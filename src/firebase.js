import { initializeApp } from "firebase/app";
import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

// TODO: Replace with your Firebase project configuration
// You can get this from the Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let unsubscribe = null;

// Function to handle Google Login via Chrome Identity API (Web Flow for Cross-Browser Support)
export async function loginWithGoogle() {
  try {
    const manifest = chrome.runtime.getManifest();
    const clientId = manifest.oauth2.client_id;
    const scopes = manifest.oauth2.scopes.join(' ');
    // Hardcoded to ensure match with GCP. chrome.identity.getRedirectURL() sometimes adds parameters.
    const redirectUri = "https://cgoakjabdplamdcmhgfnljfeikifbhni.chromiumapp.org/";

    console.log("OAuth Redirect URI:", redirectUri);

    // 1. Construct the OAuth2 URL
    let authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);

    // 2. Launch Web Auth Flow
    const redirectUrl = await new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        { interactive: true, url: authUrl.toString() },
        (responseUrl) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(responseUrl);
          }
        }
      );
    });

    if (!redirectUrl) {
      throw new Error("Authorization failed: No redirect URL returned.");
    }

    // 3. Extract token from the redirect URL
    const urlParams = new URLSearchParams(new URL(redirectUrl).hash.substring(1)); // Remove '#'
    const token = urlParams.get('access_token');

    if (!token) {
      throw new Error("Authorization failed: No access token found.");
    }

    // 4. Create a Firebase credential with the token
    const credential = GoogleAuthProvider.credential(null, token);

    // 5. Sign in to Firebase
    const userCredential = await signInWithCredential(auth, credential);
    console.log("User logged in:", userCredential.user.uid);

    // Start syncing using the user's UID
    startSync(userCredential.user.uid);

    return userCredential.user;

  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Function to start real-time synchronization
export function startSync(uid, onUpdateCallback) {
  const userConfigRef = doc(db, "users", uid);

  // Stop previous listener if exists
  if (unsubscribe) {
    unsubscribe();
  }

  // Listen for real-time updates
  unsubscribe = onSnapshot(userConfigRef, (docSnap) => {
    if (docSnap.exists()) {
      const remoteConfig = docSnap.data();

      console.log("Firebase: Received update from cloud:", remoteConfig);

      // Save to local storage for offline access/cache (FLATTENED)
      chrome.storage.local.set(remoteConfig, () => {
        console.log("Firebase: Synced remote config to local storage.");
      });

      // Update UI via callback if provided
      if (onUpdateCallback) {
        onUpdateCallback(remoteConfig);
      }
    } else {
      console.log("Firebase: No remote config found for user.");
    }
  }, (error) => {
    console.error("Firebase: Sync Error:", error);
  });
}

// Function to save configuration to Firestore
export async function saveConfigToCloud(uid, newConfig) {
  if (!uid) {
    console.error("Firebase: Cannot save config, UID is missing.");
    return;
  }

  console.log("Firebase: Saving config to cloud for user:", uid, newConfig);

  try {
    const userConfigRef = doc(db, "users", uid);
    // Merge true allows updating only changed fields without overwriting everything
    await setDoc(userConfigRef, newConfig, { merge: true });
    console.log("Config saved to cloud");
  } catch (error) {
    console.error("Error saving config to cloud:", error);
  }
}

// Function to force fetch configuration from Firestore (Polling/Keep-Alive)
export async function forceFetchConfig(uid) {
  if (!uid) return;

  try {
    const userConfigRef = doc(db, "users", uid);
    const docSnap = await getDoc(userConfigRef); // Use getDoc, need to import it

    if (docSnap.exists()) {
      const remoteConfig = docSnap.data();
      console.log("Firebase: Force fetch successful:", remoteConfig);
      chrome.storage.local.set(remoteConfig);
    } else {
      console.log("Firebase: Force fetch - No remote config found.");
    }
  } catch (error) {
    console.error("Firebase: Force fetch error:", error);
  }
}

export { auth, db };
