import Stripe from "stripe";
import Anthropic from "@anthropic-ai/sdk";
import { getSubmission, saveSubmission } from "../../lib/store";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en recrutement et en optimisation de CV (ATS, ressources humaines).
On va te donner un CV brut et, éventuellement, une offre d'emploi ciblée.

Ta tâche :
1. Réécris le CV pour le rendre plus percutant, clair et optimisé pour les filtres ATS (mots-clés pertinents, structure standard, verbes d'action).
2. Si une offre d'emploi est fournie, mets en avant les expériences et compétences les plus pertinentes pour ce poste précis, et adapte le vocabulaire à l'offre.
3. RÈGLE ABSOLUE : n'invente JAMAIS d'expérience, de compétence, de diplôme ou de chiffre qui n'est pas déjà présent (ou clairement déductible) dans le CV original. Tu peux reformuler et mettre en valeur, jamais fabriquer des faits.
4. Conserve la langue du CV original (français ou anglais) sauf si l'utilisateur demande explicitement une traduction.
5. Structure le résultat en Markdown propre (titres, sous-titres, listes à puces), prêt à être copié dans un éditeur de CV.
6. Termine par une section "Notes d'optimisation" (3 à 5 puces) expliquant brièvement les changements clés que tu as faits et pourquoi.

Ne mets aucun texte avant ou après le CV optimisé et les notes — uniquement ces deux blocs.`;

export default async function handler(req, res) {
  const sessionId = req.query.session_id;
  if (!sessionId) {
    return res.status(400).json({ error: "session_id manquant." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Paiement non confirmé." });
    }

    const submissionId = session.client_reference_id;
    const submission = getSubmission(submissionId);

    if (!submission) {
      return res.status(404).json({
        error:
          "Données introuvables ou expirées. Si tu as déjà payé, contacte le support avec ton ID de session.",
        sessionId,
      });
    }

    // Si déjà généré (ex: l'utilisateur a rafraîchi la page), on renvoie le résultat en cache
    if (submission.result) {
      return res.status(200).json({ result: submission.result });
    }

    const userMessage = submission.jobDescription
      ? `CV original :\n"""\n${submission.cv}\n"""\n\nOffre d'emploi ciblée :\n"""\n${submission.jobDescription}\n"""`
      : `CV original (aucune offre ciblée fournie, optimise-le de façon générale) :\n"""\n${submission.cv}\n"""`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const result = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    // On met en cache le résultat pour éviter de regénérer (et refacturer l'appel API) à chaque refresh
    saveSubmission(submissionId, { ...submission, result });

    return res.status(200).json({ result });
  } catch (err) {
    console.error("Erreur génération:", err);
    return res.status(500).json({ error: "Erreur lors de la génération du CV optimisé." });
  }
}
