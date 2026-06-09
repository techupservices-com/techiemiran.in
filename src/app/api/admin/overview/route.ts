import { getAdminHomepageData } from "@/lib/data";

export async function GET() {
  const data = await getAdminHomepageData();
  return Response.json(data);
}
