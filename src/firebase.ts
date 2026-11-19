import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
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
 * Project: campus-501ec
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB26LgVIt-oy1SO1YhefBDon8O1rD9EOfc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'campus-501ec.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'campus-501ec',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'campus-501ec.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '166676710317',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:166676710317:web:9837b1f62be5074605d724',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-G7GWQ0M87S',
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
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    if (typeof window !== 'undefined') {
      isSupported()
        .then((supported) => {
          if (supported && app) {
            analytics = getAnalytics(app);
          }
        })
        .catch(() => {
          // Analytics is optional in restricted iframe contexts
        });
    }
  } catch (error) {
    console.warn('Firebase initialization skipped due to invalid config:', error);
    app = null;
    auth = null;
    googleProvider = null;
  }
}

export { analytics, app, auth, googleProvider };

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
