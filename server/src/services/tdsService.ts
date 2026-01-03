export const TDSService = {
    /**
     * Monitor Section 194O limits for E-commerce monitoring
     * @param salesData Array of sales platforms and amounts { platform: string, amount: number }
     * @param hasPandAadhaar Boolean
     */
    check194OStatus(salesData: { platform: string, amount: number }[], hasPandAadhaar: boolean) {
        const totalSales = salesData.reduce((sum, s) => sum + s.amount, 0);
        const LIMIT = 5_00_000; // ₹5 Lakhs

        if (!hasPandAadhaar) {
            return {
                alert: 'CRITICAL',
                rate: 0.05, // 5%
                deduction: totalSales * 0.05,
                message: 'PAN/Aadhaar missing! 5% TDS applicable on ALL sales (Sec 206AA).'
            };
        }

        if (totalSales > LIMIT) {
            return {
                alert: 'WARNING',
                rate: 0.001, // 0.1%
                deduction: totalSales * 0.001,
                message: `Sales crossed ₹5L. 0.1% TDS applicable on ₹${totalSales}.`
            };
        }

        return {
            alert: 'SAFE',
            rate: 0,
            deduction: 0,
            remainingLimit: LIMIT - totalSales
        };
    }
};
