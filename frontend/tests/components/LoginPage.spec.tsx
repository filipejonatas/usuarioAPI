/**
 * Day 1 - Frontend Component Test
 * Basic render test for login form
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../../src/app/contexts/AuthContext'
import LoginPage from '../../src/app/pages/LoginPage'

describe('LoginPage', () => {
  it('should render login form with email and password fields', () => {
    // Arrange & Act
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )

    // Assert
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })
})

