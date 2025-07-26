// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "e-commerce-et7bs",
  appId: "1:90292158368:web:f0d15cc8a604ae8bdbaec5",
  storageBucket: "e-commerce-et7bs.firebasestorage.app",
  apiKey: "AIzaSyBF6KbYoKy3d7obk8Mmy81fdxTke_5HVtA",
  authDomain: "e-commerce-et7bs.firebaseapp.com",
  messagingSenderId: "90292158368",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
