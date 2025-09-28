// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAEcoi0Gc2IFFOlLOVuvNb9vWMJe_IUcvA",
  authDomain: "prepwise-a4e84.firebaseapp.com",
  projectId: "prepwise-a4e84",
  storageBucket: "prepwise-a4e84.firebasestorage.app",
  messagingSenderId: "222388035087",
  appId: "1:222388035087:web:cdd3bfac81701d015a4d7a",
  measurementId: "G-S5NZKN9280"
};


// Initialize Firebase
const app = !getApps.length?initializeApp(firebaseConfig):getApp();
export const auth = getAuth(app);
export const db=getFirestore(app)