/**
 * @openapi
 * tags:
 *   name: Directory
 *   description: Directory browsing and profile management
 */

/**
 * @openapi
 * /universities:
 *   get:
 *     summary: List universities
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/SortParam'
 *       - name: verified
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by verified status
 *       - name: location
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of universities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/UniversityProfile' } }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *                     pages: { type: 'integer' }
 */

/**
 * @openapi
 * /universities/compare:
 *   get:
 *     summary: Compare up to three universities
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: ids
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated list of 2 or 3 university IDs
 *     responses:
 *       200:
 *         description: List of compared universities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/UniversityProfile' } }
 */

/**
 * @openapi
 * /universities/{id}:
 *   get:
 *     summary: Get a specific university profile
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: University profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/UniversityProfile' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /universities/me:
 *   patch:
 *     summary: Update own university profile
 *     description: Requires UNIVERSITY role.
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UniversityUpdate'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/UniversityProfile' }
 */

/**
 * @openapi
 * /agents:
 *   get:
 *     summary: List agents
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/SortParam'
 *       - name: verified
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by verified status
 *       - name: location
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/AgentProfile' } }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *                     pages: { type: 'integer' }
 */

/**
 * @openapi
 * /agents/{id}:
 *   get:
 *     summary: Get a specific agent profile
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/AgentProfile' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /agents/me:
 *   patch:
 *     summary: Update own agent profile
 *     description: Requires AGENT role.
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentUpdate'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/AgentProfile' }
 */

/**
 * @openapi
 * /consultants:
 *   get:
 *     summary: List consultants
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/SortParam'
 *       - name: verified
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by verified status
 *       - name: location
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of consultants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/ConsultantProfile' } }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *                     pages: { type: 'integer' }
 */

/**
 * @openapi
 * /consultants/{id}:
 *   get:
 *     summary: Get a specific consultant profile
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consultant profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/ConsultantProfile' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /consultants/me:
 *   patch:
 *     summary: Update own consultant profile
 *     description: Requires CONSULTANT role.
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsultantUpdate'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/ConsultantProfile' }
 */

/**
 * @openapi
 * /students/me:
 *   patch:
 *     summary: Update own student profile
 *     description: Requires STUDENT role.
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentUpdate'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: 'string' }
 *                     name: { type: 'string' }
 *                     avatarUrl: { type: 'string', nullable: true }
 *                     createdAt: { type: 'string', format: 'date-time' }
 *                     student:
 *                       type: object
 *                       properties:
 *                         nationality: { type: 'string', nullable: true }
 *                         currentEducation: { type: 'string', nullable: true }
 *                         interestedIn: { type: 'array', items: { type: 'string' } }
 *                         preferredLocations: { type: 'array', items: { type: 'string' } }
 *                         budgetMin: { type: 'integer', nullable: true }
 *                         budgetMax: { type: 'integer', nullable: true }
 *                         bio: { type: 'string', nullable: true }
 *                         intakeTarget: { type: 'string', nullable: true }
 */
