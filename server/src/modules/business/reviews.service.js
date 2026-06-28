import { prisma } from '../../db/prisma.js';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '../../shared/utils/errors.js';

const userMini = {
  select: { id: true, name: true, avatarUrl: true, role: true },
};

export const listForTarget = async (targetId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const where = { targetId };
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { reviewer: userMini },
    }),
    prisma.review.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
};

export const createReview = async (user, { targetId, rating, title, body }) => {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, status: true },
  });
  if (!target || target.status !== 'ACTIVE') {
    throw new NotFoundError('Target not found');
  }
  if (!['UNIVERSITY', 'AGENT', 'CONSULTANT'].includes(target.role)) {
    throw new BadRequestError('Target cannot be reviewed');
  }
  if (target.id === user.id) {
    throw new BadRequestError('Cannot review yourself');
  }

  const profileRel = {
    UNIVERSITY: 'universityProfile',
    AGENT: 'agentProfile',
    CONSULTANT: 'consultantProfile',
  }[target.role];

  const [review] = await prisma.$transaction(async (tx) => {
    const duplicate = await tx.review.findUnique({
      where: { reviewerId_targetId: { reviewerId: user.id, targetId: target.id } },
    });
    if (duplicate) throw new ConflictError('You have already reviewed this profile');

    const r = await tx.review.create({
      data: {
        reviewerId: user.id,
        targetId: target.id,
        targetRole: target.role,
        rating,
        title,
        body,
      },
      include: { reviewer: userMini },
    });

    const agg = await tx.review.aggregate({
      where: { targetId: target.id },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await tx[profileRel].update({
      where: { userId: target.id },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });

    return [r];
  });

  return review;
};
