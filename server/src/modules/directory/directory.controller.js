import { prisma } from '../../db/prisma.js';
import { NotFoundError, ForbiddenError } from '../../shared/utils/errors.js';
import { sendOk, sendPaginated } from '../../shared/utils/sendResponse.js';

// Common "safe to return publicly" selection for each role.
const uniSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  createdAt: true,
  university: true,
};
const agentSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  createdAt: true,
  agent: true,
};
const consultantSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  createdAt: true,
  consultant: true,
};

const buildListArgs = (role, query) => {
  const { page, limit, q, verified, location, sort } = query;
  const profileKey = {
    UNIVERSITY: 'university',
    AGENT: 'agent',
    CONSULTANT: 'consultant',
  }[role];

  const where = {
    role,
    status: 'ACTIVE',
    ...(q
      ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { [profileKey]: { description: { contains: q, mode: 'insensitive' } } },
        ],
      }
      : {}),
    ...(verified !== undefined
      ? { [profileKey]: { is: { verified } } }
      : {}),
    ...(location
      ? { [profileKey]: { is: { location: { contains: location, mode: 'insensitive' } } } }
      : {}),
  };

  const orderBy =
    sort === 'name'
      ? { name: 'asc' }
      : sort === 'newest'
        ? { createdAt: 'desc' }
        : { [profileKey]: { rating: 'desc' } };

  return {
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  };
};

const listByRole = (role, select) => async (req, res) => {
  const args = buildListArgs(role, req.query);
  const [items, total] = await Promise.all([
    prisma.user.findMany({ ...args, select }),
    prisma.user.count({ where: args.where }),
  ]);
  sendPaginated(res, items, {
    page: req.query.page,
    limit: req.query.limit,
    total,
    pages: Math.ceil(total / req.query.limit),
  });
};

const getByRole = (role, select, notFoundMsg) => async (req, res) => {
  const user = await prisma.user.findFirst({
    where: { id: req.params.id, role, status: 'ACTIVE' },
    select,
  });
  if (!user) throw new NotFoundError(notFoundMsg);
  // Increment "views" counter for universities (marketing metric).
  if (role === 'UNIVERSITY') {
    prisma.universityProfile
      .update({ where: { userId: user.id }, data: { views: { increment: 1 } } })
      .catch(() => { });
  }
  sendOk(res, user);
};

export const listUniversities = listByRole('UNIVERSITY', uniSelect);
export const getUniversity = getByRole('UNIVERSITY', uniSelect, 'University not found');

// Batch lookup used by the "compare universities" feature on web + mobile.
// Accepts 2–4 IDs and returns them preserving caller order, skipping missing
// or suspended entries.
export const compareUniversities = async (req, res) => {
  const ids = req.query.ids;

  const rows = await prisma.user.findMany({
    where: { id: { in: ids }, role: 'UNIVERSITY', status: 'ACTIVE' },
    select: uniSelect,
  });

  // Keep caller-specified order so the UI renders the slots predictably.
  const byId = new Map(rows.map((r) => [r.id, r]));
  const items = ids.map((id) => byId.get(id)).filter(Boolean);

  sendOk(res, items);
};

export const listAgents = listByRole('AGENT', agentSelect);
export const getAgent = getByRole('AGENT', agentSelect, 'Agent not found');

export const listConsultants = listByRole('CONSULTANT', consultantSelect);
export const getConsultant = getByRole('CONSULTANT', consultantSelect, 'Consultant not found');

// Update own profile — scoped to the currently authenticated role.
export const updateOwnProfile = async (req, res) => {
  const { user } = req;
  const role = user.role;

  if (role === 'ADMIN') {
    throw new ForbiddenError('Admins edit profiles through /api/users/me');
  }

  const { name, avatarUrl, ...profile } = req.body;
  const userPatch = {};
  if (name !== undefined) userPatch.name = name;
  if (avatarUrl !== undefined) userPatch.avatarUrl = avatarUrl;

  const profileRel = {
    UNIVERSITY: 'university',
    AGENT: 'agent',
    CONSULTANT: 'consultant',
    STUDENT: 'student',
  }[role];

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...userPatch,
      ...(Object.keys(profile).length
        ? { [profileRel]: { update: profile } }
        : {}),
    },
    include: { [profileRel]: true },
  });

  sendOk(res, updated);
};
