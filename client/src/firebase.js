import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpRcvvxhE-jhw7uEKNGsTVDuVqfgoj8K8",
  authDomain: "letter-app-d8b52.firebaseapp.com",
  projectId: "letter-app-d8b52",
  storageBucket: "letter-app-d8b52.firebasestorage.app",
  messagingSenderId: "y513789343297",
  appId: "1:513789343297:web:cc1a9f5c437eff73a278c0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

export { auth, signInWithGoogle, logout };
