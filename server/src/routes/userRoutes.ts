import { Router } from 'express';
import { UserService } from '../services/userService';

const router = Router();

// GET /api/v1/users/:userId - Fetch user profile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await UserService.getUser(userId);

        if (!profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ profile });
    } catch (error) {
        console.error('❌ Get User Error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// PUT /api/v1/users/:userId - Update user profile
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        // Validate required fields
        if (!updates.name && !updates.type && !updates.email) {
            return res.status(400).json({ error: 'At least one field required for update' });
        }

        const updated = await UserService.syncUser(userId, updates);
        res.json({ profile: updated, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('❌ Update User Error:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

export default router;
