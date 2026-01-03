/**
 * TaxAlly Client Service
 *
 * This service acts as a client to the TaxAlly Python server
 * which runs the HuggingFace LLM agent.
 *
 * The Python server should be running at TAXALLY_API_URL (default: http://localhost:8000)
 */

const TAXALLY_API_URL = process.env.TAXALLY_API_URL || 'http://localhost:8000';
const TAXALLY_TIMEOUT = parseInt(process.env.TAXALLY_TIMEOUT || '60000'); // 60 seconds for LLM

interface TaxAllyProfile {
    name?: string;
    pan?: string;
    entity_type?: string;
    gst_registered?: boolean;
    gstin?: string;
    annual_turnover?: number;
    income_sources?: string[];
    state?: string;
    type?: string;
    turnover?: string;
    hasGST?: boolean;
}

interface ChatRequest {
    message: string;
    session_id?: string;
    user_id?: string;
    profile?: TaxAllyProfile;
}

interface ChatResponse {
    response: string;
    session_id: string;
    tool_calls: Array<{
        tool: string;
        params: Record<string, any>;
        reasoning: string;
    }>;
    suggestions: string[];
    risks: Array<Record<string, any>>;
}

interface ToolExecuteRequest {
    tool: string;
    params: Record<string, any>;
}

interface ToolExecuteResponse {
    success: boolean;
    tool: string;
    result: any;
    error?: string;
}

interface HealthResponse {
    status: string;
    version: string;
    model: string;
    timestamp: string;
}

export const TaxAllyClient = {
    /**
     * Check if TaxAlly server is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${TAXALLY_API_URL}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            return response.ok;
        } catch (error) {
            console.log('TaxAlly server not available:', (error as Error).message);
            return false;
        }
    },

    /**
     * Get health status
     */
    async getHealth(): Promise<HealthResponse | null> {
        try {
            const response = await fetch(`${TAXALLY_API_URL}/health`);
            if (!response.ok) return null;
            return await response.json() as HealthResponse;
        } catch (error) {
            return null;
        }
    },

    /**
     * Chat with TaxAlly agent
     */
    async chat(request: ChatRequest): Promise<ChatResponse> {
        const response = await fetch(`${TAXALLY_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': request.user_id || 'anonymous'
            },
            body: JSON.stringify({
                message: request.message,
                session_id: request.session_id,
                user_id: request.user_id,
                profile: request.profile
            }),
            signal: AbortSignal.timeout(TAXALLY_TIMEOUT)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`TaxAlly chat failed: ${error}`);
        }

        return await response.json() as ChatResponse;
    },

    /**
     * Execute a specific tool
     */
    async executeTool(tool: string, params: Record<string, any>, userId?: string): Promise<ToolExecuteResponse> {
        const response = await fetch(`${TAXALLY_API_URL}/tools/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId || 'anonymous'
            },
            body: JSON.stringify({ tool, params }),
            signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Tool execution failed: ${error}`);
        }

        return await response.json() as ToolExecuteResponse;
    },

    /**
     * List available tools
     */
    async listTools(): Promise<{ tools: any[]; count: number }> {
        const response = await fetch(`${TAXALLY_API_URL}/tools`);

        if (!response.ok) {
            throw new Error('Failed to list tools');
        }

        return await response.json() as { tools: any[]; count: number };
    },

    /**
     * Get compliance deadlines
     */
    async getDeadlines(daysAhead: number = 30, userId?: string): Promise<any> {
        const response = await fetch(
            `${TAXALLY_API_URL}/deadlines?days_ahead=${daysAhead}`,
            {
                headers: { 'X-User-Id': userId || 'anonymous' }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get deadlines');
        }

        return await response.json();
    },

    /**
     * Run compliance check
     */
    async checkCompliance(turnover?: number, income?: number, userId?: string): Promise<any> {
        const params = new URLSearchParams();
        if (turnover) params.append('turnover', turnover.toString());
        if (income) params.append('income', income.toString());

        const response = await fetch(
            `${TAXALLY_API_URL}/compliance/check?${params.toString()}`,
            {
                headers: { 'X-User-Id': userId || 'anonymous' }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to check compliance');
        }

        return await response.json();
    },

    /**
     * Get/Update user profile
     */
    async getProfile(userId: string): Promise<any> {
        const response = await fetch(`${TAXALLY_API_URL}/profile`, {
            headers: { 'X-User-Id': userId }
        });

        if (!response.ok) {
            throw new Error('Failed to get profile');
        }

        return await response.json();
    },

    async updateProfile(userId: string, updates: Record<string, any>): Promise<any> {
        const response = await fetch(`${TAXALLY_API_URL}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        return await response.json();
    }
};
