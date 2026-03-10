import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request when available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Normalise error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      'Unknown error';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export const authApi = {
  login: (data: LoginPayload) => api.post('/auth/login', data),
  register: (data: RegisterPayload) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface CreateProjectPayload {
  title: string;
  description: string;
  category: string;
  tier?: string;
  priority?: string;
  budget?: number;
  deadline?: string;
  deliverables?: string;
}

export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: CreateProjectPayload) => api.post('/projects', data),
  update: (id: string, data: Partial<CreateProjectPayload>) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getMessages: (id: string) => api.get(`/projects/${id}/messages`),
  sendMessage: (id: string, data: { content: string; receiverId: string; isInternal?: boolean }) =>
    api.post(`/projects/${id}/messages`, data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  pendingApprovals: () => api.get('/admin/pending-approvals'),
  approveProject: (id: string, approvalNotes?: string) =>
    api.post(`/admin/approve-project/${id}`, { approvalNotes }),
  rejectProject: (id: string, rejectionReason: string) =>
    api.post(`/admin/reject-project/${id}`, { rejectionReason }),
  requestInfo: (id: string, message: string) =>
    api.post(`/admin/request-info/${id}`, { message }),
  listUsers: () => api.get('/admin/users'),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: { name?: string }) => api.patch(`/users/${id}`, data),
};

export default api;
