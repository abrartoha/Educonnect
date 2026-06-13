import { responseHandler } from '../../shared/utils/responseHandler.js';
import {
  listMyCampaigns as listMyCampaignsService,
  createCampaign as createCampaignService,
  updateCampaign as updateCampaignService,
  deleteCampaign as deleteCampaignService,
} from './campaigns.service.js';

export const listMyCampaigns = async (req, res) => {
  const result = await listMyCampaignsService(req.user.id, req.query);
  responseHandler.paginated(res, result.items, result.meta);
};

export const createCampaign = async (req, res) => {
  const campaign = await createCampaignService(req.user.id, req.body);
  responseHandler.created(res, campaign);
};

export const updateCampaign = async (req, res) => {
  const campaign = await updateCampaignService(req.params.id, req.user.id, req.body);
  responseHandler.updated(res, campaign);
};

export const deleteCampaign = async (req, res) => {
  await deleteCampaignService(req.params.id, req.user.id);
  responseHandler.noContent(res);
};
