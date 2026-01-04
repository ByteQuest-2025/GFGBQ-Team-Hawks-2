import express from 'express';
import { CalendarService } from '../services/calendarService';
import { verifyAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware to ensure user is logged in to OUR app first
router.use(verifyAuth);

// Sync Event to Google Calendar
router.post('/sync', async (req, res) => {
    try {
        const { googleAccessToken, event } = req.body;

        if (!googleAccessToken) {
            res.status(400).json({ error: 'Google Access Token is required' });
            return;
        }

        if (!event || !event.summary || !event.startTime) {
            res.status(400).json({ error: 'Valid event data (summary, startTime) is required' });
            return;
        }

        // Default duration 1 hour if not specified
        const start = new Date(event.startTime);
        const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 60 * 60 * 1000);

        const result = await CalendarService.createEvent(googleAccessToken, {
            summary: event.summary,
            description: event.description,
            startTime: start.toISOString(),
            endTime: end.toISOString()
        });

        res.json({ success: true, eventId: result.id, link: result.htmlLink });
    } catch (error) {
        console.error('Route Error /sync:', error);
        res.status(500).json({ error: 'Failed to sync event' });
    }
});

// List Events from Google Calendar
router.post('/events', async (req, res) => {
    try {
        const { googleAccessToken } = req.body;

        if (!googleAccessToken) {
            res.status(400).json({ error: 'Google Access Token is required' });
            return;
        }

        const events = await CalendarService.listEvents(googleAccessToken);
        res.json({ success: true, events });
    } catch (error) {
        console.error('Route Error /events:', error);
        res.status(500).json({ error: 'Failed to list events' });
    }
});

export default router;
