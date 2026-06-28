import { api } from './client.js';

// ---- auth ------------------------------------------------------------------
export const authApi = {
  me: () => api.get('/auth/me', { skipRefresh: true }),
  signup: (payload) => api.post('/auth/signup', payload),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, email, newPassword) =>
    api.post('/auth/reset-password', { token, email, newPassword }),
};

// ---- directory (universities/agents/consultants) ---------------------------
export const directoryApi = {
  listUniversities: async (query) => {
    const r = await api.get('/universities', { query });
    return { items: r.data, meta: r.meta };
  },
  getUniversity: async (id) => {
    const r = await api.get(`/universities/${id}`);
    return { item: r.data };
  },
  compareUniversities: async (ids) => {
    const r = await api.get('/universities/compare', { query: { ids: ids.join(',') } });
    return { items: r.data };
  },
  updateUniversityMe: (patch) => api.patch('/universities/me', patch),

  listAgents: async (query) => {
    const r = await api.get('/agents', { query });
    return { items: r.data, meta: r.meta };
  },
  getAgent: async (id) => {
    const r = await api.get(`/agents/${id}`);
    return { item: r.data };
  },
  updateAgentMe: (patch) => api.patch('/agents/me', patch),

  listConsultants: async (query) => {
    const r = await api.get('/consultants', { query });
    return { items: r.data, meta: r.meta };
  },
  getConsultant: async (id) => {
    const r = await api.get(`/consultants/${id}`);
    return { item: r.data };
  },
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

// ---- enquiries (student → university / agent / consultant) -----------------
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
