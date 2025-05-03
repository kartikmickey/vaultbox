// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8L2yEzdQADdlj7ZbiDT-JhiXuEaB7CCU",
  authDomain: "vaultbox-cc15a.firebaseapp.com",
  projectId: "vaultbox-cc15a",
  storageBucket: "vaultbox-cc15a.appspot.com", // ✅ FIXED typo here!
  messagingSenderId: "291532692792",
  appId: "1:291532692792:web:508d77de92d281fa8b35cd",
  measurementId: "G-KXXZYT7X0P"
};

const app = initializeApp(firebaseConfig);

// ✅ These are the ones you use in your app
export const auth = getAuth(app);
export const db = getFirestore(app);
