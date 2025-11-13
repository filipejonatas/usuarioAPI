/**
 * Day 3 - Fake User Repository
 * In-memory implementation for testing
 */
import { UserRepository, User, CreateUserData } from '../../src/domain/interfaces/UserRepository'

export class FakeUserRepository implements UserRepository {
  private users: User[] = []
  private nextId = 1

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim()
    return this.users.find((u) => u.email.toLowerCase() === normalizedEmail) || null
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

  // Helper methods for testing
  clear(): void {
    this.users = []
    this.nextId = 1
  }

  getAll(): User[] {
    return [...this.users]
  }
}

