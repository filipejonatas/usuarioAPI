/**
 * Domain Interface - Token Generator
 * Abstraction for JWT token generation
 */
export interface UserPayload {
  Id: number
  email: string
  name?: string | null
  role?: string | null
}

export interface TokenGenerator {
  generate(payload: UserPayload): string
  verify(token: string): UserPayload
}

