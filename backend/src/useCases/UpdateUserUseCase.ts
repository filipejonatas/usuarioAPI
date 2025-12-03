/**
 * Use Case - Update User
 * Contains business logic for updating user information
 */
import type { UserRepository, UpdateUserData, User } from '../domain/interfaces/UserRepository'

export interface UpdateUserInput extends UpdateUserData {
  id: number
}

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<Omit<User, 'password'>> {
    const { id, ...updateData } = input

    // Check if user exists
    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new Error('USER_NOT_FOUND')
    }

    // Normalize email if provided
    if (updateData.email) {
      const normalizedEmail = updateData.email.trim().toLowerCase()
      
      // Check if email is already taken by another user
      const userWithEmail = await this.userRepository.findByEmail(normalizedEmail)
      if (userWithEmail && userWithEmail.Id !== id) {
        throw new Error('EMAIL_ALREADY_TAKEN')
      }
      
      updateData.email = normalizedEmail
    }

    // Update user
    const updatedUser = await this.userRepository.update(id, updateData)

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  }
}

