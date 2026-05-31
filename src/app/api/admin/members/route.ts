import { listMembersWithVerification } from "@/lib/mock-store";

export async function GET() {
  return Response.json({ members: listMembersWithVerification() });
}
