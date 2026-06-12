import { prisma } from '../../db/prisma.js';
import { NotFoundError, ForbiddenError } from '../../shared/utils/errors.js';
import { responseHandler } from '../../shared/utils/responseHandler.js';

export const listMyCampaigns = async (req, res) => {
  const items = await prisma.campaign.findMany({
    where: { universityId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  responseHandler.ok(res, items);
};

export const createCampaign = async (req, res) => {
  const campaign = await prisma.campaign.create({
    data: { ...req.body, universityId: req.user.id },
  });
  responseHandler.created(res, campaign);
};

export const updateCampaign = async (req, res) => {
  const existing = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    select: { universityId: true },
  });
  if (!existing) throw new NotFoundError('Campaign not found');
  if (existing.universityId !== req.user.id) throw new ForbiddenError();

  const campaign = await prisma.campaign.update({
    where: { id: req.params.id },
    data: req.body,
  });
  responseHandler.updated(res, campaign);
};

export const deleteCampaign = async (req, res) => {
  const existing = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    select: { universityId: true },
  });
  if (!existing) throw new NotFoundError('Campaign not found');
  if (existing.universityId !== req.user.id) throw new ForbiddenError();

  await prisma.campaign.delete({ where: { id: req.params.id } });
  responseHandler.noContent(res);
};
