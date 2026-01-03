import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

// HELPER: Get Authenticated Sheets Client
const getSheetsClient = async () => {
    // 1. Auth with the same credentials strategy
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            project_id: process.env.GOOGLE_PROJECT_ID,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();

    // 2. Initialize Sheets API
    return google.sheets({ version: 'v4', auth: client as any });
};

// ENDPOINT: Export Reports to Sheets
router.post('/export', async (req, res): Promise<any> => {
    try {
        const { reportData, quarter } = req.body;
        console.log(`📊 Received export request for ${quarter}`, reportData?.length);

        if (!reportData || !Array.isArray(reportData)) {
            return res.status(400).json({ error: 'Invalid data format. Expected "reportData" array.' });
        }

        const SHEET_ID = process.env.GOOGLE_SHEET_ID;
        if (!SHEET_ID) {
            console.error('❌ GOOGLE_SHEET_ID is missing in .env');
            return res.status(500).json({ error: 'Server misconfiguration: GOOGLE_SHEET_ID missing.' });
        }

        // 3. Prepare Data for Sheets (Header + Rows)
        // Assume reportData is generic objects, let's flatten or use fixed headers based on context
        // For this hackathon, let's just dump the raw values
        // If data is [ {name: 'Feb', tax: 3000...}, ... ]

        let headers: string[] = [];
        let rows: any[] = [];

        if (reportData.length > 0) {
            headers = Object.keys(reportData[0]);
            rows = reportData.map(item => Object.values(item));
        }

        const values = [
            [`REPORT EXPORT: ${quarter}`, new Date().toISOString()], // Meta Header
            headers,
            ...rows,
            [], // Spacer
        ];

        // 4. Append to Sheet
        const sheets = await getSheetsClient();

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A1', // Append to Sheet1
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: values,
            },
        });

        const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}`;

        // 5. Success
        return res.json({
            success: true,
            message: 'Data synced to Google Sheets',
            sheetUrl
        });

    } catch (error: any) {
        console.error('❌ Google Sheets Export Error:', error);

        // Handle the specific "unsupported" error if it somehow persists
        if (error.code === 'ERR_OSSL_UNSUPPORTED') {
            return res.status(500).json({ error: 'Server Cert Error: OpenSSL Unsupported. Check Private Key formatting.' });
        }

        return res.status(500).json({ error: error.message || 'Failed to export to sheets' });
    }
});

export default router;
