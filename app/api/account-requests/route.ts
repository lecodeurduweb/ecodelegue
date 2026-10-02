import { env } from "cloudflare:workers";
import { ensureAuthSchema, hashPassword, ownerEmail } from "../../local-auth";

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function POST(req: Request) {
  await ensureAuthSchema();
  const body: any = await req.json().catch(() => ({}));
  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const schoolClass = clean(body.schoolClass);
  const reason = clean(body.reason);
  const password = String(body.password || "");

  if (!name || !email || !schoolClass || password.length < 8) {
    return Response.json(
      { error: "Nom, e-mail, classe et mot de passe de 8 caractères minimum sont requis" },
      { status: 400 },
    );
  }

  if (!email.includes("@") || email.length > 160) {
    return Response.json({ error: "Adresse e-mail invalide" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  if (email === ownerEmail()) {
    await env.DB.prepare(
      "INSERT INTO members (id,email,name,role,status,created_at,password_hash) VALUES (?,?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,role='admin',status='active',password_hash=excluded.password_hash",
    )
      .bind(crypto.randomUUID(), email, name, "admin", "active", Date.now(), passwordHash)
      .run();
    return Response.json({ ok: true, approved: true });
  }

  await env.DB.prepare(
    "INSERT INTO account_requests (id,name,email,school_class,reason,status,created_at,password_hash) VALUES (?,?,?,?,?,'pending',?,?)",
  )
    .bind(crypto.randomUUID(), name, email, schoolClass, reason.slice(0, 800), Date.now(), passwordHash)
    .run();

  return Response.json({ ok: true });
}
