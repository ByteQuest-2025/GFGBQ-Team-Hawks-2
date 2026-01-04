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
            photoURL: user.photoURL
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
    },

    // ==========================================================================
    // MCP (TaxAlly) Tools
    // ==========================================================================

    /**
     * MCP - Get available tools
     */
    async getMCPTools() {
        const response = await fetch(`${API_URL}/mcp/tools`);
        if (!response.ok) throw new Error('Failed to fetch MCP tools');
        return response.json();
    },

    /**
     * MCP - Execute a tool
     */
    async executeMCPTool(toolName: string, params: Record<string, any>) {
        const response = await fetch(`${API_URL}/mcp/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tool: toolName, params })
        });
        if (!response.ok) throw new Error('Failed to execute MCP tool');
        return response.json();
    },

    /**
     * MCP - Calculate income tax with regime comparison
     */
    async calculateIncomeTax(income: number, deductions?: { d80c?: number; d80d?: number; hra?: number; other?: number }) {
        const response = await fetch(`${API_URL}/mcp/calculate-tax`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                income,
                deductions_80c: deductions?.d80c,
                deductions_80d: deductions?.d80d,
                hra_exemption: deductions?.hra,
                other_deductions: deductions?.other
            })
        });
        if (!response.ok) throw new Error('Failed to calculate tax');
        return response.json();
    },

    /**
     * MCP - Check GST compliance
     */
    async checkGSTCompliance(turnover: number, isService: boolean, state: string, interState?: boolean) {
        const response = await fetch(`${API_URL}/mcp/check-gst`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                turnover,
                is_service_provider: isService,
                state,
                inter_state_sales: interState
            })
        });
        if (!response.ok) throw new Error('Failed to check GST');
        return response.json();
    },

    /**
     * MCP - Get tax deadlines
     */
    async getTaxDeadlines(profileType: 'individual' | 'business', hasGST: boolean) {
        const response = await fetch(`${API_URL}/mcp/deadlines?profile_type=${profileType}&has_gst=${hasGST}`);
        if (!response.ok) throw new Error('Failed to fetch deadlines');
        return response.json();
    },

    /**
     * MCP - Check presumptive taxation (44AD/44ADA)
     */
    async checkPresumptiveTax(grossReceipts: number, businessType: 'professional' | 'trader' | 'manufacturer', digitalPercentage?: number) {
        const response = await fetch(`${API_URL}/mcp/presumptive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gross_receipts: grossReceipts,
                business_type: businessType,
                digital_turnover_percentage: digitalPercentage
            })
        });
        if (!response.ok) throw new Error('Failed to check presumptive tax');
        return response.json();
    },

    /**
     * MCP - Categorize transaction
     */
    async categorizeTransaction(description: string, amount: number, type: 'credit' | 'debit') {
        const response = await fetch(`${API_URL}/mcp/categorize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, amount, type })
        });
        if (!response.ok) throw new Error('Failed to categorize transaction');
        return response.json();
    },

    // ==========================================================================
    // Tax Document Parsing
    // ==========================================================================

    /**
     * DOCUMENTS - Parse Indian tax document (Form 16, 26AS, etc.)
     */
    async parseTaxDocument(fileBase64: string, mimeType: string, docType?: string) {
        const response = await fetch(`${API_URL}/documents/parse-tax`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileBase64, mimeType, docType })
        });
        if (!response.ok) throw new Error('Failed to parse tax document');
        return response.json();
    },

    /**
     * DOCUMENTS - Parse bank statement with categorization
     */
    async parseBankStatement(fileBase64: string, mimeType?: string) {
        const response = await fetch(`${API_URL}/documents/parse-bank-statement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileBase64, mimeType: mimeType || 'application/pdf' })
        });
        if (!response.ok) throw new Error('Failed to parse bank statement');
        return response.json();
    },

    // ==========================================================================
    // TaxAlly HuggingFace Server (Local LLM)
    // ==========================================================================

    /**
     * TAXALLY - Check if TaxAlly HuggingFace server is running
     */
    async checkTaxAllyServer() {
        const response = await fetch(`${API_URL}/taxally/health`);
        if (!response.ok) throw new Error('Failed to check TaxAlly server');
        return response.json();
    },

    /**
     * TAXALLY - Chat directly with TaxAlly HuggingFace agent
     */
    async chatWithTaxAlly(message: string, sessionId?: string, profile?: any) {
        const response = await fetch(`${API_URL}/taxally/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, session_id: sessionId, profile })
        });
        if (!response.ok) throw new Error('TaxAlly server unavailable');
        return response.json();
    },

    /**
     * TAXALLY - Get TaxAlly tools
     */
    async getTaxAllyTools() {
        const response = await fetch(`${API_URL}/taxally/tools`);
        if (!response.ok) throw new Error('Failed to get TaxAlly tools');
        return response.json();
    },

    /**
     * TAXALLY - Execute TaxAlly tool
     */
    async executeTaxAllyTool(tool: string, params: Record<string, any>) {
        const response = await fetch(`${API_URL}/taxally/tools/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tool, params })
        });
        if (!response.ok) throw new Error('Failed to execute TaxAlly tool');
        return response.json();
    },

    // ==========================================================================
    // Google Calendar Integration
    // ==========================================================================

    /**
     * CALENDAR - Sync Event to Google Calendar
     */
    async syncToCalendar(googleAccessToken: string, firebaseAuthToken: string, event: { summary: string; description?: string; startTime: string; endTime?: string }) {
        const response = await fetch(`${API_URL}/calendar/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${firebaseAuthToken}`
            },
            body: JSON.stringify({ googleAccessToken, event })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Calendar Sync Failed: ${response.status} ${errorData.error || response.statusText}`);
        }
        return response.json();
    },

    /**
     * CALENDAR - List Events
     */
    async listCalendarEvents(googleAccessToken: string, firebaseAuthToken: string) {
        const response = await fetch(`${API_URL}/calendar/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${firebaseAuthToken}`
            },
            body: JSON.stringify({ googleAccessToken })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Calendar List Failed: ${response.status} ${errorData.error || response.statusText}`);
        }
        return response.json();
    }
};
