/**
 * Authentication Middleware
 * Uses Chain of Responsibility pattern via MiddlewareChain
 */
import type { Request, Response, NextFunction } from 'express'
import { MiddlewareChain } from './MiddlewareChain'
import { AuthenticationHandler } from './handlers/AuthenticationHandler'

// User payload interface matching domain interfaces
export interface UserPayload {
  Id: number
  email: string
  name?: string | null
  role?: string | null
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}

/**
 * Authentication middleware using Chain of Responsibility
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const chain = new MiddlewareChain()
  chain.add(new AuthenticationHandler())
  chain.execute()(req, res, next)
}