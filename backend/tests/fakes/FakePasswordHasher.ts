/**
 * Day 3 - Fake Password Hasher
 * Simple in-memory implementation for testing
 */
import { PasswordHasher } from '../../src/domain/interfaces/PasswordHasher'

export class FakePasswordHasher implements PasswordHasher {
  private hashes = new Map<string, string>()

  async hash(password: string): Promise<string> {
    // Simple fake hash: just prefix with "hashed_"
    const fakeHash = `hashed_${password}`
    this.hashes.set(fakeHash, password)
    return fakeHash
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    // Check if the stored password matches
    const storedPassword = this.hashes.get(hashedPassword)
    return storedPassword === password
  }

  // Helper method for testing
  clear(): void {
    this.hashes.clear()
  }
}

