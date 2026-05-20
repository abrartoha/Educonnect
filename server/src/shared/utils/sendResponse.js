import { HttpStatus } from './httpStatus.js';

/**
 * Standardized API response format:
 * {
 *   success: boolean,
 *   data: any,
 *   message?: string,
 *   meta?: { pagination, etc }
 * }
 */

export const sendResponse = (res, { statusCode = HttpStatus.OK, data = null, message, meta } = {}) => {
  const response = { success: statusCode < 400 };

  if (data !== null) response.data = data;
  if (message) response.message = message;
  if (meta) response.meta = meta;

  res.status(statusCode).json(response);
};

export const sendCreated = (res, data, message = 'Created successfully', meta) =>
  sendResponse(res, { statusCode: HttpStatus.CREATED, data, message, meta });

export const sendOk = (res, data, message, meta) =>
  sendResponse(res, { statusCode: HttpStatus.OK, data, message, meta });

export const sendNoContent = (res) =>
  res.status(HttpStatus.NO_CONTENT).send();

export const sendPaginated = (res, data, pagination, message, meta = {}) =>
  sendResponse(res, { statusCode: HttpStatus.OK, data, message, meta: { ...meta, pagination } });