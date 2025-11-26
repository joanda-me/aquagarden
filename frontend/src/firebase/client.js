import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // PEGA AQUÍ TUS CLAVES PÚBLICAS DE FIREBASE (apiKey, authDomain, etc.)
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);