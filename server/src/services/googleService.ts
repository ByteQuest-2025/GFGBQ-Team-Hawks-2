import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Auth
// For this Hackathon, we'll assume a specific public sheet or Service Account usage
// If credentials aren't present, we'll return Mock Data to avoid blocking the demo
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

export const GoogleService = {
    /**
     * Fetch Rows from a Google Sheet (Bank Statement)
     */
    async fetchSheetData(spreadsheetId: string, range: string) {
        // FALLBACK: If no creds, return Mock Bank Statement
        if (!process.env.GOOGLE_CLIENT_EMAIL) {
            console.warn('⚠️ No Google Credentials. Returning Mock Sheet Data.');
            return [
                ['Date', 'Description', 'Amount', 'Type'],
                ['2024-01-01', 'Upwork Payout', '50000', 'Credit'],
                ['2024-01-05', 'Starbucks Coffee', '450', 'Debit'],
                ['2024-01-10', 'AWS Server Bill', '2500', 'Debit'],
                ['2024-01-15', 'Uber Ride', '350', 'Debit'],
                ['2024-01-20', 'Client Payment', '30000', 'Credit'],
                ['2024-01-25', 'Apple Subscription', '99', 'Debit'],
                ['2024-01-28', 'Office Rent', '15000', 'Debit']
            ];
        }

        try {
            const sheets = google.sheets({ version: 'v4', auth });
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            return response.data.values || [];
        } catch (error) {
            console.error('Google Sheets API Error:', error);
            throw new Error('Failed to fetch Google Sheet');
        }
    },

    /**
     * Fetch Content from a Google Doc (Contract/Notice)
     */
    async fetchDocContent(documentId: string) {
        // FALLBACK: Mock Data
        if (!process.env.GOOGLE_CLIENT_EMAIL) {
            console.warn('⚠️ No Google Credentials. Returning Mock Doc Content.');
            return `
**SERVICE AGREEMENT (MOCK)**
This Agreement is made between **Alpha Corp** (Client) and **Freelancer** (Contractor).
1. **Scope**: Web Development Services.
2. **Fees**: INR 50,000 per month.
3. **Termination**: 30 days notice required.
4. **Confidentiality**: Standard NDA applies.
            `;
        }

        try {
            const docs = google.docs({ version: 'v1', auth });
            const response = await docs.documents.get({ documentId });
            // Simple text extractor
            const text = response.data.body?.content?.map(c => c.paragraph?.elements?.map(e => e.textRun?.content).join('')).join('\n');
            return text || "No content found.";
        } catch (error) {
            console.error('Google Docs API Error:', error);
            throw new Error('Failed to fetch Google Doc');
        }
    }
};
