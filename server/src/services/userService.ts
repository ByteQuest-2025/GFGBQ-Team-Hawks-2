import { db } from '../firebase';
import { BusinessProfile } from '../types/shared';

// Mock DB for development without Service Account
const mockDb: Record<string, any> = {};

export const UserService = {
    // Create or Update User Profile
    async syncUser(uid: string, data: Partial<BusinessProfile> & { email: string }) {
        try {
            await db.collection('users').doc(uid).set({
                ...data,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.warn(`[Mock Fallback] Firestore write failed (${(error as Error).message}). Using in-memory store.`);
            mockDb[uid] = { ...data, updatedAt: new Date() };
        }
        return { uid, ...data, isNewUser: true }; // Flagging as new for onboarding flow
    },

    // Get User Profile
    async getUser(uid: string) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) return doc.data();

            // If doc doesn't exist in valid DB, check mock? 
            // Usually if DB is valid, we trust it.
            // But if DB threw error, we go to catch.
            return null;
        } catch (error) {
            console.warn(`[Mock Fallback] Firestore read failed. Checking in-memory store.`);
            return mockDb[uid] || null;
        }
    }
};
