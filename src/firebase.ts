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

function isValidConfigValue(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.startsWith('YOUR_');
}

function resolveConfig(envValue: string | undefined, fallback: string): string {
  return isValidConfigValue(envValue) ? envValue!.trim() : fallback;
}

/**
 * CampusLend Firebase Configuration
 * Project: teak-composition-97cdj
 */
export const firebaseConfig = {
  apiKey: resolveConfig(
    import.meta.env.VITE_FIREBASE_API_KEY,
    'AIzaSyAqkoTGbW4hyluO0OjPSgsonsL3IVHusZM'
  ),
  authDomain: resolveConfig(
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    'teak-composition-97cdj.firebaseapp.com'
  ),
  projectId: resolveConfig(import.meta.env.VITE_FIREBASE_PROJECT_ID, 'teak-composition-97cdj'),
  storageBucket: resolveConfig(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    'teak-composition-97cdj.firebasestorage.app'
  ),
  messagingSenderId: resolveConfig(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    '786799230558'
  ),
  appId: resolveConfig(
    import.meta.env.VITE_FIREBASE_APP_ID,
    '1:786799230558:web:1b264bb0cdd8d0b858fecf'
  ),
};

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
