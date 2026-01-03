import { BusinessProfile } from '../types/shared';

export const TaxCalculatorService = {
    /**
     * Calculate Presumptive Income under Section 44AD (Traders/Manufacturers)
     * @param turnover Total turnover
     * @param digitalTurnover Turnover received via digital modes (Bank, UPI, etc.)
     */
    calculate44ADIncome(turnover: number, digitalTurnover: number) {
        const cashTurnover = turnover - digitalTurnover;
        const deemedIncome = (digitalTurnover * 0.06) + (cashTurnover * 0.08);
        return {
            section: '44AD',
            deemedIncome,
            explanation: `6% on digital turnover (₹${digitalTurnover}) + 8% on cash turnover (₹${cashTurnover})`
        };
    },

    /**
     * Calculate Presumptive Income under Section 44ADA (Professionals)
     * @param grossReceipts Total professional receipts
     */
    calculate44ADAIncome(grossReceipts: number) {
        const deemedIncome = grossReceipts * 0.50;
        return {
            section: '44ADA',
            deemedIncome,
            explanation: `50% of gross receipts (₹${grossReceipts})`
        };
    },

    /**
     * Check for Advance Tax liability and Section 234C interest
     * @param estimatedTax Estimated tax liability for the year
     * @param paidTax Tax already paid (TDS + Advance Tax)
     * @param currentDate Date to check against deadlines
     */
    checkAdvanceTaxStatus(estimatedTax: number, paidTax: number, currentDate: Date = new Date()) {
        if (estimatedTax < 10000) {
            return { status: 'EXEMPT', message: 'Advance tax not applicable (Liability < ₹10k)' };
        }

        const month = currentDate.getMonth(); // 0-indexed (0=Jan, ..., 2=March, ..., 5=June)
        // Adjusting for Financial Year cycle (Apr-Mar)
        // June 15 (15%), Sep 15 (45%), Dec 15 (75%), Mar 15 (100%)

        // Simple check for March 15th deadline (most critical for Presumptive)
        // Note: JS Month is 0-indexed. March is 2.
        const isMarch15Passed = month > 2 || (month === 2 && currentDate.getDate() > 15);

        if (isMarch15Passed && paidTax < estimatedTax) {
            const shortfall = estimatedTax - paidTax;
            const interest234C = shortfall * 0.01; // 1% per month for 1 month
            return {
                status: 'OVERDUE',
                shortfall,
                interestWarning: `Potential §234C interest: ~₹${interest234C.toFixed(2)} (1% for 1 month)`,
                action: 'Pay immediately to stop §234B interest.'
            };
        }

        return { status: 'ON_TRACK', message: 'Next deadline: March 15th (100% due)' };
    }
};
