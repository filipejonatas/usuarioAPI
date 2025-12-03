/**
 * Role Authorization Middleware
 * Uses Chain of Responsibility pattern via MiddlewareChain
 */
import type { Request, Response, NextFunction } from 'express';
import type { role } from '@prisma/client';
import { MiddlewareChain } from './MiddlewareChain';
import { AuthenticationHandler } from './handlers/AuthenticationHandler';
import { RoleAuthorizationHandler } from './handlers/RoleAuthorizationHandler';

/**
 * Require specific roles - combines authentication and authorization
 */
export function requireRole(...allowed: role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const chain = new MiddlewareChain()
    chain.add(new AuthenticationHandler())
    chain.add(new RoleAuthorizationHandler(...allowed))
    chain.execute()(req, res, next)
  };
}

/**
 * Require any role (user must be authenticated and have a role)
 */
export function requireAnyRole(req: Request, res: Response, next: NextFunction): void {
  const chain = new MiddlewareChain()
  chain.add(new AuthenticationHandler())
  chain.add({
    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
      const role = req.user?.role ?? null;
      if (!role) {
        res.status(403).json({ message: 'Acesso negado: sem role' });
        return;
      }
      next();
    }
  })
  chain.execute()(req, res, next)
}

/**
 * Require role or be the owner of the resource
 */
export function requireRoleOrSelf(allowed: role[], getOwnerId: (req: Request) => number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const chain = new MiddlewareChain()
    chain.add(new AuthenticationHandler())
    chain.add({
      async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user = req.user;
        if (!user) {
          res.status(401).json({ message: 'Usuário não autenticado' });
          return;
        }

        if (allowed.includes(user.role as role)) {
          next();
          return;
        }

        const ownerId = getOwnerId(req);
        if (user.Id === ownerId) {
          next();
          return;
        }

        res.status(403).json({ message: 'Acesso negado' });
      }
    })
    chain.execute()(req, res, next)
  };
}