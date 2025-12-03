/**
 * Domain Interface - User Repository
 * Abstraction for user data access operations
 */
export interface User {
  Id: number
  email: string
  name?: string | null
  role?: string | null
  password?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  email: string
  name?: string | null
  role?: string | null
  password: string
}

export interface UpdateUserData {
  email?: string
  name?: string | null
  role?: string | null
  password?: string
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: number): Promise<User | null>
  findAll(): Promise<User[]>
  create(data: CreateUserData): Promise<User>
  update(id: number, data: UpdateUserData): Promise<User>
  delete(id: number): Promise<void>
}

