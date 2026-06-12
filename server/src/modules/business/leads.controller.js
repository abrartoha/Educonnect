import { prisma } from '../../db/prisma.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../shared/utils/errors.js';
import { sendEnquiryEmail } from '../../shared/services/email.js';
import { logger } from '../../config/logger.js';
import { responseHandler } from '../../shared/utils/responseHandler.js';

const userMini = {
  select: { id: true, name: true, avatarUrl: true, email: true, role: true },
};

const ENQUIRABLE_ROLES = new Set(['UNIVERSITY', 'AGENT', 'CONSULTANT']);

// Student → university / agent / consultant enquiry.
export const createLead = async (req, res) => {
  const { targetId, programme, message } = req.body;

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, status: true, name: true, email: true },
  });
  if (!target || target.status !== 'ACTIVE' || !ENQUIRABLE_ROLES.has(target.role)) {
    throw new NotFoundError('Recipient not found');
  }

  // Persist + bump the inquiries counter when targeting a university.
  const writes = [
    prisma.lead.create({
      data: {
        studentId: req.user.id,
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

  // Fire-and-forget the email so a slow SMTP server doesn't block the request.
  sendEnquiryEmail({
    to: target.email,
    targetName: target.name,
    studentName: req.user.name,
    studentEmail: req.user.email,
    programme,
    message,
  }).catch((err) => {
    logger.error({ err, leadId: lead.id }, 'Enquiry email failed');
  });

  responseHandler.created(res, lead);
};

// Provider (uni/agent/consultant) sees enquiries sent to them.
export const listMyLeads = async (req, res) => {
  const items = await prisma.lead.findMany({
    where: { targetId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { student: userMini },
  });
  responseHandler.ok(res, items);
};

export const updateLeadStatus = async (req, res) => {
  const existing = await prisma.lead.findUnique({
    where: { id: req.params.id },
    select: { targetId: true },
  });
  if (!existing) throw new NotFoundError('Lead not found');
  if (existing.targetId !== req.user.id) throw new ForbiddenError();

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
    include: { student: userMini },
  });
  responseHandler.updated(res, lead);
};

// Student sees enquiries they submitted (for history).
export const listMySubmittedLeads = async (req, res) => {
  if (req.user.role !== 'STUDENT') throw new BadRequestError('Students only');
  const items = await prisma.lead.findMany({
    where: { studentId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { target: userMini },
  });
  responseHandler.ok(res, items);
};
