# PursuitsHQ: feature and live-service integration roadmap

The project now lives at `D:/Repos/PursuitsHQ`. Page titles are simplified and update information/actions live in the navigation menu. See [the implementation backlog](./docs/IMPLEMENTATION_BACKLOG.md) for sequenced tickets, the current code map, proposed entities/routes, dependencies, and release acceptance criteria.

The interface and rename are implemented. The future database, workers, and service integrations described below remain proposed work.

Reviewed against the local application on October 24, 2026. This is a proposed implementation plan. The light/dark/system theme control is implemented; the additional services below are not connected yet.

## Assessment

The interface now gives the application history, next queue, resume references, and analytics distinct places. The next major improvement is a reliable history of what happened to each application and exactly which document was attached. That history makes conversion, resume comparisons, reminders, and recommendations useful.

The current adapter reads real local files, consolidates canonical requisition URLs, retains attempts and events, and links existing PDFs. It refreshes while the dashboard is visible. Notes and planning changes persist on the server. These are working features, rather than static screen mockups.

The important limits are:

- A PDF path can point to a file that was later replaced. The current hash comparison checks the available file against a preparation manifest when one exists; it does not establish what was attached at submission.
- Source journals, preparation manifests, and local planning JSON are separate stores. Dashboard stage overrides do not write back to the application agent's journal.
- Recorded outcomes are incomplete. An old pending application is still pending evidence, rather than a verified rejection or unanswered outreach.
- There is no Gmail/Calendar OAuth connector, independent background sync worker, or durable integration checkpoint database yet.
- The server reads Windows-local files. A hosted server will need a local bridge or uploaded archive to access them.

## Recommended product additions

| Priority | Addition | Expected user experience | Data needed |
| --- | --- | --- | --- |
| 1 | Immutable resume vault | Open the exact archived document for each application attempt, see prepared/attached/confirmed states, and compare versions | File bytes, SHA-256, attempt ID, attachment time, evidence/receipt |
| 1 | Automatic outcome timeline | Confirmation, assessment, recruiter reply, interview, and rejection events arrive with links to their evidence; ambiguous matches enter review | Mail message/thread IDs, job IDs, source timestamps, matching confidence |
| 1 | Daily next-action queue | A ranked list with due follow-ups, interview preparation, verified opportunities, and clear holds | Follow-up dates, calendar events, posting freshness, readiness and eligibility |
| 2 | Interview workspace | Interview rounds, local time, reschedules, preparation notes, and a company timeline | Read-only calendar sync and manually confirmed rounds |
| 2 | Cohort and source analytics | Compare interview reach and stage conversion by application week, source, role family, and seniority | Complete event history, standardized source and role fields |
| 2 | Resume performance comparisons | Compare response rates and time to response across versions, with sample sizes and context | Immutable resume IDs linked to attempts and dated outcomes |
| 3 | Time and effort analytics | See which sources and preparation activities produce useful conversations per hour spent | Explicit effort tracking, activity categories, reliable outcomes |
| 3 | Evidence-based recommendations | Suggestions explain the relevant job requirements, verified experience, and missing evidence | Exact posting snapshot, verified candidate facts, transparent scoring |

### Resume history worth building first

Archive a copy of the PDF when it is actually selected for an application, addressed by content hash. Store the display filename separately. Link the artifact to an application attempt, not just the company. Keep preparation time, attachment time, and submission confirmation as separate facts.

For old records, mark the evidence level: archived at submission, matches a recorded preparation hash, current referenced file only, or missing. Historical files without a trustworthy attachment hash must keep that uncertainty visible. A backfill can archive their current bytes without rewriting that history.

Add side-by-side PDF viewing and extracted-text differences, with changed bullets and dates highlighted. Resume outcome comparisons should show the number of applications, source/role mix, and observation period; different response rates alone do not establish that a wording change caused the difference.

### Analytics that improve decisions

- Track application-date cohorts and stage transitions separately from calendar activity. A week with many rejection messages may describe older applications.
- Show submitted-to-assessment, assessment-to-interview, and interview-to-offer conversion with explicit denominators and sample sizes.
- Show a response-time distribution alongside the median. Pending applications are unfinished observations; introduce survival analysis only after event dates and observation boundaries are reliable.
- Separate discovery source, application platform, referral, role family, seniority, and location. Preserve unknown values.
- Show completeness measures: applications with immutable resumes, verified receipts, known source, and confirmed outcomes.
- Compare mature cohorts on equal follow-up windows. Small samples and missing outcomes should remain visible in comparisons.

## Live-service connections

| Connection | Current state | Implementation work | Account/setup input |
| --- | --- | --- | --- |
| Application agent | Reads submitted/outcome journals and preparation files | Versioned event adapter, idempotent ingestion, reconciliation, explicit command interface for future actions | Confirm the canonical journal owner and event contract |
| Resume storage | Serves known PDFs through indexed IDs | Immutable content-addressed archive, attempt linkage, backup/restore, text extraction | Local archive path; private object storage if hosted |
| Gmail, if this is the job-search mailbox | Not implemented | OAuth callback, encrypted token storage, incremental sync, matching/review queue, retry/recovery | Google Cloud project, enabled Gmail API, consent configuration, OAuth client, chosen account |
| Calendar | Not implemented | Read-only event sync, round matching, time zones, cancellations/reschedules, reminders | Enable Calendar API, choose calendars and read scopes |
| Notifications | In-app planning exists | Scheduled reminder worker; optional email or calendar actions as a later feature | Preferred reminder destinations and delivery settings |

### Gmail implementation sequence

1. Register a Google OAuth client for the intended local or hosted deployment. Configure exact callback URLs, consent settings, authorized test users where appropriate, and offline access for background synchronization. Tokens stay in the backend's protected credential store.
2. Start with read-only mailbox access. `gmail.readonly` is classified as a restricted scope. A public launch needs an explicit review of Google's verification requirements and any applicable exceptions/security assessment for server-side storage or transmission. See [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes) and [restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification).
3. Backfill a bounded date range. Persist message ID, thread ID, relevant source dates, matching evidence, processing version, and a sync cursor. Store the minimum content needed for the feature, with deletion controls.
4. Match exact requisition URLs/IDs first. Use sender, company, role, and application date as secondary signals. A general newsletter or a message mentioning several jobs must not silently change an application's status.
5. Store candidate events with source references; send ambiguous matches/classifications to an inbox for review. Preserve both when the event occurred and when it was detected.
6. For a local pilot, run an independent scheduled polling worker. For a hosted service, Gmail push uses Cloud Pub/Sub and a mailbox watch; renew the watch before expiry and consume changes through the history API. Implement missed-notification reconciliation and cursor-expiry resync. See [Gmail push](https://developers.google.com/workspace/gmail/api/guides/push) and [history.list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list).
7. Test duplicate deliveries, revoked access, token expiry, ambiguous companies, reopened roles, and a message received after the original application closed. Connecting the mailbox should not introduce email sending or application submission.

### Calendar implementation sequence

Use the narrow read scope that supports the selected calendars, such as `calendar.events.readonly`. Match events to a pursuit and interview round, retain time zones, and handle recurring instances, cancellations, and reschedules. Let the user resolve an unclear match. The initial feature reads existing interviews and displays reminders; creating or editing calendar entries is a separate later action.

Push channels expire and require replacement; reconciliation is still needed. A local polling worker is a reasonable starting point. See [Calendar scopes](https://developers.google.com/workspace/calendar/api/auth) and [Calendar push notifications](https://developers.google.com/workspace/calendar/api/guides/push).

### Application-agent connection

Keep the existing source adapter during migration. Add a versioned event contract containing an event ID, source, application and attempt IDs, canonical job URL, event type, occurred/observed timestamps, evidence reference, and optional resume content hash. Enforce uniqueness on source plus external event ID so repeated reads or deliveries cannot duplicate outcomes.

If dashboard actions will eventually start agent work, use explicit queued commands such as verify posting, prepare materials, or open for review. Preserve holds and eligibility blockers. Submission requires the candidate's approval of the exact role, answers, and attachments. The current dashboard has no submission command endpoint.

## Data and runtime architecture

```text
Local agent journals / resume files     Gmail / Calendar
                  |                         |
            Local adapter          OAuth sync worker
                  |                         |
                  +----> Normalized event store <---- Review decisions
                              |         |
                       Resume archive   Analytics read model
                              |         |
                         PursuitsHQ server/API
                                  |
                              Dashboard
```

For the personal Windows installation, a transactional SQLite database on local non-synced disk is a practical next step. Keep SQLite WAL files off OneDrive/network folders; its WAL design requires processes sharing the database to run on the same host. For hosted workers or multiple app instances, use PostgreSQL and private object storage. This is an architectural recommendation, not a database already installed by this change. See [SQLite WAL](https://sqlite.org/wal.html).

Suggested entities: pursuits, application_attempts, source_events, resume_artifacts, attempt_attachments, queue_items, followups, interview_rounds, integrations, sync_checkpoints, review_items, and audit_events. Source evidence and local decisions should remain distinguishable.

Each worker needs a persistent checkpoint, bounded retries/backoff, idempotency, a recoverable failed-item queue, and a visible last-success/last-error status. A browser timer alone cannot keep data current while the dashboard is closed.

## Hosting requirements

- Establish independent, reproducible dependency installs and commit a lockfile for this app; the current workstation uses a shared dependency junction.
- Migrate JSON planning state and source projections with an import ledger, repeatable migrations, and verified backups.
- Provide authentication and ownership checks before serving personal records beyond localhost.
- Protect OAuth secrets and refresh tokens in backend-only storage, with disconnect/revocation and data deletion.
- Use a persistent worker/service for synchronization. A local bridge can send only approved records and archived documents to a hosted deployment; a cloud server cannot open a Windows path directly.
- Add deployment health checks, structured sync errors, backup restore checks, and CI for source normalization, event deduplication, document integrity, and connector recovery.

## Delivery order and acceptance criteria

1. **Data foundation and resume vault:** migrate attempts/events, archive newly attached resumes, and expose provenance. Acceptance: replacing the original PDF does not change the archived attachment, and repeated imports keep counts stable.
2. **Mail outcomes:** connect one mailbox, backfill a bounded period, and add the review inbox. Acceptance: duplicate or reordered messages produce one correct event; uncertain matches require review; reconnect recovers missing changes.
3. **Calendar and daily queue:** show confirmed interviews, due follow-ups, verified next opportunities, and blocked items. Acceptance: reschedules/cancellations update correctly across time zones and holds remain effective.
4. **Deeper analytics:** add event funnels, equal-observation cohorts, and resume comparisons. Acceptance: chart totals reconcile to their underlying records and every metric has a defined denominator.
5. **Hosted access if wanted:** add authentication, persistent infrastructure, and the local bridge. Acceptance: a fresh deployment restores from backup and sync continues with all browser tabs closed.

The largest immediate value is the resume vault plus incoming outcomes. Together they answer which document was used, what happened next, and which follow-up deserves attention.
