import { Router, Request, Response } from 'express';
import { TaxAllyToolsService } from '../services/taxallyToolsService';

const router = Router();

/**
 * MCP Routes - Model Context Protocol endpoints for TaxAlly
 * These endpoints expose tax tools for external integrations (Claude Desktop, etc.)
 */

// GET /api/v1/mcp/tools - List all available tools
router.get('/tools', (req: Request, res: Response) => {
    try {
        const tools = TaxAllyToolsService.getAvailableTools();
        res.json({
            success: true,
            tools,
            metadata: {
                version: '1.0.0',
                provider: 'TaxAlly',
                description: 'Indian Tax & Compliance Tools'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch tools' });
    }
});

// POST /api/v1/mcp/execute - Execute a tool by name
router.post('/execute', async (req: Request, res: Response) => {
    try {
        const { tool, params } = req.body;

        if (!tool) {
            return res.status(400).json({ success: false, error: 'Tool name is required' });
        }

        const result = await TaxAllyToolsService.executeTool(tool, params || {});
        res.json({
            success: true,
            tool,
            result
        });
    } catch (error: any) {
        console.error('MCP Execution Error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Tool execution failed'
        });
    }
});

// POST /api/v1/mcp/calculate-tax - Direct tax calculation endpoint
router.post('/calculate-tax', (req: Request, res: Response) => {
    try {
        const { income, deductions_80c, deductions_80d, hra_exemption, other_deductions } = req.body;

        if (!income || income <= 0) {
            return res.status(400).json({ success: false, error: 'Valid income amount is required' });
        }

        const result = TaxAllyToolsService.calculateIncomeTax({
            income,
            deductions_80c,
            deductions_80d,
            hra_exemption,
            other_deductions
        });

        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Tax calculation failed' });
    }
});

// POST /api/v1/mcp/check-gst - GST compliance check
router.post('/check-gst', (req: Request, res: Response) => {
    try {
        const { turnover, is_service_provider, state, inter_state_sales } = req.body;

        if (!turnover || !state) {
            return res.status(400).json({ success: false, error: 'Turnover and state are required' });
        }

        const result = TaxAllyToolsService.checkGSTCompliance({
            turnover,
            is_service_provider: is_service_provider ?? false,
            state,
            inter_state_sales
        });

        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'GST check failed' });
    }
});

// POST /api/v1/mcp/advance-tax - Advance tax schedule
router.post('/advance-tax', (req: Request, res: Response) => {
    try {
        const { estimated_annual_tax, tax_already_paid } = req.body;

        if (!estimated_annual_tax) {
            return res.status(400).json({ success: false, error: 'Estimated annual tax is required' });
        }

        const result = TaxAllyToolsService.checkAdvanceTax({
            estimated_annual_tax,
            tax_already_paid
        });

        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Advance tax check failed' });
    }
});

// GET /api/v1/mcp/deadlines - Get upcoming deadlines
router.get('/deadlines', (req: Request, res: Response) => {
    try {
        const profile_type = (req.query.profile_type as 'individual' | 'business') || 'individual';
        const has_gst = req.query.has_gst === 'true';

        const result = TaxAllyToolsService.getTaxDeadlines({ profile_type, has_gst });
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch deadlines' });
    }
});

// POST /api/v1/mcp/presumptive - Check 44AD/44ADA eligibility
router.post('/presumptive', (req: Request, res: Response) => {
    try {
        const { gross_receipts, business_type, digital_turnover_percentage } = req.body;

        if (!gross_receipts || !business_type) {
            return res.status(400).json({ success: false, error: 'Gross receipts and business type are required' });
        }

        const result = TaxAllyToolsService.checkPresumptiveTaxation({
            gross_receipts,
            business_type,
            digital_turnover_percentage
        });

        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Presumptive taxation check failed' });
    }
});

// POST /api/v1/mcp/categorize - Categorize transaction
router.post('/categorize', (req: Request, res: Response) => {
    try {
        const { description, amount, type } = req.body;

        if (!description || !amount || !type) {
            return res.status(400).json({ success: false, error: 'Description, amount, and type are required' });
        }

        const result = TaxAllyToolsService.categorizeTransaction({ description, amount, type });
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Transaction categorization failed' });
    }
});

export default router;
