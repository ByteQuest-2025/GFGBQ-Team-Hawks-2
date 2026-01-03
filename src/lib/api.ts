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
     * OBLIGATIONS - Get user compliance obligations
     */
    async getObligations(uid: string) {
        const response = await fetch(`${API_URL}/obligations?uid=${uid}`);
        if (!response.ok) throw new Error('Failed to fetch obligations');
        return response.json();
    },

    /**
     * OBLIGATIONS - Refresh obligations based on profile
     */
    async refreshObligations(uid: string, profile: any) {
        const response = await fetch(`${API_URL}/obligations/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, profile })
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
     * TOOLS - GST Registration Check
     */
    async checkGSTRequirement(turnover: number, isInterstate: boolean) {
        const response = await fetch(`${API_URL}/tools/gst-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ turnover, isInterstate })
        });
        if (!response.ok) throw new Error('Failed to check GST requirement');
        return response.json();
    },

    /**
     * TOOLS - TDS Monitor (Section 194O)
     */
    async checkTDS(monthlySales: number) {
        const response = await fetch(`${API_URL}/tools/tds-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ monthlySales })
        });
        if (!response.ok) throw new Error('Failed to check TDS');
        return response.json();
    },

    /**
     * DOCUMENTS - Analyze document with Gemini Vision
     */
    async analyzeDocument(imageBase64: string) {
        const response = await fetch(`${API_URL}/documents/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64 })
        });
        if (!response.ok) throw new Error('Failed to analyze document');
        return response.json();
    },

    /**
     * INTEGRATIONS - Analyze Google Sheet Expenses with AI
     */
    async analyzeExpensesFromSheet(spreadsheetId?: string) {
        const response = await fetch(`${API_URL}/integrations/analyze-sheet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spreadsheetId })
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
    }
};
