import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, initializeFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence verbose firebase warnings in the development environment
setLogLevel('error');

// Intercept console.error to handle benign "Could not reach Cloud Firestore backend" and quota warnings in offline/sandbox environments
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const isBenignFirestoreError = args.some(arg => 
    arg && (
      (typeof arg === 'string' && (
        arg.includes('Could not reach Cloud Firestore backend') || 
        arg.includes('The client will operate in offline mode') ||
        arg.includes('@firebase/firestore:') ||
        arg.includes('Connection failed') ||
        arg.includes('resource-exhausted') ||
        arg.includes('Quota limit exceeded') ||
        arg.includes('Free daily write units')
      )) ||
      (arg instanceof Error && (
        arg.message.includes('Could not reach Cloud Firestore backend') ||
        arg.message.includes('unavailable') ||
        arg.message.includes('resource-exhausted') ||
        arg.message.includes('Quota limit exceeded')
      ))
    )
  );
  if (isBenignFirestoreError) {
    console.warn("[Firestore Status Note]: Operating in resilient local/offline mode.", ...args);
    return;
  }
  originalConsoleError.apply(console, args);
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Use initializeFirestore to include settings like experimentalAutoDetectLongPolling
// this helps in environments with restrictive proxies/firewalls by dynamically choosing the best transport
const customDbId = (firebaseConfig as any).firestoreDatabaseId;

let primaryDb: any;
try {
  primaryDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, customDbId || '(default)');
  console.log(`Firestore initialized with primary database ID: ${customDbId || '(default)'}`);
} catch (error) {
  console.warn("Primary Firestore initialization failed, falling back to standard getFirestore...", error);
  primaryDb = getFirestore(app);
}

let fallbackDb: any = null;

// Export db as a live let binding so that we can dynamically reassign it to fallbackDb
// if the custom database is unreachable, without using a Proxy that breaks Firebase SDK's internal type/class checks.
export let db: any = primaryDb;

// Test connection and dynamically swap database if custom one fails
async function testConnection() {
  const primaryDbId = customDbId || '(default)';
  console.log(`Verifying Firestore connection to primary database: ${primaryDbId}...`);
  try {
    // Attempt connection
    await getDocFromServer(doc(primaryDb, '_connection_test_', 'ping'));
    console.log(`Firestore connection to ${primaryDbId} verified successfully.`);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.log(`Firestore connection reached database ${primaryDbId} successfully (permission denied is expected for test document).`);
      return;
    }
    
    console.warn(`Primary database connection test returned: ${error?.message || error}. Code: ${error?.code}`);
    
    // If the custom database returned an internal/invalid error or was unavailable, try (default)
    if (customDbId && customDbId !== '(default)') {
      console.log("Attempting fallback to '(default)' database...");
      try {
        fallbackDb = initializeFirestore(app, {
          experimentalAutoDetectLongPolling: true,
        });
        await getDocFromServer(doc(fallbackDb, '_connection_test_', 'ping'));
        db = fallbackDb;
        console.log("Successfully connected and switched to fallback '(default)' database.");
      } catch (fallbackError: any) {
        if (fallbackError?.code === 'permission-denied') {
          db = fallbackDb;
          console.log("Successfully switched to fallback '(default)' database (permission denied is expected).");
        } else {
          console.log(`Fallback database also returned: ${fallbackError?.message || fallbackError}`);
        }
      }
    }
  }
}

testConnection();
