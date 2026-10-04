// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDPMIBxaxUXO1okBwpFFW-3xAip4wj6Mg",
  authDomain: "geopitch-2c40d.firebaseapp.com",
  // 👇 THIS IS THE LINE THAT CHANGED 👇
  databaseURL: "https://geopitch-2c40d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "geopitch-2c40d",
  storageBucket: "geopitch-2c40d.firebasestorage.app",
  messagingSenderId: "958956450160",
  appId: "1:958956450160:web:bc6a73d5fe12b8191e9fb5",
  measurementId: "G-SRBN67NXRS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database and export it
export const db = getDatabase(app);