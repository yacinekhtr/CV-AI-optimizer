import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session_id) return;

    async function fetchResult() {
      try {
        const res = await fetch(`/api/verify?session_id=${session_id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erreur lors de la récupération du résultat.");
        }

        setResult(data.result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [session_id]);

  function copyToClipboard() {
    navigator.clipboard.writeText(result);
  }

  return (
    <div className="container">
      <header className="hero">
        <h1>Ton CV optimisé</h1>
        <p>Merci pour ton paiement — voici ta version générée par l'IA.</p>
      </header>

      <div className="card">
        {loading && (
          <div className="loading">Génération en cours, quelques secondes...</div>
        )}

        {error && <div className="error">{error}</div>}

        {!loading && result && (
          <>
            <button onClick={copyToClipboard} style={{ marginBottom: 20 }}>
              Copier le résultat
            </button>
            <div className="result">{result}</div>
          </>
        )}
      </div>
    </div>
  );
}
