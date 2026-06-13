import { responseHandler } from '../../shared/utils/responseHandler.js';
import {
  createLead as createLeadService,
  listMyLeads as listMyLeadsService,
  updateLeadStatus as updateLeadStatusService,
  listMySubmittedLeads as listMySubmittedLeadsService,
} from './leads.service.js';

export const createLead = async (req, res) => {
  const lead = await createLeadService(req.user, req.body);
  responseHandler.created(res, lead);
};

export const listMyLeads = async (req, res) => {
  const result = await listMyLeadsService(req.user.id, req.query);
  responseHandler.paginated(res, result.items, result.meta);
};

export const updateLeadStatus = async (req, res) => {
  const lead = await updateLeadStatusService(req.params.id, req.user.id, req.body.status);
  responseHandler.updated(res, lead);
};

export const listMySubmittedLeads = async (req, res) => {
  const result = await listMySubmittedLeadsService(req.user.id, req.query);
  responseHandler.paginated(res, result.items, result.meta);
};
