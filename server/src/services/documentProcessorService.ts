import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_FOR_DOCS || process.env.GEMINI_API_KEY; // Fallback to main key if specific one not set
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Use a model that supports vision/multimodal input
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

export type DocumentType = 'BANK_STATEMENT' | 'INVOICE' | 'INVESTMENT_PROOF';

export const DocumentProcessorService = {
    /**
     * Analyze a document using Gemini Vision
     * @param fileBase64 Base64 string of the file (image or pdf)
     * @param mimeType Mime type (image/jpeg, image/png, application/pdf)
     * @param docType Type of document to process
     */
    async processDocument(fileBase64: string, mimeType: string, docType: DocumentType) {
        if (!model) {
            console.warn('⚠️ Gemini API Key missing - returning mock extraction');
            return this.getMockData(docType);
        }

        const propmt = this.getPromptForType(docType);

        // Construct the image part
        const imagePart: Part = {
            inlineData: {
                data: fileBase64,
                mimeType: mimeType
            }
        };

        try {
            const result = await model.generateContent([propmt, imagePart]);
            const response = result.response;
            const text = response.text();

            // Attempt to clean and parse JSON
            const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Document Processing Error:', error);
            throw new Error('Failed to process document');
        }
    },

    getPromptForType(docType: DocumentType): string {
        switch (docType) {
            case 'BANK_STATEMENT':
                return `
          Analyze this bank statement image/PDF.
          Extract a list of transactions.
          Return ONLY a valid JSON object with this structure:
          {
            "accountNumber": "string",
            "period": "string",
            "transactions": [
              { "date": "YYYY-MM-DD", "description": "string", "amount": number, "type": "CREDIT" | "DEBIT", "category": "BUSINESS" | "PERSONAL" | "UNKNOWN" }
            ],
            "summary": { "totalCredits": number, "totalDebits": number }
          }
          Infer 'category' based on description (e.g., 'UPI' or 'Vendor' -> BUSINESS, 'Movie' -> PERSONAL).
        `;
            case 'INVOICE':
                return `
          Analyze this invoice image/PDF.
          Extract key details.
          Return ONLY a valid JSON object with this structure:
          {
            "invoiceNumber": "string",
            "date": "YYYY-MM-DD",
            "vendorName": "string",
            "gstin": "string",
            "items": [ { "description": "string", "amount": number, "hsn": "string" } ],
            "totalAmount": number,
            "taxAmount": number
          }
        `;
            case 'INVESTMENT_PROOF':
                return `
          Analyze this investment proof document (e.g., LIC receipt, PPF, ELSS).
          Return ONLY a valid JSON object with this structure:
          {
            "type": "string (e.g., LIC, PPF)",
            "amount": number,
            "date": "YYYY-MM-DD",
            "eligibleSection": "string (e.g., 80C, 80D)"
          }
        `;
            default:
                return 'Analyze this document and return JSON summary.';
        }
    },

    getMockData(docType: DocumentType) {
        if (docType === 'INVOICE') {
            return {
                invoiceNumber: "INV-2024-001",
                date: "2024-01-15",
                vendorName: "Mock Vendor Enterprises",
                gstin: "27ABCDE1234F1Z5",
                totalAmount: 25000,
                taxAmount: 4500
            };
        }
        return { error: "Mock data not implemented for this type" };
    }
};
