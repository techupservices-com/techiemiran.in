import { z } from "zod";
import { createSessionToken } from "@/lib/auth";
import { ADMIN_SESSION_COOKIE, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from "@/lib/constants";

export async function POST(request: Request) {
  const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
  const body = schema.parse(await request.json());
  const adminEmail = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  if (body.email !== adminEmail || body.password !== adminPassword) {
    return Response.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  const response = Response.json({ message: "Signed in." });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=${createSessionToken("admin_root", "admin")}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
  );
  return response;
}
