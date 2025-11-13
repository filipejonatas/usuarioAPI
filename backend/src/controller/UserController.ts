import type { Request, Response } from 'express'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { prisma } from '../models/prisma'
import bcrypt from 'bcrypt'

export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { Id: 'asc' },
    })
    return res.json(users)
  } catch (err: unknown) {
    console.error('getUsers error:', err)
    const message = err instanceof Error ? err.message : 'Erro ao buscar os usuários'
    return res.status(500).json({ message })
  }
}

export async function getUserbyId(req: Request, res: Response) {
  const { id } = req.params
  const idNum = Number(id)
  if (!id || Number.isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ message: 'Parâmetro id inválido' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { Id: idNum } })
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }
    return res.status(200).json(user)
  } catch (err: unknown) {
    console.error('getUserbyId error:', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ message })
  }
}

// Função para gerar senha aleatória
function generateRandomPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%&*'
  const allChars = uppercase + lowercase + numbers + special
  
  let password = ''
  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // Preencher o resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Função para gerar hash da senha
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function createUser(req: Request, res: Response) {
  const { email, name, role } = req.body as {
    email: string
    name?: string
    role?: string
  }

  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório' })
  }

  try {
    // Normalizar e-mail
    const normEmail = email.trim().toLowerCase()

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email: normEmail } })
    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já está em uso' })
    }

    // Gerar senha aleatória
    const generatedPassword = generateRandomPassword(12)
    const hashedPassword = await hashPassword(generatedPassword)

    // Criar usuário
    const created = await prisma.user.create({
      data: {
        email: normEmail,
        name: name ?? null,
        role: role ?? null,
        password: hashedPassword,
      },
    })

    // Retornar usuário sem senha hash, mas com a senha gerada
    const { password: _, ...userWithoutPassword } = created

    return res.status(201).json({
      ...userWithoutPassword,
      generatedPassword, // Incluir senha gerada na resposta
    })
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ message: 'E-mail já está em uso' })
      }
    }
    console.error('createUser error:', err)
    const message = err instanceof Error ? err.message : 'Erro ao criar usuário'
    return res.status(500).json({ message })
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params
  const { email, name, role } = req.body as {
    email?: string
    name?: string
    role?: string
  }

  const idNum = Number(id)
  if (!id || Number.isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ message: 'Parâmetro id inválido' })
  }

  const data: Record<string, unknown> = {}
  if (email !== undefined) data.email = email
  if (name !== undefined) data.name = name
  if (role !== undefined) data.role = role

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'Nenhum campo para atualizar' })
  }

  try {
    const updated = await prisma.user.update({
      where: { Id: idNum },
      data,
    })
    return res.status(200).json(updated)
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return res.status(404).json({ message: 'Usuário não encontrado' })
      }
      if (err.code === 'P2002') {
        return res.status(409).json({ message: 'E-mail já está em uso' })
      }
    }
    console.error('updateUser error:', err)
    const message = err instanceof Error ? err.message : 'Erro interno ao atualizar usuário'
    return res.status(500).json({ message })
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params
  const idNum = Number(id)
  if (!id || Number.isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ message: 'Parâmetro id inválido' })
  }

  try {
    const exists = await prisma.user.findUnique({ where: { Id: idNum } })
    if (!exists) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    const deleted = await prisma.user.delete({ where: { Id: idNum } })
    return res.status(200).json({ message: 'Usuário deletado com sucesso', data: deleted })
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return res.status(404).json({ message: 'Usuário não encontrado' })
      }
    }
    console.error('deleteUser error:', err)
    const message = err instanceof Error ? err.message : 'Erro interno ao deletar usuário'
    return res.status(500).json({ message })
  }
}