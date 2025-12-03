/**
 * Use Case - Create User
 * Contains business logic for creating a new user
 * Uses Repository and PasswordHasher through dependency injection
 */
import type { UserRepository, CreateUserData, User } from '../domain/interfaces/UserRepository'
import type { PasswordHasher } from '../domain/interfaces/PasswordHasher'

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(data: CreateUserData): Promise<{ user: Omit<User, 'password'>; generatedPassword: string }> {
    // Normalize email
    const normalizedEmail = data.email.trim().toLowerCase()

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(normalizedEmail)
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_TAKEN')
    }

    // Generate random password
    const generatedPassword = this.generateRandomPassword(12)

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(generatedPassword)

    // Create user
    const user = await this.userRepository.create({
      email: normalizedEmail,
      name: data.name ?? null,
      role: data.role ?? null,
      password: hashedPassword,
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      generatedPassword,
    }
  }

  private generateRandomPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%&*'
    const allChars = uppercase + lowercase + numbers + special

    let password = ''
    // Garantir pelo menos um de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    // Preencher o resto aleatoriamente
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Embaralhar a senha
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}

