"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkspaceItem, WorkspaceState } from "../lib/workspace-store";
const initial: WorkspaceState = { version: 0, updatedAt: "", items: {}, customQueue: [], events: [] };
export function useWorkspace() {
  const [state, setState] = useState(initial), [error, setError] = useState(""), [saving, setSaving] = useState(false), [ready, setReady] = useState(false);
  const current = useRef(initial), pending = useRef<Promise<unknown>>(Promise.resolve());
  const accept = useCallback((value: WorkspaceState) => { current.current = value; setState(value); }, []);
  const reload = useCallback(async () => { const response = await fetch("/api/workspace", { cache: "no-store" }); if (!response.ok) throw new Error("Saved workspace is unavailable."); accept(await response.json()); }, [accept]);
  useEffect(() => { reload().catch(error => setError(error.message)).finally(() => setReady(true)); const focus = () => { reload().catch(() => {}); }; window.addEventListener("focus", focus); return () => window.removeEventListener("focus", focus); }, [reload]);
  function change(payload: Record<string, unknown>) {
    const operation = pending.current.then(async () => {
      setSaving(true); setError("");
      try {
        const response = await fetch("/api/workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, version: current.current.version }) });
        const body = await response.json(); if (!response.ok) { if (response.status === 409) await reload(); throw new Error(body.error || "Unable to save changes."); }
        accept(body);
      } catch (error) { setError((error as Error).message); throw error; } finally { setSaving(false); }
    }); pending.current = operation.catch(() => {}); return operation;
  }
  return { state, ready, saving, error, reload, item: (entity: string, id: string): WorkspaceItem => state.items[`${entity}:${id}`] || {}, patch: (entity: string, id: string, patch: WorkspaceItem) => change({ entity, id, patch }), create: (create: { company: string; role: string; url: string }) => change({ create }) };
}
