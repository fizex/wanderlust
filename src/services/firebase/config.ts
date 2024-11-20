import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is valid
async function initializeFirebase() {
  try {
    // Validate required config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Missing required Firebase configuration');
    }

    // Initialize Firebase app
    const app = initializeApp(firebaseConfig);

    // Initialize services
    const auth = getAuth(app);
    auth.useDeviceLanguage();

    const db = getFirestore(app);
    
    // Enable persistence before any other Firestore operations
    try {
      await enableIndexedDbPersistence(db);
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support offline persistence.');
      }
    }
    
    let storage = null;
    if (firebaseConfig.storageBucket) {
      storage = getStorage(app);
    }

    return { app, auth, db, storage };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return { app: null, auth: null, db: null, storage: null };
  }
}

// Initialize all Firebase services
const firebaseInstance = await initializeFirebase();

export const { app, auth, db, storage } = firebaseInstance;