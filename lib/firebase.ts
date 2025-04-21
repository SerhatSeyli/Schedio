import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQcf8YIP_LhBCdmqC7kC30ffy4lScWE1I",
  authDomain: "shifttrac-5d100.firebaseapp.com",
  projectId: "shifttrac-5d100",
  storageBucket: "shifttrac-5d100.firebasestorage.app",
  messagingSenderId: "727561855523",
  appId: "1:727561855523:web:ddb1ada7532fa3e6840796",
  measurementId: "G-SBBN282987"
};

// Initialize Firebase properly with the actual credentials
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider with specific client ID
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Set custom parameters for Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
  client_id: '727561855523-mnsebhnbt4irruau5pa6aa8d8de7opc1.apps.googleusercontent.com'
});

// Enable persistence to keep the user logged in
if (typeof window !== 'undefined') {
  try {
    setPersistence(auth, browserLocalPersistence);
    console.log('Firebase persistence set to local');
  } catch (error) {
    console.error('Error setting persistence:', error);
  }
}

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

// Only initialize messaging in browser environment and if supported
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      try {
        messaging = getMessaging(app);
      } catch (error) {
        console.warn('Firebase messaging initialization failed:', error);
      }
    }
  }).catch(error => {
    console.warn('Firebase messaging support check failed:', error);
  });
}

export { app, auth, db, googleProvider, messaging };
