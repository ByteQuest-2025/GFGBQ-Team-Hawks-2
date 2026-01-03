import type { User } from 'firebase/auth';

const API_URL = 'http://localhost:3001/api/v1';

export const api = {
    /**
     * AUTH - Sync Firebase User with Backend
     */
    async syncUser(user: User) {
        const token = await user.getIdToken();
        const userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'User',
            photoURL: user.photoURL,
            businessType: 'freelancer'
        };

        const response = await fetch(`${API_URL}/auth/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error('Failed to sync user');
        return response.json();
    },

    /**
     * COMPLIANCE - Get user obligations
     */
    async getObligations(uid: string) {
        const response = await fetch(`${API_URL}/obligations/${uid}`);
        if (!response.ok) throw new Error('Failed to fetch obligations');
        return response.json();
    },

    /**
     * COMPLIANCE - Refresh obligations based on profile
     */
    async refreshObligations(uid: string, profile: any) {
        const response = await fetch(`${API_URL}/obligations/${uid}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        if (!response.ok) throw new Error('Failed to refresh obligations');
        return response.json();
    },

    /**
     * COPILOT - Chat with AI assistant
     */
    async chatWithCopilot(message: string, userId: string, history?: any[]) {
        const response = await fetch(`${API_URL}/copilot/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, message, history })
        });
        if (!response.ok) throw new Error('Failed to chat with copilot');
        return response.json();
    },

    /**
     * TOOLS - Tax Calculator (Section 44AD/44ADA)
     */
    async calculateTax(turnover: number, businessType: 'professional' | 'business') {
        const response = await fetch(`${API_URL}/tools/calculate-tax`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ turnover, businessType })
        });
        if (!response.ok) throw new Error('Failed to calculate tax');
        return response.json();
    },

    /**
     * TOOLS - Check GST Requirement
     */
    async checkGSTRequirement(turnover: number, state: string) {
        const response = await fetch(`${API_URL}/tools/gst-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ turnover, state })
        });
        if (!response.ok) throw new Error('Failed to check GST requirement');
        return response.json();
    },

    /**
     * DOCUMENTS - Analyze document with Gemini Vision
     */
    async analyzeDocument(base64Image: string) {
        const response = await fetch(`${API_URL}/documents/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Image })
        });
        if (!response.ok) throw new Error('Failed to analyze document');
        return response.json();
    },

    /**
     * INTEGRATIONS - Analyze Expenses from Google Sheet
     */
    async analyzeExpensesFromSheet() {
        const response = await fetch(`${API_URL}/integrations/analyze-sheet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ useMockData: true })
        });
        if (!response.ok) throw new Error('Failed to analyze expenses');
        return response.json();
    },

    /**
     * NOTIFICATIONS - Send deadline alert
     */
    async sendDeadlineAlert(email: string, deadlineName: string, dueDate: string) {
        const response = await fetch(`${API_URL}/notifications/send-alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, deadlineName, dueDate })
        });
        if (!response.ok) throw new Error('Failed to send alert');
        return response.json();
    },

    /**
     * USERS - Profile Management
     */
    async getUserProfile(userId: string) {
        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user profile');
        return response.json();
    },

    async updateUserProfile(userId: string, data: any) {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update user profile');
        return response.json();
    }
};
