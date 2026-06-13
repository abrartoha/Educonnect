/**
 * @openapi
 * tags:
 *   name: Business
 *   description: Campaigns, leads (enquiries), and reviews for universities, agents, and consultants
 */

// ---- Campaigns --------------------------------------------------------------

/**
 * @openapi
 * /campaigns:
 *   get:
 *     summary: List my campaigns
 *     description: |
 *       Retrieve a paginated list of campaigns owned by the authenticated university.
 *       **Requires**: UNIVERSITY role.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *     responses:
 *       200:
 *         description: Paginated list of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/Campaign' } }
 *                 message: { type: 'string' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires UNIVERSITY role)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /campaigns:
 *   post:
 *     summary: Create a campaign
 *     description: |
 *       Create a new marketing campaign for the authenticated university.
 *       **Requires**: UNIVERSITY role and valid CSRF token.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampaign'
 *           example:
 *             name: "Open Day 2026"
 *             audience: "Prospective international students"
 *             startDate: "2026-07-01T00:00:00.000Z"
 *             endDate: "2026-07-31T23:59:59.999Z"
 *             status: "DRAFT"
 *     responses:
 *       201:
 *         description: Campaign created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/Campaign' }
 *                 message: { type: 'string' }
 *       400:
 *         description: Invalid input
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
 *         description: Not authorized (requires UNIVERSITY role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /campaigns/{id}:
 *   patch:
 *     summary: Update a campaign
 *     description: |
 *       Update an existing campaign. The authenticated user must own the campaign.
 *       **Requires**: UNIVERSITY role and valid CSRF token.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Campaign ID
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCampaign'
 *     responses:
 *       200:
 *         description: Campaign updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/Campaign' }
 *                 message: { type: 'string' }
 *       400:
 *         description: Invalid input
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
 *         description: Not authorized (requires UNIVERSITY role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /campaigns/{id}:
 *   delete:
 *     summary: Delete a campaign
 *     description: |
 *       Permanently delete a campaign. The authenticated user must own the campaign.
 *       **Requires**: UNIVERSITY role and valid CSRF token.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Campaign ID
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       204:
 *         description: Campaign deleted successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires UNIVERSITY role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// ---- Leads -----------------------------------------------------------------

/**
 * @openapi
 * /leads:
 *   get:
 *     summary: List received leads
 *     description: |
 *       Retrieve a paginated list of leads (enquiries) directed at the authenticated user.
 *       Returns leads where the authenticated user is the target.
 *       **Requires**: UNIVERSITY, AGENT, or CONSULTANT role.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *     responses:
 *       200:
 *         description: Paginated list of received leads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/LeadWithStudent' } }
 *                 message: { type: 'string' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires UNIVERSITY, AGENT, or CONSULTANT role)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /leads/mine:
 *   get:
 *     summary: List my submitted leads
 *     description: |
 *       Retrieve a paginated list of leads submitted by the authenticated student.
 *       **Requires**: STUDENT role.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *     responses:
 *       200:
 *         description: Paginated list of submitted leads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/LeadWithTarget' } }
 *                 message: { type: 'string' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (requires STUDENT role)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /leads:
 *   post:
 *     summary: Submit a lead (enquiry)
 *     description: |
 *       Submit an enquiry to a university, agent, or consultant.
 *       A 24-hour cooldown applies per target — duplicate submissions within this window are rejected.
 *       An email notification is sent to the target.
 *       **Requires**: STUDENT role and valid CSRF token.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLead'
 *           example:
 *             targetId: "cmqaf54h90003tsrwopg483df"
 *             programme: "Master of Computer Science"
 *             message: "I am interested in your computer science programme and would like to know more about entry requirements."
 *     responses:
 *       201:
 *         description: Lead submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/LeadWithStudent' }
 *                 message: { type: 'string' }
 *       400:
 *         description: Invalid input or 24-hour cooldown active
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
 *         description: Not authorized (requires STUDENT role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Target user not found or not enquirable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /leads/{id}/status:
 *   patch:
 *     summary: Update lead status
 *     description: |
 *       Update the status of a lead directed at the authenticated user.
 *       Valid transitions: NEW → CONTACTED | CLOSED, CONTACTED → CONVERTED | CLOSED.
 *       CONVERTED and CLOSED are terminal states.
 *       **Requires**: UNIVERSITY, AGENT, or CONSULTANT role and valid CSRF token.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Lead ID
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLeadStatus'
 *           example:
 *             status: "CONTACTED"
 *     responses:
 *       200:
 *         description: Lead status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/LeadWithStudent' }
 *                 message: { type: 'string' }
 *       400:
 *         description: Invalid status transition
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
 *         description: Not authorized (requires UNIVERSITY, AGENT, or CONSULTANT role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Lead not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// ---- Reviews ---------------------------------------------------------------

/**
 * @openapi
 * /reviews/target/{id}:
 *   get:
 *     summary: List reviews for a target
 *     description: |
 *       Retrieve a paginated list of reviews for a specific university, agent, or consultant.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Target user ID (university, agent, or consultant)
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *     responses:
 *       200:
 *         description: Paginated list of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/ReviewWithReviewer' } }
 *                 message: { type: 'string' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Create a review
 *     description: |
 *       Submit a review for a university, agent, or consultant.
 *       Each student can only review a given target once (enforced by a unique constraint).
 *       The target's aggregate rating and review count are updated automatically.
 *       **Requires**: STUDENT role and valid CSRF token.
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReview'
 *           example:
 *             targetId: "cmqaf54h90003tsrwopg483df"
 *             rating: 5
 *             title: "Excellent service"
 *             body: "The consultant was very helpful and guided me through the entire application process."
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/ReviewWithReviewer' }
 *                 message: { type: 'string' }
 *       400:
 *         description: Invalid input (e.g. target cannot be reviewed, self-review)
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
 *         description: Not authorized (requires STUDENT role) or CSRF token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Target user not found or not reviewable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: You have already reviewed this profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
