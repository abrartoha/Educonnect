import { NotFoundError } from '../../shared/utils/errors.js';
import { responseHandler } from '../../shared/utils/responseHandler.js';
import * as directoryService from './directory.service.js';

const listByRole = (role) => async (req, res) => {
  const result = await directoryService.listProfilesByRole(role, req.query);
  responseHandler.paginated(res, result.items, result.meta);
};

const getByRole = (role, notFoundMsg) => async (req, res) => {
  const user = await directoryService.getProfileById(role, req.params.id);
  if (!user) throw new NotFoundError(notFoundMsg);
  responseHandler.ok(res, user);
};

export const listUniversities = listByRole('UNIVERSITY');
export const getUniversity = getByRole('UNIVERSITY', 'University not found');

export const compareUniversities = async (req, res) => {
  const items = await directoryService.compareUniversities(req.query.ids);
  responseHandler.ok(res, items);
};

export const listAgents = listByRole('AGENT');
export const getAgent = getByRole('AGENT', 'Agent not found');

export const listConsultants = listByRole('CONSULTANT');
export const getConsultant = getByRole('CONSULTANT', 'Consultant not found');

export const updateOwnProfile = async (req, res) => {
  const updated = await directoryService.updateUserProfile(req.user.id, req.user.role, req.body);
  responseHandler.ok(res, updated);
};
