import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin
// In production, use service account credentials
// For this hackathon/MVP, we can use default credentials or a mock if needed

let firebaseInitialized = false;

try {
    if (!admin.apps.length) {
        // PRIORITY 1: Explicit ENV Vars (Best for Vercel/Render/Cloud Run)
        if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
            try {
                console.log('🔐 Initializing Firebase with ENV vars...');
                const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.GOOGLE_PROJECT_ID || 'bytequest-hackathon',
                        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
                        privateKey: privateKey,
                    })
                });
                console.log('✅ Firebase Admin initialized (ENV Strategy)');
                firebaseInitialized = true;
            } catch (envError) {
                console.warn('⚠️ ENV Initialization failed (Invalid Private Key?), trying file strategy...', envError);
            }
        }

        // PRIORITY 2: Remote/Local File Path (Fallback if ENV failed or missing)
        if (!firebaseInitialized && process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                // Production-grade: Load Service Account from file path
                const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT);
                const serviceAccount = require(serviceAccountPath);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('✅ Firebase Admin initialized (File Strategy)');
                firebaseInitialized = true;
            } catch (fileError) {
                console.error('❌ File Strategy Failed:', fileError);
            }
        }

        // FALLBACK: Skip Firebase (for demo/hackathon)
        if (!firebaseInitialized) {
            console.warn('⚠️ No valid Firebase credentials found. Running without Firebase.');
            console.warn('   Set GOOGLE_PRIVATE_KEY/GOOGLE_CLIENT_EMAIL or FIREBASE_SERVICE_ACCOUNT in .env');
        }
    } else {
        firebaseInitialized = true;
    }
} catch (error) {
    console.error('❌ Firebase Admin Initialization Critical Error:', error);
    console.warn('⚠️ Continuing without Firebase...');
}

// Mock Firestore and Auth for when Firebase is not initialized
const mockDb = {
    collection: () => ({
        doc: () => ({
            get: async () => ({ exists: false, data: () => null }),
            set: async () => { },
            update: async () => { },
            delete: async () => { }
        }),
        where: () => ({
            get: async () => ({ docs: [], empty: true })
        }),
        get: async () => ({ docs: [], empty: true }),
        add: async () => ({ id: 'mock-id' })
    })
};

const mockAuth = {
    verifyIdToken: async () => ({ uid: 'mock-user' }),
    getUser: async () => ({ uid: 'mock-user', email: 'demo@example.com' }),
    createUser: async () => ({ uid: 'mock-user' })
};

export const db = firebaseInitialized ? admin.firestore() : mockDb as any;
export const auth = firebaseInitialized ? admin.auth() : mockAuth as any;
export const isFirebaseInitialized = firebaseInitialized;
