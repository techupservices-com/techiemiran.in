import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

export async function POST() {
  const response = Response.json({ message: "Logged out." });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
