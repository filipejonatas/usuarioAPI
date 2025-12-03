/**
 * Chain of Responsibility - Authentication Handler
 * Handles JWT token verification
 */
import type { Request, Response, NextFunction } from 'express'
import type { MiddlewareHandler } from '../MiddlewareChain'
import { container } from '../../container/Container'
import type { TokenGenerator } from '../../domain/interfaces/TokenGenerator'

export class AuthenticationHandler implements MiddlewareHandler {
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1] // Bearer TOKEN

    if (!token) {
      res.status(401).json({ message: 'Token de acesso requerido' })
      return
    }

    try {
      const tokenGenerator = container.resolve<TokenGenerator>('TokenGenerator')
      const decoded = tokenGenerator.verify(token)

      // Attach user to request
      req.user = decoded
      next()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha na autenticação'
      
      if (errorMessage === 'Token expirado') {
        res.status(401).json({ message: 'Token expirado' })
      } else if (errorMessage === 'Token inválido') {
        res.status(403).json({ message: 'Token inválido' })
      } else {
        res.status(403).json({ message: errorMessage })
      }
    }
  }
}

