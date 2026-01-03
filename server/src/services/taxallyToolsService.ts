/**
 * TaxAlly Tools Service
 * Enhanced tax tools with MCP-style interface for the Tax Copilot
 * Integrates TaxAlly's comprehensive Indian tax calculations
 */

// =============================================================================
// TAX SLAB CONFIGURATIONS (AY 2025-26)
// =============================================================================

const OLD_REGIME_SLABS = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 5 },
    { min: 500000, max: 1000000, rate: 20 },
    { min: 1000000, max: Infinity, rate: 30 }
];

const NEW_REGIME_SLABS = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 700000, rate: 5 },
    { min: 700000, max: 1000000, rate: 10 },
    { min: 1000000, max: 1200000, rate: 15 },
    { min: 1200000, max: 1500000, rate: 20 },
    { min: 1500000, max: Infinity, rate: 30 }
];

const SPECIAL_CATEGORY_STATES = [
    'Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Sikkim', 'Tripura', 'Himachal Pradesh', 'Uttarakhand'
];

// =============================================================================
// TOOL INTERFACES
// =============================================================================

interface TaxCalculationResult {
    grossIncome: number;
    taxableIncome: number;
    taxBeforeCess: number;
    cess: number;
    totalTax: number;
    effectiveRate: number;
    slabBreakdown: { slab: string; tax: number }[];
    regime: 'old' | 'new';
}

interface GSTCheckResult {
    registrationRequired: boolean;
    threshold: number;
    limitDescription: string;
    recommendedAction: string;
    interStateSelling: boolean;
    compositionSchemeEligible: boolean;
}

interface AdvanceTaxSchedule {
    installment: string;
    dueDate: string;
    cumulativePercentage: number;
    amount: number;
    status: 'PAID' | 'DUE' | 'UPCOMING' | 'OVERDUE';
}

interface DeadlineInfo {
    name: string;
    date: string;
    description: string;
    category: string;
    daysUntil: number;
    urgency: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

interface PresumptiveResult {
    section: '44AD' | '44ADA';
    eligible: boolean;
    deemedIncome: number;
    taxOnDeemedIncome: number;
    explanation: string;
    conditions: string[];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateSlabTax(income: number, slabs: typeof OLD_REGIME_SLABS): { tax: number; breakdown: { slab: string; tax: number }[] } {
    let remainingIncome = income;
    let totalTax = 0;
    const breakdown: { slab: string; tax: number }[] = [];

    for (const slab of slabs) {
        if (remainingIncome <= 0) break;

        const taxableInSlab = Math.min(remainingIncome, slab.max - slab.min);
        const taxInSlab = (taxableInSlab * slab.rate) / 100;

        if (taxInSlab > 0) {
            breakdown.push({
                slab: slab.max === Infinity
                    ? `Above ₹${(slab.min / 100000).toFixed(1)}L @ ${slab.rate}%`
                    : `₹${(slab.min / 100000).toFixed(1)}L - ₹${(slab.max / 100000).toFixed(1)}L @ ${slab.rate}%`,
                tax: taxInSlab
            });
        }

        totalTax += taxInSlab;
        remainingIncome -= taxableInSlab;
    }

    return { tax: totalTax, breakdown };
}

function getFinancialYear(date: Date = new Date()): string {
    const month = date.getMonth();
    const year = date.getFullYear();
    // FY starts in April
    if (month < 3) {
        return `FY ${year - 1}-${year.toString().slice(-2)}`;
    }
    return `FY ${year}-${(year + 1).toString().slice(-2)}`;
}

function getAssessmentYear(date: Date = new Date()): string {
    const month = date.getMonth();
    const year = date.getFullYear();
    if (month < 3) {
        return `AY ${year}-${(year + 1).toString().slice(-2)}`;
    }
    return `AY ${year + 1}-${(year + 2).toString().slice(-2)}`;
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

export const TaxAllyToolsService = {
    /**
     * Get all available MCP tools
     */
    getAvailableTools() {
        return [
            {
                name: 'calculate_income_tax',
                description: 'Calculate income tax with old vs new regime comparison',
                parameters: ['income', 'deductions_80c', 'deductions_80d', 'hra_exemption', 'other_deductions']
            },
            {
                name: 'check_gst_compliance',
                description: 'Check GST registration requirement and compliance status',
                parameters: ['turnover', 'is_service_provider', 'state', 'inter_state_sales']
            },
            {
                name: 'check_advance_tax',
                description: 'Get advance tax schedule and status',
                parameters: ['estimated_annual_tax', 'tax_already_paid']
            },
            {
                name: 'get_tax_deadlines',
                description: 'Get upcoming tax compliance deadlines',
                parameters: ['profile_type', 'has_gst']
            },
            {
                name: 'check_presumptive_taxation',
                description: 'Check 44AD/44ADA eligibility and calculate deemed income',
                parameters: ['gross_receipts', 'business_type', 'digital_turnover_percentage']
            },
            {
                name: 'categorize_transaction',
                description: 'Categorize a transaction for tax purposes',
                parameters: ['description', 'amount', 'type']
            }
        ];
    },

    /**
     * Execute an MCP tool by name
     */
    async executeTool(toolName: string, params: Record<string, any>): Promise<any> {
        switch (toolName) {
            case 'calculate_income_tax':
                return this.calculateIncomeTax(params as any);
            case 'check_gst_compliance':
                return this.checkGSTCompliance(params as any);
            case 'check_advance_tax':
                return this.checkAdvanceTax(params as any);
            case 'get_tax_deadlines':
                return this.getTaxDeadlines(params as any);
            case 'check_presumptive_taxation':
                return this.checkPresumptiveTaxation(params as any);
            case 'categorize_transaction':
                return this.categorizeTransaction(params as any);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    },

    /**
     * Calculate Income Tax with regime comparison
     */
    calculateIncomeTax(params: {
        income: number;
        deductions_80c?: number;
        deductions_80d?: number;
        hra_exemption?: number;
        other_deductions?: number;
    }): { old_regime: TaxCalculationResult; new_regime: TaxCalculationResult; recommendation: string } {
        const { income, deductions_80c = 0, deductions_80d = 0, hra_exemption = 0, other_deductions = 0 } = params;

        // Standard deduction (both regimes)
        const standardDeduction = 75000; // Updated for 2024-25

        // Old Regime: All deductions allowed
        const totalOldDeductions = Math.min(deductions_80c, 150000) + Math.min(deductions_80d, 50000) + hra_exemption + other_deductions + standardDeduction;
        const oldTaxableIncome = Math.max(0, income - totalOldDeductions);
        const oldResult = calculateSlabTax(oldTaxableIncome, OLD_REGIME_SLABS);

        // New Regime: Only standard deduction
        const newTaxableIncome = Math.max(0, income - standardDeduction);
        const newResult = calculateSlabTax(newTaxableIncome, NEW_REGIME_SLABS);

        // Apply 87A rebate if taxable income <= 7L (new) or 5L (old)
        let oldTaxBeforeRebate = oldResult.tax;
        let newTaxBeforeRebate = newResult.tax;

        if (oldTaxableIncome <= 500000) {
            oldTaxBeforeRebate = Math.max(0, oldTaxBeforeRebate - 12500);
        }
        if (newTaxableIncome <= 700000) {
            newTaxBeforeRebate = Math.max(0, newTaxBeforeRebate - 25000);
        }

        // Apply 4% Health & Education Cess
        const oldCess = oldTaxBeforeRebate * 0.04;
        const newCess = newTaxBeforeRebate * 0.04;

        const oldTotal = oldTaxBeforeRebate + oldCess;
        const newTotal = newTaxBeforeRebate + newCess;

        const oldRegimeResult: TaxCalculationResult = {
            grossIncome: income,
            taxableIncome: oldTaxableIncome,
            taxBeforeCess: oldTaxBeforeRebate,
            cess: oldCess,
            totalTax: oldTotal,
            effectiveRate: income > 0 ? (oldTotal / income) * 100 : 0,
            slabBreakdown: oldResult.breakdown,
            regime: 'old'
        };

        const newRegimeResult: TaxCalculationResult = {
            grossIncome: income,
            taxableIncome: newTaxableIncome,
            taxBeforeCess: newTaxBeforeRebate,
            cess: newCess,
            totalTax: newTotal,
            effectiveRate: income > 0 ? (newTotal / income) * 100 : 0,
            slabBreakdown: newResult.breakdown,
            regime: 'new'
        };

        const savings = Math.abs(oldTotal - newTotal);
        const recommendation = oldTotal < newTotal
            ? `Old Regime saves ₹${savings.toLocaleString('en-IN')}. Beneficial if you have substantial 80C/80D deductions.`
            : `New Regime saves ₹${savings.toLocaleString('en-IN')}. Simpler with no documentation needed.`;

        return {
            old_regime: oldRegimeResult,
            new_regime: newRegimeResult,
            recommendation
        };
    },

    /**
     * Check GST Compliance Status
     */
    checkGSTCompliance(params: {
        turnover: number;
        is_service_provider: boolean;
        state: string;
        inter_state_sales?: boolean;
    }): GSTCheckResult {
        const { turnover, is_service_provider, state, inter_state_sales = false } = params;

        const isSpecialState = SPECIAL_CATEGORY_STATES.includes(state);

        // Determine threshold
        let threshold: number;
        if (is_service_provider) {
            threshold = isSpecialState ? 1000000 : 2000000; // 10L or 20L
        } else {
            threshold = isSpecialState ? 2000000 : 4000000; // 20L or 40L
        }

        // Inter-state sales require mandatory registration regardless of turnover
        const registrationRequired = turnover > threshold || inter_state_sales;

        // Composition scheme eligibility (turnover up to 1.5 Cr for goods, not for services)
        const compositionSchemeEligible = !is_service_provider && turnover <= 15000000;

        let recommendedAction: string;
        if (registrationRequired && inter_state_sales) {
            recommendedAction = 'Mandatory GST registration required for inter-state sales. Apply on gst.gov.in within 30 days of crossing threshold.';
        } else if (registrationRequired) {
            recommendedAction = `Register for GST. You have crossed the ₹${(threshold / 100000).toFixed(0)}L threshold for ${state}.`;
        } else {
            const headroom = threshold - turnover;
            recommendedAction = `No registration required yet. You have ₹${(headroom / 100000).toFixed(2)}L headroom before threshold.`;
        }

        return {
            registrationRequired,
            threshold,
            limitDescription: `₹${(threshold / 100000).toFixed(0)} Lakhs (${isSpecialState ? 'Special Category State' : 'Regular State'})`,
            recommendedAction,
            interStateSelling: inter_state_sales,
            compositionSchemeEligible
        };
    },

    /**
     * Check Advance Tax Schedule
     */
    checkAdvanceTax(params: {
        estimated_annual_tax: number;
        tax_already_paid?: number;
    }): { exempt: boolean; schedule: AdvanceTaxSchedule[]; totalDue: number; message: string } {
        const { estimated_annual_tax, tax_already_paid = 0 } = params;

        // Advance tax not applicable if total tax < 10,000
        if (estimated_annual_tax < 10000) {
            return {
                exempt: true,
                schedule: [],
                totalDue: 0,
                message: 'Advance tax not applicable. Your estimated tax liability is below ₹10,000.'
            };
        }

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Determine FY dates (April to March)
        const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;

        const installments = [
            { name: 'Q1 (15th June)', date: new Date(fyStartYear, 5, 15), cumulative: 15 },
            { name: 'Q2 (15th September)', date: new Date(fyStartYear, 8, 15), cumulative: 45 },
            { name: 'Q3 (15th December)', date: new Date(fyStartYear, 11, 15), cumulative: 75 },
            { name: 'Q4 (15th March)', date: new Date(fyStartYear + 1, 2, 15), cumulative: 100 }
        ];

        const schedule: AdvanceTaxSchedule[] = installments.map((inst, idx) => {
            const amount = (estimated_annual_tax * inst.cumulative) / 100;
            const previousCumulative = idx > 0 ? installments[idx - 1].cumulative : 0;
            const installmentAmount = (estimated_annual_tax * (inst.cumulative - previousCumulative)) / 100;

            let status: 'PAID' | 'DUE' | 'UPCOMING' | 'OVERDUE';
            if (today > inst.date) {
                status = tax_already_paid >= amount ? 'PAID' : 'OVERDUE';
            } else if (today.getTime() > inst.date.getTime() - 7 * 24 * 60 * 60 * 1000) {
                status = 'DUE';
            } else {
                status = 'UPCOMING';
            }

            return {
                installment: inst.name,
                dueDate: inst.date.toISOString().split('T')[0],
                cumulativePercentage: inst.cumulative,
                amount: installmentAmount,
                status
            };
        });

        const overdueItems = schedule.filter(s => s.status === 'OVERDUE');
        const totalDue = estimated_annual_tax - tax_already_paid;

        let message: string;
        if (overdueItems.length > 0) {
            message = `⚠️ ${overdueItems.length} installment(s) overdue. Pay immediately to avoid §234B/C interest (1% per month).`;
        } else if (totalDue > 0) {
            const nextDue = schedule.find(s => s.status === 'DUE' || s.status === 'UPCOMING');
            message = nextDue ? `Next installment: ${nextDue.installment}. Amount: ₹${nextDue.amount.toLocaleString('en-IN')}` : 'All installments scheduled.';
        } else {
            message = 'All advance tax installments paid. You are compliant.';
        }

        return { exempt: false, schedule, totalDue, message };
    },

    /**
     * Get upcoming tax deadlines
     */
    getTaxDeadlines(params: {
        profile_type: 'individual' | 'business';
        has_gst: boolean;
    }): { upcoming_deadlines: DeadlineInfo[]; total_count: number } {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Determine FY
        const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
        const fyEndYear = fyStartYear + 1;

        const deadlines: DeadlineInfo[] = [];

        // GST deadlines (monthly/quarterly)
        if (params.has_gst) {
            // GSTR-3B (Monthly - 20th of next month)
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const gstr3bYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            deadlines.push({
                name: 'GSTR-3B',
                date: new Date(gstr3bYear, nextMonth, 20).toISOString().split('T')[0],
                description: 'Monthly GST return with tax payment',
                category: 'GST',
                daysUntil: 0,
                urgency: 'NORMAL'
            });

            // GSTR-1 (11th of next month)
            deadlines.push({
                name: 'GSTR-1',
                date: new Date(gstr3bYear, nextMonth, 11).toISOString().split('T')[0],
                description: 'Monthly outward supplies return',
                category: 'GST',
                daysUntil: 0,
                urgency: 'NORMAL'
            });
        }

        // Income Tax deadlines
        deadlines.push({
            name: 'ITR Filing (Non-Audit)',
            date: `${fyEndYear}-07-31`,
            description: 'Income Tax Return for individuals without audit requirement',
            category: 'Income Tax',
            daysUntil: 0,
            urgency: 'NORMAL'
        });

        if (params.profile_type === 'business') {
            deadlines.push({
                name: 'ITR Filing (Audit Cases)',
                date: `${fyEndYear}-10-31`,
                description: 'ITR for businesses requiring tax audit',
                category: 'Income Tax',
                daysUntil: 0,
                urgency: 'NORMAL'
            });

            deadlines.push({
                name: 'Tax Audit Report',
                date: `${fyEndYear}-09-30`,
                description: 'Form 3CA/3CB/3CD submission',
                category: 'Income Tax',
                daysUntil: 0,
                urgency: 'NORMAL'
            });
        }

        // Advance Tax deadlines
        const advanceTaxDates = [
            { name: 'Advance Tax Q1', date: `${fyStartYear}-06-15`, desc: '15% of estimated tax' },
            { name: 'Advance Tax Q2', date: `${fyStartYear}-09-15`, desc: '45% cumulative' },
            { name: 'Advance Tax Q3', date: `${fyStartYear}-12-15`, desc: '75% cumulative' },
            { name: 'Advance Tax Q4', date: `${fyEndYear}-03-15`, desc: '100% of estimated tax' }
        ];

        advanceTaxDates.forEach(atd => {
            deadlines.push({
                name: atd.name,
                date: atd.date,
                description: atd.desc,
                category: 'Advance Tax',
                daysUntil: 0,
                urgency: 'NORMAL'
            });
        });

        // TDS deadlines
        deadlines.push({
            name: 'TDS Payment',
            date: new Date(currentYear, currentMonth + 1, 7).toISOString().split('T')[0],
            description: 'TDS deducted in previous month',
            category: 'TDS',
            daysUntil: 0,
            urgency: 'NORMAL'
        });

        // Calculate days until and urgency
        const enrichedDeadlines = deadlines.map(d => {
            const deadlineDate = new Date(d.date);
            const timeDiff = deadlineDate.getTime() - today.getTime();
            const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            let urgency: 'CRITICAL' | 'WARNING' | 'NORMAL';
            if (daysUntil < 0) {
                urgency = 'CRITICAL'; // Overdue
            } else if (daysUntil <= 7) {
                urgency = 'CRITICAL';
            } else if (daysUntil <= 15) {
                urgency = 'WARNING';
            } else {
                urgency = 'NORMAL';
            }

            return { ...d, daysUntil, urgency };
        });

        // Filter to upcoming only (next 90 days) and sort by date
        const upcoming = enrichedDeadlines
            .filter(d => d.daysUntil >= -7 && d.daysUntil <= 90) // Include recently passed (7 days grace)
            .sort((a, b) => a.daysUntil - b.daysUntil);

        return {
            upcoming_deadlines: upcoming,
            total_count: upcoming.length
        };
    },

    /**
     * Check Presumptive Taxation eligibility (44AD/44ADA)
     */
    checkPresumptiveTaxation(params: {
        gross_receipts: number;
        business_type: 'professional' | 'trader' | 'manufacturer';
        digital_turnover_percentage?: number;
    }): PresumptiveResult {
        const { gross_receipts, business_type, digital_turnover_percentage = 50 } = params;

        const isProfessional = business_type === 'professional';
        const section = isProfessional ? '44ADA' : '44AD';

        // Eligibility limits
        const limit44AD = 30000000;  // 3 Cr (increased from 2 Cr for digital)
        const limit44ADA = 7500000;  // 75 Lakhs

        const limit = isProfessional ? limit44ADA : limit44AD;
        const eligible = gross_receipts <= limit;

        let deemedIncome: number;
        let explanation: string;

        if (isProfessional) {
            // 44ADA: 50% of gross receipts
            deemedIncome = gross_receipts * 0.50;
            explanation = `50% of gross receipts (₹${gross_receipts.toLocaleString('en-IN')}) = ₹${deemedIncome.toLocaleString('en-IN')}`;
        } else {
            // 44AD: 6% for digital, 8% for cash
            const digitalTurnover = (gross_receipts * digital_turnover_percentage) / 100;
            const cashTurnover = gross_receipts - digitalTurnover;
            deemedIncome = (digitalTurnover * 0.06) + (cashTurnover * 0.08);
            explanation = `6% on digital (₹${digitalTurnover.toLocaleString('en-IN')}) + 8% on cash (₹${cashTurnover.toLocaleString('en-IN')}) = ₹${deemedIncome.toLocaleString('en-IN')}`;
        }

        // Calculate tax on deemed income (using new regime for simplicity)
        const taxResult = calculateSlabTax(deemedIncome, NEW_REGIME_SLABS);
        const taxOnDeemedIncome = taxResult.tax * 1.04; // Including cess

        const conditions = isProfessional
            ? [
                'Must be a "specified profession" (doctor, lawyer, CA, engineer, architect, interior decorator, etc.)',
                'Gross receipts must not exceed ₹75 Lakhs',
                'Cannot claim further expenses against income',
                'No requirement to maintain books of accounts'
            ]
            : [
                'Available for resident individuals, HUFs, and partnership firms',
                `Turnover limit: ₹3 Cr (if 95%+ digital) or ₹2 Cr otherwise`,
                'Cannot claim further expenses against income',
                'No requirement to maintain books of accounts',
                'Must file ITR-4 (Sugam)'
            ];

        return {
            section,
            eligible,
            deemedIncome,
            taxOnDeemedIncome,
            explanation,
            conditions
        };
    },

    /**
     * Categorize a transaction for tax purposes
     */
    categorizeTransaction(params: {
        description: string;
        amount: number;
        type: 'credit' | 'debit';
    }): { category: string; taxImplication: string; gstApplicable: boolean; tdsApplicable: boolean; suggestedAction: string } {
        const { description, amount, type } = params;
        const desc = description.toLowerCase();

        // Pattern matching for categorization
        let category = 'UNCATEGORIZED';
        let taxImplication = '';
        let gstApplicable = false;
        let tdsApplicable = false;
        let suggestedAction = '';

        if (type === 'credit') {
            // Income categorization
            if (desc.includes('salary') || desc.includes('wages')) {
                category = 'SALARY';
                taxImplication = 'Taxable under "Income from Salary". Check Form 16 for TDS.';
                tdsApplicable = true;
            } else if (desc.includes('consulting') || desc.includes('professional') || desc.includes('freelance')) {
                category = 'PROFESSIONAL_INCOME';
                taxImplication = 'Taxable under "Profits & Gains from Business/Profession". Section 44ADA may apply.';
                gstApplicable = amount > 2000000; // If annual receipts > 20L
                tdsApplicable = amount > 30000;
            } else if (desc.includes('rent')) {
                category = 'RENTAL_INCOME';
                taxImplication = 'Taxable under "Income from House Property". Standard deduction of 30% allowed.';
                tdsApplicable = amount > 240000; // Monthly > 20k
            } else if (desc.includes('interest') || desc.includes('fd') || desc.includes('fixed deposit')) {
                category = 'INTEREST_INCOME';
                taxImplication = 'Taxable under "Income from Other Sources". TDS applicable if > ₹40k/year.';
                tdsApplicable = amount > 40000;
            } else if (desc.includes('sale') || desc.includes('sold') || desc.includes('invoice')) {
                category = 'BUSINESS_INCOME';
                taxImplication = 'Taxable as business income. Track for GST if registered.';
                gstApplicable = true;
            } else if (desc.includes('dividend')) {
                category = 'DIVIDEND';
                taxImplication = 'Taxable in hands of recipient. TDS @ 10% if > ₹5000.';
                tdsApplicable = amount > 5000;
            } else {
                category = 'OTHER_INCOME';
                taxImplication = 'Review for tax categorization.';
            }
        } else {
            // Expense categorization
            if (desc.includes('rent') || desc.includes('office')) {
                category = 'OFFICE_RENT';
                taxImplication = 'Deductible business expense. TDS @ 10% applicable if > ₹2.4L/year.';
                tdsApplicable = amount > 20000; // Monthly
                gstApplicable = true;
            } else if (desc.includes('software') || desc.includes('subscription') || desc.includes('saas')) {
                category = 'SOFTWARE_EXPENSE';
                taxImplication = 'Deductible as business expense. Check if GST paid can be claimed as ITC.';
                gstApplicable = true;
            } else if (desc.includes('travel') || desc.includes('flight') || desc.includes('hotel')) {
                category = 'TRAVEL_EXPENSE';
                taxImplication = 'Deductible if for business purposes. Maintain receipts.';
                gstApplicable = true;
            } else if (desc.includes('insurance') || desc.includes('lic') || desc.includes('premium')) {
                category = 'INSURANCE';
                taxImplication = 'May qualify for 80C (life) or 80D (health) deduction.';
                suggestedAction = 'Verify if eligible for Section 80C/80D deduction.';
            } else if (desc.includes('contractor') || desc.includes('vendor')) {
                category = 'CONTRACTOR_PAYMENT';
                taxImplication = 'TDS @ 1-2% applicable under 194C if > ₹30k single or ₹1L annual.';
                tdsApplicable = amount > 30000;
                gstApplicable = true;
            } else if (desc.includes('professional') || desc.includes('lawyer') || desc.includes('ca')) {
                category = 'PROFESSIONAL_FEES';
                taxImplication = 'TDS @ 10% under 194J if > ₹30k.';
                tdsApplicable = amount > 30000;
                gstApplicable = true;
            } else {
                category = 'OTHER_EXPENSE';
                taxImplication = 'Review for deductibility.';
            }
        }

        if (!suggestedAction) {
            const actions = [];
            if (tdsApplicable) actions.push('Verify TDS compliance');
            if (gstApplicable) actions.push('Check GST invoice');
            suggestedAction = actions.length > 0 ? actions.join('. ') : 'No immediate action required.';
        }

        return {
            category,
            taxImplication,
            gstApplicable,
            tdsApplicable,
            suggestedAction
        };
    }
};
