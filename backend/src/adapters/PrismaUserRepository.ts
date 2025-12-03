/**
 * Adapter Pattern - Prisma User Repository
 * Implements UserRepository interface using Prisma ORM
 * Adapts Prisma-specific operations to domain interface
 */
import { prisma } from '../models/prisma'
import type { UserRepository, User, CreateUserData, UpdateUserData } from '../domain/interfaces/UserRepository'

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })
    return user ? this.mapToDomain(user) : null
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { Id: id },
    })
    return user ? this.mapToDomain(user) : null
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { Id: 'asc' },
    })
    return users.map(this.mapToDomain)
  }

  async create(data: CreateUserData): Promise<User> {
    const normalizedEmail = data.email.trim().toLowerCase()
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: data.name ?? null,
        role: data.role ?? null,
        password: data.password,
      },
    })
    return this.mapToDomain(user)
  }

  async update(id: number, data: UpdateUserData): Promise<User> {
    const updateData: any = {}
    if (data.email !== undefined) {
      updateData.email = data.email.trim().toLowerCase()
    }
    if (data.name !== undefined) updateData.name = data.name
    if (data.role !== undefined) updateData.role = data.role
    if (data.password !== undefined) updateData.password = data.password

    const user = await prisma.user.update({
      where: { Id: id },
      data: updateData,
    })
    return this.mapToDomain(user)
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { Id: id },
    })
  }

  private mapToDomain(prismaUser: any): User {
    return {
      Id: prismaUser.Id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role,
      password: prismaUser.password,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    }
  }
}

