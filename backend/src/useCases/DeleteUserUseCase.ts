/**
 * Use Case - Delete User
 * Contains business logic for deleting a user
 */
import type { UserRepository } from '../domain/interfaces/UserRepository'

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number): Promise<void> {
    // Check if user exists
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    // Delete user
    await this.userRepository.delete(id)
  }
}

