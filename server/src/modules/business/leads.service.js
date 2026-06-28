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

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'];

const startOfDay = (d) => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};

const truncateDate = (date, granularity) => {
  const d = new Date(date);
  if (granularity === 'month') {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  } else if (granularity === 'week') {
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString().slice(0, 10);
};

export const getLeadStats = async (targetId, { startDate, endDate, granularity = 'week' }) => {
  const where = { targetId };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startOfDay(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [statusGroups, leads, total] = await Promise.all([
    prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    }),
    prisma.lead.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.lead.count({ where }),
  ]);

  const statusDistribution = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s, 0]),
  );
  for (const g of statusGroups) {
    statusDistribution[g.status] = g._count._all;
  }

  const bucketMap = new Map();
  for (const { createdAt } of leads) {
    const key = truncateDate(createdAt, granularity);
    bucketMap.set(key, (bucketMap.get(key) ?? 0) + 1);
  }

  const timeSeries = Array.from(bucketMap, ([date, count]) => ({ date, count }));

  return {
    statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
      status,
      count,
    })),
    timeSeries,
    total,
  };
};
