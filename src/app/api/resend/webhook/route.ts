import { updateBroadcastEmailRecipientEvent } from "@/lib/services/broadcast-email-service";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    type?: string;
    data?: { email_id?: string };
  };

  const emailId = payload.data?.email_id;
  if (!payload.type || !emailId) {
    return Response.json({ ok: true });
  }

  await updateBroadcastEmailRecipientEvent(emailId, payload.type);
  return Response.json({ ok: true });
}
