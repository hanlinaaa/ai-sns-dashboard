import { withCurrentDataVersion } from "@/domain/data-version"
import type { Platform, PlatformAccount } from "@/domain/types"
import type { DataRepositories } from "@/services/repositories"

export interface PlatformAccountCheckResult {
  account: PlatformAccount | null
  isUsable: boolean
  message: string
}

export interface PlatformAccountService {
  listAccounts(): Promise<PlatformAccount[]>
  getAccountForPlatform(platform: Platform): Promise<PlatformAccountCheckResult>
  connectMockAccount(platform: Platform, displayName: string): Promise<PlatformAccount>
}

function createAccountId(platform: Platform) {
  return `acct-${platform}-${Date.now()}`
}

function isAccountExpired(account: PlatformAccount, now: Date) {
  return account.expiresAt !== undefined && account.expiresAt.getTime() <= now.getTime()
}

export function createPlatformAccountService(
  repositories: Pick<DataRepositories, "platformAccountRepository">,
): PlatformAccountService {
  return {
    async listAccounts() {
      try {
        return await repositories.platformAccountRepository.list()
      } catch (error) {
        console.error("Failed to list platform accounts:", error)
        throw error
      }
    },
    async getAccountForPlatform(platform) {
      try {
        const accounts = await repositories.platformAccountRepository.list()
        const now = new Date()
        const account =
          accounts.find(
            (item) =>
              item.platform === platform &&
              item.status === "connected" &&
              !isAccountExpired(item, now),
          ) ?? null

        if (!account) {
          return {
            account: null,
            isUsable: false,
            message: `${platform.toUpperCase()} account is not connected or has expired.`,
          }
        }

        return {
          account,
          isUsable: true,
          message: `${account.displayName} is ready.`,
        }
      } catch (error) {
        console.error("Failed to check platform account:", error)
        throw error
      }
    },
    async connectMockAccount(platform, displayName) {
      try {
        const connectedAt = new Date()
        const expiresAt = new Date(connectedAt)
        expiresAt.setDate(expiresAt.getDate() + 60)

        return await repositories.platformAccountRepository.create(
          withCurrentDataVersion({
            id: createAccountId(platform),
            platform,
            displayName,
            status: "connected",
            connectedAt,
            expiresAt,
            credentialsRef: `mock:${platform}:${connectedAt.getTime()}`,
          }),
        )
      } catch (error) {
        console.error("Failed to connect mock platform account:", error)
        throw error
      }
    },
  }
}
