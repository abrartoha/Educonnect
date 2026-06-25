/**
 * @openapi
 * tags:
 *   name: Admin
 *   description: Admin operations for managing users, posts, and platform moderation to test these API first login with admin credintials and then setup the csrf token in the header.
 */

/**
 * @openapi
 * /admin/overview:
 *   get:
 *     summary: Get admin dashboard overview
 *     description: |
 *       Retrieve high-level statistics and metrics for the admin dashboard.
 *       Includes counts of users by role and status, posts, and other platform metrics.
 *       **Requires**: ADMIN role authentication
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin overview data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminOverviewResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires ADMIN role)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List all users with filtering
 *     description: |
 *       Retrieve a paginated list of users with optional filtering by role, status, or search query.
 *       **Requires**: ADMIN role authentication
 *
 *       **Query Parameters**:
 *       - `role`: Filter by user role (ADMIN, UNIVERSITY, AGENT, CONSULTANT, STUDENT)
 *       - `status`: Filter by account status (PENDING, ACTIVE, SUSPENDED)
 *       - `q`: Search by email or name (max 120 characters)
 *       - `page`: Page number (min 1, default 1)
 *       - `limit`: Results per page (min 1, max 100, default 20)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         description: Filter by user role
 *         schema:
 *           type: string
 *           enum: [ADMIN, UNIVERSITY, AGENT, CONSULTANT, STUDENT]
 *       - name: status
 *         in: query
 *         description: Filter by account status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, SUSPENDED]
 *       - name: q
 *         in: query
 *         description: Search query for email or name
 *         schema:
 *           type: string
 *           maxLength: 120
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *             example:
 *               items:
 *                 - id: "cmqak517z0006tsiwsnt2jwsr"
 *                   email: "jones.zhang@mail.com"
 *                   name: "Jon Zhang"
 *                   role: "STUDENT"
 *                   status: "ACTIVE"
 *                   avatarUrl: null
 *                   lastLoginAt: null
 *                   createdAt: "2026-06-12T06:40:39.791Z"
 *                   university: null
 *                   agent: null
 *                   consultant: null
 *                   student:
 *                     userId: "cmqak517z0006tsiwsnt2jwsr"
 *                     phone: "+1234567890"
 *                     nationality: "Australia"
 *                     currentEducation: "High School"
 *                     interestedIn: []
 *                     preferredLocations: []
 *                     budgetMin: null
 *                     budgetMax: null
 *                     bio: null
 *                     intakeTarget: null
 *                 - id: "cmqaf54jh0007tsrw0bx6ioiw"
 *                   email: "raj.patel@educonsult.com.au"
 *                   name: "Raj Patel"
 *                   role: "CONSULTANT"
 *                   status: "ACTIVE"
 *                   avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Raj"
 *                   lastLoginAt: null
 *                   createdAt: "2026-06-12T04:20:46.013Z"
 *                   university: null
 *                   agent: null
 *                   consultant:
 *                     userId: "cmqaf54jh0007tsrw0bx6ioiw"
 *                     phone: "+61 4 0098 7654"
 *                     location: "Sydney, NSW"
 *                     description: "Independent consultant specialising in STEM programs and postgraduate placements."
 *                     website: null
 *                     yearsExperience: 9
 *                     studentsAssisted: 620
 *                     successRate: 91
 *                     rating: 4.7
 *                     reviewCount: 95
 *                     verified: true
 *                     tier: "FREE"
 *                     qualifications: ["MSc Engineering", "Certified Career Coach"]
 *                     services: ["Mock Interview", "Portfolio Review"]
 *                     languages: ["English", "Hindi", "Gujarati"]
 *                     specialisations: ["Engineering", "Computer Science"]
 *                     hourlyRate: 90
 *                   student: null
 *               total: 14
 *               page: 1
 *               limit: 10
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires ADMIN role)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /admin/users/{id}/approve:
 *   post:
 *     summary: Approve a pending user account
 *     description: |
 *       Approve a user account that is currently in PENDING status.
 *       Changes the user's status to ACTIVE, allowing them full platform access.
 *       **Requires**: ADMIN role authentication and valid CSRF token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID to approve
 *         schema:
 *           type: string
 *           format: cuid
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       200:
 *         description: User approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/UserDetailResponse'
 *             example:
 *               item:
 *                 id: "cmqaf54h90003tsrwopg483df"
 *                 email: "info@swinburne.edu.au"
 *                 name: "Swinburne University of Technology"
 *                 role: "UNIVERSITY"
 *                 status: "ACTIVE"
 *                 avatarUrl: null
 *                 lastLoginAt: null
 *                 createdAt: "2026-06-12T04:20:45.883Z"
 *                 university:
 *                   userId: "cmqaf54h90003tsrwopg483df"
 *                   shortName: "Swinburne"
 *                   location: "Hawthorn, VIC"
 *                   type: "Public"
 *                   description: "Technology-focused university known for industry engagement and applied research."
 *                   website: "https://swinburne.edu.au"
 *                   verified: true
 *                   tier: "PREMIUM"
 *                 agent: null
 *                 consultant: null
 *                 student: null
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires ADMIN role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /admin/users/{id}/suspend:
 *   post:
 *     summary: Suspend a user account
 *     description: |
 *       Suspend an active user account due to policy violations or other reasons.
 *       Suspended users cannot log in or access platform resources.
 *       **Requires**: ADMIN role authentication and valid CSRF token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID to suspend
 *         schema:
 *           type: string
 *           format: cuid
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       200:
 *         description: User suspended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/UserDetailResponse'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires ADMIN role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /admin/users/{id}/reactivate:
 *   post:
 *     summary: Reactivate a suspended user account
 *     description: |
 *       Reactivate a previously suspended user account, restoring their platform access.
 *       User status changes from SUSPENDED back to ACTIVE.
 *       **Requires**: ADMIN role authentication and valid CSRF token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID to reactivate
 *         schema:
 *           type: string
 *           format: cuid
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       200:
 *         description: User reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/UserDetailResponse'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires ADMIN role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /admin/posts/{id}/pin:
 *   post:
 *     summary: Pin or unpin a post
 *     description: |
 *       Pin a post to the top of feeds or unpin an already pinned post.
 *       Pinned posts receive increased visibility and appear first in feed listings.
 *       **Requires**: ADMIN role authentication and valid CSRF token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Post ID to pin/unpin
 *         schema:
 *           type: string
 *           format: uuid
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       200:
 *         description: Post pin status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/PostDetailResponse'
 *       400:
 *         description: Invalid post ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires ADMIN role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /admin/posts/{id}/status:
 *   patch:
 *     summary: Update post status
 *     description: |
 *       Change the status of a post to PUBLISHED, HIDDEN, or REMOVED.
 *       - **PUBLISHED**: Post is visible to all users
 *       - **HIDDEN**: Post is hidden from public view but not deleted
 *       - **REMOVED**: Post is permanently removed (soft delete)
 *       **Requires**: ADMIN role authentication and valid CSRF token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Post ID to update
 *         schema:
 *           type: string
 *           format: uuid
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, HIDDEN, REMOVED]
 *                 description: New status for the post
 *           example:
 *             status: "REMOVED"
 *     responses:
 *       200:
 *         description: Post status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/PostDetailResponse'
 *       400:
 *         description: Invalid post ID format or invalid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires ADMIN role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
