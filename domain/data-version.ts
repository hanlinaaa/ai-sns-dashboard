export const CURRENT_DATA_VERSION = 1

export interface VersionedRecord {
  dataVersion: number
}

export function withCurrentDataVersion<T extends object>(record: T): T & VersionedRecord {
  return {
    ...record,
    dataVersion: CURRENT_DATA_VERSION,
  }
}
