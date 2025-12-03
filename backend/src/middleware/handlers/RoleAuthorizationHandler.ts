/**
 * Chain of Responsibility - Role Authorization Handler
 * Handles role-based authorization
 */
import type { Request, Response, NextFunction } from 'express'
import type { MiddlewareHandler } from '../MiddlewareChain'
import type { role } from '@prisma/client'

export class RoleAuthorizationHandler implements MiddlewareHandler {
  private allowedRoles: role[]

  constructor(...allowedRoles: role[]) {
    this.allowedRoles = allowedRoles
  }

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const roleValue = req.user?.role ?? null

    if (!roleValue) {
      res.status(403).json({ message: 'Acesso negado: sem role' })
      return
    }

    const userRole = roleValue as role
    if (!this.allowedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Acesso negado: permissão insuficiente' })
      return
    }

    next()
  }
}

