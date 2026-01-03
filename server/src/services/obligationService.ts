import { db } from '../firebase';
import { evaluateObligations } from './complianceService';
import { UserService } from './userService';

const obligationsCollection = db.collection('obligations');

export const ObligationService = {
    // Generate & Save Obligations for a User
    async refreshObligations(userId: string) {
        const user = await UserService.getUser(userId);
        if (!user) throw new Error('User not found');

        // Run Rules Engine
        // Cast Firestore data to BusinessProfile (ensure robust validation in prod)
        const newObligations = evaluateObligations(user as any);

        const batch = db.batch();

        // In a real app, clear old pending obligations or diff them
        // For MVP, we'll just add new ones loosely

        const results = [];
        for (const obl of newObligations) {
            const ref = obligationsCollection.doc();
            const payload = {
                ...obl,
                userId,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            batch.set(ref, payload);
            results.push({ ...payload, id: ref.id });
        }

        await batch.commit();
        return results;
    },

    // Get User Obligations
    async getUserObligations(userId: string) {
        const snapshot = await obligationsCollection.where('userId', '==', userId).get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    }
};
