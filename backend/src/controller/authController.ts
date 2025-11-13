import type { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../models/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserPayload, RegisterRequest, LoginRequest } from '../types/authInterface';

// Remove duplicate Express Request interface extension here.
// The extension should only be declared once, e.g., in your middleware/auth.ts or a dedicated types file.


// Função para gerar hash da senha
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Função para verificar senha
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Função para gerar JWT (robusta contra overloads)
function generateToken(user: UserPayload): string {
  const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
  }

  // Garante tipo compatível (nunca undefined)
  const expiresIn = (JWT_EXPIRES_IN ?? '24h') as string;

  // Evita incluir chaves null/undefined
  const payload: jwt.JwtPayload = {
    Id: user.Id,
    email: user.email,
    ...(user.name != null ? { name: user.name } : {}),
    ...(user.roleuser != null ? { role: user.roleuser } : {}),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

export async function register(req: Request, res: Response) {
  const { email, password, name, role } = req.body as RegisterRequest;

  // Validações
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' });
  }

  try {
    // Normalizar e-mail
    const normEmail = email.trim().toLowerCase();

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email: normEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: normEmail,
        password: hashedPassword,
        name: name ?? null,
        role: role ?? null,
      },
    });

    // Gerar token a partir de um UserPayload explícito
    const token = generateToken({
      Id: user.Id,
      email: user.email,
      name: user.name ?? null,
      roleuser: user.role ?? null,
    });

    // Retornar usuário sem senha
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword,
      token,
    });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ message: 'E-mail já está em uso' });
    }
    console.error('register error:', err);
    const message = err instanceof Error ? err.message : 'Erro ao criar usuário';
    return res.status(500).json({ message });
  }
}

// Endpoint para alterar senha
export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string
    newPassword: string
  }

  // Validações
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' })
  }

  try {
    const { user } = req
    if (!user) {
      return res.status(401).json({ message: 'Usuário não autenticado' })
    }

    // Buscar usuário completo do banco
    const dbUser = await prisma.user.findUnique({ where: { Id: user.Id } })
    if (!dbUser || !dbUser.password) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    // Verificar senha atual
    const isValidPassword = await verifyPassword(currentPassword, dbUser.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Senha atual incorreta' })
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword)

    // Atualizar senha
    await prisma.user.update({
      where: { Id: user.Id },
      data: { password: hashedPassword },
    })

    return res.status(200).json({ message: 'Senha alterada com sucesso' })
  } catch (err: unknown) {
    console.error('changePassword error:', err)
    const message = err instanceof Error ? err.message : 'Erro ao alterar senha'
    return res.status(500).json({ message })
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginRequest;

  // Validações
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
  }

  try {
    // Normalizar e-mail
    const normEmail = email.trim().toLowerCase();

    // Buscar usuário
    const user = await prisma.user.findUnique({ where: { email: normEmail } });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = generateToken({
      Id: user.Id,
      email: user.email,
      name: user.name ?? null,
      roleuser: user.role ?? null,
    });

    // Verificar se é a primeira vez que o usuário faz login (senha gerada pelo sistema)
    // Se createdAt e updatedAt são iguais, provavelmente é a primeira vez
    const isFirstLogin = user.createdAt.getTime() === user.updatedAt.getTime();
    
    // Retornar usuário sem senha
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token,
      mustChangePassword: isFirstLogin, // Flag para indicar que precisa trocar senha
    });
  } catch (err: unknown) {
    console.error('login error:', err);
    const message = err instanceof Error ? err.message : 'Erro interno';
    return res.status(500).json({ message });
  }
}