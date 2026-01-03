import { db } from '../firebase';
import { BusinessProfile } from '../types/shared';

// Mock DB for development without Service Account
const mockDb: Record<string, any> = {};

export const UserService = {
    // Create or Update User Profile
    async syncUser(uid: string, data: Partial<BusinessProfile> & { email?: string }) {
        const timestamp = new Date();
        const userRef = db.collection('users').doc(uid);

        try {
            // Check if user exists first to determine "isNewUser" logic correctly if needed elsewhere
            // But for sync, we just want to ensure the record exists with latest auth info.

            // Clean undefined values to avoid Firestore errors
            const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
                if (value !== undefined) acc[key] = value;
                return acc;
            }, {} as any);

            await userRef.set({
                ...cleanData,
                updatedAt: timestamp,
                lastLoginAt: timestamp
            }, { merge: true });

            const updatedDoc = await userRef.get();
            return { id: uid, ...updatedDoc.data() };
        } catch (error) {
            console.warn(`[Mock Fallback] Firestore write failed. Using in-memory store.`, error);
            // Mock logic
            if (!mockDb[uid]) {
                mockDb[uid] = { ...data, createdAt: timestamp, updatedAt: timestamp };
            } else {
                mockDb[uid] = { ...mockDb[uid], ...data, updatedAt: timestamp };
            }
            return { id: uid, ...mockDb[uid] };
        }
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
