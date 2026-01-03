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
        let profile = await UserService.getUser(userId);

        // Fallback to mock profile if user not found (guest users)
        if (!profile) {
            profile = {
                id: userId,
                name: 'Guest Business',
                type: 'freelancer',
                turnover: '< ₹20L',
                ownerName: 'Guest User',
                state: 'Delhi',
                email: 'guest@example.com',
                hasGST: false,
                panNumber: '',
                createdAt: new Date()
            } as any;
        }

        const obligations = await ObligationService.getUserObligations(userId);

        // Call AI
        const result = await CopilotService.chat(message, profile as any, obligations);

        res.json(result);
    } catch (error) {
        console.error('Copilot Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

export default router;
