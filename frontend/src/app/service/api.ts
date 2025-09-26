import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface User {
  Id: number
  email: string
  name?: string
  role?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: User
  token: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
  role?: string
}

// Auth API
export const authApi = {
  login: (data: LoginRequest) => 
    api.post<LoginResponse>('/auth/login', data).then(res => res.data),
  register: (data: RegisterRequest) => 
    api.post<User>('/auth/register', data).then(res => res.data),
}

// User API
export const userApi = {
  getAll: () => api.get<User[]>('/users').then(res => res.data),
  create: (data: Omit<User, 'Id'>) => api.post<User>('/users', data).then(res => res.data),
  update: (id: number, data: Partial<Omit<User, 'Id'>>) => 
    api.put<User>(`/users/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/users/${id}`),
}