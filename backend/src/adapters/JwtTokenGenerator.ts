/**
 * Adapter Pattern - JWT Token Generator
 * Implements TokenGenerator interface using jsonwebtoken library
 * Adapts JWT operations to domain interface
 */
import jwt from 'jsonwebtoken'
import type { TokenGenerator, UserPayload } from '../domain/interfaces/TokenGenerator'

export class JwtTokenGenerator implements TokenGenerator {
  private readonly secret: string
  private readonly expiresIn: string

  constructor(secret: string, expiresIn: string = '24h') {
    if (!secret) {
      throw new Error('JWT_SECRET não configurado')
    }
    this.secret = secret
    this.expiresIn = expiresIn
  }

  generate(payload: UserPayload): string {
    const jwtPayload: jwt.JwtPayload = {
      Id: payload.Id,
      email: payload.email,
      ...(payload.name != null ? { name: payload.name } : {}),
      ...(payload.role != null ? { role: payload.role } : {}),
    }

    return jwt.sign(jwtPayload, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    })
  }

  verify(token: string): UserPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload
      return {
        Id: decoded.Id,
        email: decoded.email,
        name: decoded.name ?? null,
        role: decoded.role ?? null,
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido')
      }
      throw new Error('Falha na verificação do token')
    }
  }
}

