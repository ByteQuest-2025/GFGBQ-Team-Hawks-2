import { BusinessProfile, ComplianceObligation } from '../types/shared';

// Rule definition type
interface ComplianceRule {
    id: string;
    name: string;
    condition: (profile: BusinessProfile) => boolean;
    obligation: Omit<ComplianceObligation, 'id' | 'applicableRules'>;
}

// Server-side Compliance Rules (Same as frontend, but running securely)
export const COMPLIANCE_RULES: ComplianceRule[] = [
    {
        id: 'GST_REG_20L',
        name: 'GST Registration Threshold',
        condition: (p) => p.turnover !== 'below_20L' && !p.hasGST,
        obligation: {
            name: 'GST Registration',
            type: 'GST',
            description: 'Register for GST as turnover > ₹20 Lakhs',
            frequency: 'one_time',
            penalty: 'Late fee ₹200/day',
            helpText: 'Mandatory GST registration.'
        }
    },
    {
        id: 'ITR_INDIVIDUAL',
        name: 'Income Tax Return Filing',
        condition: (_p) => true,
        obligation: {
            name: 'Income Tax Return (ITR)',
            type: 'INCOME_TAX',
            description: 'File annual ITR by July 31st',
            frequency: 'annual',
            penalty: 'Up to ₹5,000 late fee',
            helpText: 'File ITR-3 or ITR-4.'
        }
    }
    // ... (Full list from frontend can be pasted here)
];

export function evaluateObligations(profile: BusinessProfile): ComplianceObligation[] {
    const obligations: ComplianceObligation[] = [];

    for (const rule of COMPLIANCE_RULES) {
        if (rule.condition(profile)) {
            obligations.push({
                id: `obl_${rule.id}_${Date.now()}`, // Temporary ID logic
                ...rule.obligation,
                applicableRules: [rule.id],
                status: 'PENDING',
                dueDate: new Date(new Date().setDate(new Date().getDate() + 30)) // Mock due date logic
            });
        }
    }
    return obligations;
}
