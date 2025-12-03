/**
 * Chain of Responsibility Pattern - Middleware Chain
 * Allows multiple middleware handlers to process a request sequentially
 * Each handler can either process the request, pass it to the next handler, or stop the chain
 */
import type { Request, Response, NextFunction } from 'express'

export interface MiddlewareHandler {
  handle(req: Request, res: Response, next: NextFunction): void | Promise<void>
}

export class MiddlewareChain {
  private handlers: MiddlewareHandler[] = []

  /**
   * Add a handler to the chain
   */
  add(handler: MiddlewareHandler): MiddlewareChain {
    this.handlers.push(handler)
    return this
  }

  /**
   * Execute all handlers in sequence
   */
  execute(): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      let currentIndex = 0

      const executeNext = async () => {
        if (currentIndex >= this.handlers.length) {
          return next()
        }

        const handler = this.handlers[currentIndex]
        currentIndex++

        try {
          await handler.handle(req, res, executeNext)
        } catch (error) {
          next(error)
        }
      }

      await executeNext()
    }
  }
}

