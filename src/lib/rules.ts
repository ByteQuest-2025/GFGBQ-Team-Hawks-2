import type { BusinessProfile, ComplianceObligation } from '../types';

// Rule definition type
interface ComplianceRule {
    id: string;
    name: string;
    condition: (profile: BusinessProfile) => boolean;
    obligation: Omit<ComplianceObligation, 'id' | 'applicableRules'>;
}

// Hardcoded Indian Tax Compliance Rules
export const COMPLIANCE_RULES: ComplianceRule[] = [
    // GST Rules
    {
        id: 'GST_REG_20L',
        name: 'GST Registration Threshold',
        condition: (p) => p.turnover !== 'below_20L' && !p.hasGST,
        obligation: {
            name: 'GST Registration',
            type: 'GST',
            description: 'Register for GST as your turnover exceeds ₹20 Lakhs',
            frequency: 'one_time',
            penalty: 'Late fee of ₹200/day (max ₹10,000) + 10% of tax due',
            helpText: 'GST registration is mandatory when your annual turnover crosses ₹20 Lakhs. You can register online at gst.gov.in'
        }
    },
    {
        id: 'GSTR1_MONTHLY',
        name: 'GSTR-1 Monthly Filing',
        condition: (p) => p.hasGST && p.turnover === 'above_1Cr',
        obligation: {
            name: 'GSTR-1 (Monthly)',
            type: 'GST',
            description: 'File monthly sales return by 11th of next month',
            frequency: 'monthly',
            penalty: 'Late fee ₹50/day (₹20 for nil return)',
            helpText: 'GSTR-1 contains details of all your outward supplies (sales). Due by 11th of the following month.'
        }
    },
    {
        id: 'GSTR1_QUARTERLY',
        name: 'GSTR-1 Quarterly Filing',
        condition: (p) => p.hasGST && p.turnover !== 'above_1Cr',
        obligation: {
            name: 'GSTR-1 (Quarterly)',
            type: 'GST',
            description: 'File quarterly sales return under QRMP scheme',
            frequency: 'quarterly',
            penalty: 'Late fee ₹50/day (₹20 for nil return)',
            helpText: 'Under QRMP scheme, you file GSTR-1 quarterly. Due dates: Apr-Jun by July 13, Jul-Sep by Oct 13, etc.'
        }
    },
    {
        id: 'GSTR3B_MONTHLY',
        name: 'GSTR-3B Monthly Filing',
        condition: (p) => p.hasGST,
        obligation: {
            name: 'GSTR-3B',
            type: 'GST',
            description: 'File monthly summary return and pay GST by 20th',
            frequency: 'monthly',
            penalty: 'Late fee ₹50/day + 18% interest on unpaid tax',
            helpText: 'GSTR-3B is your monthly summary return where you pay your GST liability. Due by 20th of next month.'
        }
    },
    // Income Tax Rules
    {
        id: 'ITR_INDIVIDUAL',
        name: 'Income Tax Return Filing',
        condition: (_p) => true, // Everyone needs to file ITR
        obligation: {
            name: 'Income Tax Return (ITR)',
            type: 'INCOME_TAX',
            description: 'File annual income tax return by July 31st',
            frequency: 'annual',
            penalty: 'Late fee up to ₹5,000 + interest on unpaid tax',
            helpText: 'File ITR-3 (business income) or ITR-4 (presumptive taxation) by July 31st. Use presumptive taxation (44AD/44ADA) for simpler compliance if eligible.'
        }
    },
    {
        id: 'ADVANCE_TAX_Q1',
        name: 'Advance Tax Q1',
        condition: (p) => p.turnover !== 'below_20L',
        obligation: {
            name: 'Advance Tax - Q1',
            type: 'INCOME_TAX',
            description: 'Pay 15% of estimated annual tax by June 15',
            frequency: 'quarterly',
            penalty: 'Interest under section 234B and 234C',
            helpText: 'If your tax liability exceeds ₹10,000/year, pay advance tax quarterly. Q1 (15% of tax) is due by June 15.'
        }
    },
    {
        id: 'ADVANCE_TAX_Q2',
        name: 'Advance Tax Q2',
        condition: (p) => p.turnover !== 'below_20L',
        obligation: {
            name: 'Advance Tax - Q2',
            type: 'INCOME_TAX',
            description: 'Pay 45% of estimated annual tax by September 15',
            frequency: 'quarterly',
            penalty: 'Interest under section 234B and 234C',
            helpText: 'Second installment of advance tax. Pay cumulative 45% of annual tax liability by September 15.'
        }
    },
    {
        id: 'ADVANCE_TAX_Q3',
        name: 'Advance Tax Q3',
        condition: (p) => p.turnover !== 'below_20L',
        obligation: {
            name: 'Advance Tax - Q3',
            type: 'INCOME_TAX',
            description: 'Pay 75% of estimated annual tax by December 15',
            frequency: 'quarterly',
            penalty: 'Interest under section 234B and 234C',
            helpText: 'Third installment of advance tax. Pay cumulative 75% of annual tax liability by December 15.'
        }
    },
    {
        id: 'ADVANCE_TAX_Q4',
        name: 'Advance Tax Q4',
        condition: (p) => p.turnover !== 'below_20L',
        obligation: {
            name: 'Advance Tax - Q4',
            type: 'INCOME_TAX',
            description: 'Pay 100% of estimated annual tax by March 15',
            frequency: 'quarterly',
            penalty: 'Interest under section 234B and 234C',
            helpText: 'Final installment of advance tax. Pay remaining tax liability by March 15 to avoid interest.'
        }
    },
    // TDS Rules
    {
        id: 'TDS_194C',
        name: 'TDS on Contractor Payments',
        condition: (p) => p.turnover === 'above_1Cr',
        obligation: {
            name: 'TDS on Contractors (194C)',
            type: 'TDS',
            description: 'Deduct TDS on contractor payments exceeding ₹30,000',
            frequency: 'monthly',
            penalty: 'Disallowance of expense + interest',
            helpText: 'If you pay contractors more than ₹30,000 in a single transaction or ₹1 lakh/year, deduct TDS at 1% (individuals) or 2% (others).'
        }
    },
    {
        id: 'TDS_RETURN',
        name: 'Quarterly TDS Return',
        condition: (p) => p.turnover === 'above_1Cr',
        obligation: {
            name: 'TDS Return (Form 26Q)',
            type: 'TDS',
            description: 'File quarterly TDS return by end of following month',
            frequency: 'quarterly',
            penalty: 'Late fee ₹200/day + penalty up to tax amount',
            helpText: 'File TDS return quarterly. Q1 by July 31, Q2 by Oct 31, Q3 by Jan 31, Q4 by May 31.'
        }
    }
];

// Function to evaluate rules and get applicable obligations
export function getApplicableObligations(profile: BusinessProfile): ComplianceObligation[] {
    const obligations: ComplianceObligation[] = [];

    for (const rule of COMPLIANCE_RULES) {
        if (rule.condition(profile)) {
            obligations.push({
                id: rule.id,
                ...rule.obligation,
                applicableRules: [rule.id]
            });
        }
    }

    return obligations;
}

// Get compliance summary for a profile
export function getComplianceSummary(profile: BusinessProfile): {
    totalObligations: number;
    gstObligations: number;
    itObligations: number;
    tdsObligations: number;
    needsGSTRegistration: boolean;
} {
    const obligations = getApplicableObligations(profile);

    return {
        totalObligations: obligations.length,
        gstObligations: obligations.filter(o => o.type === 'GST').length,
        itObligations: obligations.filter(o => o.type === 'INCOME_TAX').length,
        tdsObligations: obligations.filter(o => o.type === 'TDS').length,
        needsGSTRegistration: obligations.some(o => o.id === 'GST_REG_20L')
    };
}
