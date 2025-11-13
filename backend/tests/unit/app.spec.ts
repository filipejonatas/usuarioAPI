/**
 * Day 1 - Smoke Test
 * Test: GET /health → 200
 */
import { describe, it, expect } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app'

describe('App Smoke Test', () => {
  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      // Arrange
      // Act
      const response = await request(app).get('/health')

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: 'ok' })
    })
  })
})

