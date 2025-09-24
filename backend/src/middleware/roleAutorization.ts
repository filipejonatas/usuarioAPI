import type { Request, Response, NextFunction } from 'express';
import type { role } from '@prisma/client';


export function requireRole(...allowed: role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const roleValue = req.user?.role ?? null;
    if (!roleValue) {
      return res.status(403).json({ message: 'Acesso negado: sem role' });
    }
    const userRole = roleValue as role;
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: 'Acesso negado: permissão insuficiente' });
    }
    next();
  };
}

export function requireAnyRole(req: Request, res: Response, next: NextFunction) {
  const role = req.user?.role ?? null;
  if (!role) {
    return res.status(403).json({ message: 'Acesso negado: sem role' });
  }
  next();
}

export function requireRoleOrSelf(allowed: role[], getOwnerId: (req: Request) => number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Não autenticado' });

    if (allowed.includes(user.role as role)) {
      return next();
    }

    const ownerId = getOwnerId(req);
    if (user.Id === ownerId) {
      return next();
    }

    return res.status(403).json({ message: 'Acesso negado' });
  };
}