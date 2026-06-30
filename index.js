import { useState } from "react";

export default function Home() {
  const [cv, setCv] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const priceLabel = "9 €";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (cv.trim().length < 50) {
      setError("Colle ton CV complet (au moins quelques lignes) avant de continuer.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, jobDescription }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <header className="hero">
        <h1>Optimise ton CV avec l'IA</h1>
        <p>
          Colle ton CV et (optionnellement) l'offre visée. Reçois en quelques
          secondes une version réécrite, optimisée ATS et adaptée au poste.
        </p>
      </header>

      <div className="steps">
        <div className="step">
          <div className="num">1</div>
          Colle ton CV
        </div>
        <div className="step">
          <div className="num">2</div>
          Paye {priceLabel}
        </div>
        <div className="step">
          <div className="num">3</div>
          Récupère ton CV optimisé
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <label htmlFor="cv">
          Ton CV actuel <span className="hint">(copie-colle le texte complet)</span>
        </label>
        <textarea
          id="cv"
          rows={12}
          value={cv}
          onChange={(e) => setCv(e.target.value)}
          placeholder="Colle ici l'intégralité de ton CV (expériences, formations, compétences...)"
          required
        />

        <label htmlFor="job">
          Offre d'emploi ciblée{" "}
          <span className="hint">(optionnel mais recommandé pour un meilleur résultat)</span>
        </label>
        <textarea
          id="job"
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Colle ici le texte de l'offre d'emploi visée"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Redirection vers le paiement..." : `Optimiser mon CV — ${priceLabel}`}
        </button>
        <p className="price">Paiement sécurisé par carte via Stripe. Résultat généré juste après.</p>
      </form>
    </div>
  );
}
