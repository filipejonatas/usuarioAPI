export interface UserPayload {
  Id: number
  email: string
  name?: string | null
  role?: string | null
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
  role?: string
}

export interface LoginRequest {
  email: string
  password: string
}