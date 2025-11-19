// config/firebaseAdmin.js
import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyPath = path.join(__dirname, "serviceAccountKey.json");

export let firestore = null;
export let authAdmin = null;

export async function initFirebase() {
  try {
    if (!fs.existsSync(keyPath)) {
      console.warn("⚠️ Firebase serviceAccountKey.json not found in config/. Skipping Firebase init.");
      return;
    }
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firestore = admin.firestore();
    authAdmin = admin.auth();
    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("❌ Firebase init error:", err.message);
    // Do not throw: backend can still run without firebase (provisional)
  }
}

export default admin;
