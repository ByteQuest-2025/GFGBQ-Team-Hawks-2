import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { BusinessProfile, ComplianceObligation, Deadline, RiskAlert } from '../types';
import { getApplicableObligations } from './rules';
import { generateDeadlines } from './deadlines';
import { generateAlerts } from './alerts';

// Store state type
interface StoreState {
    profile: BusinessProfile | null;
    obligations: ComplianceObligation[];
    deadlines: Deadline[];
    alerts: RiskAlert[];
    isOnboarded: boolean;
}

// Store context type
interface StoreContextType extends StoreState {
    setProfile: (profile: BusinessProfile) => void;
    updateProfile: (updates: Partial<BusinessProfile>) => void;
    clearProfile: () => void;
    markDeadlineComplete: (deadlineId: string) => void;
    refreshData: () => void;
}

// Create context
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Local storage key
const STORAGE_KEY = 'tax-copilot-profile';

// Provider component
export function StoreProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<StoreState>({
        profile: null,
        obligations: [],
        deadlines: [],
        alerts: [],
        isOnboarded: false
    });

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const profile = JSON.parse(saved) as BusinessProfile;
                profile.createdAt = new Date(profile.createdAt);
                processProfile(profile);
            } catch (e) {
                console.error('Failed to load saved profile:', e);
            }
        }
    }, []);

    // Process profile and generate obligations, deadlines, alerts
    const processProfile = (profile: BusinessProfile) => {
        const obligations = getApplicableObligations(profile);
        const deadlines = generateDeadlines(obligations);
        const alerts = generateAlerts(deadlines);

        setState(prev => ({
            ...prev,
            profile,
            obligations,
            deadlines,
            alerts,
            isOnboarded: true
        }));

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    };

    // Set new profile
    const setProfile = (profile: BusinessProfile) => {
        processProfile(profile);
    };

    // Update existing profile
    const updateProfile = (updates: Partial<BusinessProfile>) => {
        if (state.profile) {
            const updated = { ...state.profile, ...updates };
            processProfile(updated);
        }
    };

    // Clear profile
    const clearProfile = () => {
        localStorage.removeItem(STORAGE_KEY);
        setState({
            profile: null,
            obligations: [],
            deadlines: [],
            alerts: [],
            isOnboarded: false
        });
    };

    // Mark deadline as complete
    const markDeadlineComplete = (deadlineId: string) => {
        setState(prev => ({
            ...prev,
            deadlines: prev.deadlines.map(d =>
                d.id === deadlineId ? { ...d, status: 'completed' as const } : d
            ),
            alerts: prev.alerts.filter(a => a.deadlineId !== deadlineId)
        }));
    };

    // Refresh all computed data
    const refreshData = () => {
        if (state.profile) {
            processProfile(state.profile);
        }
    };



    return (
        <StoreContext.Provider
            value={{
                ...state,
                setProfile,
                updateProfile,
                clearProfile,
                markDeadlineComplete,
                refreshData
            }}
        >
            {children}
        </StoreContext.Provider>
    );
}

// Hook to use store
export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}
