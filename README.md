# PursuitsHQ

Public source release with synthetic demonstration data. Personal application records, resume PDFs, captured account telemetry, credentials, and workspace state stay in ignored local files.

```sh
git clone https://github.com/hemu1808/PursuitsHQ.git
cd PursuitsHQ
npm ci
npm run dev
```


A dynamic personal career workspace: application history, recorded resume attachments, prepared resume versions, the next application queue, outcome analytics, and persistent planning.

The project directory is `D:/Repos/PursuitsHQ`; the package name is `pursuitshq`. Source modules use the PursuitsHQ name.

## Run

Node 22.20+ is required. From this directory:

```sh
npm install
npm run dev
```

Open http://localhost:3001. For production, run `npm run build`, then `npm start`. Validate with `npm test` and `npm run typecheck`.

All application code is in this project. No website generator, hosted mock, or browser-only database is required. Existing local dependencies may be linked to the shared installation; a fresh install uses the dependencies declared in package.json.

## Dynamic sources

The source adapter discovers the current user's existing application preparation workspace and the application agent's application/outcome journals under roaming application data. Configure `PURSUITSHQ_ROOT`, `PURSUITSHQ_REPO`, or `PURSUITSHQ_DATA_DIR` and `JOB_AGENT_STATE_DIR` in `.env.local` for another source. A `.pursuitshq-data` marker is also supported. The compatibility adapter in `src/lib/source-config.ts` continues to read existing source folders and previous configuration names so that the product rename preserves application/resume links.

Each source sync reads the submitted-application journal, outcome journal, reviewed company queue, and dated preparation manifests. Canonical requisition URLs consolidate repeated records while preserving application IDs, attempts, events, and resume references. Lowercase and historical uppercase submission schemas are accepted. A visibly labeled bundled snapshot is used when the connected ledger is unavailable.

The source journals, resume contents, and career-workspace files are read-only from this app. The app does not submit applications or send messages.

## Resume history

The application drawer links the PDF referenced at submission. Prepared materials for the company are shown separately with their exact role and preparation batch. The resume library searches both submission references and queued-role materials.

An attachment path does not prove historical contents if the file was overwritten. The PDF preview calculates its SHA-256 hash and compares a recorded manifest hash when available. Missing files remain visible. A current master resume is never substituted for an unknown historical attachment.

PDFs are served only through opaque indexed IDs and a real-path containment check against configured roots. Arbitrary filesystem paths are not accepted by the endpoint. Additional resume-archive roots can be configured with RESUME_ALLOWED_ROOTS.

## Persistent workspace

Notes, bookmarks, local stage updates, follow-up dates, queue priorities/order/plans, and user-added opportunities are saved on disk in `.local/workspace.json`, or APP_STATE_DIR. They survive reloads, browser changes, and server restarts. A version check rejects stale concurrent writes; atomic replacement preserves the last complete state. All changes have an activity entry. Local stage updates are labeled and do not rewrite the source agent journal.

## Analytics

Application-date cohorts filter the charts and outcome comparisons. Calendar charts show weekly application and outcome activity. Historical interview events remain counted when a pursuit closes. Timing uses the first recorded outcome after submission and reports the sample size; negative or missing intervals are excluded. Pending outcomes are never inferred as ghosting or rejection. Discovery source and application platform are separate dimensions.

## API

- `GET /api/data[?force=1]`: normalize current sources and project linked resume/queue metadata.
- `GET /api/resume?id=OPAQUE_ID`: inline PDF; add `download=1` or `meta=1` for file download or hash metadata.
- `GET /api/workspace`: persisted state and version.
- `PUT /api/workspace`: versioned application, queue, or alarm patch; or create a user-added review opportunity. Cross-origin browser writes are rejected.

Private state, `.env.local`, build output, and dependencies are excluded by .gitignore. Bind the personal server to localhost unless you add authentication for a shared deployment.

## Color themes

Use the header theme control to choose Light, Dark, or System. Light is the initial default. Your choice is remembered independently for each dashboard in this browser and synchronized between its tabs. System follows operating-system appearance changes. A small head script applies the saved theme before the dashboard paints. Dark charts use a brighter palette; PDF previews retain their original document colors. Browser storage being unavailable does not prevent changing the current session’s theme.

See [INTEGRATION_ROADMAP.md](./INTEGRATION_ROADMAP.md) for the source review, advanced features, live-service setup, and an implementation sequence. The roadmap describes proposed integrations; only the connectors documented above are implemented.

## Navigation and updates

Page headers contain the page title and relevant filters/actions. The header navigation contains a compact Data updates menu with source identity, timestamp, automatic update state, manual sync, pause/resume, and source settings. Detail and chart annotations retain their metric definitions.

See [docs/IMPLEMENTATION_BACKLOG.md](./docs/IMPLEMENTATION_BACKLOG.md) for phased implementation tickets, proposed API/data contracts, dependencies, and release acceptance criteria.

## Demo and private data

The checked-in `src/demo` fixtures are fictional/generated examples. Runtime data in `src/data`, `.local`, and environment files are ignored by Git. The app uses configured local/live sources or a private snapshot when available, then falls back to the labeled demonstration. Resume history and PDF previews become available when you connect your own archive; no personal resumes are included.
