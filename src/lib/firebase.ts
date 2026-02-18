import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQHu9pqj_meXKNVWE-WuMOPSlcWHEZQA0",
  authDomain: "attandace-dashboard.firebaseapp.com",
  projectId: "attandace-dashboard",
  storageBucket: "attandace-dashboard.firebasestorage.app",
  messagingSenderId: "241922077051",
  appId: "1:241922077051:web:cc62d534e433b9d7370dde"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
