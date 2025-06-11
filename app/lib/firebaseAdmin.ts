import admin from "firebase-admin";
import account from "../../firebase-key.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(account as admin.ServiceAccount),
  });
}

const db = admin.firestore();
export { db };
