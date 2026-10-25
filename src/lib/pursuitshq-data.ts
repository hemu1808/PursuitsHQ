import fs from "node:fs";
import path from "node:path";
import { sourceRoots } from "./source-config.ts";
import { createHash } from "node:crypto";
import type { Stage } from "./analytics";
import { stageOf } from "./analytics.ts";

// The source files have several historical schemas. Normalize them at this boundary.
type Raw = Record<string, any>;
export type ResumeRecord = { id: string; name: string; company: string; role: string; kind: "submitted" | "prepared" | "master"; exists: boolean; bytes: number; modifiedAt: string; recordedAt: string; batch: string; applicationIds: string[]; queueIds: string[]; expectedHash?: string; provenance: string };
export type PursuitApplication = { id: string; ids: string[]; company: string; role: string; url: string; ats: string; source: string; appliedAt: string; latestAppliedAt: string; stage: Stage; resumeIds: string[]; attempts: number; events: { at: string; stage: Stage; note: string }[]; outcomeAt: string; evidence: string };
export type QueueRole = { id: string; company: string; role: string; url: string; ats: string; location: string; status: string; readiness: "prepared" | "blocked" | "research"; blocker: string; nextAction: string; resumeIds: string[]; checkedAt: string; batch: string; alreadyApplied: boolean };
export type PursuitsData = { applications: PursuitApplication[]; resumes: ResumeRecord[]; queue: QueueRole[]; syncedAt: string; sourceUpdatedAt: string; mode: "connected" | "snapshot" | "demo"; sources: { name: string; exists: boolean; updatedAt: string; count: number }[]; diagnostics: { imported: number; consolidated: number; unmatchedOutcomes: number; invalidLines: number; chronologyConflicts: number }; roots: { pursuits: string; ledger: string }; };
type RegistryEntry = { path: string; expectedHash?: string };
let registry = new Map<string, RegistryEntry>();
let cache: { at: number; value: PursuitsData } | null = null;
const str = (value: unknown) => typeof value === "string" ? value : "";
const hash = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 20);
export function canonicalJob(url: string) {
  try { const value = new URL(url); value.hash = ""; value.hostname = value.hostname.replace(/^boards\.greenhouse\./, "job-boards.greenhouse."); value.pathname = value.pathname.replace(/\/(application|apply|confirmation|applications\/new)\/?$/i, "").replace(/\/$/, ""); for (const key of [...value.searchParams.keys()]) if (/^(utm_|ref|source|gh_src|tracking|trk|gclid|fbclid|lever-)/i.test(key)) value.searchParams.delete(key); value.searchParams.sort(); return value.href.toLowerCase(); } catch { return ""; }
}
export function atsFor(url: string, fallback = "Other") { return /ashbyhq/i.test(url) ? "Ashby" : /greenhouse/i.test(url) ? "Greenhouse" : /lever\.co/i.test(url) ? "Lever" : /myworkday/i.test(url) ? "Workday" : /rippling/i.test(url) ? "Rippling" : fallback; }
function stamp(file: string) { try { return fs.statSync(file).mtime.toISOString(); } catch { return ""; } }
function json(file: string, fallback: any = null) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function ndjson(file: string, failures: { count: number }): Raw[] { try { return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).flatMap(line => { try { return [JSON.parse(line)]; } catch { failures.count++; return []; } }); } catch { return []; } }
const validDate = (value: string) => Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : "";

export function readPursuitsData(force = false): PursuitsData {
  if (!force && cache && Date.now() - cache.at < 10000) return cache.value;
  const roots = sourceRoots(), failures = { count: 0 };
  const applicationFile = path.join(roots.ledger, "applications.ndjson"), outcomeFile = path.join(roots.ledger, "outcomes.ndjson");
  const masterFile = path.join(roots.pursuits, "data", "company-queue-current", "master.json");
  let master = json(masterFile, { applications: [], queue: [] });
  const demoOnly = process.env.PURSUITSHQ_DEMO === "1";
  let raw = demoOnly ? [] : ndjson(applicationFile, failures).filter(row => /^(submitted|applied)$/i.test(str(row.status)));
  let mode: PursuitsData["mode"] = "connected";
  let outcomes = ndjson(outcomeFile, failures);
  if (!raw.length) { const privateRows = demoOnly ? null : json(path.join(process.cwd(), "src/data/applications.json")); raw = privateRows || json(path.join(process.cwd(), "src/demo/applications.json"), []); const folder = privateRows ? "src/data" : "src/demo"; outcomes = json(path.join(process.cwd(), folder, "metrics.json"), {}).interviews || []; mode = privateRows ? "snapshot" : "demo"; if (mode === "demo") master = json(path.join(process.cwd(), "src/demo/queue.json"), { applications: [], queue: [] }); }
  const extras = mode === "demo" ? [] : ["candidate-confirmed-applications.ndjson", "local-receipt-confirmed-applications.ndjson"].flatMap(name => ndjson(path.join(roots.pursuits, "data", name), failures));
  const rawUrls = new Set(raw.map(row => canonicalJob(str(row.url))));
  raw.push(...extras.filter(row => !rawUrls.has(canonicalJob(str(row.url)))));
  const corrections = mode === "demo" ? [] : json(path.join(roots.pursuits, "data/application-url-corrections.json"), {}).rows || [];
  raw = raw.map(row => { const correction = corrections.find((fix: Raw) => fix.applicationId === row.id); return correction ? { ...row, url: correction.url } : row; });
  const sources: PursuitsData["sources"] = [{ name: "Application ledger", exists: fs.existsSync(applicationFile), updatedAt: stamp(applicationFile), count: raw.length }, { name: "Outcome journal", exists: fs.existsSync(outcomeFile), updatedAt: stamp(outcomeFile), count: outcomes.length }, { name: "Reviewed company queue", exists: fs.existsSync(masterFile), updatedAt: stamp(masterFile), count: master.queue?.length || 0 }];
  const resumes = new Map<string, ResumeRecord>(), nextRegistry = new Map<string, RegistryEntry>();
  function addResume(reference: unknown, link: { application?: string; queue?: string; company?: string; role?: string; at?: string; batch?: string; expectedHash?: string; master?: boolean }) {
    let file = str(reference).trim(); if (!file) return "";
    if (/^(canonical )?resume\.pdf$/i.test(file)) file = path.join(roots.pursuits, "resume.pdf");
    else if (!path.isAbsolute(file)) { const candidate = path.resolve(roots.pursuits, file); if (fs.existsSync(candidate)) file = candidate; else return ""; }
    file = path.normalize(file); if (!/\.pdf$/i.test(file)) return "";
    const id = hash(file.toLowerCase()); let exists = false, bytes = 0, modifiedAt = "";
    try { const stat = fs.statSync(file); exists = stat.isFile(); bytes = stat.size; modifiedAt = stat.mtime.toISOString(); } catch {}
    const existing = resumes.get(id);
    const item: ResumeRecord = existing || { id, name: path.basename(file), company: link.company || "Master resume", role: link.role || "General profile", kind: link.master ? "master" : link.application ? "submitted" : "prepared", exists, bytes, modifiedAt, recordedAt: link.at || modifiedAt, batch: link.batch || "Application history", applicationIds: [], queueIds: [], expectedHash: link.expectedHash, provenance: link.application ? "Attachment path recorded on an application. Historical file contents are verified only when a recorded hash is available." : "Prepared material from an explicit role manifest. This does not establish that it was submitted." };
    if (link.application && !item.applicationIds.includes(link.application)) { item.applicationIds.push(link.application); item.kind = "submitted"; }
    if (link.queue && !item.queueIds.includes(link.queue)) item.queueIds.push(link.queue);
    if (link.at && (!item.recordedAt || link.at > item.recordedAt)) item.recordedAt = link.at;
    if (link.expectedHash) item.expectedHash = link.expectedHash;
    if (existing && link.company && existing.company !== link.company) { item.company = "Shared resume"; item.role = "Referenced by multiple roles"; }
    if (link.master) item.kind = "master";
    resumes.set(id, item); nextRegistry.set(id, { path: file, expectedHash: item.expectedHash }); return id;
  }
  const grouped = new Map<string, Raw[]>();
  raw.forEach((row, i) => { if (!str(row.company) || !str(row.role)) return; const key = canonicalJob(str(row.url)) || `id:${str(row.id || row.job_id) || i}`; grouped.set(key, [...(grouped.get(key) || []), row]); });
  const applications: PursuitApplication[] = [];
  const matchedOutcomeIds = new Set<string>();
  for (const [key, attempts] of grouped) {
    const sorted = [...attempts].sort((a, b) => Date.parse(str(b.submittedAt || b.date_applied)) - Date.parse(str(a.submittedAt || a.date_applied)));
    const latest = sorted[0], id = str(latest.id || latest.job_id) || hash(key), ids = [...new Set(attempts.map(row => str(row.id || row.job_id)).filter(Boolean))];
    const events = outcomes.filter(event => ids.includes(str(event.id))).map(event => { matchedOutcomeIds.add(str(event.id)); return { at: validDate(str(event.occurredAt)), stage: stageOf(str(event.status)), note: str(event.note) }; }).filter(event => event.at).sort((a, b) => a.at.localeCompare(b.at));
    const masterRow = (master.applications || []).find((row: Raw) => ids.includes(str(row.id)) || canonicalJob(str(row.url)) === key);
    let stage: Stage = events.at(-1)?.stage || "pending";
    if (!events.length && masterRow?.hiringOutcome && /reject|interview|assessment|offer/i.test(masterRow.hiringOutcome)) stage = stageOf(masterRow.hiringOutcome);
    else if (!events.length && mode !== "connected") stage = stageOf(str(latest.status));
    const dates = attempts.map(row => validDate(str(row.submittedAt || row.date_applied || row.appliedAt))).filter(Boolean).sort();
    const appliedAt = dates[0] || "", latestAppliedAt = dates.at(-1) || "";
    const resumeIds = [...new Set(attempts.map(row => addResume(row.answers?.Resume || row.resumePath || row.resume_path || row.recordedResume || masterRow?.recordedResume, { application: id, company: latest.company, role: latest.role, at: str(row.submittedAt || row.date_applied), batch: "Recorded submission" })).filter(Boolean))];
    applications.push({ id, ids, company: str(latest.company), role: str(latest.role), url: str(latest.url), ats: atsFor(str(latest.url), str(latest.ats) || "Other"), source: str(latest.discoverySource) || (/^(direct-company|user-supplied|web-search|job-board|hacker-news)$/.test(str(latest.source)) ? latest.source : "unknown"), appliedAt, latestAppliedAt, stage, resumeIds, attempts: attempts.length, events, outcomeAt: events.at(-1)?.at || "", evidence: events.at(-1)?.note || str(masterRow?.outcomeEvidence) });
  }
  const queueMap = new Map<string, QueueRole>();
  function addQueue(row: Raw, batch: string, prepared?: Raw) {
    const url = str(row.url || row.exactUrl || row.primaryUrl), key = canonicalJob(url); if (!key || !str(row.company) || !str(row.role || row.primaryRole)) return;
    const status = str(row.status || prepared?.status) || "Needs review";
    if (/^(already applied|closed|excluded|skipped|not a job)/i.test(status)) return;
    const id = str(row.id) || hash(key), previous = queueMap.get(key);
    const resumeId = addResume(prepared?.pdf || row.resume || row.pdf, { queue: id, company: row.company, role: row.role || row.primaryRole, at: str(prepared?.createdAt || row.resumeCheckedAt), batch, expectedHash: str(prepared?.pdfHash) });
    const resumeIds = [...new Set([...(previous?.resumeIds || []), resumeId].filter(Boolean))];
    const blocked = /held|blocked|requirement|eligibility|clearance/i.test(status) || !!str(row.blocker);
    const hasResume = resumeIds.some(id => resumes.get(id)?.exists);
    queueMap.set(key, { id, company: row.company, role: row.role || row.primaryRole, url, ats: str(row.ats) || atsFor(url), location: str(row.location), status, readiness: blocked ? "blocked" : hasResume ? "prepared" : "research", blocker: str(row.blocker), nextAction: str(row.nextAction) || (hasResume ? "Review exact role, resume, and required form answers before applying." : "Prepare an exact-role resume and verify the posting."), resumeIds, checkedAt: str(row.postingCheckedAt || row.resumeCheckedAt || prepared?.createdAt), batch, alreadyApplied: grouped.has(key) });
  }
  (master.queue || []).forEach((row: Raw) => addQueue(row, "Reviewed company queue"));
  const dataDir = path.join(roots.pursuits, "data");
  let preparationDirs: string[] = []; try { preparationDirs = mode === "demo" ? [] : fs.readdirSync(dataDir).filter(name => /^preparation-\d{4}-\d{2}-\d{2}$/.test(name)).sort(); } catch {}
  for (const dir of preparationDirs) {
    const location = path.join(dataDir, dir), queueFile = path.join(location, "queue.json");
    const queue = json(queueFile, []), manifest = json(path.join(location, "tailored-resumes-manifest.json"), {}), materials = json(path.join(location, "new-materials.json"), {});
    const preparedRows: Raw[] = [...(manifest.rows || []), ...(materials.rows || [])];
    if (Array.isArray(queue)) queue.forEach(row => addQueue(row, dir.replace("preparation-", "Prepared "), preparedRows.find(item => item.id === row.id || canonicalJob(str(item.exactUrl || item.primaryUrl)) === canonicalJob(str(row.url)))));
    const readiness = json(path.join(location, "role-readiness.json"), {}).rows || [];
    readiness.forEach((row: Raw) => addQueue(row, dir.replace("preparation-", "Reviewed "), preparedRows.find(item => item.id === row.id)));
    preparedRows.forEach(row => addResume(row.pdf, { company: str(row.company), role: str(row.role), at: str(manifest.createdAt || materials.createdAt), batch: dir.replace("preparation-", "Prepared "), expectedHash: str(row.pdfHash) }));
    if (queue.length || preparedRows.length) sources.push({ name: dir, exists: true, updatedAt: stamp(queueFile) || stamp(path.join(location, "new-materials.json")), count: queue.length || preparedRows.length });
  }
  if (mode !== "demo") addResume(path.join(roots.pursuits, "resume.pdf"), { master: true, batch: "Master profile" });
  const value: PursuitsData = { applications: applications.sort((a, b) => b.latestAppliedAt.localeCompare(a.latestAppliedAt)), resumes: [...resumes.values()].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)), queue: [...queueMap.values()].filter(row => !row.alreadyApplied), syncedAt: new Date().toISOString(), sourceUpdatedAt: sources.map(source => source.updatedAt).filter(Boolean).sort().at(-1) || "", mode, sources, diagnostics: { imported: raw.length, consolidated: raw.length - applications.length, unmatchedOutcomes: outcomes.filter(event => !matchedOutcomeIds.has(str(event.id))).length, invalidLines: failures.count, chronologyConflicts: applications.filter(app => app.events.some(event => app.appliedAt && event.at < app.appliedAt)).length }, roots };
  if (mode === "demo") { const captured = json(path.join(process.cwd(), "src/demo/metrics.json"), {}).generatedAt || value.syncedAt; value.sourceUpdatedAt = captured; value.sources = [{ name: "Synthetic applications", exists: true, updatedAt: captured, count: value.applications.length }, { name: "Synthetic opportunities", exists: true, updatedAt: captured, count: value.queue.length }]; }
  registry = nextRegistry; cache = { at: Date.now(), value }; return value;
}
export function resumeFile(id: string) { if (!registry.size) readPursuitsData(); const entry = registry.get(id); if (!entry) return null; const roots = sourceRoots(); const allowedRoots = [roots.pursuits, roots.ledger, ...(process.env.RESUME_ALLOWED_ROOTS || "").split(path.delimiter).filter(Boolean)]; let actual: string; try { actual = fs.realpathSync(entry.path); } catch { return null; } if (!allowedRoots.some(root => { try { const relative = path.relative(fs.realpathSync(root), actual); return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative); } catch { return false; } })) return null; return { ...entry, path: actual }; }
