import axios from 'axios';
import { supabase } from '../lib/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const isAuthRoute = err.config?.url?.includes('/auth/');
    // Only force-redirect on 401 from non-auth routes (i.e., an expired session)
    // Don't redirect if the user is actively trying to log in (wrong password, etc.)
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  verifyRegister: (email, otp) => api.post('/auth/register/verify', { email, otp }),
  login:          (email, password) => api.post('/auth/login', { email, password }),
  sendOtp:        (email) => api.post('/auth/otp/send', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword }),
  me:             () => api.get('/auth/me'),
};

// Items
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getOne: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/items/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/items/${id}`),
  markSold: (id) => api.post(`/items/${id}/sold`),
  markAvailable: (id) => api.post(`/items/${id}/available`),
};

// Borrow
export const borrowAPI = {
  getAll: (params) => api.get('/borrow', { params }),
  getOne: (id) => api.get(`/borrow/${id}`),
  create: (data) => api.post('/borrow', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/borrow/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/borrow/${id}`),
  markStatus: (id, status) => api.patch(`/borrow/${id}/status`, { status }),
  request: (id, data) => api.post(`/borrow/${id}/request`, data),
  respond: (id, requestId, status) => api.put(`/borrow/${id}/request/${requestId}`, { status }),
  markReturned: (id) => api.put(`/borrow/${id}/return`),
};

// Messages
export const messagesAPI = {
  getConversations: () => api.get('/messages'),
  getOrCreate: (data) => api.post('/messages/conversation', data),
  getMessages: (id) => api.get(`/messages/${id}`),
  send: (id, content) => api.post(`/messages/${id}`, { content }),
};

// Users
export const usersAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (data) => api.post('/users/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyListings: () => api.get('/users/my/listings'),
  saveItem: (id) => api.post(`/users/save/${id}`),
};

// Payments
export const paymentsAPI = {
  checkout: (data) => api.post('/payments/checkout', data),
  verify: (sessionId) => api.get(`/payments/verify/${sessionId}`),
  history: () => api.get('/payments/history'),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: () => api.put('/notifications/read'),
  markOneRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Requests (Broadcast)
export const requestsAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  getMine: () => api.get('/requests/mine'),
  respond: (id) => api.post(`/requests/${id}/respond`),
  close: (id) => api.put(`/requests/${id}/close`),
};

// Reviews
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getForUser: (userId) => api.get(`/reviews/${userId}`),
};

export default api;
