import { prisma } from '../../db/prisma.js';
import { hashPassword, verifyPassword } from '../../shared/utils/password.js';
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
} from '../../shared/utils/tokens.js';
import {
  UnauthorizedError,
  ConflictError,
  ForbiddenError,
} from '../../shared/utils/errors.js';
import crypto from 'crypto';
import redisClient from '../../db/redis.js';

// Shape the profile payload for each role.
const buildProfileData = (role, data) => {
  switch (role) {
    case 'UNIVERSITY':
      return {
        university: {
          create: {
            shortName: data.shortName,
            location: data.location,
            type: data.type,
            description: data.description,
            website: data.website,
            phone: data.phone,
          },
        },
      };
    case 'AGENT':
      return {
        agent: {
          create: {
            contactPerson: data.contactPerson,
            phone: data.phone,
            location: data.location,
            description: data.description,
            maraNumber: data.maraNumber,
            yearsExperience: data.yearsExperience,
          },
        },
      };
    case 'CONSULTANT':
      return {
        consultant: {
          create: {
            phone: data.phone,
            location: data.location,
            description: data.description,
            yearsExperience: data.yearsExperience,
            hourlyRate: data.hourlyRate,
          },
        },
      };
    case 'STUDENT':
      return {
        student: {
          create: {
            phone: data.phone,
            nationality: data.nationality,
            currentEducation: data.currentEducation,
            interestedIn: data.interestedIn ?? [],
            preferredLocations: data.preferredLocations ?? [],
            budgetMin: data.budgetMin,
            budgetMax: data.budgetMax,
          },
        },
      };
    default:
      return {};
  }
};

export const registerUser = async (input) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await hashPassword(input.password);
  // Students are auto-active; others start PENDING until admin approves.
  const status = input.role === 'STUDENT' ? 'ACTIVE' : 'PENDING';

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
      name: input.name,
      status,
      ...buildProfileData(input.role, input),
    },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  return user;
};

export const authenticateUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always run verify to avoid timing leaks — use a dummy hash if user not found.
  const hash =
    user?.passwordHash ??
    '$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const ok = await verifyPassword(hash, password);
  if (!user || !ok) throw new UnauthorizedError('Invalid email or password');
  if (user.status === 'SUSPENDED') throw new ForbiddenError('Account suspended');
  return user;
};

export const issueTokensForUser = async (user, { userAgent, ip } = {}) => {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
      userAgent,
      ip,
    },
  });
  return { accessToken, refreshToken };
};

// Rotate a refresh token: revoke old, issue new. Detects reuse of revoked tokens.
export const rotateRefreshToken = async (presentedToken, { userAgent, ip } = {}) => {
  const tokenHash = hashRefreshToken(presentedToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored) throw new UnauthorizedError('Invalid refresh token');

  // Reuse of a revoked token = suspected theft. Revoke the whole family.
  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new UnauthorizedError('Refresh token reuse detected');
  }

  if (stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token expired');
  }

  if (stored.user.status === 'SUSPENDED') {
    throw new ForbiddenError('Account suspended');
  }

  const newRefresh = generateRefreshToken();
  const newAccess = signAccessToken({ sub: stored.user.id, role: stored.user.role });

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedBy: hashRefreshToken(newRefresh) },
    }),
    prisma.refreshToken.create({
      data: {
        userId: stored.user.id,
        tokenHash: hashRefreshToken(newRefresh),
        expiresAt: refreshTokenExpiry(),
        userAgent,
        ip,
      },
    }),
  ]);

  return { accessToken: newAccess, refreshToken: newRefresh, user: stored.user };
};

export const revokeRefreshToken = async (presentedToken) => {
  if (!presentedToken) return;
  await prisma.refreshToken
    .updateMany({
      where: { tokenHash: hashRefreshToken(presentedToken), revokedAt: null },
      data: { revokedAt: new Date() },
    })
    .catch(() => { });
};

export const revokeAllForUser = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

/**
 * Change a user's password.
 * @param {string} userId - The ID of the user whose password to change.
 * @param {string} currentPassword - The user's current password.
 * @param {string} newPassword - The new password.
 * @returns {Promise<void>}
 */
export const changeUserPassword = async (user, currentPassword, newPassword) => {
  const userData = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true, email: true } });
  if (!user || !userData) throw new UnauthorizedError('User not found');
  const isOkCurrentPass = await verifyPassword(userData.passwordHash, currentPassword);
  if (!isOkCurrentPass) throw new UnauthorizedError('Current password is incorrect');
  const newHash = await hashPassword(newPassword);

  const res = await prisma.user.update({
    where: { id: user.id, email: userData.email },
    data: { passwordHash: newHash },
  });
  if (res) await revokeAllForUser(user.id); // Invalidate all existing sessions after password change.
  return res;
};

/**
 * Generate a password reset token and store it in Redis.
 * Token expires in 3 minutes.
 * @param {string} email - The email of the user requesting password reset
 * @returns {Promise<string>} The reset token
 */
export const generatePasswordResetToken = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('User not found');
  // Note: We don't want to reveal whether the user exists or not, so we return success even if sending fails.
  // Refactore: In a real implementation, Silently reject and log this failure for internal monitoring but not expose it to the user.

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Store token in Redis with 3 minute expiry (180 seconds)
  await redisClient.set(`password_reset:${tokenHash}`, email, {
    EX: 180,
  });

  return token;
};

/**
 * Reset user password using a reset token.
 * @param {string} token - The reset token from the email link
 * @param {string} email - The user's email address
 * @param {string} newPassword - The new password
 * @returns {Promise<Object>} The updated user object
 */
export const resetPasswordWithToken = async (token, email, newPassword) => {
  // Hash the token to match what's stored in Redis
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Verify token exists in Redis and matches email
  const storedEmail = await redisClient.get(`password_reset:${tokenHash}`);
  if (!storedEmail) {
    throw new UnauthorizedError('Invalid or expired reset token');
  }

  if (storedEmail !== email) {
    throw new UnauthorizedError('Email does not match the reset token');
  }

  // Get the user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('User not found');

  // Note: We don't want to reveal whether all the conditions are met or not, so we return success even if sending fails.
  // Refactore: In a real implementation, Silently reject and log this failure for internal monitoring but not expose it to the user.

  // Hash new password
  const newHash = await hashPassword(newPassword);

  // Update password
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  // Invalidate all existing sessions after password reset
  await revokeAllForUser(user.id);

  // Delete the token from Redis
  await redisClient.del(`password_reset:${tokenHash}`);

  return updatedUser;
};