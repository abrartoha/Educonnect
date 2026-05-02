import { prisma } from '../../db/prisma.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/utils/errors.js';

const userMini = {
  select: { id: true, name: true, avatarUrl: true, role: true, email: true },
};

// Booking creation. The "student" column holds the booker (any of
// STUDENT/AGENT/CONSULTANT/UNIVERSITY); the "provider" column holds the
// counterparty (AGENT/CONSULTANT/UNIVERSITY only). Self-booking blocked.
const PROVIDER_ROLES = new Set(['AGENT', 'CONSULTANT', 'UNIVERSITY']);

export const createBooking = async (req, res) => {
  const { providerId, subject, notes, scheduledAt, durationMinutes, mode } = req.body;

  if (providerId === req.user.id) {
    throw new BadRequestError('Cannot book yourself');
  }

  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    select: { id: true, role: true, status: true },
  });
  if (!provider || provider.status !== 'ACTIVE') {
    throw new NotFoundError('Provider not found');
  }
  if (!PROVIDER_ROLES.has(provider.role)) {
    throw new BadRequestError('Provider must be an agent, consultant, or university');
  }

  const booking = await prisma.booking.create({
    data: {
      studentId: req.user.id,
      providerId,
      subject,
      notes,
      scheduledAt,
      durationMinutes,
      mode,
    },
    include: { student: userMini, provider: userMini },
  });
  res.status(201).json({ item: booking });
};

// List bookings relevant to the caller — both sides (booker and provider).
export const listMyBookings = async (req, res) => {
  const userId = req.user.id;

  const items = await prisma.booking.findMany({
    where: {
      OR: [{ studentId: userId }, { providerId: userId }],
    },
    orderBy: { scheduledAt: 'desc' },
    include: { student: userMini, provider: userMini },
  });
  res.json({ items });
};

export const updateBookingStatus = async (req, res) => {
  const existing = await prisma.booking.findUnique({
    where: { id: req.params.id },
    select: { studentId: true, providerId: true, status: true },
  });
  if (!existing) throw new NotFoundError('Booking not found');

  const userId = req.user.id;
  const isBooker = existing.studentId === userId;
  const isProvider = existing.providerId === userId;
  if (!isBooker && !isProvider) throw new ForbiddenError();

  const nextStatus = req.body.status;
  // Position-based transitions (regardless of role).
  if (isBooker && !['CANCELLED'].includes(nextStatus)) {
    throw new ForbiddenError('The booker can only cancel');
  }
  if (
    isProvider &&
    !['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(nextStatus)
  ) {
    throw new ForbiddenError('Invalid transition');
  }

  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: nextStatus },
    include: { student: userMini, provider: userMini },
  });
  res.json({ item: booking });
};
