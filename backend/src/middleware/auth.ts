import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// User payload interface matching Prisma schema and auth controller
interface UserPayload {
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

// Middleware para autenticação JWT
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Token de acesso requerido' })
    return
  }

  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    console.error('JWT_SECRET não configurado')
    res.status(500).json({ message: 'Erro de configuração do servidor' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
    req.user = decoded
    next()
  } catch (err: unknown) {
    console.error('Token verification error:', err)
    
    // Diferentes tipos de erro JWT
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expirado' })
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Token inválido' })
    } else {
      res.status(403).json({ message: 'Falha na autenticação' })
    }
  }
}