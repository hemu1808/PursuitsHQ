import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Older source workspaces remain readable during the dashboard rename.
// These identifiers refer to external records/configuration, not the product name.
export function sourceRoots() {
  const modern = path.join(os.homedir(), "OneDrive", "Desktop", "PursuitsHQ");
  const historical = path.join(os.homedir(), "OneDrive", "Desktop", "career-ops");
  const repository = process.env.PURSUITSHQ_REPO || process.env.CAREER_OPS_REPO || (fs.existsSync(modern) ? modern : historical);
  let marker = "";
  for (const name of [".pursuitshq-data", ".career-ops-data"]) {
    try { marker = fs.readFileSync(path.join(repository, name), "utf8").trim(); if (marker) break; } catch {}
  }
  const pursuits = path.resolve(repository, process.env.PURSUITSHQ_ROOT || process.env.PURSUITSHQ_DATA_DIR || process.env.CAREER_OPS_ROOT || process.env.CAREER_OPS_DATA_DIR || marker || ".");
  const ledger = process.env.JOB_AGENT_STATE_DIR || path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "job-application-agent");
  return { pursuits, ledger };
}
