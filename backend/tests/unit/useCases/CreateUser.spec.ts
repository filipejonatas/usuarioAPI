/**
 * Day 3 - CreateUser Use Case Tests
 * TDD tests for user creation use case
 */
import { describe, it, expect, beforeEach } from '@jest/globals'
import { CreateUser, EmailAlreadyTakenError, PasswordTooShortError } from '../../../src/domain/useCases/CreateUser'
import { FakeUserRepository } from '../../fakes/FakeUserRepository'
import { FakePasswordHasher } from '../../fakes/FakePasswordHasher'
import { UserCreateInput } from '../../../src/validation/userSchema'

describe('CreateUser', () => {
  let createUser: CreateUser
  let userRepository: FakeUserRepository
  let passwordHasher: FakePasswordHasher

  beforeEach(() => {
    userRepository = new FakeUserRepository()
    passwordHasher = new FakePasswordHasher()
    createUser = new CreateUser(userRepository, passwordHasher)
  })

  describe('Success cases', () => {
    it('should create a user successfully and return user without password', async () => {
      // Arrange
      const input: UserCreateInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'User',
      }

      // Act
      const result = await createUser.execute(input)

      // Assert
      expect(result.Id).toBeDefined()
      expect(result.email).toBe('test@example.com')
      expect(result.name).toBe('Test User')
      expect(result.role).toBe('User')
      expect(result).not.toHaveProperty('password')

      // Verify password was hashed
      const createdUser = await userRepository.findByEmail('test@example.com')
      expect(createdUser?.password).toBe('hashed_password123')
    })

    it('should create user with minimal data (email and password only)', async () => {
      // Arrange
      const input: UserCreateInput = {
        email: 'minimal@example.com',
        password: 'password123',
      }

      // Act
      const result = await createUser.execute(input)

      // Assert
      expect(result.email).toBe('minimal@example.com')
      expect(result.name).toBeNull()
      expect(result.role).toBeNull()
    })
  })

  describe('Error cases', () => {
    it('should not allow duplicate email', async () => {
      // Arrange
      const input: UserCreateInput = {
        email: 'duplicate@example.com',
        password: 'password123',
      }

      // Create first user
      await createUser.execute(input)

      // Act & Assert
      await expect(createUser.execute(input)).rejects.toThrow(EmailAlreadyTakenError)
      await expect(createUser.execute(input)).rejects.toThrow('duplicate@example.com já está em uso')
    })

    it('should reject password shorter than 8 characters', async () => {
      // Arrange
      const input: UserCreateInput = {
        email: 'test@example.com',
        password: 'short',
      }

      // Act & Assert
      await expect(createUser.execute(input)).rejects.toThrow(PasswordTooShortError)
      await expect(createUser.execute(input)).rejects.toThrow('pelo menos 8 caracteres')
    })

    it('should handle case-insensitive email duplicates', async () => {
      // Arrange
      const input1: UserCreateInput = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      }
      const input2: UserCreateInput = {
        email: 'test@example.com',
        password: 'password123',
      }

      // Create first user
      await createUser.execute(input1)

      // Act & Assert
      await expect(createUser.execute(input2)).rejects.toThrow(EmailAlreadyTakenError)
    })
  })
})

