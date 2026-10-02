"use client";

import { useState } from "react";
import { CheckCircle2, Leaf, LockKeyhole, UserRoundPlus } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function ConnexionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [password, setPassword] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Connexion impossible");
      location.href = "/";
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/account-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password, schoolClass, reason }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Demande impossible");
      setSent(true);
      setName("");
      setEmail("");
      setPassword("");
      setSchoolClass("");
      setReason("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="login">
      <Toaster richColors />
      <section className="welcome">
        <div className="brand">
          <Leaf />
          <span>
            <b>Éco-délégués</b>
            <small>Collège Jules-Verne</small>
          </span>
        </div>
        <div>
          <em>Espace collaboratif</em>
          <h1>
            Accès <mark>approuvé</mark>
          </h1>
          <p>
            Le site est réservé aux comptes validés par un administrateur.
            Chaque compte visible dans l'administration peut être vérifié,
            accepté ou supprimé.
          </p>
        </div>
        <footer>
          <span>
            <b>0</b>
            <small>Aucun accès visiteur</small>
          </span>
          <span>
            <b>100%</b>
            <small>Comptes vérifiés</small>
          </span>
        </footer>
      </section>
      <section className="auth">
        <div className="authbox">
          <span className="eyebrow">ACCÈS AU SITE</span>
          <h2>Se connecter</h2>
          <p>
            Entre avec l'e-mail et le mot de passe d'un compte déjà approuvé.
          </p>
          <form onSubmit={login}>
            <label>
              Adresse e-mail
              <input required type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            </label>
            <label>
              Mot de passe
              <input required type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </label>
            <button className="primary" disabled={saving}>
              <LockKeyhole />
              Se connecter
            </button>
          </form>
          <div className="or">OU</div>
          {sent ? (
            <div className="success">
              <CheckCircle2 />
              <b>Demande envoyée</b>
              <small>Un administrateur pourra l'accepter depuis le site.</small>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h3>Demander la création d'un compte</h3>
              <label>
                Nom et prénom
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Louis Sittler"
                />
              </label>
              <label>
                Adresse e-mail
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@email.fr"
                />
              </label>
              <label>
                Mot de passe souhaité
                <input
                  required
                  minLength={8}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                />
              </label>
              <label>
                Classe ou rôle
                <input
                  required
                  value={schoolClass}
                  onChange={(e) => setSchoolClass(e.target.value)}
                  placeholder="Ex. 4e, professeur, CPE"
                />
              </label>
              <label>
                Pourquoi veux-tu un compte ?
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex. Je suis éco-délégué et je veux ajouter des projets."
                />
              </label>
              <button className="primary" disabled={saving}>
                <UserRoundPlus />
                {saving ? "Envoi..." : "Envoyer la demande"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
