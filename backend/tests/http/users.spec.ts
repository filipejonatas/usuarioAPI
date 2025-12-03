/**
 * Day 4 - HTTP Route Tests
 * Test POST /api/users endpoint
 * 
 * ⚠️ WARNING: These tests use the REAL database!
 * Make sure you're using a TEST database, not production!
 * Set DATABASE_URL in .env to point to a test database.
 */
import request from 'supertest'
import app from '../../src/app'
import { prisma } from '../../src/models/prisma'
import jwt from 'jsonwebtoken'

// Helper function to create a valid admin token for tests
function createTestToken(userId: number = 1, role: string = 'Admin'): string {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only'
  return jwt.sign(
    { Id: userId, email: 'admin@test.com', role },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

describe('POST /api/users', () => {
  beforeEach(async () => {
    // ⚠️ WARNING: This deletes ALL users from the database!
    // Only use this with a TEST database, never with production!
    // The deleteMany() function is in: backend/tests/http/users.spec.ts (line 12)
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
      const adminToken = createTestToken(1, 'Admin')
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
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
      const adminToken = createTestToken(1, 'Admin')
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
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
      const adminToken = createTestToken(1, 'Admin')
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)

      // Act - Try to create duplicate
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)

      // Assert
      expect(response.status).toBe(409)
      expect(response.body.message).toContain('já está em uso')
    })
  })
})

