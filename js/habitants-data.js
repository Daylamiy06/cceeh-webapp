import { db, ref, push, set, update, remove, get } from "./firebase-init.js";

/** Lit tous les habitants, triés par nom complet croissant. */
async function listerHabitants() {
  const snapshot = await get(ref(db, "habitants"));
  return objetVersTableau(snapshot.val()).sort((a, b) =>
    a.nom_complet.localeCompare(b.nom_complet, "fr")
  );
}

/** Lit la fiche d'un habitant par son identifiant. */
async function lireHabitant(id) {
  const snapshot = await get(ref(db, `habitants/${id}`));
  if (!snapshot.exists()) return null;
  return { id, ...snapshot.val() };
}

/** Lit tous les parcours scolaires d'un habitant donné. */
async function listerParcoursDe(idHabitant) {
  const snapshot = await get(ref(db, "parcours"));
  return objetVersTableau(snapshot.val()).filter(
    (p) => p.id_habitant === idHabitant
  );
}

/** Lit toutes les activités professionnelles d'un habitant donné. */
async function listerActivitesDe(idHabitant) {
  const snapshot = await get(ref(db, "activites"));
  return objetVersTableau(snapshot.val()).filter(
    (a) => a.id_habitant === idHabitant
  );
}

/** Crée un nouvel habitant. */
async function creerHabitant(donnees) {
  const nouvelleReference = push(ref(db, "habitants"));
  await set(nouvelleReference, {
    ...donnees,
    date_enregistrement: new Date().toISOString().slice(0, 10),
  });
  return nouvelleReference.key;
}

/** Modifie une fiche habitant existante. */
function modifierHabitant(id, donnees) {
  return update(ref(db, `habitants/${id}`), donnees);
}

/** Supprime un habitant ainsi que l'ensemble de ses parcours scolaires et activités professionnelles rattachés (suppression en cascade). */
async function supprimerHabitant(id) {
  const [parcoursDeLHabitant, activitesDeLHabitant] = await Promise.all([
    listerParcoursDe(id),
    listerActivitesDe(id),
  ]);

  await Promise.all([
    ...parcoursDeLHabitant.map((p) => remove(ref(db, `parcours/${p.id}`))),
    ...activitesDeLHabitant.map((a) => remove(ref(db, `activites/${a.id}`))),
    remove(ref(db, `habitants/${id}`)),
  ]);
}

// --- Écriture : Parcours scolaire 

function creerParcours(idHabitant, donnees) {
  const nouvelleReference = push(ref(db, "parcours"));
  return set(nouvelleReference, { id_habitant: idHabitant, ...donnees });
}

function modifierParcours(id, donnees) {
  return update(ref(db, `parcours/${id}`), donnees);
}

function supprimerParcours(id) {
  return remove(ref(db, `parcours/${id}`));
}

// --- Écriture : Activité professionnelle

function creerActivite(idHabitant, donnees) {
  const nouvelleReference = push(ref(db, "activites"));
  return set(nouvelleReference, { id_habitant: idHabitant, ...donnees });
}

function modifierActivite(id, donnees) {
  return update(ref(db, `activites/${id}`), donnees);
}

function supprimerActivite(id) {
  return remove(ref(db, `activites/${id}`));
}

// --- Champs calculés à l'affichage
function calculerContact(habitant) {
  const telephone = (habitant.telephone || "").trim();
  const email = (habitant.email || "").trim();

  if (!telephone && !email) return "Aucun contact";
  if (telephone && email) return `${telephone} / ${email}`;
  return telephone || email;
}

/** Traduit la civilité stockée en son libellé court d'affichage. */
function libelleCiviliteCourt(civilite) {
  const correspondances = {
    Monsieur: "Mr",
    Madame: "Mme",
    Mademoiselle: "Mlle",
  };
  return correspondances[civilite] || civilite;
}

/** Calcule la durée d'expérience d'une activité professionnelle affichée */
function calculerExperience(activite) {
  const anneeDebut = new Date(activite.date_debut).getFullYear();
  const anneeReference = activite.en_cours ? new Date().getFullYear() : new Date(activite.date_fin).getFullYear();
  const duree = Math.max(0, anneeReference - anneeDebut);
  return `${duree} ${duree === 1 ? "an" : "ans"}`;
}

// --- Utilitaire
/** Convertit un objet Firebase { id: {...} } en tableau [{ id, ... }]. */
function objetVersTableau(objet) {
  if (!objet) return [];
  return Object.entries(objet).map(([id, valeur]) => ({ id, ...valeur }));
}

export {
  listerHabitants,
  lireHabitant,
  listerParcoursDe,
  listerActivitesDe,
  creerHabitant,
  modifierHabitant,
  supprimerHabitant,
  creerParcours,
  modifierParcours,
  supprimerParcours,
  creerActivite,
  modifierActivite,
  supprimerActivite,
  calculerContact,
  libelleCiviliteCourt,
  calculerExperience,
};