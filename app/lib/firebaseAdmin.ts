import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

console.log("projectId: ", projectId);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      privateKey: privateKey?.replace(/\\n/g, "\n"),
      clientEmail: clientEmail,
    }),
  });
}

const db = admin.firestore();
export { db };
