import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Use the standard web auth
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-67c0b.firebaseapp.com",
  projectId: "reactchat-67c0b",
  storageBucket: "reactchat-67c0b.appspot.com",
  messagingSenderId: "896399620500",
  appId: "1:896399620500:web:5cd90ccccc8b8b94127781"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services with the app instance
export const auth = getAuth(app); // Pass app to getAuth
export const db = getFirestore(app); // Pass app to getFirestore
export const storage = getStorage(app); // Pass app to getStorage

export default app;
