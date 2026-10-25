export type Stage = "pending" | "assessment" | "interview" | "offer" | "rejected" | "withdrawn";
export type Application = { index: number; id: string; company: string; role: string; url: string; ats: string; source: string; submittedAt: string; status: string; outcomeNote?: string };
export type Attention = { id: string; company: string; applicationId: string; blocker: string; stage: string; url: string; createdAt: string; requiredActions: string[] };
export type Interview = { id: string; status: string; occurredAt: string; note: string };
export type JobDataset = { applications: Application[]; attention: Attention[]; interviews: Interview[]; snapshotAt: string; importedCounts: { applications: number; interviews: number; rejected: number } };
export type Workspace = Record<string, { note?: string; followUp?: string; completed?: boolean; saved?: boolean }>;
export const DAY = 86_400_000;
export const stageLabels: Record<Stage, string> = { pending: "Awaiting response", assessment: "Assessment", interview: "Interview", offer: "Offer", rejected: "Rejected", withdrawn: "Withdrawn" };
export const sourceLabel = (source: string) => ({ "direct-company": "Company careers", "user-supplied": "Personal leads", "web-search": "Web search", "job-board": "Job boards", "hacker-news": "Hacker News" }[source] || source);
export function stageOf(status: string): Stage {
  if (/reject|declin/i.test(status)) return "rejected";
  if (/withdraw/i.test(status)) return "withdrawn";
  if (/offer|hired/i.test(status)) return "offer";
  if (/assessment|take.home/i.test(status)) return "assessment";
  if (/interview|screen/i.test(status)) return "interview";
  return "pending";
}
export function uniqueApplications(rows: Application[]) {
  const byId = new Map<string, Application>();
  for (const row of rows) { const previous = byId.get(row.id); if (!previous || Date.parse(row.submittedAt) >= Date.parse(previous.submittedAt)) byId.set(row.id, row); }
  return [...byId.values()];
}
export const ageDays = (date: string, reference: string) => Math.max(0, Math.floor((Date.parse(reference) - Date.parse(date)) / DAY));
export const number = (value: number) => new Intl.NumberFormat("en-US").format(value);
export const percent = (value: number, total: number) => total ? `${(value / total * 100).toFixed(1)}%` : "—";
export function shortDate(date: string) { const timestamp = Date.parse(date); return Number.isFinite(timestamp) ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(timestamp) : "Not recorded"; }
export function roleGroup(role: string) {
  if (/\b(ai|ml|llm|data|machine learning|intelligence)\b/i.test(role)) return "AI & data";
  if (/full.?stack|product engineer/i.test(role)) return "Full stack & product";
  if (/front.?end|react|\bui\b/i.test(role)) return "Frontend";
  if (/back.?end|platform|infrastructure|distributed/i.test(role)) return "Backend & platform";
  return "Software engineering";
}
export function withinRange(app: Application, days: number, reference: string) { return !days || (Date.parse(app.submittedAt) <= Date.parse(reference) && Date.parse(app.submittedAt) >= Date.parse(reference) - days * DAY); }
export function summarize(rows: Application[], interviews: Interview[], reference: string) {
  const ids = new Set(rows.map(row => row.id));
  const interviewIds = new Set(interviews.filter(event => ids.has(event.id) && /interview/i.test(event.status)).map(event => event.id));
  for (const row of rows) if (["interview", "offer"].includes(stageOf(row.status))) interviewIds.add(row.id);
  const counts: Record<Stage, number> = { pending: 0, assessment: 0, interview: 0, offer: 0, rejected: 0, withdrawn: 0 };
  rows.forEach(row => counts[stageOf(row.status)]++);
  const outcomes = rows.filter(row => !["pending", "withdrawn"].includes(stageOf(row.status)) || interviewIds.has(row.id)).length;
  const maturePending = rows.filter(row => stageOf(row.status) === "pending" && ageDays(row.submittedAt, reference) >= 14).length;
  return { counts, outcomes, interviewIds, maturePending, companies: new Set(rows.map(row => row.company.toLowerCase())).size, total: rows.length };
}
export function weeklySeries(rows: Application[], reference: string, weeks = 9) {
  const end = new Date(reference); end.setUTCHours(0, 0, 0, 0); end.setUTCDate(end.getUTCDate() - (end.getUTCDay() + 6) % 7);
  return Array.from({ length: weeks }, (_, index) => { const start = end.getTime() - (weeks - 1 - index) * 7 * DAY; return { label: shortDate(new Date(start).toISOString()), value: rows.filter(row => Date.parse(row.submittedAt) >= start && Date.parse(row.submittedAt) < start + 7 * DAY).length, date: new Date(start).toISOString() }; });
}
export function groupPerformance(rows: Application[], interviews: Interview[], reference: string, group: (row: Application) => string) {
  const groups = new Map<string, Application[]>(); rows.forEach(row => { const key = group(row); groups.set(key, [...(groups.get(key) || []), row]); });
  return [...groups].map(([label, items]) => ({ label, ...summarize(items, interviews, reference) })).sort((a, b) => b.total - a.total);
}
export function csvText(rows: (string | number)[][]) { return rows.map(row => row.map(value => { const text = String(value ?? ""); return `"${(/^[=+\-@\t\r]/.test(text) ? "'" : "") + text.replaceAll('"', '""')}"`; }).join(",")).join("\r\n"); }
export function followUpQueue(rows: Application[], workspace: Workspace, reference: string) {
  return rows.filter(row => { const action = workspace[row.id]; if (action?.completed) return false; if (action?.followUp) return Date.parse(action.followUp) <= Date.parse(reference); return ["interview", "assessment"].includes(stageOf(row.status)) || stageOf(row.status) === "pending" && ageDays(row.submittedAt, reference) >= 14; }).sort((a, b) => { const priority = (row: Application) => stageOf(row.status) === "assessment" ? 0 : stageOf(row.status) === "interview" ? 1 : 2; return priority(a) - priority(b) || Date.parse(a.submittedAt) - Date.parse(b.submittedAt); });
}
