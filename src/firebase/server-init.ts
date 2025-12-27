import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

// This global variable is used to avoid initializing the app multiple times.
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeServerFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp();
  } else {
    firebaseApp = getApp();
  }

  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  
  // This is a workaround to fix a bug in the Firestore SDK
  // where the settings are not applied correctly on hot reloads.
  try {
     db.settings({
        ignoreUndefinedProperties: true,
     });
  } catch(e) {
      // console.log(e)
  }


  return { firebaseApp, auth, db };
}
