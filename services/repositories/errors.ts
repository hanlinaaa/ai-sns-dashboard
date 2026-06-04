import type { DataAccessErrorCode, DataAccessErrorInfo } from "@/domain/data-state"

export class RepositoryError extends Error {
  readonly code: DataAccessErrorCode
  readonly cause?: unknown

  constructor(code: DataAccessErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = "RepositoryError"
    this.code = code
    this.cause = cause
  }

  toInfo(): DataAccessErrorInfo {
    return {
      code: this.code,
      message: this.message,
    }
  }
}

export function toRepositoryError(error: unknown, fallbackMessage: string) {
  if (error instanceof RepositoryError) {
    return error
  }

  return new RepositoryError("unknown", fallbackMessage, error)
}

export function toDataAccessErrorInfo(
  error: unknown,
  fallbackMessage: string,
): DataAccessErrorInfo {
  return toRepositoryError(error, fallbackMessage).toInfo()
}
