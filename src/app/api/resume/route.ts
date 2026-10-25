import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { resumeFile } from "../../../lib/pursuitshq-data";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams, id = query.get("id") || "";
    if (!/^[a-f0-9]{20}$/.test(id)) return Response.json({ error: "Invalid resume reference." }, { status: 400 });
    const file = resumeFile(id); if (!file) return Response.json({ error: "This referenced PDF is missing or outside the configured resume roots." }, { status: 404 });
    const bytes = await fs.readFile(file.path), actualHash = createHash("sha256").update(bytes).digest("hex");
    if (query.has("meta")) return Response.json({ bytes: bytes.length, sha256: actualHash, expectedHash: file.expectedHash || null, matchesRecordedHash: file.expectedHash ? file.expectedHash === actualHash : null });
    const name = path.basename(file.path).replace(/[^a-zA-Z0-9._-]/g, "_");
    return new Response(bytes, { headers: { "Content-Type": "application/pdf", "Content-Length": String(bytes.length), "Content-Disposition": `${query.has("download") ? "attachment" : "inline"}; filename="${name}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return Response.json({ error: "Unable to read this resume file." }, { status: 500 }); }
}
