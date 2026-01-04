import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { BusinessProfile } from '../types/shared';
import { COMPLIANCE_KNOWLEDGE, SYSTEM_PROMPT_ADDENDUM } from '../data/complianceKnowledge';
import { TaxAllyToolsService } from './taxallyToolsService';
import { TaxAllyClient } from './taxallyClient';

dotenv.config();

// Configuration: Use TaxAlly HuggingFace server when available
const USE_TAXALLY_SERVER = process.env.USE_TAXALLY_SERVER !== 'false'; // Default: true

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;

/**
 * Prune knowledge base to only include relevant sections based on user query.
 * Reduces input tokens -> Faster Latency + Lower Cost.
 */
function getRelevantContext(message: string) {
    const msg = message.toLowerCase();
    const context: Partial<typeof COMPLIANCE_KNOWLEDGE> = {};

    // Simple keyword matching for MVP (Can be vector search later)
    if (msg.includes('gst') || msg.includes('tax') || msg.includes('bill') || msg.includes('invoice')) {
        context.gst = COMPLIANCE_KNOWLEDGE.gst;
    }

    if (msg.includes('income') || msg.includes('audit') || msg.includes('return') || msg.includes('itrd') || msg.includes('44ad')) {
        context.incomeTax = COMPLIANCE_KNOWLEDGE.incomeTax;
    }

    if (msg.includes('tds') || msg.includes('deduction') || msg.includes('ecommerce') || msg.includes('amazon') || msg.includes('flipkart')) {
        context.tds = COMPLIANCE_KNOWLEDGE.tds;
    }

    if (msg.includes('shop') || msg.includes('labour') || msg.includes('employee') || msg.includes('work') || msg.includes('license')) {
        context.stateLaws = COMPLIANCE_KNOWLEDGE.stateLaws;
    }

    if (msg.includes('udyam') || msg.includes('msme') || msg.includes('register') || msg.includes('micro')) {
        context.identity = COMPLIANCE_KNOWLEDGE.identity;
    }

    // Fallback: If no keywords specific, send a lightweight summary or specific sections if query is broad
    if (Object.keys(context).length === 0) {
        // If query is generic like "Help me", send Identity and GST basics
        return {
            identity: COMPLIANCE_KNOWLEDGE.identity,
            gst_basics: COMPLIANCE_KNOWLEDGE.gst.thresholds
        };
    }

    return context;
}

import { GoogleService } from './googleService';
import { CalendarService } from './calendarService';

// ... (imports)

/**
 * Detect if the user message requires a tool call and extract parameters
 */
function detectToolIntent(message: string, profile: BusinessProfile): { tool: string; params: Record<string, any> } | null {
    const msg = message.toLowerCase();

    // Tax calculation intent
    if ((msg.includes('calculate') || msg.includes('compute') || msg.includes('how much')) &&
        (msg.includes('tax') || msg.includes('income'))) {
        // Try to extract income from message
        const incomeMatch = message.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|lac|l|crore|cr|k)?/i);
        if (incomeMatch) {
            let income = parseFloat(incomeMatch[1].replace(/,/g, ''));
            const unit = incomeMatch[2]?.toLowerCase();
            if (unit === 'lakh' || unit === 'lac' || unit === 'l') income *= 100000;
            else if (unit === 'crore' || unit === 'cr') income *= 10000000;
            else if (unit === 'k') income *= 1000;

            return {
                tool: 'calculate_income_tax',
                params: {
                    income,
                    deductions_80c: msg.includes('80c') ? 150000 : 0,
                    deductions_80d: msg.includes('80d') ? 25000 : 0
                }
            };
        }
    }

    // GST check intent
    if (msg.includes('gst') && (msg.includes('need') || msg.includes('require') || msg.includes('register') || msg.includes('limit'))) {
        const turnoverMatch = message.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|lac|l|crore|cr)?/i);
        let turnover = 0;
        if (turnoverMatch) {
            turnover = parseFloat(turnoverMatch[1].replace(/,/g, ''));
            const unit = turnoverMatch[2]?.toLowerCase();
            if (unit === 'lakh' || unit === 'lac' || unit === 'l') turnover *= 100000;
            else if (unit === 'crore' || unit === 'cr') turnover *= 10000000;
        }

        return {
            tool: 'check_gst_compliance',
            params: {
                turnover: turnover || getTurnoverFromRange(profile.turnover),
                is_service_provider: profile.type === 'freelancer',
                state: profile.state
            }
        };
    }

    // Presumptive taxation intent
    if (msg.includes('44ad') || msg.includes('44ada') || msg.includes('presumptive')) {
        const receiptsMatch = message.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|lac|l|crore|cr)?/i);
        let receipts = getTurnoverFromRange(profile.turnover);
        if (receiptsMatch) {
            receipts = parseFloat(receiptsMatch[1].replace(/,/g, ''));
            const unit = receiptsMatch[2]?.toLowerCase();
            if (unit === 'lakh' || unit === 'lac' || unit === 'l') receipts *= 100000;
            else if (unit === 'crore' || unit === 'cr') receipts *= 10000000;
        }

        return {
            tool: 'check_presumptive_taxation',
            params: {
                gross_receipts: receipts,
                business_type: profile.type === 'freelancer' ? 'professional' : 'trader'
            }
        };
    }

    // Deadline intent
    if (msg.includes('deadline') || msg.includes('due date') || msg.includes('when') && msg.includes('file')) {
        return {
            tool: 'get_tax_deadlines',
            params: {
                profile_type: profile.type === 'freelancer' ? 'individual' : 'business',
                has_gst: profile.hasGST
            }
        };
    }

    // Advance tax intent
    if (msg.includes('advance tax') || (msg.includes('advance') && msg.includes('pay'))) {
        const taxMatch = message.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|lac|l|k)?/i);
        let estimatedTax = 100000; // Default
        if (taxMatch) {
            estimatedTax = parseFloat(taxMatch[1].replace(/,/g, ''));
            const unit = taxMatch[2]?.toLowerCase();
            if (unit === 'lakh' || unit === 'lac' || unit === 'l') estimatedTax *= 100000;
            else if (unit === 'k') estimatedTax *= 1000;
        }

        return {
            tool: 'check_advance_tax',
            params: { estimated_annual_tax: estimatedTax }
        };
        return {
            tool: 'check_advance_tax',
            params: { estimated_annual_tax: estimatedTax }
        };
    }

    // Calendar Request Intent
    if (msg.includes('schedule') || msg.includes('calendar') || msg.includes('remind me')) {
        return {
            tool: 'calendar_create_event',
            params: {
                summary: 'Tax Reminder', // Default, should be extracted
                description: message,
                startTime: new Date().toISOString() // Placeholder
            }
        };
    }

    return null;
}

/**
 * Convert turnover range to approximate number
 */
function getTurnoverFromRange(range: string): number {
    switch (range) {
        case 'below_20L': return 1500000; // 15 Lakh average
        case '20L_to_1Cr': return 5000000; // 50 Lakh average
        case 'above_1Cr': return 20000000; // 2 Cr average
        default: return 2000000;
    }
}

/**
 * Format tool result for LLM context
 */
function formatToolResult(toolName: string, result: any): string {
    switch (toolName) {
        case 'calculate_income_tax':
            return `
**TAX CALCULATION RESULT:**
- Old Regime Tax: ₹${result.old_regime.totalTax.toLocaleString('en-IN')} (Effective: ${result.old_regime.effectiveRate.toFixed(1)}%)
- New Regime Tax: ₹${result.new_regime.totalTax.toLocaleString('en-IN')} (Effective: ${result.new_regime.effectiveRate.toFixed(1)}%)
- Recommendation: ${result.recommendation}`;

        case 'check_gst_compliance':
            return `
**GST COMPLIANCE CHECK:**
- Registration Required: ${result.registrationRequired ? 'YES' : 'NO'}
- Threshold: ${result.limitDescription}
- Action: ${result.recommendedAction}`;

        case 'check_presumptive_taxation':
            return `
**PRESUMPTIVE TAXATION (Section ${result.section}):**
- Eligible: ${result.eligible ? 'YES' : 'NO'}
- Deemed Income: ₹${result.deemedIncome.toLocaleString('en-IN')}
- Calculation: ${result.explanation}
- Estimated Tax: ₹${result.taxOnDeemedIncome.toLocaleString('en-IN')}`;

        case 'get_tax_deadlines':
            const deadlines = result.upcoming_deadlines.slice(0, 5);
            return `
**UPCOMING DEADLINES:**
${deadlines.map((d: any) => `- ${d.name}: ${d.date} (${d.daysUntil} days) [${d.urgency}]`).join('\n')}`;

        case 'check_advance_tax':
            if (result.exempt) return `**ADVANCE TAX:** Not applicable (${result.message})`;
            return `
**ADVANCE TAX STATUS:**
- ${result.message}
- Schedule: ${result.schedule.map((s: any) => `${s.installment}: ₹${s.amount.toLocaleString('en-IN')} [${s.status}]`).join(', ')}`;

        default:
            return JSON.stringify(result, null, 2);

        case 'calendar_create_event':
            return `**CALENDAR ACTION:** I have prepared a calendar event for: "${result.summary}". Please confirm to sync it.`;
    }
}

export const CopilotService = {
    async chat(message: string, profile: BusinessProfile, obligations: any[]) {
        // 1. Try TaxAlly HuggingFace server first (if enabled and available)
        if (USE_TAXALLY_SERVER) {
            try {
                const isAvailable = await TaxAllyClient.isAvailable();
                if (isAvailable) {
                    console.log('🤖 Using TaxAlly HuggingFace server');

                    // ✅ HARDCODE: Override name and type for userId '1'
                    const displayName = profile.id === '1' ? 'Aditya' : profile.name;
                    const displayType = profile.id === '1' ? 'business' : profile.type;

                    // Convert BusinessProfile to TaxAlly format
                    const taxallyProfile = {
                        name: displayName,
                        pan: profile.panNumber,
                        entity_type: displayType,
                        gst_registered: profile.hasGST,
                        gstin: profile.gstNumber,
                        annual_turnover: getTurnoverFromRange(profile.turnover),
                        state: profile.state,
                        type: displayType,
                        turnover: profile.turnover,
                        hasGST: profile.hasGST
                    };

                    console.log('📤 Sending to TaxAlly:', { name: displayName, type: displayType, userId: profile.id });

                    const response = await TaxAllyClient.chat({
                        message,
                        user_id: profile.id,
                        profile: taxallyProfile
                    });

                    return {
                        response: response.response,
                        tool_calls: response.tool_calls,
                        suggestions: response.suggestions,
                        source: 'taxally_hf'
                    };
                }
            } catch (error) {
                console.log('TaxAlly server error, falling back to Gemini:', (error as Error).message);
            }
        }

        // 2. Detect if we should call a TaxAlly tool (local tools)
        const toolIntent = detectToolIntent(message, profile);
        let toolContext = '';
        let toolCalls: Array<{ tool: string; params: Record<string, any>; result: any }> = [];

        if (toolIntent) {
            try {
                console.log(`🔧 Executing TaxAlly tool: ${toolIntent.tool}`);
                let toolResult;

                if (toolIntent.tool === 'calendar_create_event') {
                    // Special handling for Client-Side Action
                    toolResult = toolIntent.params; // Pass params back as result
                } else {
                    toolResult = await TaxAllyToolsService.executeTool(toolIntent.tool, toolIntent.params);
                }

                toolContext = formatToolResult(toolIntent.tool, toolResult);
                toolCalls.push({
                    tool: toolIntent.tool,
                    params: toolIntent.params,
                    result: toolResult
                });
                console.log(`✅ Tool result obtained`);
            } catch (err) {
                console.error('Tool execution failed:', err);
            }
        }

        if (!model) {
            // If no LLM but we have tool result, return formatted tool output
            if (toolContext) {
                return {
                    response: `[TaxAlly Tools] ${toolContext}\n\n(Configure GEMINI_API_KEY for personalized advice)`,
                    tool_calls: toolCalls,
                    source: 'local_tools'
                };
            }
            console.warn('⚠️ Gemini API Key missing - returning mock response');
            return {
                response: `[MOCK CA] Based on Section 44ADA, as a freelancer, you can declare 50% of your ₹${profile.turnover} turnover as income. (Configure GEMINI_API_KEY for real advice)`,
                tool_calls: [],
                source: 'mock'
            };
        }

        // ⚡ OPTIMIZATION: Only load knowledge relevant to the question
        const relevantKnowledge = getRelevantContext(message);

        // 🔌 INTEGRATION: Fetch External Google Data
        let externalContext = '';

        // 1. Fetch Financials (if keywords match)
        if (profile.linkedSheetId && (message.toLowerCase().includes('expense') || message.toLowerCase().includes('spend') || message.toLowerCase().includes('profit'))) {
            try {
                const sheetData = await GoogleService.fetchSheetData(profile.linkedSheetId, 'Sheet1!A1:D50');
                externalContext += `\n**LINKED FINANCIAL DATA (Sheet):**\n${JSON.stringify(sheetData)}`;
            } catch (e) {
                console.error('Failed to fetch sheet context', e);
            }
        }

        // 2. Fetch Docs (if keywords match)
        if (profile.linkedDocId && (message.toLowerCase().includes('contract') || message.toLowerCase().includes('agreement') || message.toLowerCase().includes('notice'))) {
            try {
                const docText = await GoogleService.fetchDocContent(profile.linkedDocId);
                externalContext += `\n**LINKED DOCUMENT CONTENT (Doc):**\n"${docText.substring(0, 3000)}..."`;
            } catch (e) {
                console.error('Failed to fetch doc context', e);
            }
        }

        const systemPrompt = `
      You are a specialized "Tax & Compliance Copilot" acting as a Legal Officer and Chartered Accountant for Indian Micro-Businesses.

      ${SYSTEM_PROMPT_ADDENDUM}

      **RELEVANT LAWS (CONTEXT PRUNED):**
      ${JSON.stringify(relevantKnowledge, null, 2)}

      **USER CONTEXT:**
      - Business: ${profile.name} (${profile.type})
      - Turnover: ${profile.turnover}
      - State: ${profile.state}
      - GST: ${profile.hasGST ? 'Yes' : 'No'}

      **OBLIGATIONS:**
      ${obligations.map(o => `${o.name} (Due: ${o.dueDate})`).join(', ')}

      ${externalContext}

      ${toolContext ? `**TAXALLY TOOL CALCULATION (VERIFIED DATA - USE THIS):**${toolContext}` : ''}

      **USER QUERY:** "${message}"

      **RESPONSE GUIDELINES:**
      - Be precise but accessible.
      - Structure: Direct Answer -> Legal Ref -> Action.
      - If External Data is provided, cite it specifically (e.g., "According to your Sheet...").
      - If TaxAlly Tool data is provided, use those exact numbers in your response - they are verified calculations.
    `;

        try {
            const result = await model.generateContent(systemPrompt);
            const response = result.response;
            return {
                response: response.text(),
                tool_calls: toolCalls,
                source: toolCalls.length > 0 ? 'gemini_with_tools' : 'gemini'
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            // Fallback response for UI - prevents 500
            return {
                response: "I'm having trouble connecting to my brain right now (Gemini API Error). Please try again in a moment, or check if your API Key is valid.",
                tool_calls: toolCalls,
                source: 'error'
            };
        }
    }
};
