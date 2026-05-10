import { prisma } from '../../db/prisma.js';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors.js';
import { revokeAllForUser } from '../auth/auth.service.js';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  avatarUrl: true,
  lastLoginAt: true,
  createdAt: true,
  university: true,
  agent: true,
  consultant: true,
  student: true,
};

export const listUsers = async (req, res) => {
  const { role, status, q, page = 1, limit = 20 } = req.query;
  const where = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
};

export const approveEntity = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, role: true },
  });
  if (!user) throw new NotFoundError('User not found');

  // The User model's relation fields are named `university`, `agent`,
  // `consultant`, `student` — not `*Profile`. That's the name Prisma expects
  // inside a nested `update`. The delegate name (tx.universityProfile...) is
  // different; don't confuse the two.
  const profileRel = {
    UNIVERSITY: 'university',
    AGENT: 'agent',
    CONSULTANT: 'consultant',
  }[user.role];

  if (!profileRel) throw new BadRequestError('Not an approvable entity');

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'ACTIVE',
      [profileRel]: { update: { verified: true } },
    },
    select: userSelect,
  });
  res.json({ item: updated });
};

export const suspendEntity = async (req, res) => {
  if (req.params.id === req.user.id)
    throw new BadRequestError('Cannot suspend your own account');
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true },
  });
  if (!user) throw new NotFoundError('User not found');

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { status: 'SUSPENDED' },
    select: userSelect,
  });
  // Kick them out immediately by revoking refresh tokens.
  await revokeAllForUser(user.id);
  res.json({ item: updated });
};

export const reactivateEntity = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true },
  });
  if (!user) throw new NotFoundError('User not found');
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { status: 'ACTIVE' },
    select: userSelect,
  });
  res.json({ item: updated });
};

export const setPostPin = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    select: { id: true, isPinned: true },
  });
  if (!post) throw new NotFoundError('Post not found');
  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { isPinned: !post.isPinned },
  });
  res.json({ item: updated });
};

export const setPostStatus = async (req, res) => {
  const { status } = req.body;
  const existing = await prisma.post.findUnique({
    where: { id: req.params.id },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError('Post not found');
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json({ item: post });
};

// Dashboard counters.
export const overview = async (_req, res) => {
  const [
    universities,
    agents,
    consultants,
    students,
    posts,
    pendingApprovals,
    leads,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'UNIVERSITY' } }),
    prisma.user.count({ where: { role: 'AGENT' } }),
    prisma.user.count({ where: { role: 'CONSULTANT' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.count({
      where: {
        status: 'PENDING',
        role: { in: ['UNIVERSITY', 'AGENT', 'CONSULTANT'] },
      },
    }),
    prisma.lead.count(),
  ]);
  res.json({
    counts: {
      universities,
      agents,
      consultants,
      students,
      posts,
      pendingApprovals,
      leads,
    },
  });
};
