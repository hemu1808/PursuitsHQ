"use client";
import { useEffect, useRef } from "react";
import { ArrowUpRight, ChevronDown, Pause, Play, RefreshCw } from "lucide-react";

type Props = {
  label: string;
  source: string;
  updatedAt: string;
  updatedLabel?: string;
  connected: boolean;
  automatic: boolean;
  interval: number;
  busy: boolean;
  caption?: string;
  saveStatus?: string;
  onRefresh: () => void;
  onToggle: () => void;
  onConnections: () => void;
};

export default function SyncStatus({ label, source, updatedAt, updatedLabel = "Last synced", connected, automatic, interval, busy, caption, saveStatus, onRefresh, onToggle, onConnections }: Props) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false; };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const valid = Number.isFinite(Date.parse(updatedAt));
  const timestamp = valid ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }).format(new Date(updatedAt)) + " UTC" : "Unavailable";
  return <details className="nav-sync" ref={ref} onKeyDown={event => { if (event.key === "Escape" && ref.current?.open) { event.preventDefault(); ref.current.open = false; ref.current.querySelector("summary")?.focus(); } }}>
    <summary aria-label="Data updates" title={`${label} · ${updatedLabel} ${timestamp}`}><i className={`source-indicator ${connected ? "connected" : "recorded"}`} /><RefreshCw size={14} className={busy ? "spin" : ""} aria-hidden="true" /><span className="nav-sync-label">{busy ? "Updating…" : label}</span><time className="nav-sync-time" dateTime={valid ? updatedAt : undefined}>{timestamp}</time><ChevronDown size={12} className="nav-sync-chevron" aria-hidden="true" /></summary>
    <div className="nav-sync-popover"><strong>Data updates</strong><dl><div><dt>Source</dt><dd>{source}</dd></div><div><dt>{updatedLabel}</dt><dd>{timestamp}</dd></div><div><dt>Automatic updates</dt><dd>{automatic ? `Every ${interval}s while visible` : "Paused"}</dd></div>{saveStatus && <div><dt>Workspace</dt><dd>{saveStatus}</dd></div>}</dl>{caption && <p>{caption}</p>}<div className="nav-sync-actions"><button className="button primary small-button" disabled={busy} onClick={onRefresh}><RefreshCw size={14} className={busy ? "spin" : ""} />{busy ? "Updating…" : "Sync now"}</button><button className="button secondary small-button" onClick={onToggle} aria-label={automatic ? "Pause automatic updates" : "Enable automatic updates"}>{automatic ? <Pause size={14} /> : <Play size={14} />}{automatic ? "Pause updates" : "Enable updates"}</button></div><button className="nav-sync-link" onClick={() => { if (ref.current) ref.current.open = false; onConnections(); }}>Source settings <ArrowUpRight size={13} /></button></div>
  </details>;
}
