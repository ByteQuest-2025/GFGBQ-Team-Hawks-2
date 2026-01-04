import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { auth, db } from './firebase';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import type { BusinessProfile, ComplianceObligation, Deadline, RiskAlert } from '../types';
import { getApplicableObligations } from './rules';
import { generateDeadlines } from './deadlines';
import { generateAlerts } from './alerts';

interface StoreState {
    profile: BusinessProfile | null;
    obligations: ComplianceObligation[];
    deadlines: Deadline[];
    alerts: RiskAlert[];
    isOnboarded: boolean;
}

interface StoreContextType extends StoreState {
    setProfile: (profile: BusinessProfile) => Promise<void>;
    updateProfile: (updates: Partial<BusinessProfile>) => Promise<void>;
    clearProfile: () => void;
    markDeadlineComplete: (deadlineId: string) => void;
    refreshData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);
const STORAGE_KEY = 'tax-copilot-profile';

export function StoreProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<StoreState>({
        profile: null,
        obligations: [],
        deadlines: [],
        alerts: [],
        isOnboarded: false
    });

    // Stable function to calculate derived data and update local state
    const syncLocalState = useCallback((profile: BusinessProfile) => {
        const obligations = getApplicableObligations(profile);
        const deadlines = generateDeadlines(obligations);
        const alerts = generateAlerts(deadlines);

        setState(prev => {
            // Guard against infinite loops: Only update if data actually changed
            if (JSON.stringify(prev.profile) === JSON.stringify(profile) && prev.isOnboarded) {
                return prev;
            }
            return {
                ...prev,
                profile,
                obligations,
                deadlines,
                alerts,
                isOnboarded: true
            };
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }, []);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const profile = JSON.parse(saved) as BusinessProfile;
                if (profile.createdAt) profile.createdAt = new Date(profile.createdAt);
                syncLocalState(profile);
            } catch (e) {
                console.error('Failed to load saved profile:', e);
            }
        }
    }, [syncLocalState]);

    // NEW: Function to sync with Firebase Cloud
    const syncWithFirebase = async (profile: BusinessProfile) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            // 1. Update Firebase Auth (Only name, skip photo if it's too long)
            await firebaseUpdateProfile(user, {
                displayName: profile.name,
                // We only send the photo to Auth if it's a short link. 
                // If it's a long base64 string, we set it to null here to avoid the error.
                photoURL: profile.photoURL && profile.photoURL.length < 2000
                    ? profile.photoURL
                    : user.photoURL
            });

            // 2. Update Firestore (Everything fits here!)
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                ...profile,
                name: profile.name, // Ensure 'name' is saved correctly
                updatedAt: new Date().toISOString()
            }, { merge: true });

            console.log("✅ Firebase sync successful for:", profile.name);
        } catch (error) {
            console.error("❌ Firebase Sync Error:", error);
        }
    };

    // Change 1: Updated setProfile to be more direct
    const setProfile = useCallback(async (profile: BusinessProfile) => {
        console.log("Setting Profile to Firebase:", profile.name);
        syncLocalState(profile);
        await syncWithFirebase(profile);
    }, [syncLocalState]);

    // Change 2: Better updateProfile that doesn't rely on outside state
    const updateProfile = useCallback(async (updates: Partial<BusinessProfile>) => {
        setState(current => {
            if (current.profile) {
                const updatedProfile = { ...current.profile, ...updates };

                // We trigger the sync separately to ensure we have the new data
                syncLocalState(updatedProfile);
                syncWithFirebase(updatedProfile); // This will run with "Anita"

                return { ...current, profile: updatedProfile };
            }
            return current;
        });
    }, [syncLocalState]);

    const clearProfile = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setState({
            profile: null,
            obligations: [],
            deadlines: [],
            alerts: [],
            isOnboarded: false
        });
    }, []);

    const markDeadlineComplete = useCallback((deadlineId: string) => {
        setState(prev => ({
            ...prev,
            deadlines: prev.deadlines.map(d =>
                d.id === deadlineId ? { ...d, status: 'completed' as const } : d
            ),
            alerts: prev.alerts.filter(a => a.deadlineId !== deadlineId)
        }));
    }, []);

    const refreshData = useCallback(() => {
        if (state.profile) {
            syncLocalState(state.profile);
        }
    }, [state.profile, syncLocalState]);

    // Memoize context value to prevent unnecessary re-renders in children
    const contextValue = useMemo(() => ({
        ...state,
        setProfile,
        updateProfile,
        clearProfile,
        markDeadlineComplete,
        refreshData
    }), [state, setProfile, updateProfile, clearProfile, markDeadlineComplete, refreshData]);

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}