import Stripe from "stripe";
import { nanoid } from "nanoid";
import { saveSubmission } from "../../lib/store";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { cv, jobDescription, language } = req.body || {};

  if (!cv || cv.trim().length < 50) {
    return res.status(400).json({ error: "Le CV semble trop court ou vide." });
  }

  // On génère un identifiant unique pour relier le paiement aux données soumises
  const submissionId = nanoid();
  saveSubmission(submissionId, {
    cv: cv.slice(0, 20000),
    jobDescription: (jobDescription || "").slice(0, 8000),
    language: language || "auto",
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: submissionId,
      line_items: [
        {
          price_data: {
            currency: process.env.PRICE_CURRENCY || "eur",
            product_data: {
              name: "Optimisation de CV par IA",
              description: "Réécriture et optimisation ATS de votre CV pour une offre ciblée",
            },
            unit_amount: parseInt(process.env.PRICE_AMOUNT || "900", 10),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Erreur Stripe:", err);
    return res.status(500).json({ error: "Erreur lors de la création du paiement." });
  }
}
