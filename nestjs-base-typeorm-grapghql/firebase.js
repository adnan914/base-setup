// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzWoNtXyO5vPezBMybADMlmMmbhRxVGFw",
  authDomain: "crud-operation-d9114.firebaseapp.com",
  projectId: "crud-operation-d9114",
  storageBucket: "crud-operation-d9114.appspot.com",
  messagingSenderId: "457488935392",
  appId: "1:457488935392:web:4ab91dd3f2e1d79f05e385",
  measurementId: "G-LXQPJ7P7TJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);