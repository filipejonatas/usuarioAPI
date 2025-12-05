/**
 * Day 2 - Zod Validation Schemas
 * UserCreateSchema with validation rules
 */
import { z } from 'zod'

// Base schema without password (for reuse)
const UserBaseSchema = z.object({
  email: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
      z.string({ required_error: 'E-mail é obrigatório' })
        .min(1, 'E-mail é obrigatório')
        .email('E-mail inválido')
    ),
  name: z
    .preprocess(
      (val) => {
        if (typeof val !== 'string') return undefined
        const trimmed = val.trim()
        // Keep original value if invalid (so validation can reject it)
        return trimmed.length >= 2 ? trimmed : trimmed
      },
      z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .optional()
    ),
  role: z.enum(['Admin', 'User', 'Manager']).optional(),
})

// Schema with required password (for registration and tests)
export const UserCreateSchema = UserBaseSchema.extend({
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

// Schema with optional password (for admin user creation)
export const UserCreateAdminSchema = UserBaseSchema.extend({
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .optional(),
})

export type UserCreateInput = z.infer<typeof UserCreateSchema>

