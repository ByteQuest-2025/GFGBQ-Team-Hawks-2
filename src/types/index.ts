// Business Profile Types
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
  email: string;
  photoURL?: string;
  createdAt: Date;
}

// Compliance Types
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
}

// Deadline Types
export type DeadlineStatus = 'upcoming' | 'due_soon' | 'overdue' | 'completed';

export interface Deadline {
  id: string;
  obligationId: string;
  obligationName: string;
  dueDate: Date;
  status: DeadlineStatus;
  description: string;
  penalty?: string;
  daysRemaining: number;
}

// Risk Alert Types
export type AlertLevel = 'info' | 'warning' | 'critical';

export interface RiskAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  deadlineId?: string;
  action: string;
  createdAt: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Indian States for dropdown
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

// Business Type Labels
export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  freelancer: 'Freelancer / Consultant',
  gig_worker: 'Gig Worker (Delivery, Ride-sharing)',
  micro_trader: 'Micro Trader / Small Vendor',
  small_retailer: 'Small Retailer / Shop Owner'
};

// Turnover Labels
export const TURNOVER_LABELS: Record<TurnoverRange, string> = {
  below_20L: 'Below ₹20 Lakhs',
  '20L_to_1Cr': '₹20 Lakhs - ₹1 Crore',
  above_1Cr: 'Above ₹1 Crore'
};
