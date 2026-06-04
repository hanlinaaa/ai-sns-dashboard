export type DataAccessErrorCode =
  | "storage_unavailable"
  | "not_found"
  | "validation_failed"
  | "network_error"
  | "backend_unavailable"
  | "unknown"

export interface DataAccessErrorInfo {
  code: DataAccessErrorCode
  message: string
}

export type LoadingState = "idle" | "loading" | "success" | "error"

export interface AsyncDataState<T> {
  status: LoadingState
  data: T
  error: DataAccessErrorInfo | null
}
