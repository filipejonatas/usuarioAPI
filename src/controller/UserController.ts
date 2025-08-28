import type { Request, Response } from 'express'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { prisma } from '../models/prisma'

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
    const created = await prisma.user.create({
      data: { email, name, role },
    })
    return res.status(201).json(created)
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