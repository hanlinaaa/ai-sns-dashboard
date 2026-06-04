# Domain Model

The domain layer defines the data the SNS tool manages and the rules that make that data valid.

## Core Entities

- `GeneratedContent`: AI-generated content before or after workflow actions.
- `HistoryRecord`: saved generation history used for reuse, editing, filtering, and export.
- `CalendarEvent`: scheduled content on the publishing calendar.
- `BrandSettings`: brand voice, safety words, hashtag preferences, and knowledge-base defaults.
- `SystemSettings`: AI, SNS connection, workflow, analytics, and notification settings.
- `PlatformAccount`: connected SNS account metadata.
- `PublishJob`: publish execution record for scheduled or manual posting.

## Platform Rules

`platform-rules.ts` owns platform-specific constraints:

- X: 280 character limit, 3 hashtags by default.
- Instagram: 2200 character limit, 30 hashtags by default.
- LINE: 500 character limit, no hashtags by default, LINE-specific format warnings.
- Each platform also defines a minimum schedule gap for conflict detection.

## Status Machine

`workflow.ts` defines the content lifecycle:

```text
draft -> generated -> scheduled -> pendingApproval -> published
                         |              |                |
                         v              v                v
                       failed <---------+-------------- failed
```

The canonical statuses are:

- `draft`
- `generated`
- `scheduled`
- `pendingApproval`
- `published`
- `failed`

Use `canTransitionStatus` or `assertStatusTransition` before changing status.

## Validation

`validation.ts` centralizes business validation:

- NG words
- required words
- hashtag count
- content length
- LINE formatting
- schedule conflicts

Validation returns structured `ValidationIssue` objects so UI and services can decide whether to block, warn, or display remediation.
