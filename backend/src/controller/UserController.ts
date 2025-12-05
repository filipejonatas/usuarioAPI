/**
 * User Controller
 * Thin HTTP layer that delegates business logic to Use Cases
 * Uses Dependency Injection Container to resolve dependencies
 */
import type { Request, Response } from 'express'
import { container } from '../container/Container'
import { CreateUserUseCase } from '../useCases/CreateUserUseCase'
import { GetUsersUseCase } from '../useCases/GetUsersUseCase'
import { GetUserByIdUseCase } from '../useCases/GetUserByIdUseCase'
import { UpdateUserUseCase } from '../useCases/UpdateUserUseCase'
import { DeleteUserUseCase } from '../useCases/DeleteUserUseCase'
import { UserCreateAdminSchema } from '../validation/userSchema'

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const useCase = container.resolve<GetUsersUseCase>('GetUsersUseCase')
    const users = await useCase.execute()
    res.json(users)
  } catch (err: unknown) {
    console.error('getUsers error:', err)
    const message = err instanceof Error ? err.message : 'Erro ao buscar os usuários'
    res.status(500).json({ message })
  }
}

export async function getUserbyId(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const idNum = Number(id)

  if (!id || Number.isNaN(idNum) || idNum <= 0) {
    res.status(400).json({ message: 'Parâmetro id inválido' })
    return
  }

  try {
    const useCase = container.resolve<GetUserByIdUseCase>('GetUserByIdUseCase')
    const user = await useCase.execute(idNum)
    res.status(200).json(user)
  } catch (err: unknown) {
    console.error('getUserbyId error:', err)
    
    if (err instanceof Error && err.message === 'USER_NOT_FOUND') {
      res.status(404).json({ message: 'Usuário não encontrado' })
      return
    }

    const message = err instanceof Error ? err.message : 'Erro interno'
    res.status(500).json({ message })
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  // Validate request body using Zod schema (password is optional, will be generated)
  const validationResult = UserCreateAdminSchema.safeParse(req.body)

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0]
    res.status(400).json({ message: firstError.message })
    return
  }

  const { email, name, role, password } = validationResult.data

  try {
    const useCase = container.resolve<CreateUserUseCase>('CreateUserUseCase')
    const result = await useCase.execute({
      email,
      name: name ?? null,
      role: role ?? null,
      password: password || '', // Use provided password or generate one
    })

    const response: any = { ...result.user }
    if (result.generatedPassword) {
      response.generatedPassword = result.generatedPassword
    }
    res.status(201).json(response)
  } catch (err: unknown) {
    console.error('createUser error:', err)

    if (err instanceof Error && err.message === 'EMAIL_ALREADY_TAKEN') {
      res.status(409).json({ message: 'E-mail já está em uso' })
      return
    }

    const message = err instanceof Error ? err.message : 'Erro ao criar usuário'
    res.status(500).json({ message })
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const { email, name, role } = req.body as {
    email?: string
    name?: string
    role?: string
  }

  const idNum = Number(id)
  if (!id || Number.isNaN(idNum) || idNum <= 0) {
    res.status(400).json({ message: 'Parâmetro id inválido' })
    return
  }

  const updateData: any = {}
  if (email !== undefined) updateData.email = email
  if (name !== undefined) updateData.name = name
  if (role !== undefined) updateData.role = role

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ message: 'Nenhum campo para atualizar' })
    return
  }

  try {
    const useCase = container.resolve<UpdateUserUseCase>('UpdateUserUseCase')
    const updated = await useCase.execute({
      id: idNum,
      ...updateData,
    })
    res.status(200).json(updated)
  } catch (err: unknown) {
    console.error('updateUser error:', err)

    if (err instanceof Error && err.message === 'USER_NOT_FOUND') {
      res.status(404).json({ message: 'Usuário não encontrado' })
      return
    }

    if (err instanceof Error && err.message === 'EMAIL_ALREADY_TAKEN') {
      res.status(409).json({ message: 'E-mail já está em uso' })
      return
    }

    const message = err instanceof Error ? err.message : 'Erro interno ao atualizar usuário'
    res.status(500).json({ message })
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const idNum = Number(id)

  if (!id || Number.isNaN(idNum) || idNum <= 0) {
    res.status(400).json({ message: 'Parâmetro id inválido' })
    return
  }

  try {
    const useCase = container.resolve<DeleteUserUseCase>('DeleteUserUseCase')
    await useCase.execute(idNum)
    res.status(200).json({ message: 'Usuário deletado com sucesso' })
  } catch (err: unknown) {
    console.error('deleteUser error:', err)

    if (err instanceof Error && err.message === 'USER_NOT_FOUND') {
      res.status(404).json({ message: 'Usuário não encontrado' })
      return
    }

    const message = err instanceof Error ? err.message : 'Erro interno ao deletar usuário'
    res.status(500).json({ message })
  }
}
