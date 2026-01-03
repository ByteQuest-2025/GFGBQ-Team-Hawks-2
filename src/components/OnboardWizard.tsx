import { useState } from 'react';
import { useStore } from '../lib/store';
import type { BusinessProfile, BusinessType, TurnoverRange } from '../types';
import { INDIAN_STATES, BUSINESS_TYPE_LABELS, TURNOVER_LABELS } from '../types';
import './OnboardWizard.css';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export function OnboardWizard() {
    const { setProfile } = useStore();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        email: '',
        type: '' as BusinessType | '',
        turnover: '' as TurnoverRange | '',
        state: '',
        hasGST: false,
        gstNumber: '',
        panNumber: ''
    });

    const totalSteps = 3;

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.name && formData.ownerName && formData.email;
            case 2:
                return formData.type && formData.turnover && formData.state;
            case 3:
                return formData.panNumber && (!formData.hasGST || formData.gstNumber);
            default:
                return false;
        }
    };

    const handleSubmit = () => {
        const profile: BusinessProfile = {
            id: generateId(),
            name: formData.name,
            ownerName: formData.ownerName,
            email: formData.email,
            type: formData.type as BusinessType,
            turnover: formData.turnover as TurnoverRange,
            state: formData.state,
            hasGST: formData.hasGST,
            gstNumber: formData.hasGST ? formData.gstNumber : undefined,
            panNumber: formData.panNumber,
            createdAt: new Date()
        };
        setProfile(profile);
    };

    return (
        <div className="wizard-container">
            <div className="wizard-card animate-slide-up">
                {/* Header */}
                <div className="wizard-header">
                    <div className="wizard-logo">
                        <span className="logo-icon">🛡️</span>
                        <span className="logo-text">TaxCopilot</span>
                    </div>
                    <h1>Let's get you compliant</h1>
                    <p>Answer a few questions so we can identify your tax obligations</p>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
                </div>
                <div className="step-indicator">Step {step} of {totalSteps}</div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="wizard-step animate-fade-in">
                        <h2>📋 Basic Information</h2>

                        <div className="input-group">
                            <label className="input-label">Business Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="E.g., Sharma Consulting"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Your Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="E.g., Priya Sharma"
                                value={formData.ownerName}
                                onChange={(e) => updateField('ownerName', e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="E.g., priya@email.com"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Business Details */}
                {step === 2 && (
                    <div className="wizard-step animate-fade-in">
                        <h2>🏢 Business Details</h2>

                        <div className="input-group">
                            <label className="input-label">What type of business?</label>
                            <div className="option-grid">
                                {(Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][]).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={`option-card ${formData.type === value ? 'selected' : ''}`}
                                        onClick={() => updateField('type', value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Annual Turnover (Approx)</label>
                            <div className="option-grid cols-3">
                                {(Object.entries(TURNOVER_LABELS) as [TurnoverRange, string][]).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={`option-card ${formData.turnover === value ? 'selected' : ''}`}
                                        onClick={() => updateField('turnover', value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">State</label>
                            <select
                                className="input select"
                                value={formData.state}
                                onChange={(e) => updateField('state', e.target.value)}
                            >
                                <option value="">Select your state</option>
                                {INDIAN_STATES.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 3: Tax Details */}
                {step === 3 && (
                    <div className="wizard-step animate-fade-in">
                        <h2>📑 Tax Details</h2>

                        <div className="input-group">
                            <label className="input-label">PAN Number</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="E.g., ABCDE1234F"
                                value={formData.panNumber}
                                onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())}
                                maxLength={10}
                            />
                        </div>

                        <div className="input-group">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={formData.hasGST}
                                    onChange={(e) => updateField('hasGST', e.target.checked)}
                                />
                                <span className="toggle-text">I have GST registration</span>
                            </label>
                        </div>

                        {formData.hasGST && (
                            <div className="input-group animate-fade-in">
                                <label className="input-label">GST Number</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="E.g., 27ABCDE1234F1Z5"
                                    value={formData.gstNumber}
                                    onChange={(e) => updateField('gstNumber', e.target.value.toUpperCase())}
                                    maxLength={15}
                                />
                            </div>
                        )}

                        <div className="info-box">
                            <span className="info-icon">💡</span>
                            <p>Based on your inputs, we'll identify applicable tax obligations and deadlines.</p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="wizard-actions">
                    {step > 1 && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setStep(step - 1)}
                        >
                            Back
                        </button>
                    )}

                    {step < totalSteps ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={!canProceed()}
                        >
                            🚀 Get Started
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
