import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { BusinessProfile } from '../types/shared';
import { COMPLIANCE_KNOWLEDGE, SYSTEM_PROMPT_ADDENDUM } from '../data/complianceKnowledge';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

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

export const CopilotService = {
    async chat(message: string, profile: BusinessProfile, obligations: any[]) {
        if (!model) {
            console.warn('⚠️ Gemini API Key missing - returning mock response');
            return {
                response: `[MOCK CA] Based on Section 44ADA, as a freelancer, you can declare 50% of your ₹${profile.turnover} turnover as income. (Configure GEMINI_API_KEY for real advice)`
            };
        }

        // ⚡ OPTIMIZATION: Only load knowledge relevant to the question
        const relevantKnowledge = getRelevantContext(message);

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
      
      **USER QUERY:** "${message}"

      **RESPONSE GUIDELINES:**
      - Be precise but accessible.
      - Structure: Direct Answer -> Legal Ref -> Action.
    `;

        try {
            const result = await model.generateContent(systemPrompt);
            const response = result.response;
            return { response: response.text() };
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error('AI Service Unavailable');
        }
    }
};
