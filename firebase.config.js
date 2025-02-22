
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5Sp7o-L04BNqkz7LvQfdOL02X9wUwle0",
    authDomain: "lpg-tracker-system.firebaseapp.com",
    projectId: "lpg-tracker-system",
    storageBucket: "lpg-tracker-system.firebasestorage.app",
    messagingSenderId: "583977463241",
    appId: "1:583977463241:web:fab779e68b1715b7428c18"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export db to use it in other files
export { db };
