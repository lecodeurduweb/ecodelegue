import { env } from "cloudflare:workers";
import { createSession, ensureAuthSchema, verifyPassword } from "../../../local-auth";

export async function POST(req: Request) {
  await ensureAuthSchema(env.DB);
  const body: any = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return Response.json({ error: "E-mail et mot de passe requis" }, { status: 400 });

  const member: any = await env.DB.prepare(
    "SELECT id,email,name,role,status,password_hash as passwordHash FROM members WHERE lower(email)=?",
  )
    .bind(email)
    .first();

  if (!member || member.status !== "active" || !(await verifyPassword(password, member.passwordHash))) {
    return Response.json({ error: "Compte non approuvé ou mot de passe incorrect" }, { status: 401 });
  }

  await createSession({
    userId: member.id,
    displayName: member.name,
    email: member.email,
    role: member.role,
  });

  return Response.json({ ok: true });
}
