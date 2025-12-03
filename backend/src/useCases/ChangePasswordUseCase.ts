/**
 * Use Case - Change Password
 * Contains business logic for changing user password
 */
import type { UserRepository } from '../domain/interfaces/UserRepository'
import type { PasswordHasher } from '../domain/interfaces/PasswordHasher'

export interface ChangePasswordInput {
  userId: number
  currentPassword: string
  newPassword: string
}

export class ChangePasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    // Validate new password length
    if (input.newPassword.length < 6) {
      throw new Error('PASSWORD_TOO_SHORT')
    }

    // Find user
    const user = await this.userRepository.findById(input.userId)
    if (!user || !user.password) {
      throw new Error('USER_NOT_FOUND')
    }

    // Verify current password
    const isValidPassword = await this.passwordHasher.compare(
      input.currentPassword,
      user.password
    )
    if (!isValidPassword) {
      throw new Error('INVALID_CURRENT_PASSWORD')
    }

    // Hash new password
    const hashedPassword = await this.passwordHasher.hash(input.newPassword)

    // Update password
    await this.userRepository.update(input.userId, {
      password: hashedPassword,
    })
  }
}

