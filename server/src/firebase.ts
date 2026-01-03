import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin
// In production, use service account credentials
// For this hackathon/MVP, we can use default credentials or a mock if needed
// Assuming GOOGLE_APPLICATION_CREDENTIALS is set or using a placeholder for now

try {
    if (!admin.apps.length) {
        // PRIORITY 1: Explicit ENV Vars (Best for Vercel/Render/Cloud Run)
        if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
            console.log('🔐 Initializing Firebase with ENV vars...');
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.GOOGLE_PROJECT_ID || 'bytequest-hackathon',
                    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
                    privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // FIX: Handle escaped newlines
                })
            });
            console.log('✅ Firebase Admin initialized (ENV Strategy)');
        }
        // PRIORITY 2: Remote/Local File Path
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Production-grade: Load Service Account from file path
            const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT);
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin initialized (File Strategy)');
        }
        // FALLBACK: Default Google Credentials (GCP Internal)
        else {
            console.warn('⚠️ No explicit credentials found. Using Application Default Credentials.');
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
    }
} catch (error) {
    console.error('❌ Firebase Admin Initialization Failed:', error);
}

export const db = admin.firestore();
export const auth = admin.auth();
