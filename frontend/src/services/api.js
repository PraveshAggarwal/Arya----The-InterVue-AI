import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('intervue_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('intervue_token');
      localStorage.removeItem('intervue_auth');
      localStorage.removeItem('intervue_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
};

export const resumeService = {
  upload: (formData) => api.post('/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  analyze: (id, data) => api.post(`/resumes/${id}/analyze`, data, { timeout: 180000 }),
  delete: (id) => api.delete(`/resumes/${id}`),
};

export const interviewService = {
  create: (data) => api.post('/interviews', data),
  getAll: () => api.get('/interviews'),
  getById: (id) => api.get(`/interviews/${id}`),
  start: (id) => api.post(`/interviews/${id}/start`),
  complete: (id, data) => api.post(`/interviews/${id}/complete`, data, { timeout: 300000 }),
  nextQuestion: (id, data) => api.post(`/interviews/${id}/next-question`, data),
};

export const questionService = {
  generate: (id) => api.post(`/questions/${id}/generate`),
  getAll: (id) => api.get(`/questions/${id}`),
};

export default api;
