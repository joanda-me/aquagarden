import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyAjNDG7_6JtbdeYhHBWP2Xc5Hkj8I15gIs",

  authDomain: "aqua-d8975.firebaseapp.com",

  projectId: "aqua-d8975",

  storageBucket: "aqua-d8975.firebasestorage.app",

  messagingSenderId: "814011307612",

  appId: "1:814011307612:web:ee864f608690dedf1df899",

  measurementId: "G-YFN0HEF07M"

};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);