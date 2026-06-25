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

const startOfDay = (d) => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};

export const getCampaignStats = async (userId, { startDate, endDate } = {}) => {
  const campaignWhere = { universityId: userId };
  const leadWhere = { targetId: userId };

  if (startDate || endDate) {
    campaignWhere.OR = [];
    leadWhere.createdAt = {};
    if (startDate) {
      const s = startOfDay(startDate);
      campaignWhere.OR.push({ endDate: { gte: s } });
      leadWhere.createdAt.gte = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      campaignWhere.OR.push({ startDate: { lte: e } });
      leadWhere.createdAt.lte = e;
    }
    if (campaignWhere.OR.length === 0) delete campaignWhere.OR;
  }

  const [campaigns, leads] = await Promise.all([
    prisma.campaign.findMany({
      where: campaignWhere,
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        impressions: true,
        clicks: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lead.findMany({
      where: leadWhere,
      select: { status: true, createdAt: true },
    }),
  ]);

  const campaignMetrics = campaigns.map((c) => {
    const cStart = c.startDate.getTime();
    const cEnd = c.endDate.getTime();
    const matched = leads.filter((l) => {
      const t = l.createdAt.getTime();
      return t >= cStart && t <= cEnd;
    });
    const totalLeads = matched.length;
    const convertedLeads = matched.filter((l) => l.status === 'CONVERTED').length;
    const conversionRate = totalLeads > 0
      ? Math.round((convertedLeads / totalLeads) * 1000) / 10
      : 0;
    const ctr = c.impressions > 0
      ? Math.round((c.clicks / c.impressions) * 1000) / 10
      : 0;

    return {
      campaignId: c.id,
      name: c.name,
      status: c.status,
      totalLeads,
      convertedLeads,
      conversionRate,
      impressions: c.impressions,
      clicks: c.clicks,
      ctr,
    };
  });

  const totalCampaigns = campaignMetrics.length;
  const totalLeads = campaignMetrics.reduce((s, c) => s + c.totalLeads, 0);
  const totalConverted = campaignMetrics.reduce((s, c) => s + c.convertedLeads, 0);
  const avgConversionRate = totalLeads > 0
    ? Math.round((totalConverted / totalLeads) * 1000) / 10
    : 0;

  return {
    summary: { totalCampaigns, totalLeads, totalConverted, avgConversionRate },
    campaigns: campaignMetrics,
  };
};
