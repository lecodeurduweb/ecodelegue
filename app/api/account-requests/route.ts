import { env } from "cloudflare:workers";

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function POST(req: Request) {
  const body: any = await req.json().catch(() => ({}));
  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const schoolClass = clean(body.schoolClass);
  const reason = clean(body.reason);

  if (!name || !email || !schoolClass) {
    return Response.json(
      { error: "Nom, e-mail et classe sont requis" },
      { status: 400 },
    );
  }

  if (!email.includes("@") || email.length > 160) {
    return Response.json({ error: "Adresse e-mail invalide" }, { status: 400 });
  }

  await env.DB.prepare(
    "INSERT INTO account_requests (id,name,email,school_class,reason,status,created_at) VALUES (?,?,?,?,?,'pending',?)",
  )
    .bind(crypto.randomUUID(), name, email, schoolClass, reason.slice(0, 800), Date.now())
    .run();

  return Response.json({ ok: true });
}
