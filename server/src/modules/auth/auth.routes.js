import { Router } from 'express';
import { authLimiter, signupLimiter } from '../../shared/middleware/rateLimits.js';
import { validate } from '../../shared/middleware/validate.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import { signupSchema, loginSchema } from './auth.schema.js';
import {
  signup,
  login,
  refresh,
  logout,
  me,
  csrfToken,
  getFormToken,
} from './auth.controller.js';
// import { timeCheck } from '../../shared/middleware/timeCheck.js';

const router = Router();

/**
 * @openapi
 * /auth/csrf:
 *   get:
 *     summary: Get CSRF token
 *     description: |
 *       Returns a CSRF token required for mutating requests.
 *       Token is set as an HTTP-only cookie (csrfToken) and also returned in the response body.
 *       The double-submit cookie pattern is used for CSRF protection.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: CSRF token generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CsrfResponse'
 *             example:
 *               csrfToken: "abc123def456..."
 */
router.get('/csrf', asyncHandler(csrfToken));

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Create a new user account with the specified role (UNIVERSITY, AGENT, CONSULTANT, or STUDENT).
 *       Each role has different required and optional fields. Password must be at least 8 characters
 *       with uppercase, lowercase, and digit.
 *       On success, returns user object and JWT tokens (in cookies for web, in body for mobile).
 *
 *       **Status**: STUDENT accounts are created as ACTIVE immediately. Other roles are created as PENDING
 *       until an admin approves them.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UniversitySignup'
 *               - $ref: '#/components/schemas/AgentSignup'
 *               - $ref: '#/components/schemas/ConsultantSignup'
 *               - $ref: '#/components/schemas/StudentSignup'
 *           examples:
 *             StudentSignup:
 *               summary: Student account signup
 *               value:
 *                 email: "student@example.com"
 *                 password: "Password123"
 *                 name: "John Doe"
 *                 role: "STUDENT"
 *                 phone: "+1234567890"
 *                 nationality: "Australia"
 *                 currentEducation: "High School"
 *                 interestedIn: ["Engineering", "Business"]
 *                 preferredLocations: ["Sydney", "Melbourne"]
 *                 budgetMin: 20000
 *                 budgetMax: 50000
 *             ConsultantSignup:
 *               summary: Consultant account signup
 *               value:
 *                 email: "consultant@example.com"
 *                 password: "Password123"
 *                 name: "Jane Smith"
 *                 role: "CONSULTANT"
 *                 phone: "+1987654321"
 *                 location: "Sydney, Australia"
 *                 description: "Education consultant with 10 years of experience in university admissions."
 *                 yearsExperience: 10
 *                 hourlyRate: 150
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponse'
 *             example:
 *               user:
 *                 id: "uuid-123"
 *                 email: "student@example.com"
 *                 name: "John Doe"
 *                 role: "STUDENT"
 *                 status: "ACTIVE"
 *                 avatarUrl: null
 *               tokens:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/signup',
  signupLimiter,
  validate({ body: signupSchema }),
  asyncHandler(signup)
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: |
 *       Authenticate user with email and password.
 *       On success, returns user object and JWT tokens.
 *       Web clients receive tokens in HTTP-only cookies (em_access, em_refresh).
 *       Mobile clients receive tokens in the response body.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "student@example.com"
 *             password: "Password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               user:
 *                 id: "uuid-123"
 *                 email: "student@example.com"
 *                 name: "John Doe"
 *                 role: "STUDENT"
 *                 status: "ACTIVE"
 *                 avatarUrl: null
 *               tokens:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Account suspended
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(login)
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: |
 *       Use refresh token to obtain a new access token.
 *       Accepts refresh token from signed cookie (web clients) or request body (mobile clients).
 *       Does not require CSRF protection (cookies are SameSite=strict).
 *       If token reuse is detected (revoked token submitted), all user tokens are invalidated for security.
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: 'string'
 *                 description: Required for mobile clients, optional for web (uses cookie)
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *             example:
 *               user:
 *                 id: "uuid-123"
 *                 email: "student@example.com"
 *                 name: "John Doe"
 *                 role: "STUDENT"
 *                 status: "ACTIVE"
 *                 avatarUrl: null
 *               tokens:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid, expired, or reused refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Account suspended
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh', authLimiter, asyncHandler(refresh));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: |
 *       Clear authentication cookies/tokens and invalidate refresh token.
 *       **Web clients**: Requires X-CSRF-Token header in addition to auth cookie.
 *       **Mobile clients**: Use Bearer token, no CSRF needed.
 *       Refresh token is optional for web (uses cookie), required for mobile (body).
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Required for mobile, optional for web (uses cookie)
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *             example:
 *               ok: true
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', csrfProtection, asyncHandler(logout));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     description: |
 *       Returns the currently authenticated user's profile information.
 *       Returns null user if not authenticated.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeResponse'
 *             example:
 *               user:
 *                 id: "uuid-123"
 *                 email: "student@example.com"
 *                 name: "John Doe"
 *                 role: "STUDENT"
 *                 status: "ACTIVE"
 *                 avatarUrl: null
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               user: null
 */
router.get('/me', asyncHandler(me));

router.get('/form-token', asyncHandler(getFormToken));

// Time check route for testing. Not for production use.
// router.post('/time-check', timeCheck, (req, res) => {
//   res.json({ message: 'Form submission accepted' });
// });

export default router;