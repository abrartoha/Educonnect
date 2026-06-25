import { prisma } from '../../db/prisma.js';
import { ForbiddenError } from '../../shared/utils/errors.js';

const uniSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
  university: true,
};

const agentSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
  agent: true,
};

const consultantSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
  consultant: true,
};

const studentSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
  student: true,
};

const selectByRole = {
  UNIVERSITY: uniSelect,
  AGENT: agentSelect,
  CONSULTANT: consultantSelect,
  STUDENT: studentSelect,
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
          { [profileKey]: { is: { description: { contains: q, mode: 'insensitive' } } } },
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

export const listProfilesByRole = async (role, query) => {
  const select = selectByRole[role];
  const args = buildListArgs(role, query);

  const [items, total] = await Promise.all([
    prisma.user.findMany({ ...args, select }),
    prisma.user.count({ where: args.where }),
  ]);

  return {
    items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  };
};

export const getProfileById = async (role, id) => {
  const select = selectByRole[role];

  const user = await prisma.user.findFirst({
    where: { id, role, status: 'ACTIVE' },
    select,
  });

  if (!user) return null;

  if (role === 'UNIVERSITY') {
    prisma.universityProfile
      .update({ where: { userId: user.id }, data: { views: { increment: 1 } } })
      .catch(() => { });
  }

  return user;
};

export const compareUniversities = async (ids) => {
  const rows = await prisma.user.findMany({
    where: { id: { in: ids }, role: 'UNIVERSITY', status: 'ACTIVE' },
    select: uniSelect,
  });

  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
};

export const updateUserProfile = async (userId, role, data) => {
  if (role === 'ADMIN') {
    throw new ForbiddenError('Admins edit profiles through /api/users/me');
  }

  const { name, avatarUrl, ...profile } = data;
  const userPatch = {};
  if (name !== undefined) userPatch.name = name;
  if (avatarUrl !== undefined) userPatch.avatarUrl = avatarUrl;

  const profileRel = {
    UNIVERSITY: 'university',
    AGENT: 'agent',
    CONSULTANT: 'consultant',
    STUDENT: 'student',
  }[role];

  const select = selectByRole[role];

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...userPatch,
      ...(Object.keys(profile).length
        ? { [profileRel]: { update: profile } }
        : {}),
    },
    select,
  });
};
