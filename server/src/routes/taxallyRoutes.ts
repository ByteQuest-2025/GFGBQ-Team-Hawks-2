import { Router, Request, Response } from 'express';
import { TaxAllyClient } from '../services/taxallyClient';

const router = Router();

/**
 * TaxAlly Routes - Proxy to TaxAlly HuggingFace server
 *
 * These endpoints proxy requests to the TaxAlly Python server
 * which runs the local HuggingFace LLM (Qwen2.5-7B-Instruct)
 */

// GET /api/v1/taxally/health - Check if TaxAlly server is available
router.get('/health', async (req: Request, res: Response) => {
    try {
        const health = await TaxAllyClient.getHealth();
        if (health) {
            res.json({ available: true, ...health });
        } else {
            res.json({ available: false, message: 'TaxAlly server not running' });
        }
    } catch (error) {
        res.json({ available: false, error: (error as Error).message });
    }
});

// POST /api/v1/taxally/chat - Chat with TaxAlly agent
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message, session_id, user_id, profile } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await TaxAllyClient.chat({
            message,
            session_id,
            user_id,
            profile
        });

        res.json({ success: true, ...response });
    } catch (error) {
        console.error('TaxAlly chat error:', error);
        res.status(503).json({
            success: false,
            error: 'TaxAlly server unavailable',
            message: (error as Error).message
        });
    }
});

// GET /api/v1/taxally/tools - List available tools
router.get('/tools', async (req: Request, res: Response) => {
    try {
        const tools = await TaxAllyClient.listTools();
        res.json({ success: true, ...tools });
    } catch (error) {
        res.status(503).json({ success: false, error: (error as Error).message });
    }
});

// POST /api/v1/taxally/tools/execute - Execute a specific tool
router.post('/tools/execute', async (req: Request, res: Response) => {
    try {
        const { tool, params } = req.body;
        const userId = req.headers['x-user-id'] as string;

        if (!tool) {
            return res.status(400).json({ error: 'Tool name is required' });
        }

        const result = await TaxAllyClient.executeTool(tool, params || {}, userId);
        res.json(result);
    } catch (error) {
        res.status(503).json({ success: false, error: (error as Error).message });
    }
});

// GET /api/v1/taxally/deadlines - Get upcoming deadlines
router.get('/deadlines', async (req: Request, res: Response) => {
    try {
        const daysAhead = parseInt(req.query.days_ahead as string) || 30;
        const userId = req.headers['x-user-id'] as string;

        const deadlines = await TaxAllyClient.getDeadlines(daysAhead, userId);
        res.json({ success: true, ...deadlines });
    } catch (error) {
        res.status(503).json({ success: false, error: (error as Error).message });
    }
});

// GET /api/v1/taxally/compliance/check - Run compliance check
router.get('/compliance/check', async (req: Request, res: Response) => {
    try {
        const turnover = req.query.turnover ? parseFloat(req.query.turnover as string) : undefined;
        const income = req.query.income ? parseFloat(req.query.income as string) : undefined;
        const userId = req.headers['x-user-id'] as string;

        const result = await TaxAllyClient.checkCompliance(turnover, income, userId);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(503).json({ success: false, error: (error as Error).message });
    }
});

// GET /api/v1/taxally/profile - Get TaxAlly profile
router.get('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string || 'demo_user';
        const profile = await TaxAllyClient.getProfile(userId);
        res.json({ success: true, ...profile });
    } catch (error) {
        res.status(503).json({ success: false, error: (error as Error).message });
    }
});

// POST /api/v1/taxally/profile - Update TaxAlly profile
router.post('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string || 'demo_user';
        const result = await TaxAllyClient.updateProfile(userId, req.body);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(503).json({ success: false, error: (error as Error).message });
    }
});

export default router;
