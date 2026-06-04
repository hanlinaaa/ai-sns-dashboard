import { withCurrentDataVersion } from "@/domain/data-version"
import type {
  BrandSettings,
  CalendarEvent,
  HistoryRecord,
  Platform,
  PublishJob,
  PublishJobStatus,
} from "@/domain/types"
import { hasBlockingIssues, validateContent } from "@/domain/validation"
import type { DataRepositories } from "@/services/repositories"
import { createPlatformAccountService } from "@/services/platform-accounts"

export interface PublishServiceResult {
  ok: boolean
  job: PublishJob | null
  event?: CalendarEvent
  historyRecord?: HistoryRecord
  message: string
}

export interface CreatePublishJobInput {
  event: CalendarEvent
  brandSettings?: BrandSettings
  runImmediately?: boolean
}

export interface PublishingService {
  createJobFromCalendarEvent(input: CreatePublishJobInput): Promise<PublishServiceResult>
  runDueJobs(brandSettings?: BrandSettings): Promise<PublishServiceResult[]>
  retryJob(jobId: string, brandSettings?: BrandSettings): Promise<PublishServiceResult>
  cancelJob(jobId: string): Promise<PublishServiceResult>
}

interface MockPublishConnectorResult {
  ok: boolean
  externalId?: string
  errorMessage?: string
}

const MAX_RETRY_COUNT = 3

function createPublishJobId(eventId: string) {
  return `pub-${Date.now()}-${eventId}`
}

function shouldFailMockPublish(event: CalendarEvent) {
  return /fail|error|rejected|blocked/i.test(`${event.title}\n${event.content}`)
}

async function publishWithMockConnector(
  platform: Platform,
  event: CalendarEvent,
): Promise<MockPublishConnectorResult> {
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 250))

    if (shouldFailMockPublish(event)) {
      return {
        ok: false,
        errorMessage: `${platform.toUpperCase()} mock connector rejected the content.`,
      }
    }

    return {
      ok: true,
      externalId: `mock-${platform}-${Date.now()}`,
    }
  } catch (error) {
    console.error("Mock publish connector failed:", error)
    return {
      ok: false,
      errorMessage: "Publishing connector is unavailable.",
    }
  }
}

function updateEventStatus(
  events: CalendarEvent[],
  eventId: string,
  status: CalendarEvent["status"],
  publishJobId?: string,
) {
  return events.map((event) =>
    event.id === eventId ? withCurrentDataVersion({ ...event, status, publishJobId }) : event,
  )
}

function updateHistoryStatus(
  records: HistoryRecord[],
  historyId: string | undefined,
  status: HistoryRecord["status"],
) {
  if (!historyId) return records
  return records.map((record) =>
    record.id === historyId ? withCurrentDataVersion({ ...record, status }) : record,
  )
}

export function createPublishingService(repositories: DataRepositories): PublishingService {
  const accountService = createPlatformAccountService(repositories)

  const persistPublishResult = async (
    job: PublishJob,
    event: CalendarEvent,
    status: PublishJobStatus,
    errorMessage?: string,
  ): Promise<PublishServiceResult> => {
    try {
      const completedAt = new Date()
      const nextJob = await repositories.publishJobRepository.update(job.id, {
        status,
        completedAt,
        errorMessage,
      })
      const eventStatus =
        status === "succeeded" ? "published" : status === "failed" ? "failed" : event.status
      const historyStatus =
        status === "succeeded" ? "published" : status === "failed" ? "failed" : undefined
      const events = await repositories.calendarRepository.list()
      const savedEvents = await repositories.calendarRepository.replaceAll(
        updateEventStatus(events, event.id, eventStatus, nextJob.id),
      )
      const historyRecords = await repositories.historyRepository.list()
      const savedHistory =
        historyStatus === undefined
          ? historyRecords
          : await repositories.historyRepository.replaceAll(
              updateHistoryStatus(historyRecords, event.historyId, historyStatus),
            )

      return {
        ok: status === "succeeded",
        job: nextJob,
        event: savedEvents.find((item) => item.id === event.id),
        historyRecord: event.historyId
          ? savedHistory.find((item) => item.id === event.historyId)
          : undefined,
        message:
          status === "succeeded"
            ? "Published successfully."
            : (errorMessage ?? "Publishing did not complete."),
      }
    } catch (error) {
      console.error("Failed to persist publish result:", error)
      return {
        ok: false,
        job,
        event,
        message: "Publishing finished, but result synchronization failed.",
      }
    }
  }

  const executeJob = async (
    job: PublishJob,
    brandSettings?: BrandSettings,
  ): Promise<PublishServiceResult> => {
    try {
      const event = job.calendarEventId
        ? await repositories.calendarRepository.get(job.calendarEventId)
        : null
      if (!event) {
        const failedJob = await repositories.publishJobRepository.update(job.id, {
          status: "failed",
          completedAt: new Date(),
          errorMessage: "Calendar event was not found.",
        })
        return { ok: false, job: failedJob, message: "Calendar event was not found." }
      }

      const issues = validateContent({
        platform: event.platform,
        content: event.content,
        brandSettings,
      })
      if (hasBlockingIssues(issues)) {
        return await persistPublishResult(job, event, "failed", issues[0].message)
      }

      const accountCheck = await accountService.getAccountForPlatform(event.platform)
      if (!accountCheck.isUsable || !accountCheck.account) {
        return await persistPublishResult(job, event, "failed", accountCheck.message)
      }

      const runningJob = await repositories.publishJobRepository.update(job.id, {
        status: "running",
        startedAt: new Date(),
        accountId: accountCheck.account.id,
        errorMessage: undefined,
      })
      const connectorResult = await publishWithMockConnector(event.platform, event)

      if (!connectorResult.ok) {
        return await persistPublishResult(
          runningJob,
          event,
          "failed",
          connectorResult.errorMessage ?? "Publishing failed.",
        )
      }

      return await persistPublishResult(runningJob, event, "succeeded")
    } catch (error) {
      console.error("Failed to execute publish job:", error)
      return {
        ok: false,
        job,
        message: "Publishing failed because the queue service is unavailable.",
      }
    }
  }

  return {
    async createJobFromCalendarEvent(input) {
      try {
        const issues = validateContent({
          platform: input.event.platform,
          content: input.event.content,
          brandSettings: input.brandSettings,
        })
        if (hasBlockingIssues(issues)) {
          return {
            ok: false,
            job: null,
            event: input.event,
            message: issues[0].message,
          }
        }

        const accountCheck = await accountService.getAccountForPlatform(input.event.platform)
        if (!accountCheck.isUsable) {
          return {
            ok: false,
            job: null,
            event: input.event,
            message: accountCheck.message,
          }
        }

        const existingJob = input.event.publishJobId
          ? await repositories.publishJobRepository.get(input.event.publishJobId)
          : null
        const job =
          existingJob ??
          (await repositories.publishJobRepository.create(
            withCurrentDataVersion({
              id: createPublishJobId(input.event.id),
              platform: input.event.platform,
              accountId: accountCheck.account?.id,
              contentId: input.event.historyId,
              calendarEventId: input.event.id,
              status: "queued",
              scheduledAt: input.event.scheduledAt,
              retryCount: 0,
            }),
          ))
        const events = await repositories.calendarRepository.list()
        const savedEvents = await repositories.calendarRepository.replaceAll(
          updateEventStatus(events, input.event.id, input.event.status, job.id),
        )
        const savedEvent = savedEvents.find((event) => event.id === input.event.id) ?? input.event

        if (input.runImmediately || job.scheduledAt.getTime() <= Date.now()) {
          return await executeJob(job, input.brandSettings)
        }

        return {
          ok: true,
          job,
          event: savedEvent,
          message: "Publish job queued.",
        }
      } catch (error) {
        console.error("Failed to create publish job:", error)
        return {
          ok: false,
          job: null,
          event: input.event,
          message: "Failed to create publish job.",
        }
      }
    },
    async runDueJobs(brandSettings) {
      try {
        const jobs = await repositories.publishJobRepository.list()
        const dueJobs = jobs.filter(
          (job) => job.status === "queued" && job.scheduledAt.getTime() <= Date.now(),
        )
        return await Promise.all(dueJobs.map((job) => executeJob(job, brandSettings)))
      } catch (error) {
        console.error("Failed to run due publish jobs:", error)
        return [
          {
            ok: false,
            job: null,
            message: "Failed to run due publish jobs.",
          },
        ]
      }
    },
    async retryJob(jobId, brandSettings) {
      try {
        const job = await repositories.publishJobRepository.get(jobId)
        if (!job) return { ok: false, job: null, message: "Publish job was not found." }
        if (job.retryCount >= MAX_RETRY_COUNT) {
          return { ok: false, job, message: "Maximum retry count has been reached." }
        }
        const queuedJob = await repositories.publishJobRepository.update(job.id, {
          status: "queued",
          retryCount: job.retryCount + 1,
          scheduledAt: new Date(),
          errorMessage: undefined,
        })
        return await executeJob(queuedJob, brandSettings)
      } catch (error) {
        console.error("Failed to retry publish job:", error)
        return {
          ok: false,
          job: null,
          message: "Failed to retry publish job.",
        }
      }
    },
    async cancelJob(jobId) {
      try {
        const job = await repositories.publishJobRepository.get(jobId)
        if (!job) return { ok: false, job: null, message: "Publish job was not found." }
        if (job.status === "succeeded" || job.status === "cancelled") {
          return { ok: false, job, message: `Cannot cancel a ${job.status} publish job.` }
        }
        const cancelledJob = await repositories.publishJobRepository.update(job.id, {
          status: "cancelled",
          completedAt: new Date(),
        })
        return {
          ok: true,
          job: cancelledJob,
          message: "Publish job cancelled.",
        }
      } catch (error) {
        console.error("Failed to cancel publish job:", error)
        return {
          ok: false,
          job: null,
          message: "Failed to cancel publish job.",
        }
      }
    },
  }
}
