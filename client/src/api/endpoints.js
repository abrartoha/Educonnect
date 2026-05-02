import { api } from './client.js';

// ---- auth ------------------------------------------------------------------
export const authApi = {
  me: () => api.get('/auth/me', { skipRefresh: true }),
  signup: (payload) => api.post('/auth/signup', payload),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

// ---- directory (universities/agents/consultants) ---------------------------
export const directoryApi = {
  listUniversities: (query) => api.get('/universities', { query }),
  getUniversity: (id) => api.get(`/universities/${id}`),
  compareUniversities: (ids) =>
    api.get('/universities/compare', { query: { ids: ids.join(',') } }),
  updateUniversityMe: (patch) => api.patch('/universities/me', patch),

  listAgents: (query) => api.get('/agents', { query }),
  getAgent: (id) => api.get(`/agents/${id}`),
  updateAgentMe: (patch) => api.patch('/agents/me', patch),

  listConsultants: (query) => api.get('/consultants', { query }),
  getConsultant: (id) => api.get(`/consultants/${id}`),
  updateConsultantMe: (patch) => api.patch('/consultants/me', patch),

  updateStudentMe: (patch) => api.patch('/students/me', patch),
};

// ---- posts & social --------------------------------------------------------
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

// ---- reviews ---------------------------------------------------------------
export const reviewsApi = {
  listForTarget: (targetId) => api.get(`/reviews/target/${targetId}`),
  create: (payload) => api.post('/reviews', payload),
};

// ---- campaigns (university only) ------------------------------------------
export const campaignsApi = {
  list: () => api.get('/campaigns'),
  create: (payload) => api.post('/campaigns', payload),
  update: (id, payload) => api.patch(`/campaigns/${id}`, payload),
  remove: (id) => api.del(`/campaigns/${id}`),
};

// ---- bookings (student ↔ provider) ----------------------------------------
export const bookingsApi = {
  list: () => api.get('/bookings'),
  create: (payload) => api.post('/bookings', payload),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

// ---- meetings (LiveKit) ---------------------------------------------------
export const meetingsApi = {
  joinToken: (bookingId) => api.post(`/bookings/${bookingId}/meeting/token`),
};

// ---- messaging (1:1 chat) -------------------------------------------------
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

// ---- leads (student → university) -----------------------------------------
export const leadsApi = {
  list: () => api.get('/leads'),
  listMine: () => api.get('/leads/mine'),
  create: (payload) => api.post('/leads', payload),
  updateStatus: (id, status) => api.patch(`/leads/${id}/status`, { status }),
};

// ---- admin -----------------------------------------------------------------
export const adminApi = {
  overview: () => api.get('/admin/overview'),
  listUsers: (query) => api.get('/admin/users', { query }),
  approve: (id) => api.post(`/admin/users/${id}/approve`),
  suspend: (id) => api.post(`/admin/users/${id}/suspend`),
  reactivate: (id) => api.post(`/admin/users/${id}/reactivate`),
  togglePostPin: (id) => api.post(`/admin/posts/${id}/pin`),
  setPostStatus: (id, status) => api.patch(`/admin/posts/${id}/status`, { status }),
};
