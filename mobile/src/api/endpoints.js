import { api } from './client';

export const authApi = {
  me: () => api.get('/auth/me'),
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (payload) => api.post('/auth/signup', payload),
  logout: async (refreshToken) => api.post('/auth/logout', { refreshToken }),
};

export const directoryApi = {
  listUniversities: (query) => api.get('/universities', { query }),
  getUniversity: (id) => api.get(`/universities/${id}`),
  compareUniversities: (ids) =>
    api.get('/universities/compare', { query: { ids: ids.join(',') } }),
  listAgents: (query) => api.get('/agents', { query }),
  getAgent: (id) => api.get(`/agents/${id}`),
  listConsultants: (query) => api.get('/consultants', { query }),
  getConsultant: (id) => api.get(`/consultants/${id}`),
  updateStudentMe: (patch) => api.patch('/students/me', patch),
  updateUniversityMe: (patch) => api.patch('/universities/me', patch),
  updateAgentMe: (patch) => api.patch('/agents/me', patch),
  updateConsultantMe: (patch) => api.patch('/consultants/me', patch),
};

export const postsApi = {
  list: (query) => api.get('/posts', { query }),
  get: (id) => api.get(`/posts/${id}`),
  create: (payload) => api.post('/posts', payload),
  update: (id, payload) => api.patch(`/posts/${id}`, payload),
  remove: (id) => api.del(`/posts/${id}`),
  toggleUpvote: (id) => api.post(`/posts/${id}/upvote`),
  toggleBookmark: (id) => api.post(`/posts/${id}/bookmark`),
  listComments: (id) => api.get(`/posts/${id}/comments`),
  addComment: (id, text) => api.post(`/posts/${id}/comments`, { text }),
  deleteComment: (commentId) => api.del(`/posts/comments/${commentId}`),
  mine: () => api.get('/posts/me'),
  bookmarks: () => api.get('/posts/bookmarks'),
};

export const bookingsApi = {
  list: () => api.get('/bookings'),
  create: (payload) => api.post('/bookings', payload),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

export const leadsApi = {
  create: (payload) => api.post('/leads', payload),
  list: () => api.get('/leads'),
  listMine: () => api.get('/leads/mine'),
  updateStatus: (id, status) => api.patch(`/leads/${id}/status`, { status }),
};

export const campaignsApi = {
  list: () => api.get('/campaigns'),
  create: (payload) => api.post('/campaigns', payload),
  update: (id, payload) => api.patch(`/campaigns/${id}`, payload),
  remove: (id) => api.del(`/campaigns/${id}`),
};

export const reviewsApi = {
  listForTarget: (id) => api.get(`/reviews/target/${id}`),
  create: (payload) => api.post('/reviews', payload),
};

export const adminApi = {
  overview: () => api.get('/admin/overview'),
  listUsers: (query) => api.get('/admin/users', { query }),
  approve: (id) => api.post(`/admin/users/${id}/approve`),
  suspend: (id) => api.post(`/admin/users/${id}/suspend`),
  reactivate: (id) => api.post(`/admin/users/${id}/reactivate`),
  togglePostPin: (id) => api.post(`/admin/posts/${id}/pin`),
  setPostStatus: (id, status) => api.patch(`/admin/posts/${id}/status`, { status }),
};

// ---- meetings (LiveKit) ---------------------------------------------------
export const meetingsApi = {
  joinToken: (bookingId) => api.post(`/bookings/${bookingId}/meeting/token`),
};

// ---- messaging (1:1 chat over Socket.io) ----------------------------------
export const messagingApi = {
  listConversations: () => api.get('/messages/conversations'),
  startConversation: (userId) => api.post('/messages/conversations', { userId }),
  getConversation: (id) => api.get(`/messages/conversations/${id}`),
  listMessages: (id, query) =>
    api.get(`/messages/conversations/${id}/messages`, { query }),
  sendMessage: (id, body) =>
    api.post(`/messages/conversations/${id}/messages`, { body }),
  markRead: (id) => api.post(`/messages/conversations/${id}/read`),
};
