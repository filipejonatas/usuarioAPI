/**
 * Use Case - Get Users
 * Contains business logic for retrieving all users
 */
import type { UserRepository, User } from '../domain/interfaces/UserRepository'

export class GetUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.findAll()
    return users.map(({ password: _, ...userWithoutPassword }) => userWithoutPassword)
  }
}

