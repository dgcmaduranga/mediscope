import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDyIffEZJvHFIU6rmHqNYchUfFnHVuy3vI",
  authDomain: "medisense-7e3e6.firebaseapp.com",
  projectId: "medisense-7e3e6",
  storageBucket: "medisense-7e3e6.firebasestorage.app",
  messagingSenderId: "973151706395",
  appId: "1:973151706395:web:00c7f982ba0446e49887be"
};

export const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ export storage (this was missing)
export const storage = getStorage(app);