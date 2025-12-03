/**
 * Use Case - Login
 * Contains business logic for user authentication
 */
import type { UserRepository, User } from '../domain/interfaces/UserRepository'
import type { PasswordHasher } from '../domain/interfaces/PasswordHasher'
import type { TokenGenerator } from '../domain/interfaces/TokenGenerator'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginOutput {
  user: Omit<User, 'password'>
  token: string
  mustChangePassword: boolean
}

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private tokenGenerator: TokenGenerator
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // Normalize email
    const normalizedEmail = input.email.trim().toLowerCase()

    // Find user
    const user = await this.userRepository.findByEmail(normalizedEmail)
    if (!user || !user.password) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // Verify password
    const isValidPassword = await this.passwordHasher.compare(input.password, user.password)
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // Generate token
    const token = this.tokenGenerator.generate({
      Id: user.Id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Check if first login (createdAt === updatedAt)
    const isFirstLogin = user.createdAt.getTime() === user.updatedAt.getTime()

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
      mustChangePassword: isFirstLogin,
    }
  }
}

