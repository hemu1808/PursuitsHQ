import PursuitsHQDashboard from "../components/pursuitshq-dashboard";
import { readJobData } from "../lib/data";
export const dynamic = "force-dynamic";
export default async function Page() { return <PursuitsHQDashboard initialData={await readJobData()} />; }
