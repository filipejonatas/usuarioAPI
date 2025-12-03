/**
 * Dependency Injection Container Pattern
 * Centralized container for managing dependencies and their lifecycle
 * Provides singleton instances and resolves dependencies automatically
 */
import type { UserRepository } from '../domain/interfaces/UserRepository'
import type { PasswordHasher } from '../domain/interfaces/PasswordHasher'
import type { TokenGenerator } from '../domain/interfaces/TokenGenerator'
import { PrismaUserRepository } from '../adapters/PrismaUserRepository'
import { BcryptPasswordHasher } from '../adapters/BcryptPasswordHasher'
import { JwtTokenGenerator } from '../adapters/JwtTokenGenerator'
import { CreateUserUseCase } from '../useCases/CreateUserUseCase'
import { RegisterUseCase } from '../useCases/RegisterUseCase'
import { LoginUseCase } from '../useCases/LoginUseCase'
import { ChangePasswordUseCase } from '../useCases/ChangePasswordUseCase'
import { GetUsersUseCase } from '../useCases/GetUsersUseCase'
import { GetUserByIdUseCase } from '../useCases/GetUserByIdUseCase'
import { UpdateUserUseCase } from '../useCases/UpdateUserUseCase'
import { DeleteUserUseCase } from '../useCases/DeleteUserUseCase'

type Constructor<T = any> = new (...args: any[]) => T

class Container {
  private instances: Map<string, any> = new Map()
  private factories: Map<string, () => any> = new Map()

  /**
   * Register a singleton instance
   */
  registerSingleton<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory)
  }

  /**
   * Register a factory that creates a new instance each time
   */
  registerTransient<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory)
  }

  /**
   * Resolve a dependency by key
   */
  resolve<T>(key: string): T {
    // Check if instance already exists (singleton)
    if (this.instances.has(key)) {
      return this.instances.get(key)
    }

    // Get factory and create instance
    const factory = this.factories.get(key)
    if (!factory) {
      throw new Error(`Dependency '${key}' not registered`)
    }

    const instance = factory()

    // Store as singleton if it's a singleton registration
    // (In this implementation, we treat all as singletons unless specified otherwise)
    this.instances.set(key, instance)

    return instance
  }

  /**
   * Clear all instances (useful for testing)
   */
  clear(): void {
    this.instances.clear()
  }
}

// Create and configure container instance
const container = new Container()

// Register repositories (singletons)
container.registerSingleton<UserRepository>('UserRepository', () => {
  return new PrismaUserRepository()
})

container.registerSingleton<PasswordHasher>('PasswordHasher', () => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
  return new BcryptPasswordHasher(saltRounds)
})

container.registerSingleton<TokenGenerator>('TokenGenerator', () => {
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h'
  if (!secret) {
    throw new Error('JWT_SECRET não configurado')
  }
  return new JwtTokenGenerator(secret, expiresIn)
})

// Register use cases (singletons)
container.registerSingleton<CreateUserUseCase>('CreateUserUseCase', () => {
  return new CreateUserUseCase(
    container.resolve<UserRepository>('UserRepository'),
    container.resolve<PasswordHasher>('PasswordHasher')
  )
})

container.registerSingleton<RegisterUseCase>('RegisterUseCase', () => {
  return new RegisterUseCase(
    container.resolve<UserRepository>('UserRepository'),
    container.resolve<PasswordHasher>('PasswordHasher'),
    container.resolve<TokenGenerator>('TokenGenerator')
  )
})

container.registerSingleton<LoginUseCase>('LoginUseCase', () => {
  return new LoginUseCase(
    container.resolve<UserRepository>('UserRepository'),
    container.resolve<PasswordHasher>('PasswordHasher'),
    container.resolve<TokenGenerator>('TokenGenerator')
  )
})

container.registerSingleton<ChangePasswordUseCase>('ChangePasswordUseCase', () => {
  return new ChangePasswordUseCase(
    container.resolve<UserRepository>('UserRepository'),
    container.resolve<PasswordHasher>('PasswordHasher')
  )
})

container.registerSingleton<GetUsersUseCase>('GetUsersUseCase', () => {
  return new GetUsersUseCase(
    container.resolve<UserRepository>('UserRepository')
  )
})

container.registerSingleton<GetUserByIdUseCase>('GetUserByIdUseCase', () => {
  return new GetUserByIdUseCase(
    container.resolve<UserRepository>('UserRepository')
  )
})

container.registerSingleton<UpdateUserUseCase>('UpdateUserUseCase', () => {
  return new UpdateUserUseCase(
    container.resolve<UserRepository>('UserRepository')
  )
})

container.registerSingleton<DeleteUserUseCase>('DeleteUserUseCase', () => {
  return new DeleteUserUseCase(
    container.resolve<UserRepository>('UserRepository')
  )
})

export { container }
export type { Container }

