import { Router } from 'express';
import { EmailService } from '../services/emailService';

const router = Router();

router.post('/send-alert', async (req, res) => {
    const { email, name, deadline } = req.body;
    if (!email || !deadline) {
        return res.status(400).json({ error: 'Missing email or deadline data' });
    }

    const result = await EmailService.sendDeadlineAlert(email, name || 'User', deadline);
    res.json(result);
});

router.post('/test', async (req, res) => {
    const { email } = req.body;
    const result = await EmailService.sendEmail(email, 'Test Notification', '<h1>It Works!</h1><p>This is a test email from Tax Copilot.</p>');
    res.json(result);
});

export default router;
