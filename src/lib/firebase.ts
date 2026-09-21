import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyD2jLCAa4Tcm5p19N6tEZ0Mefv9qKnTPaQ",
  authDomain: firebaseAppletConfig.authDomain || "gen-lang-client-0759742236.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "gen-lang-client-0759742236",
  storageBucket: firebaseAppletConfig.storageBucket || "gen-lang-client-0759742236.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "762919391051",
  appId: firebaseAppletConfig.appId || "1:762919391051:web:6b72f621e192c7b8a0e2ce"
};

const databaseId = firebaseAppletConfig.firestoreDatabaseId || "ai-studio-athenaelectionob-f9fd98b2-b5fa-4c58-95e8-8d4d87819146";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  }, databaseId);
} catch (e) {
  console.warn("Failed to initialize with custom database ID, using fallback:", e);
  firestoreDb = getFirestore(app, databaseId);
}

export const db = firestoreDb;
export const googleProvider = new GoogleAuthProvider();

