import { prisma } from '../../db/prisma.js';
import { NotFoundError, ForbiddenError } from '../../shared/utils/errors.js';

const campaignSelect = {
  id: true,
  name: true,
  audience: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export const listMyCampaigns = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.campaign.findMany({
      where: { universityId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: campaignSelect,
    }),
    prisma.campaign.count({ where: { universityId: userId } }),
  ]);

  return { items, meta: { page, limit, total } };
};

export const createCampaign = async (userId, data) => {
  const { name, audience, startDate, endDate, status } = data;

  return prisma.campaign.create({
    data: { name, audience, startDate, endDate, status, universityId: userId },
    select: campaignSelect,
  });
};

export const updateCampaign = async (campaignId, userId, data) => {
  const existing = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { universityId: true },
  });
  if (!existing) throw new NotFoundError('Campaign not found');
  if (existing.universityId !== userId) throw new ForbiddenError();

  const { name, audience, startDate, endDate, status } = data;

  return prisma.campaign.update({
    where: { id: campaignId },
    data: { name, audience, startDate, endDate, status },
    select: campaignSelect,
  });
};

export const deleteCampaign = async (campaignId, userId) => {
  const existing = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { universityId: true },
  });
  if (!existing) throw new NotFoundError('Campaign not found');
  if (existing.universityId !== userId) throw new ForbiddenError();

  await prisma.campaign.delete({ where: { id: campaignId } });
};
