/**
 * Day 4 - HTTP Route Tests
 * Test POST /api/users endpoint
 */
import request from 'supertest'
import app from '../../src/app'
import { prisma } from '../../src/models/prisma'

describe('POST /api/users', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Success cases', () => {
    it('should return 201 when creating a valid user', async () => {
      // Arrange
      const validPayload = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'User',
      }

      // Act
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer fake-admin-token') // In real tests, use a valid token
        .send(validPayload)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('Id')
      expect(response.body.email).toBe('test@example.com')
      expect(response.body.name).toBe('Test User')
      expect(response.body).not.toHaveProperty('password')
    })
  })

  describe('Error cases', () => {
    it('should return 400 for invalid payload', async () => {
      // Arrange
      const invalidPayload = {
        email: 'not-an-email',
        password: 'short',
      }

      // Act
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer fake-admin-token')
        .send(invalidPayload)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message')
    })

    it('should return 409 for duplicate email', async () => {
      // Arrange
      const payload = {
        email: 'duplicate@example.com',
        password: 'password123',
      }

      // Create first user
      await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer fake-admin-token')
        .send(payload)

      // Act - Try to create duplicate
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer fake-admin-token')
        .send(payload)

      // Assert
      expect(response.status).toBe(409)
      expect(response.body.message).toContain('já está em uso')
    })
  })
})

