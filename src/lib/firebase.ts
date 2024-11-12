import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyApn1-xG8fF2IQChetMpwDNRn29D4XIUxg",
  authDomain: "linksharing-6e738.firebaseapp.com",
  databaseURL: "https://linksharing-6e738-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "linksharing-6e738",
  storageBucket: "linksharing-6e738.firebasestorage.app",
  messagingSenderId: "188243556485",
  appId: "1:188243556485:web:9712bc7b11841c40f191ec",
  measurementId: "G-JSMECGBMP1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);