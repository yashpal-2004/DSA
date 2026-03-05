import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyDLLcIn6WYjHBNA48g8e3eFjWJSrI73t9M",
    authDomain: "dsa-leetcode-sheet.firebaseapp.com",
    projectId: "dsa-leetcode-sheet",
    storageBucket: "dsa-leetcode-sheet.firebasestorage.app",
    messagingSenderId: "10106262064",
    appId: "1:10106262064:web:ad61d494f94ba0d6c453f5",
    measurementId: "G-SY4E7EFYSP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
