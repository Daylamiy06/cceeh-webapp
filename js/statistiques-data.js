// statistiques-data.js
import { db, ref, get } from "./firebase-init.js";

/* Lit une collection entière et la retourne sous forme de tableau [{id, ...}]. */
async function lireCollection(nom) {
  const snapshot = await get(ref(db, nom));
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, valeur]) => ({ id, ...valeur }));
}

/* Calcule les indicateurs chiffrés du tableau de bord */
async function calculerIndicateurs() {
  const [habitants, parcours] = await Promise.all([
    lireCollection("habitants"),
    lireCollection("parcours"),
  ]);

  const totalInscrits = habitants.length;
  const totalEleves = habitants.filter((h) => h.statut_actuel === "élève").length;
  const totalProfessionnels = habitants.filter(
    (h) => h.statut_actuel === "professionnel"
  ).length;

  const etudiants = habitants.filter((h) => h.statut_actuel === "étudiant");
  let totalLicence = 0;
  let totalMaster = 0;
  let totalDoctorat = 0;

  for (const etudiant of etudiants) {
    const famille = familleDiplomeLePlusRecent(parcours, etudiant.id);
    if (famille === "Licence") totalLicence++;
    else if (famille === "Master") totalMaster++;
    else if (famille === "Doctorat") totalDoctorat++;
  }

  return {
    totalInscrits,
    totalEleves,
    totalEtudiants: etudiants.length,
    totalLicence,
    totalMaster,
    totalDoctorat,
    totalProfessionnels,
  };
}

/* Détermine la famille de diplôme (Licence/Master/Doctorat) du parcours le plus récent d'un habitant. */
function familleDiplomeLePlusRecent(parcours, idHabitant) {
  const parcoursDeLHabitant = parcours
    .filter((p) => p.id_habitant === idHabitant && p.diplome)
    .sort((a, b) => Number(b.annee_fin || 0) - Number(a.annee_fin || 0));

  if (parcoursDeLHabitant.length === 0) return null;
  return familleDiplome(parcoursDeLHabitant[0].diplome);
}

function familleDiplome(libelleDiplome) {
  if (libelleDiplome.startsWith("Licence")) return "Licence";
  if (libelleDiplome.startsWith("Master") || libelleDiplome.startsWith("Mastère")) return "Master";
  if (libelleDiplome === "Doctorat") return "Doctorat";
  return null;
}

/* Données du graphique circulaire de répartition des diplômes. */
async function calculerRepartitionDiplomes(annee) {
  const parcours = await lireCollection("parcours");
  const parcoursDeLAnnee = parcours.filter(
    (p) => p.diplome && p.annee_fin === String(annee)
  );

  const compteurs = {};
  for (const p of parcoursDeLAnnee) {
    compteurs[p.diplome] = (compteurs[p.diplome] || 0) + 1;
  }

  return Object.entries(compteurs).map(([libelle, valeur]) => ({ libelle, valeur }));
}

/* Données du graphique en courbes d'évolution des activités professionnelles. */
async function calculerEvolutionActivites(anneeDepuis, anneeJusqua) {
  const activites = await lireCollection("activites");
  const resultat = [];

  for (let annee = anneeDepuis; annee <= anneeJusqua; annee++) {
    const nombre = activites.filter((a) => activiteActivePourAnnee(a, annee)).length;
    resultat.push({ annee, nombre });
  }

  return resultat;
}

function activiteActivePourAnnee(activite, annee) {
  const anneeDebut = new Date(activite.date_debut).getFullYear();
  if (anneeDebut > annee) return false;

  if (activite.en_cours) return true;
  const anneeFin = new Date(activite.date_fin).getFullYear();
  return anneeFin >= annee;
}
export { calculerIndicateurs, calculerRepartitionDiplomes, calculerEvolutionActivites };