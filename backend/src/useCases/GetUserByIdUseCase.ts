/**
 * Use Case - Get User By ID
 * Contains business logic for retrieving a user by ID
 */
import type { UserRepository, User } from '../domain/interfaces/UserRepository'

export class GetUserByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

