/**
 * Singleton Pattern - Prisma Database Client
 * Ensures only one instance of PrismaClient exists throughout the application
 * Prevents multiple database connections in development (hot reload) and production
 */
import { PrismaClient } from '@prisma/client'

declare global {
    // Necessário para evitar erro de tipo no globalThis em TS
    var prisma: PrismaClient | undefined
}

class PrismaSingleton {
    private static instance: PrismaClient

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public static getInstance(): PrismaClient {
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new PrismaClient({
                log: process.env.NODE_ENV === 'development' 
                    ? ['query', 'error', 'warn'] 
                    : ['error'],
            })
        }
        return PrismaSingleton.instance
    }
}

// Export singleton instance
// In development, reuse global instance to prevent multiple connections during hot reload
export const prisma = 
    process.env.NODE_ENV === 'production'
        ? PrismaSingleton.getInstance()
        : globalThis.prisma ?? PrismaSingleton.getInstance()

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma
}