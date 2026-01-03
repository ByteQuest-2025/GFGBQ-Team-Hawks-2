import { Router } from 'express';
import { TaxCalculatorService } from '../services/taxCalculatorService';
import { GSTService } from '../services/gstService';
import { TDSService } from '../services/tdsService';

const router = Router();

// /api/v1/tools/tax-calc
router.post('/tax-calc', (req, res) => {
    const { turnover, digitalTurnover, section } = req.body;

    if (section === '44ADA') {
        res.json(TaxCalculatorService.calculate44ADAIncome(turnover));
    } else {
        res.json(TaxCalculatorService.calculate44ADIncome(turnover, digitalTurnover || 0));
    }
});

// /api/v1/tools/gst-check
router.post('/gst-check', (req, res) => {
    const { turnover, isService, state } = req.body;
    res.json(GSTService.checkRegistrationRequirement(turnover, isService, state));
});

// /api/v1/tools/eway-limit
router.get('/eway-limit', (req, res) => {
    const { state, type } = req.query;
    res.json({
        limit: GSTService.getEWayBillLimit(state as string, type as 'intra-state' | 'inter-state')
    });
});

// /api/v1/tools/tds-monitor
router.post('/tds-monitor', (req, res) => {
    const { sales, hasKYC } = req.body;
    res.json(TDSService.check194OStatus(sales, hasKYC));
});

export default router;
