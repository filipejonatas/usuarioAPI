/**
 * Domain Interface - Password Hasher
 * Abstraction for password hashing operations
 */
export interface PasswordHasher {
  hash(password: string): Promise<string>
  compare(password: string, hashedPassword: string): Promise<boolean>
}

