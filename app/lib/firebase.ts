// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseAPIKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
//const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
//const firebaseMessagingSenderId =
//  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
//const firebaseMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: firebaseAPIKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  //storageBucket: firebaseStorageBucket,
  //messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  //measurementId: firebaseMeasurementId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "(default)");

export { db };
