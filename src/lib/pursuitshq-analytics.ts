import type { PursuitApplication } from "./pursuitshq-data";
export const date = (value: string) => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(Date.parse(value)) : "Unknown date";
export const percent = (a: number, b: number) => b ? `${(a / b * 100).toFixed(1)}%` : "—";
export const days = (value: string, now: string) => value ? Math.max(0, Math.floor((Date.parse(now) - Date.parse(value)) / 86400000)) : 0;
export function pursuitStats(rows: PursuitApplication[], now: string) {
  const interviews = rows.filter(row => row.stage === "interview" || row.stage === "offer" || row.events.some(event => event.stage === "interview"));
  const known = rows.filter(row => !["pending", "withdrawn"].includes(row.stage) || row.events.length > 0);
  const durations = rows.map(row => { const first = row.events.filter(event => event.at >= row.appliedAt).sort((a, b) => a.at.localeCompare(b.at))[0]; return first && row.appliedAt ? (Date.parse(first.at) - Date.parse(row.appliedAt)) / 86400000 : null; }).filter((value): value is number => value !== null && Number.isFinite(value)).sort((a, b) => a - b);
  const middle = Math.floor(durations.length / 2), median = durations.length ? durations.length % 2 ? durations[middle] : (durations[middle - 1] + durations[middle]) / 2 : null;
  return { total: rows.length, interviews: interviews.length, known: known.length, pending: rows.filter(row => row.stage === "pending").length, rejected: rows.filter(row => row.stage === "rejected").length, offers: rows.filter(row => row.stage === "offer").length, aged: rows.filter(row => row.stage === "pending" && days(row.appliedAt, now) >= 14).length, companies: new Set(rows.map(row => row.company.toLowerCase())).size, median, timingSample: durations.length };
}
export function calendarSeries(rows: PursuitApplication[], reference: string) {
  const now = new Date(reference); now.setUTCHours(0, 0, 0, 0); now.setUTCDate(now.getUTCDate() - (now.getUTCDay() + 6) % 7);
  const starts = Array.from({ length: 9 }, (_, i) => now.getTime() - (8 - i) * 7 * 86400000);
  return { applied: starts.map(start => ({ at: new Date(start).toISOString(), value: rows.filter(row => Date.parse(row.appliedAt) >= start && Date.parse(row.appliedAt) < start + 7 * 86400000).length })), outcomes: starts.map(start => ({ at: new Date(start).toISOString(), value: rows.filter(row => row.events.some(event => Date.parse(event.at) >= start && Date.parse(event.at) < start + 7 * 86400000)).length })) };
}
export function outcomeGroups(rows: PursuitApplication[], field: "source" | "ats", now: string) { return [...new Set(rows.map(row => row[field]))].map(label => ({ label, ...pursuitStats(rows.filter(row => row[field] === label), now) })).sort((a, b) => b.total - a.total); }
