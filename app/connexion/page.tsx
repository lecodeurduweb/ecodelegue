"use client";

import { useState } from "react";
import { CheckCircle2, Leaf, LockKeyhole, UserRoundPlus } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function ConnexionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/account-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, schoolClass, reason }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Demande impossible");
      setSent(true);
      setName("");
      setEmail("");
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
            Connexion <mark>optionnelle</mark>
          </h1>
          <p>
            Le site reste consultable en mode visiteur. La connexion sert
            seulement à publier, importer des fichiers ou accéder aux outils
            d'administration.
          </p>
        </div>
        <footer>
          <span>
            <b>Public</b>
            <small>Lire les projets et fichiers</small>
          </span>
          <span>
            <b>Membre</b>
            <small>Créer et gérer du contenu</small>
          </span>
        </footer>
      </section>
      <section className="auth">
        <div className="authbox">
          <span className="eyebrow">ACCÈS AU SITE</span>
          <h2>Se connecter</h2>
          <p>
            Connecte-toi avec ChatGPT si ton compte a déjà été autorisé par un
            administrateur.
          </p>
          <a className="primary" href="/signin-with-chatgpt?return_to=/">
            <LockKeyhole />
            Se connecter avec ChatGPT
          </a>
          <a className="outline authlink" href="/">
            Continuer en visiteur
          </a>
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
