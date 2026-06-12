import { prisma } from '../../db/prisma.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../../shared/utils/errors.js';
import { responseHandler } from '../../shared/utils/responseHandler.js';

const userMini = {
  select: { id: true, name: true, avatarUrl: true, role: true },
};

// Reviews about a given target (university/agent/consultant).
export const listForTarget = async (req, res) => {
  const items = await prisma.review.findMany({
    where: { targetId: req.params.id },
    orderBy: { createdAt: 'desc' },
    include: { reviewer: userMini },
  });
  responseHandler.ok(res, items);
};

export const createReview = async (req, res) => {
  if (req.user.role !== 'STUDENT') {
    throw new ForbiddenError('Only students can leave reviews');
  }

  const target = await prisma.user.findUnique({
    where: { id: req.body.targetId },
    select: { id: true, role: true, status: true },
  });
  if (!target || target.status !== 'ACTIVE') {
    throw new NotFoundError('Target not found');
  }
  if (!['UNIVERSITY', 'AGENT', 'CONSULTANT'].includes(target.role)) {
    throw new BadRequestError('Target cannot be reviewed');
  }
  if (target.id === req.user.id) {
    throw new BadRequestError('Cannot review yourself');
  }

  const duplicate = await prisma.review.findUnique({
    where: { reviewerId_targetId: { reviewerId: req.user.id, targetId: target.id } },
  });
  if (duplicate) throw new ConflictError('You have already reviewed this profile');

  const profileRel = {
    UNIVERSITY: 'universityProfile',
    AGENT: 'agentProfile',
    CONSULTANT: 'consultantProfile',
  }[target.role];

  // Transaction: create review, recompute rating + reviewCount on profile.
  const [review] = await prisma.$transaction(async (tx) => {
    const r = await tx.review.create({
      data: {
        reviewerId: req.user.id,
        targetId: target.id,
        targetRole: target.role,
        rating: req.body.rating,
        title: req.body.title,
        body: req.body.body,
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

  responseHandler.created(res, review);
};
