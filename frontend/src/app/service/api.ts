import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

export interface User {
  Id: number
  email: string
  name?: string
  role?: string
}

export const userApi = {
  getAll: () => api.get<User[]>('/users').then(res => res.data),
  create: (data: Omit<User, 'Id'>) => api.post<User>('/users', data).then(res => res.data),
  update: (id: number, data: Partial<Omit<User, 'Id'>>) => 
    api.put<User>(`/users/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/users/${id}`),
}