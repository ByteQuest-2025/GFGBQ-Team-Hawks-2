import { Router } from 'express';
import { DocumentProcessorService, DocumentType } from '../services/documentProcessorService';
import { FinancialReportService } from '../services/financialReportService';
import { TaxDocumentParserService } from '../services/taxDocumentParserService';

const router = Router();

// Configure body-parser limit for large base64 strings if using standard json middleware
// Assuming index.ts has setup: app.use(express.json({ limit: '50mb' }));

router.post('/analyze', async (req, res) => {
    try {
        const { fileBase64, mimeType, docType } = req.body;

        if (!fileBase64 || !docType) {
            return res.status(400).json({ error: 'Missing fileBase64 or docType' });
        }

        const data = await DocumentProcessorService.processDocument(fileBase64, mimeType || 'image/jpeg', docType as DocumentType);
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Data extraction failed' });
    }
});

router.post('/report', (req, res) => {
    try {
        const { transactions } = req.body; // In real app, might fetch from DB
        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({ error: 'Invalid transactions data' });
        }

        const report = FinancialReportService.generateComplianceReport(transactions);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Report generation failed' });
    }
});

// POST /api/v1/documents/parse-tax - Parse Indian tax documents (Form 16, 26AS, etc.)
router.post('/parse-tax', async (req, res) => {
    try {
        const { fileBase64, mimeType, docType } = req.body;

        if (!fileBase64) {
            return res.status(400).json({ error: 'Missing fileBase64' });
        }

        const result = await TaxDocumentParserService.parseDocument(
            fileBase64,
            mimeType || 'application/pdf',
            docType
        );

        res.json({
            success: true,
            documentType: result.type,
            data: result.data,
            identifiers: result.extractedIdentifiers
        });
    } catch (error) {
        console.error('Tax document parsing error:', error);
        res.status(500).json({ error: 'Tax document parsing failed' });
    }
});

// POST /api/v1/documents/parse-bank-statement - Parse bank statement and get categorized transactions
router.post('/parse-bank-statement', async (req, res) => {
    try {
        const { fileBase64, mimeType } = req.body;

        if (!fileBase64) {
            return res.status(400).json({ error: 'Missing fileBase64' });
        }

        const result = await TaxDocumentParserService.parseBankStatement(
            fileBase64,
            mimeType || 'application/pdf'
        );

        // Format for Google Sheets export
        const sheetsData = {
            headers: ['Date', 'Description', 'Debit', 'Credit', 'Balance', 'Category', 'GST Relevant'],
            rows: result.transactions.map(txn => [
                txn.date,
                txn.description,
                txn.debit || '',
                txn.credit || '',
                txn.balance || '',
                txn.category || 'UNCATEGORIZED',
                txn.gstRelevant ? 'Yes' : 'No'
            ]),
            summary: result.summary
        };

        res.json({
            success: true,
            parsed: result,
            sheetsFormat: sheetsData,
            confidence: result.confidence
        });
    } catch (error) {
        console.error('Bank statement parsing error:', error);
        res.status(500).json({ error: 'Bank statement parsing failed' });
    }
});

export default router;
