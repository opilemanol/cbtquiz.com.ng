import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import configJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  projectId: configJson.projectId,
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
  appId: configJson.appId,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Support custom firestoreDatabaseId if provisioned
const databaseId =
  configJson.firestoreDatabaseId && configJson.firestoreDatabaseId !== '(default)'
    ? configJson.firestoreDatabaseId
    : undefined;

export const db: Firestore = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth: Auth = getAuth(app);

// Test Firestore live connection on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export default app;
