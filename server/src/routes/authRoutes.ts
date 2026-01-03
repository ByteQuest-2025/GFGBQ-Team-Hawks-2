import { Router } from 'express';
import { UserService } from '../services/userService';

const router = Router();

// Sync User (Called after Firebase Auth login on frontend)
router.post('/sync', async (req, res) => {
    try {
        const { uid, email, name, ...profileData } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ error: 'Missing uid or email' });
        }

        const result = await UserService.syncUser(uid, { email, name, ...profileData });
        res.json({ success: true, user: result });
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
