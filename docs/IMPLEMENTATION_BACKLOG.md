# PursuitsHQ implementation backlog

This is a future implementation specification, reviewed October 24, 2026. Proposed entities, routes, and workers below do not exist yet unless explicitly identified as current. The current release includes the renamed project/modules, clean page titles, navigation-based updates, themes, local source adapters, PDF serving, and persisted planning.

## Product outcome

A pursuit should answer five questions: which exact job is this, which application attempts exist, which document was attached, what evidence explains the current stage, and what action is due next. Analytics should reconcile to those records.

The first complete user journey to deliver is: attach an archived resume to an application attempt, receive its confirmation or outcome, review a proposed match if necessary, and see the event and next action update the pursuit and analytics.

## Current code map

| Current file | Responsibility | Likely next change |
| --- | --- | --- |
| `src/components/pursuitshq-dashboard.tsx` | Application, queue, resume, analytics, activity, and source views | Split views as features grow; add a unified pursuit timeline and review inbox |
| `src/components/sync-status.tsx` | Navigation update state and controls | Display worker checkpoints and freshness when a background worker exists |
| `src/lib/pursuitshq-data.ts` | Normalize journals/manifests, consolidate requisitions, index known PDFs | Adapter output into a transactional import/event layer |
| `src/lib/source-config.ts` | Source discovery and configuration compatibility | Explicit source registrations and local bridge configuration |
| `src/lib/pursuitshq-analytics.ts` | Cohorts, activity, outcomes, timing | Event-backed stage funnels, comparable observation windows, completeness |
| `src/lib/workspace-store.ts` | Versioned planning JSON | Transactional repository while preserving existing IDs and local decisions |
| `src/app/api/resume/route.ts` | Known-file streaming and hash metadata | Immutable artifact lookup and authorized archive streaming |
| `src/app/api/workspace/route.ts` | Versioned planning changes | Migration adapter until domain routes replace it |

Avoid coupling external service adapters to view components. Keep ingestion, normalized records, analytics definitions, and presentation separate enough to replay imports without browser activity.

## Delivery sequence

| Milestone | Depends on | Deliverable | Completion gate |
| --- | --- | --- | --- |
| P0 | Current release | Stable source baseline and migration inventory | Counts, IDs, file references, planning state, and unknowns reconcile |
| P1 | P0 | Database and repeatable source ingestion | Repeat/reordered imports cannot duplicate attempts/events or lose notes |
| P2 | P1 | Immutable resume vault and attempt history | Original-file replacement cannot alter a newly archived attachment |
| P3 | P1 | Mail connection, matching, and review inbox | One message creates one traceable event; ambiguous matches require review |
| P4 | P2, P3 | Calendar, due actions, and next queue | Reschedules, holds, follow-ups, and time zones behave consistently |
| P5 | P1–P4 | Reliable analytics and explainable suggestions | Each chart reconciles and every recommendation exposes its evidence |
| P6 | P1–P4 | Optional hosted/mobile access | Authenticated access, recoverable sync, and tested restore work end to end |

P2 and P3 can be separate implementation streams once P1's attempt/event contract is stable. Calendar should not block email ingestion or document archiving.

## P0: baseline and migration inventory

**P-001 — Inventory the existing records.** Build an import report with source path/identity, schema version, observed timestamp, accepted/rejected rows, canonical pursuit IDs, attempts, resume references, and unmatched outcomes. Record the existing source-priority rules before changing them.

Acceptance: existing application/queue counts can be explained from the source report; invalid dates and unmapped outcomes are retained as diagnostics. Local overrides and source stages remain distinguishable.

**P-002 — Preserve stable identity.** Use the current canonical requisition matching as an input, while representing application attempts separately. Add a review mechanism for a mistaken merge/split. Preserve source IDs and original URLs as aliases.

Acceptance: two applications to different jobs at the same company remain separate; a resubmission remains a distinct attempt; tracking-link variants match without merging different requisitions.

## P1: transactional state and ingestion

**P-101 — Add migrations and repositories.** A personal installation can start with SQLite on local non-synced disk; a hosted deployment can use PostgreSQL. Put the database outside the build directory. Choose the database before implementing multi-writer workers, then add migrations, import checks, and a restore procedure.

Suggested entity model:

| Entity | Essential fields/invariants |
| --- | --- |
| `pursuits` | Stable ID, canonical job identity, company/role, posting snapshot, source stage |
| `application_attempts` | Pursuit ID, source attempt ID, submitted time, confirmation state; no company-only matching |
| `source_events` | Source/external ID uniqueness, event type, occurred/observed times, evidence, processing version |
| `resume_artifacts` | Content hash, byte size, media type, archive key, creation time; immutable content |
| `attempt_attachments` | Attempt/artifact relation, prepared/attached/confirmed state, evidence and time |
| `planning_items` | Notes, bookmarks, due dates, stage overrides, queue disposition/order, revision |
| `interview_rounds` | Pursuit, source event ID, time zone, scheduled instant, cancellation/reschedule state |
| `integrations` / `sync_checkpoints` | Account/source identity, secret reference, cursor, last success/error |
| `review_items` | Candidate match/event, confidence evidence, unresolved/accepted/rejected decision |
| `audit_events` | Actor, action, before/after reference, timestamp; append-only decision history |

**P-102 — Implement idempotent source ingestion.** Stage and validate input, resolve identifiers, write a transaction, then advance the checkpoint. Retain the source payload reference needed to explain a decision. A new parser version must be replayable without generating duplicate events.

Acceptance: importing the same journal twice has no additional effect; a failed transaction leaves the previous checkpoint intact; source removal is not silently interpreted as withdrawal.

**P-103 — Migrate planning state.** Import `.local/workspace.json` with its version and IDs, preserve all notes/custom queue records, and verify a reconciliation report. Keep an export before switching the active repository.

Acceptance: the original file can restore the previous state; concurrent edits receive a revision conflict; neither a source import nor an external outcome overwrites a deliberate local note.

## P2: resume vault and version comparison

**P-201 — Archive exact bytes at attachment time.** Store content-addressed PDFs and link them to attempts. The attachment workflow should archive the same bytes it supplies to the form. Keep archive verification and submission confirmation as different facts.

Historical evidence levels: archived at attachment; current file matches a recorded preparation hash; referenced current file only; missing. Backfilling today's file must not promote it to proof of historical submission.

Acceptance: replacing the original path leaves the archived bytes unchanged; identical files deduplicate while retaining all attempt relations; corrupt or unreadable files enter a recoverable error state.

**P-202 — Improve the resume library.** Add version date/source, where-used attempts, immutable/current-file badges, side-by-side viewing, and extracted-text differences. Track extraction version and handle image-only PDFs explicitly.

Acceptance: selecting two versions shows changed content; missing files remain listed; a master resume is never substituted for an unknown attachment.

**P-203 — Archive related evidence.** Store the posting snapshot and relevant answers/cover letter for the attempt, with provenance. Keep sensitive answers behind the same ownership checks as resumes when hosting.

## P3: mailbox outcomes

**P-301 — Implement OAuth lifecycle.** Register the intended local/hosted OAuth client, exact callback, consent configuration, and chosen account. Store tokens in backend-only protected storage. Implement connect, reconnect, revoke/disconnect, and deletion. Determine Google's applicable restricted-scope verification requirements before public distribution.

**P-302 — Build incremental ingestion.** Backfill a bounded period, store message/thread IDs and a cursor, process changes, and reconcile periodically. The worker runs independently of a visible page. A hosted Gmail push path uses Pub/Sub and a renewed mailbox watch; a local polling worker is a reasonable initial deployment. See [Gmail push guidance](https://developers.google.com/workspace/gmail/api/guides/push).

Acceptance: duplicates/reordered deliveries do not duplicate events; expired cursors cause a controlled resync; revoked access produces an actionable connection state without erasing history.

**P-303 — Match messages and extract candidate events.** Prefer exact job/requisition identifiers. Record secondary company/role/date/sender evidence and the matching rules version. Treat multiple plausible pursuits, generic rejection language, and job newsletters as review cases.

**P-304 — Add a review inbox.** Show the relevant excerpt/source link, proposed pursuit/attempt, event, date, and reasons. Allow correction, acceptance, rejection, and undo through a new decision event. Parser predictions must remain distinguishable from confirmed facts.

Acceptance: one recruiter message covering two jobs can create two explicit reviewed relationships; a rejection for an old attempt cannot close an unrelated newer application.

## P4: calendar and action queue

**P-401 — Sync interview events.** Read the chosen calendars with the minimum needed scope. Preserve provider IDs, time zone, recurring instance identity, cancellation state, and update revision. Let the user resolve uncertain pursuit/round matches.

Acceptance: a reschedule updates the existing round; cancellations remove reminders without deleting history; daylight-saving changes preserve the scheduled instant.

**P-402 — Build a daily action queue.** Combine interview preparation, explicit due follow-ups, ready opportunities, stale posting checks, and review items. Apply eligibility/source holds before ranking. Show the reasons and allow manual ordering/snoozing.

Possible scoring inputs: due time, verified fit, preparation completeness, posting freshness, user priority. Avoid presenting an opaque score as an eligibility decision. A recent manual override should remain visible.

**P-403 — Connect agent preparation actions.** Use explicit queued commands such as verify posting, prepare materials, and open for review. Track command ID, progress, evidence, failure, cancellation, and result. Application submission remains a distinct candidate-approved step using the exact role, answers, and artifacts.

## P5: analytics and decision support

**P-501 — Publish a metric dictionary.** Define each metric before adding it to a chart:

| Metric | Definition / requirement |
| --- | --- |
| Interview reach | Pursuits in an application cohort that have a confirmed interview event; retain historical reach after closure |
| Stage conversion | Explicit eligible preceding-stage population and subsequent confirmed transition |
| First response delay | First qualifying event after the relevant attempt; distinguish observed event date from ingestion date |
| Source performance | Separate discovery source, platform, referral, and unknown; show denominator and follow-up window |
| Resume outcomes | Attempt-level artifact linkage, sample size, role/source mix, comparable observation period |
| Data completeness | Proportion with known source, immutable attachment, receipt, and confirmed outcome; no inferred successes |

**P-502 — Add cohort comparisons.** Compare equal observation windows and expose pending/unfinished observations. Add distributions before advanced forecasting. Survival-style analysis can account for unfinished observations once event dates and observation boundaries are reliable.

**P-503 — Add explainable fit and next-action suggestions.** Use verified candidate facts and exact posting requirements. Show the supporting experience and missing evidence. Keep generated suggestions separate from source facts. Evaluate factual accuracy and usefulness on reviewed examples before enabling automatic prioritization.

**P-504 — Add effort tracking and optional digests.** Capture time categories explicitly; calculate useful conversations per effort only when both effort and outcomes are sufficiently complete. Make reminder destinations and digest frequency user-controlled.

## Proposed API/event contracts

These are design targets, not currently implemented routes:

- `GET /api/v1/pursuits/:id`: attempts, source events, local decisions, artifacts, and next actions.
- `GET /api/v1/reviews` and `POST /api/v1/reviews/:id/decision`: revision-checked review decisions.
- `POST /api/v1/artifacts` and `GET /api/v1/artifacts/:id/content`: validated archive ingestion and authorized streaming.
- `POST /api/v1/integrations/:provider/connect`, callback, status, disconnect, and resync routes.
- `POST /api/v1/agent/commands`: scoped, auditable preparation commands with idempotency keys.

Common source event envelope: `schemaVersion`, `eventId`, `source`, `externalId`, `pursuitId`, optional `attemptId`, `type`, `occurredAt`, `observedAt`, `evidenceRef`, `parserVersion`, and `confirmationState`. Carry content hashes on artifact relationships rather than assuming a path identifies immutable content.

## P6: runtime, hosting, and operational readiness

Use a persistent worker with checkpoints, bounded retries, a recoverable failed-item queue, and observable job state. Add health/freshness metrics to the navigation menu through server status. The current visible-tab timer is a UI refresh mechanism.

For hosted access, implement login/ownership checks, migrations/backups, protected credential storage, deletion/disconnect, reproducible dependency installs with a lockfile, and CI. A local bridge or an approved upload/archive process must supply records currently held on the Windows machine.

A release should pass: import reconciliation, duplicate/reordered-event recovery, original-file replacement, expired OAuth/cursor recovery, timezone/reschedule checks, unauthorized access checks, and an actual backup restore. Test the first complete user journey before adding more providers or recommendation complexity.
