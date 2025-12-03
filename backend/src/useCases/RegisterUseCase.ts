/**
 * Use Case - Register User
 * Contains business logic for user registration
 */
import type { UserRepository, User } from '../domain/interfaces/UserRepository'
import type { PasswordHasher } from '../domain/interfaces/PasswordHasher'
import type { TokenGenerator } from '../domain/interfaces/TokenGenerator'

export interface RegisterInput {
  email: string
  password: string
  name?: string
  role?: string
}

export interface RegisterOutput {
  user: Omit<User, 'password'>
  token: string
}

export class RegisterUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private tokenGenerator: TokenGenerator
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // Validate password length
    if (input.password.length < 6) {
      throw new Error('PASSWORD_TOO_SHORT')
    }

    // Normalize email
    const normalizedEmail = input.email.trim().toLowerCase()

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(normalizedEmail)
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_TAKEN')
    }

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(input.password)

    // Create user
    const user = await this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: input.name ?? null,
      role: input.role ?? null,
    })

    // Generate token
    const token = this.tokenGenerator.generate({
      Id: user.Id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
    }
  }
}

