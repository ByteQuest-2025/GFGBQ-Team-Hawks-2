import { Router } from 'express';
import { UserService } from '../services/userService';
import { verifyAuth } from '../middleware/authMiddleware';

const router = Router();

// Sync User (Called after Firebase Auth login on frontend)
// Sync User (Called after Firebase Auth login on frontend)
router.post('/sync', verifyAuth, async (req, res) => {
    try {
        const { uid, email, name, picture } = req.user!;
        // Optional extra data from frontend (only use if provided)
        const { businessType } = req.body;

        console.log(`[AUTH] Syncing user ${uid}:`, { email, name, businessType });

        // Sync with Firestore (or Mock DB)
        // Only update 'type' if businessType is explicitly provided in the request
        const updateData: any = {
            email: email || '',
            name: name || 'User',
            photoURL: picture
        };
        if (businessType) updateData.type = businessType;

        const result = await UserService.syncUser(uid, updateData);

        // Check profile completeness logic
        const profile = await UserService.getUser(uid);
        const isProfileComplete = profile?.profileCompleted === true || !!(profile?.name && profile?.type && profile?.turnover);

        console.log(`[AUTH] Profile status for ${uid}:`, {
            isProfileComplete,
            hasType: !!profile?.type,
            hasTurnover: !!profile?.turnover,
            profileCompletedFlag: profile?.profileCompleted
        });

        res.json({
            success: true,
            uid,
            isNewUser: !profile || !profile.createdAt, // improving detection logic if needed
            profileCompleted: isProfileComplete,
            user: profile
        });
    } catch (error) {
        console.error('Auth Sync Error:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

// Get Profile
router.get('/:uid', async (req, res) => {
    try {
        const user = await UserService.getUser(req.params.uid);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
