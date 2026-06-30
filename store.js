// Stockage temporaire en mémoire (suffisant pour un MVP / faible volume).
// ⚠️ En production avec plusieurs instances serveur (scaling horizontal),
// remplace ceci par une vraie base (Redis, Vercel KV, Supabase, etc.)
// Les entrées expirent après 1h pour ne pas accumuler de données indéfiniment.

const store = global.__cvStore || (global.__cvStore = new Map());

const ONE_HOUR = 60 * 60 * 1000;

export function saveSubmission(id, data) {
  store.set(id, { data, createdAt: Date.now() });
}

export function getSubmission(id) {
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > ONE_HOUR) {
    store.delete(id);
    return null;
  }
  return entry.data;
}

export function deleteSubmission(id) {
  store.delete(id);
}
