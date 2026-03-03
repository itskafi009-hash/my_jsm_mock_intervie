// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDhnhtd6l9-bsRtwivya-Mr1G_VSrhv4HY",
    authDomain: "veeru-331ad.firebaseapp.com",
    projectId: "veeru-331ad",
    storageBucket: "veeru-331ad.firebasestorage.app",
    messagingSenderId: "345904743232",
    appId: "1:345904743232:web:01147c9417014e360cf0a5",
    measurementId: "G-BJ6588Q4R0"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig): getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);