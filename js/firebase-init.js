import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

import { firebaseConfig } from "../firebase-config.js";

// --- Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- Authentification 
function connexion(email, motDePasse) {
  return signInWithEmailAndPassword(auth, email, motDePasse);
}

// Déconnecte l'utilisateur courant.
function deconnexion() {
  return signOut(auth);
}

// Vérifie le rôle de l'utilisateur
async function obtenirRole(user) {
  const snapshot = await get(ref(db, `users/${user.uid}/role`));
  return snapshot.exists() ? snapshot.val() : null;
}

async function estAdmin(user) {
  return (await obtenirRole(user)) === "admin";
}

// Garde d'authentification à appeler sur toute page protégée.
function protegerPage(onConnecte) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = calculerCheminLogin();
      return;
    }

    try {
      if (!(await estAdmin(user))) {
        await deconnexion();
        window.location.href = calculerCheminLogin();
        return;
      }

      onConnecte(user);
    } catch (erreur) {
      console.error("Erreur lors de la vérification des autorisations :", erreur);
      await deconnexion();
      window.location.href = calculerCheminLogin();
    }
  });
}

// Calcule le chemin relatif vers login.html selon la profondeur de la page
function calculerCheminLogin() {
  return window.location.pathname.includes("/pages/") ? "../login.html" : "login.html";
}

// Export public.
export {
  app,
  auth,
  db,
  connexion,
  deconnexion,
  obtenirRole,
  estAdmin,
  protegerPage,
  ref,
  push,
  set,
  update,
  remove,
  get,
  onValue,
};
