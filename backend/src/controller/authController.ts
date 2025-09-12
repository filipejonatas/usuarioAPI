import type { Request, Response } from 'express'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { prisma } from '../models/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// User payload interface for JWT and middleware consistency
interface UserPayload {
  Id: number
  email: string
  name?: string | null
  role?: string | null
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}

interface RegisterRequest {
  email: string
  password: string
  name?: string
  role?: string
}

interface LoginRequest {
  email: string
  password: string
}

// Função para gerar hash da senha
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Função para verificar senha
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Função para gerar JWT
function generateToken(user: UserPayload): string {
  const JWT_SECRET = process.env.JWT_SECRET
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado')
  }

  const payload = {
    Id: user.Id,
    email: user.email,
    name: user.name,
    role: user.role
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export async function register(req: Request, res: Response) {
  const { email, password, name, role } = req.body as RegisterRequest

  // Validações
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' })
  }

  try {
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já está em uso' })
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role || null
      }
    })

    // Gerar token
    const token = generateToken(user)

    // Retornar usuário sem senha
    const { password: _, ...userWithoutPassword } = user
    
    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword,
      token
    })

  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ message: 'E-mail já está em uso' })
      }
    }
    console.error('register error:', err)
    const message = err instanceof Error ? err.message : 'Erro ao criar usuário'
    return res.status(500).json({ message })
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginRequest

  // Validações
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' })
  }

  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    // Gerar token
    const token = generateToken(user)

    // Retornar usuário sem senha
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    })

  } catch (err: unknown) {
    console.error('login error:', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ message })
  }
}
