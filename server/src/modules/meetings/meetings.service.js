import crypto from 'node:crypto';
import { AccessToken } from 'livekit-server-sdk';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../shared/utils/errors.js';
import { emitToUser } from '../messaging/messaging.gateway.js';

// How early/late a participant may join relative to scheduledAt.
const JOIN_WINDOW_BEFORE_MS = 15 * 60 * 1000;
const JOIN_WINDOW_AFTER_MS = 15 * 60 * 1000;
// Token TTL — short so a leaked token can't be replayed indefinitely.
const TOKEN_TTL_SECONDS = 15 * 60;

// Locate the booking and authorize the caller.
const loadAuthorizedBooking = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { meeting: true },
  });
  if (!booking) throw new NotFoundError('Booking not found');

  const isStudent = booking.studentId === userId;
  const isProvider = booking.providerId === userId;
  if (!isStudent && !isProvider) throw new ForbiddenError();

  return booking;
};

const assertJoinWindow = (booking) => {
  if (booking.status !== 'CONFIRMED') {
    throw new ForbiddenError('Booking must be confirmed before joining');
  }
  // In-person bookings don't have an in-app call. Video and phone both use LiveKit.
  if (booking.mode !== 'video' && booking.mode !== 'phone') {
    throw new BadRequestError('This booking has no in-app call');
  }
  const now = Date.now();
  const start = new Date(booking.scheduledAt).getTime();
  const end = start + booking.durationMinutes * 60 * 1000;
  if (now < start - JOIN_WINDOW_BEFORE_MS) {
    throw new ForbiddenError('Meeting has not started yet');
  }
  if (now > end + JOIN_WINDOW_AFTER_MS) {
    throw new ForbiddenError('Meeting window has closed');
  }
};

// Get-or-create the Meeting row tied to this booking. Random roomName.
const ensureMeeting = async (booking) => {
  if (booking.meeting) return booking.meeting;
  return prisma.meeting.create({
    data: {
      bookingId: booking.id,
      roomName: crypto.randomUUID(),
    },
  });
};

// One active meeting per user — defence against automation/scraping.
// A meeting is "active" only while its booking's join window is still open.
// (Without webhooks, `endedAt` is never stamped, so a time-based stale check
// is the source of truth for whether a previous meeting is really live.)
const assertNoOtherActiveMeeting = async (userId, currentMeetingId) => {
  const live = await prisma.meeting.findFirst({
    where: {
      id: { not: currentMeetingId },
      endedAt: null,
      booking: {
        status: 'CONFIRMED',
        OR: [{ studentId: userId }, { providerId: userId }],
      },
    },
    include: {
      booking: { select: { scheduledAt: true, durationMinutes: true } },
    },
  });
  if (!live) return;

  const start = new Date(live.booking.scheduledAt).getTime();
  const windowEnd =
    start + live.booking.durationMinutes * 60 * 1000 + JOIN_WINDOW_AFTER_MS;
  if (Date.now() <= windowEnd) {
    throw new ForbiddenError('You already have another meeting in progress');
  }
};

// Mint a scoped LiveKit JWT for this user to join this meeting's room.
const mintToken = async (user, meeting) => {
  const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    // identity = user id (impersonation primitive); name = display label.
    identity: user.id,
    name: user.name,
    ttl: TOKEN_TTL_SECONDS,
  });
  at.addGrant({
    room: meeting.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: false,
  });
  return at.toJwt();
};

// Stamp activity onto the audit log (security forensics).
const auditTokenIssue = async ({ meetingId, userId, ip, userAgent }) => {
  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: 'meeting.token_issued',
      entityType: 'Meeting',
      entityId: meetingId,
      ip,
      userAgent,
    },
  });
};

export const issueJoinToken = async ({ bookingId, user, ip, userAgent }) => {
  const booking = await loadAuthorizedBooking(bookingId, user.id);
  assertJoinWindow(booking);
  const meeting = await ensureMeeting(booking);
  await assertNoOtherActiveMeeting(user.id, meeting.id);

  const token = await mintToken(user, meeting);

  // Stamp startedAt the first time anyone joins, and ping the other party.
  if (!meeting.startedAt) {
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { startedAt: new Date() },
    });
    const otherUserId =
      booking.studentId === user.id ? booking.providerId : booking.studentId;
    emitToUser(otherUserId, 'meeting:started', {
      bookingId: booking.id,
      meetingId: meeting.id,
      startedBy: { id: user.id, name: user.name },
      mode: booking.mode,
      subject: booking.subject,
    });
  }

  await auditTokenIssue({
    meetingId: meeting.id,
    userId: user.id,
    ip,
    userAgent,
  });

  return {
    token,
    wsUrl: env.LIVEKIT_URL,
    roomName: meeting.roomName,
    meetingId: meeting.id,
    mode: booking.mode, // client uses this to pick audio-only vs video UX
    expiresIn: TOKEN_TTL_SECONDS,
  };
};
