import { issueJoinToken } from './meetings.service.js';

export const createJoinToken = async (req, res) => {
  const result = await issueJoinToken({
    bookingId: req.params.id,
    user: req.user,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  res.json(result);
};
