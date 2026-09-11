import { db, ref, get } from "./firebase-init.js?v=20260826-2";
import { calculerContact, libelleCiviliteCourt, libelleDiplomeAvecSerie, activiteEstEnCours } from "./habitants-data.js?v=20260826-2";

async function lireCollection(nom) {
  const snapshot = await get(ref(db, nom));
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, valeur]) => ({ id, ...(valeur || {}) }));
}

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
        id_habitant: p.id_habitant,
        civilite: libelleCiviliteCourt(habitant.civilite),
        nom_complet: habitant.nom_complet,
        adresse_actuelle: habitant.adresse_actuelle,
        contact: calculerContact(habitant),
        statut: habitant.statut_actuel,
        diplome: p.diplome || "",
        serie: p.serie || "",
        annee: p.annee_fin ? String(p.annee_fin) : "",
        etablissement: p.etablissement,
      };
    })
    .filter(Boolean);
}

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
        annee: p.annee_fin ? String(p.annee_fin) : "",
        serie: p.serie || "",
        etablissement: p.etablissement,
      };
    })
    .filter(Boolean);
}

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
        id_habitant: a.id_habitant,
        civilite: libelleCiviliteCourt(habitant.civilite),
        nom_complet: habitant.nom_complet,
        adresse_actuelle: habitant.adresse_actuelle,
        contact: calculerContact(habitant),
        profession: a.profession,
        entreprise: a.entreprise,
        secteur: a.secteur,
        date_debut: a.date_debut || "",
        en_cours: activiteEstEnCours(a),
        annee: activiteEstEnCours(a)
          ? "En cours"
          : Number.isInteger(new Date(a.date_fin).getFullYear())
            ? new Date(a.date_fin).getFullYear()
            : "",
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
