import { Router } from 'express';
import { DocumentProcessorService, DocumentType } from '../services/documentProcessorService';
import { FinancialReportService } from '../services/financialReportService';

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

export default router;
