'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'

// This global variable is used to avoid initializing the app multiple times.
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;


// By exporting this function, we can centralize the initialization logic
// and ensure that it's only run once.
export function initializeFirebase() {
  if (!getApps().length) {
    // This will initialize the app either from the client-side config
    // or from the server-side environment variables.
    try {
      // This is the recommended way to initialize on App Hosting.
      // It will automatically use the server-side environment variables.
      firebaseApp = initializeApp();
    } catch (e) {
      // If the above fails, it means we are in a local development environment
      // and we should use the client-side config.
      firebaseApp = initializeApp(firebaseConfig);
    }
    
  } else {
    firebaseApp = getApp();
  }

  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);

  return { firebaseApp, auth, db };
}

// We can also export the initialized services directly.
// This is useful for server-side code that needs to access Firebase.
if (typeof window === 'undefined') {
    initializeFirebase();
}


export { firebaseApp, auth, db };
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
