/**
 * Day 3 - Fake User Repository
 * In-memory implementation for testing
 */
import { UserRepository, User, CreateUserData, UpdateUserData } from '../../src/domain/interfaces/UserRepository'

export class FakeUserRepository implements UserRepository {
  private users: User[] = []
  private nextId = 1

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim()
    return this.users.find((u) => u.email.toLowerCase() === normalizedEmail) || null
  }

  async findById(id: number): Promise<User | null> {
    return this.users.find((u) => u.Id === id) || null
  }

  async findAll(): Promise<User[]> {
    return [...this.users]
  }

  async create(data: CreateUserData): Promise<User> {
    const user: User = {
      Id: this.nextId++,
      email: data.email.toLowerCase().trim(),
      name: data.name ?? null,
      role: data.role ?? null,
      password: data.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.push(user)
    return user
  }

  async update(id: number, data: UpdateUserData): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.Id === id)
    if (userIndex === -1) {
      throw new Error('USER_NOT_FOUND')
    }

    const user = this.users[userIndex]
    const updated: User = {
      ...user,
      ...(data.email !== undefined && { email: data.email.toLowerCase().trim() }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.password !== undefined && { password: data.password }),
      updatedAt: new Date(),
    }

    this.users[userIndex] = updated
    return updated
  }

  async delete(id: number): Promise<void> {
    const userIndex = this.users.findIndex((u) => u.Id === id)
    if (userIndex === -1) {
      throw new Error('USER_NOT_FOUND')
    }
    this.users.splice(userIndex, 1)
  }

  // Helper methods for testing
  clear(): void {
    this.users = []
    this.nextId = 1
  }

  getAll(): User[] {
    return [...this.users]
  }
}

