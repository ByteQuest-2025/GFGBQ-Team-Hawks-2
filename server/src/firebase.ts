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
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Production-grade: Load Service Account from file path
            const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT);
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin initialized with Service Account');
        } else {
            // Fallback for when specific path isn't set -> try default google strategy
            // But warn that specific SA is best for "Root Fix"
            console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not set in .env');
            console.warn('   Attempting to use Default Application Credentials...');
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
    }
} catch (error) {
    console.error('❌ Firebase Admin Initialization Failed:', error);
    console.error('   To fix this from root:');
    console.error('   1. Get service-account.json from Firebase Console');
    console.error('   2. Set FIREBASE_SERVICE_ACCOUNT=path/to/key.json in server/.env');
}

export const db = admin.firestore();
export const auth = admin.auth();
