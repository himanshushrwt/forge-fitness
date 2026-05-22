import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api', timeout: 30000 });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('forge_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) { localStorage.removeItem('forge_token'); window.location.href = '/login'; }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/update-profile', data)
};

export const exercises = {
  getAll: (params) => API.get('/exercises', { params }),
  getById: (id) => API.get(`/exercises/${id}`),
};

export const workouts = {
  getAll: () => API.get('/workouts'),
  create: (data) => API.post('/workouts', data),
  update: (id, data) => API.put(`/workouts/${id}`, data),
  delete: (id) => API.delete(`/workouts/${id}`)
};

export const nutrition = {
  getAll: () => API.get('/nutrition'),
  create: (data) => API.post('/nutrition', data),
  update: (id, data) => API.put(`/nutrition/${id}`, data)
};

export const trainers = {
  getAll: () => API.get('/trainers'),
  getById: (id) => API.get(`/trainers/${id}`),
  getReviews: (id) => API.get(`/trainers/${id}/reviews`),
  submitReview: (id, data) => API.post(`/trainers/${id}/review`, data),
  getSlots: (id, date) => API.get(`/trainers/${id}/slots`, { params: { date } }),
  bookSession: (id, data) => API.post(`/trainers/${id}/book`, data),
  verify: (id) => API.put(`/trainers/${id}/verify`),
  unverify: (id) => API.put(`/trainers/${id}/unverify`),
  remove: (id) => API.delete(`/trainers/${id}`),
};

export const bookings = {
  getMy: () => API.get('/bookings/my'),
  getCoachSessions: () => API.get('/bookings/coach'),
  cancel: (id, reason) => API.put(`/bookings/${id}/cancel`, { reason }),
};

export const dietplan = {
  get: () => API.get('/dietplan'),
  save: (data) => API.post('/dietplan', data),
  remind: (data) => API.post('/dietplan/remind', data),
};

export const progress = {
  getStats: () => API.get('/progress/stats'),
  uploadPhoto: (formData) => API.post('/progress/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  logWeight: (data) => API.post('/progress/weight', data)
};

export const ai = {
  chat: (data) => API.post('/ai/chat', data),
  analyzePhoto: (data) => API.post('/ai/analyze-photo', data),
  generatePlan: (data) => API.post('/ai/generate-plan', data)
};

export const reminders = {
  getAll: () => API.get('/reminders'),
  create: (data) => API.post('/reminders', data),
  delete: (id) => API.delete(`/reminders/${id}`)
};

export const users = {
  getLeaderboard: () => API.get('/users/leaderboard'),
  updateStats: (data) => API.put('/users/stats', data)
};

export const admin = {
  getStats: () => API.get('/admin/stats'),
  getUsers: () => API.get('/admin/users'),
  getCoaches: () => API.get('/admin/coaches'),
  suspendUser: (id) => API.delete(`/admin/users/${id}`),
  verifyCoach: (id, verified) => API.put(`/admin/coaches/${id}/verify`, { verified }),
  getBookings: () => API.get('/admin/bookings'),
  getComplaints: () => API.get('/admin/complaints'),
  submitComplaint: (data) => API.post('/admin/complaints', data),
  updateComplaint: (id, data) => API.put(`/admin/complaints/${id}`, data),
  getReviews: () => API.get('/admin/reviews'),
  deleteReview: (id) => API.delete(`/admin/reviews/${id}`),
};

export default API;
