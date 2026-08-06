// ============================================================================
// seed-referentiels.js
// Amorçage automatique des 6 référentiels au premier lancement de
// l'application. Sans cet amorçage, l'application serait inutilisable tant que
// l'administrateur n'a pas saisi manuellement chaque valeur.
//
// L'amorçage n'écrit que si le référentiel est totalement vide : il ne
// écrase jamais des valeurs déjà personnalisées par l'administrateur
// ============================================================================

import { db, ref, get, set } from "./firebase-init.js";
const CIVILITES_INITIALES = ["Monsieur", "Madame", "Mademoiselle"];
const STATUTS_INITIAUX = ["élève", "étudiant", "professionnel", "autre"];
const NIVEAUX_ETUDE_INITIAUX = [
  "6e",
  "5e",
  "4e",
  "3e",
  "Seconde",
  "Première",
  "Terminale",
  "Formation pro",
  "Licence 1",
  "Licence 2",
  "Licence 3",
  "Master 1",
  "Master 2",
  "Doctorat",
];

const DIPLOMES_INITIAUX = [
  "CEPE",
  "BEPC",
  "BAC",
  "CAP",
  "BEP",
  "BT",
  "Certificat technique",
  "Diplôme pro",
  "Licence 1",
  "Licence 2",
  "Licence 3",
  "Mastère 1",
  "Mastère 2",
  "Master 1",
  "Master 2",
  "Doctorat",
];

const PROFESSIONS_INITIALES = [];
const SECTEURS_INITIAUX = [];
const PLAN_AMORCAGE = {
  civilites: CIVILITES_INITIALES,
  statuts: STATUTS_INITIAUX,
  niveaux_etude: NIVEAUX_ETUDE_INITIAUX,
  diplomes: DIPLOMES_INITIAUX,
  professions: PROFESSIONS_INITIALES,
  secteurs: SECTEURS_INITIAUX,
};

/**
 * Vérifie chaque référentiel et l'amorce s'il est vide.
 * Idempotent : peut être appelé à chaque démarrage de l'application sans
 * risque de doublons ni d'écrasement de données existantes.
 */
async function assurerAmorcageReferentiels() {
  for (const [cle, valeurs] of Object.entries(PLAN_AMORCAGE)) {
    if (valeurs.length === 0) continue; // rien à amorcer pour ce référentiel
    const referenceCollection = ref(db, `referentiels/${cle}`);
    const snapshot = await get(referenceCollection);
    if (snapshot.exists()) continue; // déjà amorcé ou déjà personnalisé
    for (const libelle of valeurs) {
      const referenceNouvelleValeur = ref(
        db,
        `referentiels/${cle}/${cleFirebaseAleatoire()}`
      );
      await set(referenceNouvelleValeur, { libelle });
    }
  }
}

/**
 * Génère un identifiant simple pour l'amorçage initial (évite une
 * dépendance à push() ici, l'amorçage étant séquentiel et non concurrent).
 */
function cleFirebaseAleatoire() {
  return `seed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export { assurerAmorcageReferentiels };