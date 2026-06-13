import { prisma } from '../../db/prisma.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/utils/errors.js';
import { sendEnquiryEmail } from '../../shared/services/email.js';
import { logger } from '../../config/logger.js';
import { hours } from '../../shared/utils/time.js';

const userMini = {
  select: { id: true, name: true, avatarUrl: true, email: true, role: true },
};

const ENQUIRABLE_ROLES = new Set(['UNIVERSITY', 'AGENT', 'CONSULTANT']);

const LEAD_STATUS_TRANSITIONS = {
  NEW: ['CONTACTED', 'CLOSED'],
  CONTACTED: ['CONVERTED', 'CLOSED'],
  CONVERTED: [],
  CLOSED: [],
};

export const createLead = async (user, { targetId, programme, message }) => {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, status: true, name: true, email: true },
  });
  if (!target || target.status !== 'ACTIVE' || !ENQUIRABLE_ROLES.has(target.role)) {
    throw new NotFoundError('Recipient not found');
  }

  const COOLDOWN_MS = hours(24);
  const recentLead = await prisma.lead.findFirst({
    where: {
      studentId: user.id,
      targetId,
      createdAt: { gte: new Date(Date.now() - COOLDOWN_MS) },
    },
    select: { id: true },
  });
  if (recentLead) {
    throw new BadRequestError(
      'You have already enquired about this target. Please wait 24 hours before submitting another enquiry.',
    );
  }

  const writes = [
    prisma.lead.create({
      data: {
        studentId: user.id,
        targetId,
        targetRole: target.role,
        programme,
        message,
      },
      include: { student: userMini, target: userMini },
    }),
  ];
  if (target.role === 'UNIVERSITY') {
    writes.push(
      prisma.universityProfile.update({
        where: { userId: targetId },
        data: { inquiries: { increment: 1 } },
      })
    );
  }
  const [lead] = await prisma.$transaction(writes);

  sendEnquiryEmail({
    to: target.email,
    targetName: target.name,
    studentName: user.name,
    studentEmail: user.email,
    programme,
    message,
  }).catch((err) => {
    logger.error({ err, leadId: lead.id }, 'Enquiry email failed');
  });

  return lead;
};

export const listMyLeads = async (targetId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const where = { targetId };
  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { student: userMini },
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
};

export const updateLeadStatus = async (leadId, userId, newStatus) => {
  const existing = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { targetId: true, status: true },
  });
  if (!existing) throw new NotFoundError('Lead not found');
  if (existing.targetId !== userId) throw new ForbiddenError();

  const allowed = LEAD_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot transition from ${existing.status} to ${newStatus}`,
    );
  }

  return prisma.lead.update({
    where: { id: leadId },
    data: { status: newStatus },
    include: { student: userMini },
  });
};

export const listMySubmittedLeads = async (studentId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const where = { studentId };
  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { target: userMini },
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
};
