
// Re-defining (or importing) types to avoid relative import issues across project roots
export type BusinessType = 'freelancer' | 'gig_worker' | 'micro_trader' | 'small_retailer';
export type TurnoverRange = 'below_20L' | '20L_to_1Cr' | 'above_1Cr';

export interface BusinessProfile {
    id: string;
    name: string;
    ownerName: string;
    type: BusinessType;
    turnover: TurnoverRange;
    state: string;
    hasGST: boolean;
    gstNumber?: string;
    panNumber: string;
    panNumber: string;
    email: string;
    photoURL?: string;
    createdAt: Date;
}

export type ObligationType = 'GST' | 'INCOME_TAX' | 'TDS' | 'ROC' | 'OTHER';
export type FrequencyType = 'monthly' | 'quarterly' | 'annual' | 'one_time';

export interface ComplianceObligation {
    id: string;
    name: string;
    type: ObligationType;
    description: string;
    frequency: FrequencyType;
    applicableRules: string[];
    penalty?: string;
    helpText: string;
    status?: 'PENDING' | 'COMPLETED' | 'OVERDUE';
    dueDate?: Date;
}
