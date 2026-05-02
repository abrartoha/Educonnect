import { prisma } from '../../db/prisma.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/utils/errors.js';

const userMini = {
  select: { id: true, name: true, avatarUrl: true, email: true, role: true },
};

// Student → university enquiry
export const createLead = async (req, res) => {
  const { universityId, programme, message } = req.body;

  const uni = await prisma.user.findUnique({
    where: { id: universityId },
    select: { id: true, role: true, status: true },
  });
  if (!uni || uni.status !== 'ACTIVE' || uni.role !== 'UNIVERSITY') {
    throw new NotFoundError('University not found');
  }

  const [lead] = await prisma.$transaction([
    prisma.lead.create({
      data: {
        studentId: req.user.id,
        universityId,
        programme,
        message,
      },
      include: { student: userMini, university: userMini },
    }),
    prisma.universityProfile.update({
      where: { userId: universityId },
      data: { inquiries: { increment: 1 } },
    }),
  ]);

  res.status(201).json({ item: lead });
};

// University sees its own leads.
export const listMyLeads = async (req, res) => {
  const items = await prisma.lead.findMany({
    where: { universityId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { student: userMini },
  });
  res.json({ items });
};

export const updateLeadStatus = async (req, res) => {
  const existing = await prisma.lead.findUnique({
    where: { id: req.params.id },
    select: { universityId: true },
  });
  if (!existing) throw new NotFoundError('Lead not found');
  if (existing.universityId !== req.user.id) throw new ForbiddenError();

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
    include: { student: userMini },
  });
  res.json({ item: lead });
};

// Student sees leads they submitted (for history).
export const listMySubmittedLeads = async (req, res) => {
  if (req.user.role !== 'STUDENT') throw new BadRequestError('Students only');
  const items = await prisma.lead.findMany({
    where: { studentId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { university: userMini },
  });
  res.json({ items });
};
