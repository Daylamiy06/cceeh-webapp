import { db, ref, push, set, update, remove, get, onValue } from "./firebase-init.js";

const REFERENTIELS = [
  { cle: "civilites", libelle: "Civilités" },
  { cle: "statuts", libelle: "Statuts" },
  { cle: "niveaux_etude", libelle: "Niveaux d'étude" },
  { cle: "diplomes", libelle: "Diplômes" },
  { cle: "professions", libelle: "Professions" },
  { cle: "secteurs", libelle: "Secteurs d'activité" },
];

/**
 * Lit une fois (sans écoute continue) toutes les valeurs d'un référentiel,
 * triées par libellé. Retourne un tableau de { id, libelle }.
 */
async function lireReferentiel(cle) {
  const snapshot = await get(ref(db, `referentiels/${cle}`));
  return objetVersTableauTrie(snapshot.val());
}

/**
 * Écoute en continu les valeurs d'un référentiel et appelle le callback à
 * chaque changement. Retourne la fonction de désabonnement (à appeler pour
 * éviter les fuites d'écoute lors du changement de page fille).
 */
function ecouterReferentiel(cle, callback) {
  const reference = ref(db, `referentiels/${cle}`);
  const arreterEcoute = onValue(reference, (snapshot) => {
    callback(objetVersTableauTrie(snapshot.val()));
  });
  return arreterEcoute;
}

/** Ajoute une nouvelle valeur à un référentiel (§5.2). */
function ajouterValeur(cle, libelle) {
  const nouvelleReference = push(ref(db, `referentiels/${cle}`));
  return set(nouvelleReference, { libelle: libelle.trim() });
}

/** Modifie le libellé d'une valeur existante (§5.3). */
function modifierValeur(cle, id, libelle) {
  return update(ref(db, `referentiels/${cle}/${id}`), { libelle: libelle.trim() });
}

/**
 * Supprime une valeur de référentiel, uniquement si elle n'est utilisée par
 * aucune fiche existante. Lève une erreur explicite sinon, à charge
 * de l'appelant de l'afficher via un message intégré à l'interface.
 *
 * @param {string} cle - identifiant technique du référentiel
 * @param {string} id - identifiant de la valeur à supprimer
 * @param {() => Promise<boolean>} estUtilisee - fonction vérifiant l'usage
 *        de cette valeur, propre à chaque référentiel (cf. usageReferentiels.js
 *        appelant dans referentiels.html).
 */
async function supprimerValeur(cle, id, estUtilisee) {
  if (await estUtilisee()) {
    throw new Error(
      "Cette valeur est utilisée par au moins une fiche existante et ne peut pas être supprimée."
    );
  }
  return remove(ref(db, `referentiels/${cle}/${id}`));
}

/** Convertit l'objet Firebase { id: { libelle } } en tableau trié par libellé. */
function objetVersTableauTrie(objet) {
  if (!objet) return [];
  return Object.entries(objet)
    .map(([id, valeur]) => ({ id, libelle: valeur.libelle }))
    .sort((a, b) => a.libelle.localeCompare(b.libelle, "fr"));
}

export {
  REFERENTIELS,
  lireReferentiel,
  ecouterReferentiel,
  ajouterValeur,
  modifierValeur,
  supprimerValeur,
};