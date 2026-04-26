import 'react-native-get-random-values';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

global.crypto = Crypto;

const firebaseConfig = {
  apiKey: "AIzaSyDwfbUSqSOY8DTmpyj4V299f7nWyKfWJiY",
  authDomain: "madassignment-4b130.firebaseapp.com",
  projectId: "madassignment-4b130",
  storageBucket: "madassignment-4b130.firebasestorage.app",
  messagingSenderId: "153881018306",
  appId: "1:153881018306:web:3ab3cc2b613ec0dad4e05b",
  measurementId: "G-0F9XQMJZZC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app)
export { auth, db };