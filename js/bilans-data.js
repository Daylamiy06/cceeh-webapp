// ============================================================================
// bilans-data.js
// Construction des 3 bilans statistiques, chacun listant une ligne par
// parcours ou par activité (et non par habitant), avec les informations de l'habitant "jointes" pour l'affichage.
// ============================================================================

import { db, ref, get } from "./firebase-init.js";
import { calculerContact, libelleCiviliteCourt } from "./habitants-data.js";

async function lireCollection(nom) {
  const snapshot = await get(ref(db, nom));
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, valeur]) => ({ id, ...valeur }));
}

/**
 * Construit le bilan de parcours : une ligne par parcours scolaire,
 * enrichie des informations de l'habitant concerné (civilité, nom, adresse, contact, statut).
 */
async function construireBilanParcours() {
  const [habitants, parcours] = await Promise.all([
    lireCollection("habitants"),
    lireCollection("parcours"),
  ]);
  const habitantsParId = indexerParId(habitants);

  return parcours
    .map((p) => {
      const habitant = habitantsParId[p.id_habitant];
      if (!habitant) return null; // parcours orphelin (ne devrait pas arriver)
      return {
        id: p.id,
        civilite: libelleCiviliteCourt(habitant.civilite),
        nom_complet: habitant.nom_complet,
        adresse_actuelle: habitant.adresse_actuelle,
        contact: calculerContact(habitant),
        statut: habitant.statut_actuel,
        diplome: p.diplome || "",
        annee: p.annee_fin || "",
        etablissement: p.etablissement,
      };
    })
    .filter(Boolean);
}

/**
 * Construit le bilan de bacheliers : sous-ensemble du bilan de
 * parcours restreint aux parcours ayant donné lieu à un diplôme "BAC", avec la colonne Série au lieu de Diplôme/Statut.
 */
async function construireBilanBacheliers() {
  const [habitants, parcours] = await Promise.all([
    lireCollection("habitants"),
    lireCollection("parcours"),
  ]);
  const habitantsParId = indexerParId(habitants);

  return parcours
    .filter((p) => p.diplome === "BAC")
    .map((p) => {
      const habitant = habitantsParId[p.id_habitant];
      if (!habitant) return null;
      return {
        id: p.id,
        civilite: libelleCiviliteCourt(habitant.civilite),
        nom_complet: habitant.nom_complet,
        adresse_actuelle: habitant.adresse_actuelle,
        contact: calculerContact(habitant),
        annee: p.annee_fin || "",
        serie: p.serie || "",
        etablissement: p.etablissement,
      };
    })
    .filter(Boolean);
}

/**
 * Construit le bilan de professionnels : une ligne par activité professionnelle.
 * L'année retenue est celle de la date de fin, ou "En cours" si la case correspondante est cochée.
 */
async function construireBilanProfessionnels() {
  const [habitants, activites] = await Promise.all([
    lireCollection("habitants"),
    lireCollection("activites"),
  ]);
  const habitantsParId = indexerParId(habitants);

  return activites
    .map((a) => {
      const habitant = habitantsParId[a.id_habitant];
      if (!habitant) return null;
      return {
        id: a.id,
        civilite: libelleCiviliteCourt(habitant.civilite),
        nom_complet: habitant.nom_complet,
        adresse_actuelle: habitant.adresse_actuelle,
        contact: calculerContact(habitant),
        profession: a.profession,
        entreprise: a.entreprise,
        secteur: a.secteur,
        annee: a.en_cours ? "En cours" : new Date(a.date_fin).getFullYear(),
      };
    })
    .filter(Boolean);
}

function indexerParId(tableau) {
  const index = {};
  for (const element of tableau) index[element.id] = element;
  return index;
}

export { construireBilanParcours, construireBilanBacheliers, construireBilanProfessionnels };