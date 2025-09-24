import type { role } from "@prisma/client"
export interface UserPayload {
  Id: number
  email: string
  name?: string | null
  roleuser?: role | null | string;
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
  role?: role
}

export interface LoginRequest {
  email: string
  password: string
}