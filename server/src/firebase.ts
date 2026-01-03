import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
// In production, use service account credentials
// For this hackathon/MVP, we can use default credentials or a mock if needed
// Assuming GOOGLE_APPLICATION_CREDENTIALS is set or using a placeholder for now

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log('🔥 Firebase Admin initialized');
    }
} catch (error) {
    console.error('Firebase initialization error (expected if no creds):', error);
    console.log('⚠️ Running in MOCK Mode for non-firebase dependent logic');
}

export const db = admin.firestore();
export const auth = admin.auth();
