import { Router } from 'express';
import { ObligationService } from '../services/obligationService';

const router = Router();

// Refresh Obligations (Run Rules Engine)
router.post('/refresh', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const obligations = await ObligationService.refreshObligations(userId);
        res.json({ success: true, count: obligations.length, obligations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to refresh obligations' });
    }
});

// Get Obligations
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const obligations = await ObligationService.getUserObligations(userId as string);
        res.json(obligations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch obligations' });
    }
});

export default router;
