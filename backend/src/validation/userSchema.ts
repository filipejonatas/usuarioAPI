/**
 * Day 2 - Zod Validation Schemas
 * UserCreateSchema with validation rules
 */
import { z } from 'zod'

export const UserCreateSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter pelo menos 8 caracteres'),
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .optional()
    .transform((val) => (val && val.trim().length >= 2 ? val.trim() : undefined)),
  role: z.enum(['Admin', 'User', 'Manager']).optional(),
})

export type UserCreateInput = z.infer<typeof UserCreateSchema>

