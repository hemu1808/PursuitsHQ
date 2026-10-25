import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type WorkspaceItem = { note?: string; saved?: boolean; followUp?: string; completed?: boolean; stage?: string; priority?: number; disposition?: string; rank?: number; acknowledged?: boolean };
export type WorkspaceState = { version: number; updatedAt: string; items: Record<string, WorkspaceItem>; customQueue: { id: string; company: string; role: string; url: string; createdAt: string }[]; events: { id: string; entity: string; at: string; summary: string }[] };
const empty = (): WorkspaceState => ({ version: 0, updatedAt: "", items: {}, customQueue: [], events: [] });
const allowed = new Set(["note", "saved", "followUp", "completed", "stage", "priority", "disposition", "rank", "acknowledged"]);
export function validatePatch(value: unknown): WorkspaceItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid workspace change.");
  const patch = value as Record<string, unknown>;
  for (const [key, item] of Object.entries(patch)) {
    if (!allowed.has(key)) throw new Error("Unsupported workspace field.");
    if (["saved", "completed", "acknowledged"].includes(key) && typeof item !== "boolean") throw new Error("Invalid selection.");
    if (key === "note" && (typeof item !== "string" || item.length > 15000)) throw new Error("Notes must be shorter than 15,000 characters.");
    if (key === "followUp" && (typeof item !== "string" || item !== "" && (!/^\d{4}-\d{2}-\d{2}$/.test(item) || !Number.isFinite(Date.parse(item)) || new Date(item).toISOString().slice(0, 10) !== item))) throw new Error("Invalid follow-up date.");
    if (key === "stage" && !["", "pending", "assessment", "interview", "offer", "rejected", "withdrawn"].includes(String(item))) throw new Error("Invalid application stage.");
    if (key === "disposition" && !["", "next", "review", "snoozed"].includes(String(item))) throw new Error("Invalid queue disposition.");
    if (["priority", "rank"].includes(key) && (typeof item !== "number" || !Number.isFinite(item) || Math.abs(item) > 100000)) throw new Error("Invalid queue priority.");
  }
  return patch as WorkspaceItem;
}
export function createWorkspaceStore(file: string) {
  let lock: Promise<unknown> = Promise.resolve();
  async function read(): Promise<WorkspaceState> {
    try { const data = JSON.parse(await readFile(file, "utf8")); if (!Number.isInteger(data.version) || !data.items || !Array.isArray(data.events) || !Array.isArray(data.customQueue)) throw new Error("Workspace file is invalid."); return data; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return empty(); throw error; }
  }
  async function update(input: { version: number; entity?: string; id?: string; patch?: unknown; create?: { company: string; role: string; url: string } }) {
    const operation = lock.then(async () => {
      const state = await read();
      if (input.version !== state.version) throw Object.assign(new Error("The workspace changed in another tab. Your view has been refreshed; try again."), { status: 409 });
      let entity: string, summary: string;
      if (input.create) {
        const { company, role, url } = input.create;
        if (![company, role, url].every(value => typeof value === "string" && value.trim().length > 0 && value.length < 2000) || !/^https?:\/\//i.test(url)) throw new Error("Provide a company, role, and valid employer URL.");
        const id = `local-${randomUUID()}`;
        state.customQueue.push({ id, company: company.trim(), role: role.trim(), url: new URL(url).href, createdAt: new Date().toISOString() }); entity = `queue:${id}`; summary = "Added an opportunity to the review queue";
      } else {
        if (!["application", "queue", "alarm"].includes(input.entity || "") || typeof input.id !== "string" || !input.id || input.id.length > 600) throw new Error("Invalid workspace entity.");
        const patch = validatePatch(input.patch); entity = `${input.entity}:${input.id}`;
        state.items[entity] = { ...state.items[entity], ...patch };
        summary = Object.keys(patch).map(key => ({ note: "Saved note", saved: patch.saved ? "Bookmarked" : "Removed bookmark", stage: "Updated local stage", followUp: "Updated follow-up date", priority: "Updated priority", disposition: "Updated queue plan", rank: "Reordered queue", acknowledged: "Updated local acknowledgement", completed: "Updated follow-up completion" }[key])).filter(Boolean).join(" · ");
      }
      state.version++; state.updatedAt = new Date().toISOString();
      state.events = [{ id: randomUUID(), entity, at: state.updatedAt, summary }, ...state.events].slice(0, 1000);
      await mkdir(path.dirname(file), { recursive: true });
      const temp = `${file}.${randomUUID()}.tmp`; await writeFile(temp, JSON.stringify(state, null, 2), { mode: 0o600 }); await rename(temp, file);
      return state;
    });
    lock = operation.catch(() => {}); return operation;
  }
  return { read, update };
}
export const workspaceStore = createWorkspaceStore(path.join(process.env.APP_STATE_DIR || path.join(process.cwd(), ".local"), "workspace.json"));
