/**
 * Auth Controller
 * Thin HTTP layer that delegates business logic to Use Cases
 * Uses Dependency Injection Container to resolve dependencies
 */
import type { Request, Response } from 'express'
import { container } from '../container/Container'
import { RegisterUseCase } from '../useCases/RegisterUseCase'
import { LoginUseCase } from '../useCases/LoginUseCase'
import { ChangePasswordUseCase } from '../useCases/ChangePasswordUseCase'
import type { RegisterRequest, LoginRequest } from '../types/authInterface'

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name, role } = req.body as RegisterRequest

  // Validações básicas
  if (!email || !password) {
    res.status(400).json({ message: 'E-mail e senha são obrigatórios' })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' })
    return
  }

  try {
    const useCase = container.resolve<RegisterUseCase>('RegisterUseCase')
    const result = await useCase.execute({
      email,
      password,
      name,
      role,
    })

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.user,
      token: result.token,
    })
  } catch (err: unknown) {
    console.error('register error:', err)

    if (err instanceof Error && err.message === 'EMAIL_ALREADY_TAKEN') {
      res.status(409).json({ message: 'E-mail já está em uso' })
      return
    }

    if (err instanceof Error && err.message === 'PASSWORD_TOO_SHORT') {
      res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' })
      return
    }

    const message = err instanceof Error ? err.message : 'Erro ao criar usuário'
    res.status(500).json({ message })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginRequest

  // Validações básicas
  if (!email || !password) {
    res.status(400).json({ message: 'E-mail e senha são obrigatórios' })
    return
  }

  try {
    const useCase = container.resolve<LoginUseCase>('LoginUseCase')
    const result = await useCase.execute({
      email,
      password,
    })

    res.status(200).json({
      message: 'Login realizado com sucesso',
      user: result.user,
      token: result.token,
      mustChangePassword: result.mustChangePassword,
    })
  } catch (err: unknown) {
    console.error('login error:', err)

    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ message: 'Credenciais inválidas' })
      return
    }

    const message = err instanceof Error ? err.message : 'Erro interno'
    res.status(500).json({ message })
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string
    newPassword: string
  }

  // Validações básicas
  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' })
    return
  }

  if (newPassword.length < 6) {
    res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' })
    return
  }

  try {
    const { user } = req
    if (!user) {
      res.status(401).json({ message: 'Usuário não autenticado' })
      return
    }

    const useCase = container.resolve<ChangePasswordUseCase>('ChangePasswordUseCase')
    await useCase.execute({
      userId: user.Id,
      currentPassword,
      newPassword,
    })

    res.status(200).json({ message: 'Senha alterada com sucesso' })
  } catch (err: unknown) {
    console.error('changePassword error:', err)

    if (err instanceof Error && err.message === 'USER_NOT_FOUND') {
      res.status(404).json({ message: 'Usuário não encontrado' })
      return
    }

    if (err instanceof Error && err.message === 'INVALID_CURRENT_PASSWORD') {
      res.status(401).json({ message: 'Senha atual incorreta' })
      return
    }

    if (err instanceof Error && err.message === 'PASSWORD_TOO_SHORT') {
      res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' })
      return
    }

    const message = err instanceof Error ? err.message : 'Erro ao alterar senha'
    res.status(500).json({ message })
  }
}
