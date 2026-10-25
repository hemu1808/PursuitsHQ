import { readPursuitsData } from "../../../lib/pursuitshq-data";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { return Response.json(readPursuitsData(new URL(request.url).searchParams.has("force")), { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "Unable to read the application snapshot. Check the source files and try again." }, { status: 500 }); }
}
