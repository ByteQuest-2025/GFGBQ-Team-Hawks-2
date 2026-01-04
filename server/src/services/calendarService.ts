import { google } from 'googleapis';

const calendar = google.calendar('v3');

export const CalendarService = {
    /**
     * Create a new event in the user's primary calendar
     */
    async createEvent(accessToken: string, eventData: {
        summary: string;
        description?: string;
        startTime: string; // ISO String
        endTime: string;   // ISO String
    }) {
        try {
            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: accessToken });

            const response = await calendar.events.insert({
                auth: oauth2Client,
                calendarId: 'primary',
                requestBody: {
                    summary: eventData.summary,
                    description: eventData.description || 'Created via TaxAlly',
                    start: { dateTime: eventData.startTime },
                    end: { dateTime: eventData.endTime },
                    colorId: '5', // Yellow/Orange (Tax related)
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 }, // 1 day before
                            { method: 'popup', minutes: 60 },      // 1 hour before
                        ],
                    },
                },
            });

            return response.data;
        } catch (error) {
            console.error('Calendar Sync Error:', error);
            throw new Error('Failed to create calendar event');
        }
    },

    /**
     * List upcoming events from primary calendar
     */
    async listEvents(accessToken: string, maxResults = 10) {
        try {
            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: accessToken });

            const response = await calendar.events.list({
                auth: oauth2Client,
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            return response.data.items;
        } catch (error) {
            console.error('Calendar List Error:', error);
            throw new Error('Failed to fetch calendar events');
        }
    }
};
