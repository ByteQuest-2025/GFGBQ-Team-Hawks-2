import { Router } from 'express';
import { GoogleService } from '../services/googleService';
import { ExpenseService } from '../services/expenseService';

const router = Router();

// GET /api/v1/integrations/analyze-sheet?sheetId=...
router.post('/analyze-sheet', async (req, res) => {
    const { spreadsheetId } = req.body;
    // Use a default Sheet ID if none provided (for demo)
    const targetSheetId = spreadsheetId || 'mock-id';

    try {
        // 1. Fetch Data
        const rawData = await GoogleService.fetchSheetData(targetSheetId, 'Sheet1!A1:D100');

        // 2. Parse (Skip Header Row)
        const transactions = rawData.slice(1).map(row => ({
            date: row[0],
            description: row[1],
            amount: parseFloat(row[2]),
            type: row[3] as 'Credit' | 'Debit'
        }));

        // 3. Analyze with AI
        const analysis = await ExpenseService.categorizeExpenses(transactions);

        res.json({
            source: 'Google Sheets',
            totalTransactions: transactions.length,
            analysis
        });

    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
