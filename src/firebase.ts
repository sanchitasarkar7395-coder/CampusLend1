import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

/**
 * CampusLend Firebase Configuration
 * ------------------------------------------------------------
 * Paste your Firebase Web App credentials below (from Firebase
 * Console -> Project Settings -> Your apps -> SDK setup) or set
 * the matching VITE_FIREBASE_* environment variables.
 *
 * Make sure "Google" is enabled under Firebase Console ->
 * Authentication -> Sign-in method, and your preview domain is
 * listed under Authentication -> Settings -> Authorized domains.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_FIREBASE_APP_ID',
};

function isValidConfigValue(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.startsWith('YOUR_');
}

export const isFirebaseConfigured: boolean =
  isValidConfigValue(firebaseConfig.apiKey) &&
  isValidConfigValue(firebaseConfig.authDomain) &&
  isValidConfigValue(firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn('Firebase initialization skipped due to invalid config:', error);
    app = null;
    auth = null;
    googleProvider = null;
  }
}

export { app, auth, googleProvider };

export interface GoogleAuthResult {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export async function signInWithGooglePopup(): Promise<GoogleAuthResult> {
  if (!auth || !googleProvider) {
    throw new Error(
      'Firebase credentials are not configured yet. Paste your apiKey, authDomain, and projectId in src/firebase.ts, or use Demo Google Sign-In below.'
    );
  }

  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;

  return {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'CampusLend Student',
    email: user.email || '',
    photoURL: user.photoURL || '',
  };
}

export async function signOutFromFirebase(): Promise<void> {
  if (auth && auth.currentUser) {
    await signOut(auth);
  }
}

export function subscribeToFirebaseAuth(
  callback: (user: User | null) => void
): () => void {
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
