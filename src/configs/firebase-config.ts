// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getStorage } from "@firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkJEUT5Z_POQdNBCzS-54vl5DkcU5BYYA",
  authDomain: "lt-atgame.firebaseapp.com",
  projectId: "lt-atgame",
  storageBucket: "lt-atgame.appspot.com",
  messagingSenderId: "979118334996",
  appId: "1:979118334996:web:f289628ebadc9f94603301"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
