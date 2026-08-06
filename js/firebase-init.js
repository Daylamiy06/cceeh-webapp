// ============================================================================
// firebase-init.js
// Point d'entrée unique pour l'initialisation de Firebase (Auth + Realtime DB).
// Toutes les pages importent ce module plutôt que de réinitialiser Firebase
// individuellement, afin de garantir une seule instance de l'application.
// ============================================================================

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

/** Déconnecte l'utilisateur courant. */
function deconnexion() {
  return signOut(auth);
}

/**
 * Garde d'authentification à appeler sur toute page protégée.
 * @param {(user: import("firebase/auth").User) => void} onConnecte
 * Callback appelé une fois la présence de l'utilisateur confirmée.
 */
function protegerPage(onConnecte) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = calculerCheminLogin();
      return;
    }
    onConnecte(user);
  });
}

/**
 * Calcule le chemin relatif vers login.html selon la profondeur de la page
 * courante (racine ou pages/). Évite de coder en dur un chemin absolu.
 */
function calculerCheminLogin() {
  return window.location.pathname.includes("/pages/") ? "../login.html" : "login.html";
}

// --- Export public 
// Chaque page importe uniquement ce dont elle a besoin depuis ce module.
export {
  app,
  auth,
  db,
  connexion,
  deconnexion,
  protegerPage,
  ref,
  push,
  set,
  update,
  remove,
  get,
  onValue,
};
