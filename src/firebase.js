// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2zhuW5Lqt2GGBsyFFQ2KJs47-ToTam9A",
  authDomain: "researchextsys.firebaseapp.com",
  projectId: "researchextsys",
  storageBucket: "researchextsys.firebasestorage.app",
  messagingSenderId: "169780280320",
  appId: "1:169780280320:web:2ed7c6913cecac30bf6ce5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider, collection, addDoc, query, where, getDocs, signInWithPopup };
