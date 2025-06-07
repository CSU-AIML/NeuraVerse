// lib/firebase.ts - Updated with proper CORS handling
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseAuthStateChanged,
  NextOrObserver,
  User
} from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
  console.error('Missing Firebase configuration. Check your .env file.');
  throw new Error('Firebase configuration is incomplete');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google provider with proper settings
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // hd: '', // Allow any domain (omit or set to a string if needed)
});

// Add additional scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Detect if we're in a secure context and can use popups
const canUsePopup = () => {
  // Check if we're in HTTPS or localhost
  const isSecure = window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1';
  
  // Check if popup is supported (not in iframe, etc.)
  const supportsPopup = window.top === window.self;
  
  return isSecure && supportsPopup;
};

// Sign in with Google and sync with Supabase (for GoogleAuthButton component)
export const signInWithGoogleAndSync = async () => {
  try {
    if (canUsePopup()) {
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, error: null };
    } else {
      await signInWithRedirect(auth, googleProvider);
      return { user: null, error: null };
    }
  } catch (error: any) {
    // Handle popup blocked -> redirect fallback
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { user: null, error: null };
      } catch (redirectError) {
        return { user: null, error: redirectError };
      }
    }
    return { user: null, error };
  }
};

// Sign in with Google popup with fallback
export const signInWithGoogle = async () => {
  try {
    if (canUsePopup()) {
      console.log('Using popup sign in');
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, error: null };
    } else {
      console.log('Popup not supported, falling back to redirect');
      // Fallback to redirect if popup is not supported
      return signInWithGoogleRedirect();
    }
  } catch (error: any) {
    console.error('Error signing in with Google popup:', error);
    
    // If popup was blocked, try redirect
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request') {
      console.log('Popup blocked, trying redirect...');
      return signInWithGoogleRedirect();
    }
    
    return { user: null, error };
  }
};

// Sign in with Google redirect
export const signInWithGoogleRedirect = async () => {
  try {
    console.log('Initiating Google redirect sign in');
    await signInWithRedirect(auth, googleProvider);
    return { error: null };
  } catch (error) {
    console.error('Error signing in with Google redirect:', error);
    return { error };
  }
};

// Get result from redirect
export const getGoogleRedirectResult = async () => {
  try {
    console.log('Checking for redirect result...');
    const result = await getRedirectResult(auth);
    
    if (result) {
      console.log('Found redirect result:', result.user.uid);
      return { user: result.user, error: null };
    }
    
    console.log('No redirect result found');
    return { user: null, error: null };
  } catch (error) {
    console.error('Error getting redirect result:', error);
    return { user: null, error };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Sign out current user
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

// Listen for auth state changes
export const onAuthStateChanged = (callback: NextOrObserver<User>) => {
  return firebaseAuthStateChanged(auth, callback);
};

// Get Firebase ID token for Supabase integration
export const getFirebaseIdToken = async () => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('No authenticated user');
  }
  return await user.getIdToken();
};

// Get user claims (for role checking)
export const getUserClaims = async () => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('No authenticated user');
  }
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims;
};

export { auth };