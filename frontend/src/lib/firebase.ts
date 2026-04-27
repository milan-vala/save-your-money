import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as
  | string
  | undefined;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  ...(measurementId ? { measurementId } : {}),
};

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseConfig.apiKey) {
    throw new Error(
      "Firebase is not configured. Set VITE_FIREBASE_* variables (see frontend/.env.example)."
    );
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/** Firebase web User exposes `refreshToken` at runtime; typings may omit it. */
export function getUserRefreshToken(user: { refreshToken?: string }): string {
  const token = user.refreshToken;
  if (!token) {
    throw new Error("Missing refresh token from Firebase user");
  }
  return token;
}
