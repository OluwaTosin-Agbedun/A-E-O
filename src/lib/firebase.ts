import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2jLCAa4Tcm5p19N6tEZ0Mefv9qKnTPaQ",
  authDomain: "gen-lang-client-0759742236.firebaseapp.com",
  projectId: "gen-lang-client-0759742236",
  storageBucket: "gen-lang-client-0759742236.firebasestorage.app",
  messagingSenderId: "762919391051",
  appId: "1:762919391051:web:6b72f621e192c7b8a0e2ce"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-athenaelectionob-f9fd98b2-b5fa-4c58-95e8-8d4d87819146");
export const googleProvider = new GoogleAuthProvider();
