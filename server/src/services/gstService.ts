
export const GSTService = {
    /**
     * Determine Registration Requirement based on Turnover & Location
     * @param turnover Aggregate Annual Turnover
     * @param isServiceProvider True if providing services (vs goods)
     * @param state State of operation
     */
    checkRegistrationRequirement(turnover: number, isServiceProvider: boolean, state: string) {
        const SPECIAL_CATEGORY_STATES = ['Manipur', 'Mizoram', 'Nagaland', 'Tripura']; // and others
        const isSpecialState = SPECIAL_CATEGORY_STATES.includes(state);

        let threshold = 0;
        if (isServiceProvider) {
            threshold = isSpecialState ? 10_00_000 : 20_00_000;
        } else {
            threshold = isSpecialState ? 20_00_000 : 40_00_000;
        }

        // New 2025 rule logic can be added here

        return {
            required: turnover > threshold,
            threshold,
            limitDescription: `₹${threshold / 100000} Lakhs (${isSpecialState ? 'Special Category' : 'Standard'})`
        };
    },

    /**
     * Get E-Way Bill Threshold for a specific state
     * @param state Origin State
     * @param movementType 'intra-state' | 'inter-state'
     */
    getEWayBillLimit(state: string, movementType: 'intra-state' | 'inter-state') {
        if (movementType === 'inter-state') return 50000; // Central limit

        const stateLimits: Record<string, number> = {
            'Maharashtra': 100000,
            'Delhi': 100000,
            'Rajasthan': 100000, // Simplified for intra-state
            'Tamil Nadu': 100000,
            'West Bengal': 100000
        };

        return stateLimits[state] || 50000; // Default to Central limit
    }
};
