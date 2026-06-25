export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

/**
 * Response handler utility for standardized API responses
 * Provides methods for sending various HTTP response types with consistent pattern
 * @namespace responseHandler
 */
export const responseHandler = {
  /**
   * Sends a standardized API response
   * @param {Object} res - Express response object
   * @param {Object} options - Response options
   * @param {number} [options.statusCode=200] - HTTP status code
   * @param {*} [options.data=null] - Response data payload
   * @param {string} [options.message] - Optional response message
   * @param {Object} [options.meta] - Optional metadata (pagination, etc.)
   * @returns {void}
   * @example
   * responseHandler.send(res, {
   *   statusCode: 200,
   *   data: { id: 1, name: 'John' },
   *   message: 'User fetched successfully'
   * });
   */
  send(res, { statusCode = HttpStatus.OK, data = null, message, meta } = {}) {
    const response = { success: statusCode < 400 };

    if (data !== null) response.data = data;
    if (message) response.message = message;
    if (meta) response.meta = meta;

    res.status(statusCode).json(response);
  },

  /**
   * Sends a 201 Created response
   * @param {Object} res - Express response object
   * @param {*} data - Created resource data
   * @param {string} [message='Created successfully'] - Response message
   * @param {Object} [meta] - Optional metadata
   * @returns {void}
   * @example
   * responseHandler.created(
   *   res,
   *   data: { id: 1, name: 'New User' },
   *   message: 'User created successfully'
   * );
   */
  created(res, data, message = 'Created successfully', meta) {
    this.send(res, { statusCode: HttpStatus.CREATED, data, message, meta });
  },

  /**
   * Sends a 200 OK response for updated resources
   * @param {Object} res - Express response object
   * @param {*} data - Updated resource data
   * @param {string} [message='Updated successfully'] - Response message
   * @param {Object} [meta] - Optional metadata
   * @returns {void}
   * @example
   * responseHandler.updated(res, { id: 1, name: 'Updated User' });
   */
  updated(res, data, message = 'Updated successfully', meta) {
    this.send(res, { statusCode: HttpStatus.OK, data, message, meta });
  },

  /**
   * Sends a 200 OK response
   * @param {Object} res - Express response object
   * @param {*} [data] - Response data payload
   * @param {string} [message] - Optional response message
   * @param {Object} [meta] - Optional metadata
   * @returns {void}
   * @example
   * responseHandler.ok(res, { users: [] }, 'Users fetched successfully');
   */
  ok(res, data, message, meta) {
    this.send(res, { statusCode: HttpStatus.OK, data, message, meta });
  },

  /**
   * Sends a 204 No Content response
   * @param {Object} res - Express response object
   * @returns {void}
   * @example
   * responseHandler.noContent(res);
   */
  noContent(res) {
    res.status(HttpStatus.NO_CONTENT).send();
  },

  /**
   * Sends a 200 OK response with pagination metadata
   * @param {Object} res - Express response object
   * @param {*} data - Array of paginated data
   * @param {Object} pagination - Pagination information
   * @param {number} pagination.page - Current page number
   * @param {number} pagination.limit - Items per page
   * @param {number} pagination.total - Total items count
   * @param {string} [message] - Optional response message
   * @param {Object} [meta={}] - Additional metadata to merge with pagination
   * @returns {void}
   * @example
   * responseHandler.paginated(res, users, {
   *   page: 1,
   *   limit: 10,
   *   total: 50
   * }, 'Users fetched successfully');
   */
  paginated(res, data, pagination, message, meta = {}) {
    this.send(res, { statusCode: HttpStatus.OK, data, message, meta: { ...meta, ...pagination } });
  },
};