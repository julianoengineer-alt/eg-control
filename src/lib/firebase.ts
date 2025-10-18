import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAA_7yl3lvAty58cTGsSzARUl2l8TB-rg0",
  authDomain: "eg-control.firebaseapp.com",
  projectId: "eg-control",
  storageBucket: "eg-control.firebasestorage.app",
  messagingSenderId: "167225225737",
  appId: "1:167225225737:web:9e003c7cc0231b85113ed8"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
export const db = getFirestore(app);

export default app;
