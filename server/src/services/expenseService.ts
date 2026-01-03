import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface Transaction {
    date: string;
    description: string;
    amount: number;
    type: 'Credit' | 'Debit';
}

export const ExpenseService = {
    /**
     * AI Categorization of Expenses
     */
    async categorizeExpenses(transactions: Transaction[]) {
        // Only analyze Debits (Expenses)
        const expenses = transactions.filter(t => t.type === 'Debit');

        if (expenses.length === 0) return { categories: [], totalDeductible: 0 };

        const prompt = `
      Act as a Chartered Accountant. I will provide a list of bank transactions.
      Categorize each expense into: 'Business' (Tax Deductible for a Freelancer) or 'Personal' (Not Deductible).
      
      Rules:
      - 'AWS', 'Hosting', 'Software', 'Office Rent', 'Laptop' -> Business
      - 'Starbucks', 'Uber' (unless specified client visit), 'Groceries', 'Netflix' -> Personal
      
      Transactions:
      ${JSON.stringify(expenses.map(t => ({ desc: t.description, amt: t.amount })))}
      
      Return ONLY a JSON array:
      [{ "description": string, "category": "Business" | "Personal", "reason": string }]
    `;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            // Clean Valid JSON
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const categorized = JSON.parse(cleanJson);

            // Calculate savings
            const totalDeductible = categorized
                .filter((c: any) => c.category === 'Business')
                .reduce((sum: number, c: any) => {
                    const tx = expenses.find(e => e.description === c.description);
                    return sum + (tx ? tx.amount : 0);
                }, 0);

            return {
                categorizedExpenses: categorized,
                totalDeductible,
                taxSaved: Math.round(totalDeductible * 0.30) // Assuming 30% slab
            };

        } catch (error) {
            console.error('Gemini Expense Analysis Failed:', error);
            // Fallback: Simple keyword match if AI fails
            return {
                error: 'AI Analysis Failed',
                fallback: true
            };
        }
    }
};
