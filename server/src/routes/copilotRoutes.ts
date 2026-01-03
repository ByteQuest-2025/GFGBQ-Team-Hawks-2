import { Router } from 'express';
import { CopilotService } from '../services/copilotService';
import { UserService } from '../services/userService';
import { ObligationService } from '../services/obligationService';

const router = Router();

router.post('/chat', async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: 'Missing userId or message' });
        }

        // Fetch Context
        const profile = await UserService.getUser(userId);
        const obligations = await ObligationService.getUserObligations(userId);

        if (!profile) return res.status(404).json({ error: 'User not found' });

        // Call AI
        const result = await CopilotService.chat(message, profile as any, obligations);

        res.json(result);
    } catch (error) {
        console.error('Copilot Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

export default router;
