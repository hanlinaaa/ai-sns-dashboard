import { AlertCircle, Database, Loader2 } from "lucide-react"
import type { DataAccessErrorInfo } from "@/domain/data-state"

interface DataStateProps {
  title: string
  description?: string
}

interface DataErrorStateProps extends DataStateProps {
  error: DataAccessErrorInfo | null
}

export function DataLoadingState({ title, description }: DataStateProps) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border bg-card p-6 text-center">
      <Loader2 className="mb-3 h-6 w-6 animate-spin text-primary" />
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function DataEmptyState({ title, description }: DataStateProps) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border bg-card p-6 text-center">
      <Database className="mb-3 h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function DataErrorState({ title, description, error }: DataErrorStateProps) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
      <AlertCircle className="mb-3 h-6 w-6 text-destructive" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {error?.message ?? description ?? "Please try again later."}
      </p>
    </div>
  )
}
