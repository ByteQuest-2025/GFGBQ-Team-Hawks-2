import { Router } from 'express';
import { UserService } from '../services/userService';
import { verifyAuth } from '../middleware/authMiddleware';

const router = Router();

// Sync User (Called after Firebase Auth login on frontend)
// Sync User (Called after Firebase Auth login on frontend)
router.post('/sync', verifyAuth, async (req, res) => {
    try {
        const { uid, email, name, picture } = req.user!;
        const { businessType } = req.body; // Optional extra data from frontend

        // Sync with Firestore (or Mock DB)
        const result = await UserService.syncUser(uid, {
            email: email || '',
            name: name || 'User',
            photoURL: picture,
            type: businessType as any
        });

        // Check profile completeness logic
        const profile = await UserService.getUser(uid);
        const isProfileComplete = !!(profile?.name && profile?.type && profile?.turnover);

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
