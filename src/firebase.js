// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwqRbGwO3eSxWaws8-L5oDYVzX5is6shc",
  authDomain: "vpecsys.firebaseapp.com",
  projectId: "vpecsys",
  storageBucket: "vpecsys.firebasestorage.app",
  messagingSenderId: "997263000162",
  appId: "1:997263000162:web:99fd12596fca2bd9d8c73b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider, collection, addDoc, query, where, getDocs, signInWithPopup };
