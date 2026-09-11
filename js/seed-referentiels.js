import { db, ref, get, set } from "./firebase-init.js";
const CIVILITES_INITIALES = ["Monsieur", "Madame", "Mademoiselle"];
const STATUTS_INITIAUX = ["élève", "étudiant", "professionnel"];

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
  "Master 1",
  "Master 2",
  "Doctorat",
];

const PROFESSIONS_INITIALES = [
  "Agriculteur",
  "Architecte",
  "Artisan",
  "Avocat",
  "Chauffeur",
  "Commerçant",
  "Comptable",
  "Employé",
  "Enseignant",
  "Entrepreneur",
  "Fonctionnaire",
  "Formateur",
  "Ingénieur BTP",
  "Ingénieur logiciel",
  "Informaticien",
  "Infirmier",
  "Journaliste",
  "Juriste",
  "Médecin",
  "Militaire",
  "Ouvrier",
  "Pharmacien",
  "Policier",
  "Professeur",
  "Sage-femme",
  "Technicien",
];

const SECTEURS_INITIAUX = [
  "Administration",
  "Agriculture",
  "Artisanat",
  "Bâtiment",
  "Commerce",
  "Communication",
  "Droit",
  "Éducation",
  "Finance",
  "Industrie",
  "Informatique",
  "Santé",
  "Services",
  "Tourisme",
  "Transport",
];

const PLAN_AMORCAGE = {
  civilites: CIVILITES_INITIALES,
  statuts: STATUTS_INITIAUX,
  niveaux_etude: NIVEAUX_ETUDE_INITIAUX,
  diplomes: DIPLOMES_INITIAUX,
  professions: PROFESSIONS_INITIALES,
  secteurs: SECTEURS_INITIAUX,
};

async function assurerAmorcageReferentiels() {
  for (const [cle, valeurs] of Object.entries(PLAN_AMORCAGE)) {
    if (valeurs.length === 0) continue; // rien à amorcer pour ce référentiel
    const referenceCollection = ref(db, `referentiels/${cle}`);
    const snapshot = await get(referenceCollection);
    if (snapshot.exists()) continue; // déjà amorcé ou déjà personnalisé
    for (const [index, libelle] of valeurs.entries()) {
      const referenceNouvelleValeur = ref(db, `referentiels/${cle}/seed_${String(index + 1).padStart(2, "0")}`);
      await set(referenceNouvelleValeur, { libelle });
    }
  }
}

export { assurerAmorcageReferentiels };
