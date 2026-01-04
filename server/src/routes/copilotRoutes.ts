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

        console.log('📨 COPILOT REQUEST:', { userId, message: message.substring(0, 50) });

        // Fetch Context
        let profile = await UserService.getUser(userId);

        console.log('👤 FETCHED PROFILE:', {
            id: profile?.id,
            name: profile?.name,
            ownerName: profile?.ownerName,
            type: profile?.type
        });

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
            console.log('⚠️ Using MOCK profile (user not found in DB)');
        }

        const obligations = await ObligationService.getUserObligations(userId);

        // Call AI
        const result = await CopilotService.chat(message, profile as any, obligations);

        // Ensure response has expected fields
        const response = {
            response: result.response || "I couldn't generate a response.",
            tool_calls: result.tool_calls || [],
            source: result.source || 'unknown'
        };

        console.log(`🤖 Copilot response source: ${response.source}, tool_calls: ${response.tool_calls.length}`);

        res.json(response);
    } catch (error) {
        console.error('Copilot Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

export default router;
