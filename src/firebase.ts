/**
 * firebase.ts — PRESERVED but NOT USED in local demo.
 *
 * This file is kept for reference and Git history, but the app no longer
 * imports from it at runtime. The local demo uses the Node.js backend.
 *
 * If you want to restore Firebase integration:
 *   1. Set VITE_FIREBASE_* variables in .env
 *   2. Restore the original AuthContext and AppContext from Git history
 */

// NOTE: These imports are intentionally commented out to prevent
// the Firebase crash (auth/invalid-api-key) during local demo.

// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
// export const auth = getAuth(app);

export {};
