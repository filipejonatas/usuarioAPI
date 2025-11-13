/**
 * Day 2 - Validation Tests
 * Test UserCreateSchema with valid and invalid cases
 */
import { describe, it, expect } from '@jest/globals'
import { UserCreateSchema } from '../../../src/validation/userSchema'

describe('UserCreateSchema', () => {
  describe('Valid cases', () => {
    it('should accept valid user data', () => {
      // Arrange
      const validData = {
        email: '  USER@EXAMPLE.COM  ',
        password: 'password123',
        name: '  John Doe  ',
        role: 'User' as const,
      }

      // Act
      const result = UserCreateSchema.safeParse(validData)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user@example.com') // Normalized
        expect(result.data.name).toBe('John Doe') // Trimmed
        expect(result.data.password).toBe('password123')
        expect(result.data.role).toBe('User')
      }
    })

    it('should accept minimal valid data (email and password only)', () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      // Act
      const result = UserCreateSchema.safeParse(validData)

      // Assert
      expect(result.success).toBe(true)
    })
  })

  describe('Invalid cases', () => {
    it('should reject invalid email', () => {
      // Arrange
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }

      // Act
      const result = UserCreateSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('E-mail inválido')
      }
    })

    it('should reject password shorter than 8 characters', () => {
      // Arrange
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
      }

      // Act
      const result = UserCreateSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('pelo menos 8 caracteres')
      }
    })

    it('should reject name shorter than 2 characters', () => {
      // Arrange
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'A',
      }

      // Act
      const result = UserCreateSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('pelo menos 2 caracteres')
      }
    })

    it('should reject missing email', () => {
      // Arrange
      const invalidData = {
        password: 'password123',
      }

      // Act
      const result = UserCreateSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      // Arrange
      const invalidData = {
        email: 'test@example.com',
      }

      // Act
      const result = UserCreateSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should normalize email (trim and lowercase)', () => {
      // Arrange
      const data = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
      }

      // Act
      const result = UserCreateSchema.safeParse(data)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })
  })
})

