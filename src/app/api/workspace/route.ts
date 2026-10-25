import { workspaceStore } from "../../../lib/workspace-store";
import { sameOrigin } from "../../../lib/http";
export const dynamic = "force-dynamic";
export async function GET() { try { return Response.json(await workspaceStore.read(), { headers: { "Cache-Control": "no-store" } }); } catch { return Response.json({ error: "The saved workspace could not be read. Your source data is intact." }, { status: 500 }); } }
export async function PUT(request: Request) {
  try {
    if (!sameOrigin(request)) return Response.json({ error: "Cross-origin writes are not accepted." }, { status: 403 });
    const text = await request.text(); if (text.length > 100000) return Response.json({ error: "Workspace change is too large." }, { status: 413 });
    return Response.json(await workspaceStore.update(JSON.parse(text)), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return Response.json({ error: (error as Error).message || "Unable to save changes." }, { status: (error as { status?: number }).status || 400 }); }
}
