import { db, ref, push, set, update, remove, get } from "./firebase-init.js";
import { runTransaction } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const REFERENTIELS = [
  { cle: "civilites", libelle: "Civilités" },
  { cle: "statuts", libelle: "Statuts" },
  { cle: "niveaux_etude", libelle: "Niveaux d'étude" },
  { cle: "diplomes", libelle: "Diplômes" },
  { cle: "professions", libelle: "Professions" },
  { cle: "secteurs", libelle: "Secteurs d'activité" },
];

async function lireReferentiel(cle) {
  const snapshot = await get(ref(db, `referentiels/${cle}`));
  return objetVersTableauTrie(snapshot.val());
}

async function lireReferentiels() {
  const snapshot = await get(ref(db, "referentiels"));
  const donnees = snapshot.val() || {};
  const valeursParReferentiel = {};
  for (const { cle } of REFERENTIELS) {
    valeursParReferentiel[cle] = objetVersTableauTrie(donnees[cle]);
  }
  return valeursParReferentiel;
}

/** Ajoute une nouvelle valeur à un référentiel (§5.2). Retourne { id, libelle } créés. */
async function ajouterValeur(cle, libelle) {
  const libelleNettoye = validerLibelle(libelle);
  const collectionReference = ref(db, `referentiels/${cle}`);
  const nouvelleReference = push(collectionReference);
  const resultat = await runTransaction(collectionReference, (courant) => {
    const valeurs = courant || {};
    if (Object.values(valeurs).some((valeur) => libellesEquivalents(valeur?.libelle, libelleNettoye))) {
      return;
    }
    return { ...valeurs, [nouvelleReference.key]: { libelle: libelleNettoye } };
  });
  if (!resultat.committed) throw new Error("Cette valeur existe déjà dans ce référentiel.");
  return { id: nouvelleReference.key, libelle: libelleNettoye };
}

/** Modifie le libellé d'une valeur existante (§5.3). */
async function modifierValeur(cle, id, libelle) {
  const libelleNettoye = validerLibelle(libelle);
  const collectionReference = ref(db, `referentiels/${cle}`);
  const resultat = await runTransaction(collectionReference, (courant) => {
    const valeurs = courant || {};
    if (!Object.prototype.hasOwnProperty.call(valeurs, id)) return;
    if (Object.entries(valeurs).some(([autreId, valeur]) => autreId !== id && libellesEquivalents(valeur?.libelle, libelleNettoye))) {
      return;
    }
    return { ...valeurs, [id]: { ...(valeurs[id] || {}), libelle: libelleNettoye } };
  });
  if (!resultat.committed) {
    throw new Error("Cette valeur n'existe plus ou le libellé existe déjà dans ce référentiel.");
  }
}

function validerLibelle(libelle) {
  const libelleNettoye = String(libelle ?? "").trim();
  if (!libelleNettoye) throw new Error("Le libellé ne peut pas être vide.");
  return libelleNettoye;
}

function libellesEquivalents(a, b) {
  return String(a).trim().toLocaleLowerCase("fr") === String(b).trim().toLocaleLowerCase("fr");
}

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
    .map(([id, valeur]) => ({ id, libelle: valeur.libelle }));
}

export {
  REFERENTIELS,
  lireReferentiel,
  lireReferentiels,
  ajouterValeur,
  modifierValeur,
  supprimerValeur,
};
