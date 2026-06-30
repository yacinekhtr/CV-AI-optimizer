# Optimiseur de CV par IA — MVP vendable

Outil web : l'utilisateur colle son CV + une offre d'emploi, paie via Stripe,
reçoit instantanément une version optimisée (ATS, mots-clés, mise en forme)
générée par l'API Anthropic (Claude).

## Stack
- Next.js (pages router) — un seul projet, frontend + API routes
- Stripe Checkout — paiement à l'acte (pas d'abonnement, pas de compte requis)
- API Anthropic (Claude Sonnet) — génération du contenu

## Mise en route en local

```bash
npm install
cp .env.example .env.local   # puis remplis les clés
npm run dev
```

Ouvre http://localhost:3000

## Variables d'environnement à remplir

| Variable | Où la trouver |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | idem (non utilisée côté client ici, mais bon à avoir) |
| `PRICE_AMOUNT` | prix en centimes, ex: 900 = 9,00€ |
| `PRICE_CURRENCY` | eur |
| `NEXT_PUBLIC_BASE_URL` | URL de ton site déployé (ex: https://moncv.app) |

⚠️ Commence avec les clés Stripe **en mode test** (`sk_test_...`) pour valider
tout le flux (paiement avec carte de test `4242 4242 4242 4242`) avant de
passer en mode live.

## Déploiement (le plus simple : Vercel)

1. Crée un repo GitHub avec ce projet.
2. Va sur vercel.com → "New Project" → importe le repo.
3. Ajoute toutes les variables d'environnement ci-dessus dans les réglages Vercel.
4. Déploie. Mets à jour `NEXT_PUBLIC_BASE_URL` avec l'URL finale, puis redeploy.
5. Passe les clés Stripe en mode live une fois que tu es prêt à vendre pour de vrai.

## Limites connues de ce MVP (à corriger si ça décolle)

- Le stockage des soumissions (`lib/store.js`) est **en mémoire** : ça marche
  très bien pour démarrer, mais si tu déploies sur plusieurs instances ou que
  le serveur redémarre, les données en attente de paiement peuvent être
  perdues. Pour passer à l'échelle : remplace par Vercel KV, Redis, ou
  Supabase (quelques lignes à changer dans `lib/store.js`).
- Pas de webhook Stripe : la vérification se fait à l'affichage de la page de
  succès (suffisant pour un MVP, mais un webhook est plus robuste en
  production pour gérer les cas où l'utilisateur ferme l'onglet juste après
  paiement).
- Pas de génération de PDF : le résultat est en Markdown, copiable. Si tu
  veux aller plus loin, on peut ajouter un export PDF/Word stylé en V2 — un
  vrai argument de vente pour faire monter le prix.

## Idées d'évolution rapide (pour augmenter le prix ou la conversion)
- Ajouter un export PDF avec un template propre → justifie 15-19€ au lieu de 9€
- Lettre de motivation générée en plus (pack à 14€)
- Aperçu gratuit partiel (3 premières lignes) avant paiement pour rassurer
- Page de témoignages / avant-après une fois les premiers clients obtenus
