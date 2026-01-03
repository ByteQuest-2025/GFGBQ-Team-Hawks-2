export const COMPLIANCE_KNOWLEDGE = {
    identity: {
        udyam: {
            micro: { investment: "1 Cr", turnover: "5 Cr" },
            small: { investment: "10 Cr", turnover: "50 Cr" },
            graduationRule: "Status prevails for 1 year after crossing threshold to allow transition planning.",
            calculation: "Investment based on ITR WDV. Turnover excludes export turnover.",
        }
    },
    gst: {
        thresholds: {
            services: "20 Lakhs (10L for Special Category States)",
            goods: "40 Lakhs (20L for Special Category States)",
            mandatory: ["Inter-state supply", "Casual Taxable Persons", "Reverse Charge Mechanism (RCM)", "Input Service Distributors"]
        },
        compositionScheme: {
            eligibility: "Turnover < 1.5 Cr (Manufacturers/Traders), < 50 Lakhs (Service Providers)",
            rates: {
                traders: "1% (0.5% CGST + 0.5% SGST)",
                restaurants: "5%",
                serviceProviders: "6%"
            },
            restrictions: ["No ITC", "Bill of Supply instead of Tax Invoice", "No Inter-state sales"]
        },
        eWayBill: {
            centralLimit: "50,000 INR",
            stateVariances: {
                Maharashtra: "1 Lakh (Intra-state)",
                Delhi: "1 Lakh (Intra-state)",
                Rajasthan: "2 Lakh (Intra-city), 1 Lakh (Intra-state)"
            },
            newRules2025: ["180-day rule for invoices", "Extension cap 360 days", "HSN Validation (4 digits <5Cr, 6 digits >5Cr)"]
        }
    },
    incomeTax: {
        presumptive: {
            section44AD: {
                target: "Traders, Manufacturers",
                limit: "2 Cr (Enhanced to 3 Cr if cash receipts < 5%)",
                deemedProfit: "6% (Digital receipts), 8% (Cash receipts)",
                lockIn: "5-year rule if opted out"
            },
            section44ADA: {
                target: "Freelancers, Professionals (Doctors, Engineers, etc.)",
                limit: "50 Lakhs (Enhanced to 75 Lakhs if cash receipts < 5%)",
                deemedProfit: "50% of gross receipts"
            }
        },
        advanceTax: {
            presumptive: "100% by March 15",
            regular: "15% (Jun 15), 45% (Sep 15), 75% (Dec 15), 100% (Mar 15)"
        }
    },
    tds: {
        section194O: {
            description: "E-commerce operators deduct TDS on gross sales",
            rate: "0.1% (reduced from 1% as of Oct 2024)",
            exemption: "Individual/HUF sellers with < 5 Lakhs sales & PAN furnished",
            penalty: "5% deduction if PAN/Aadhaar not linked (Sec 206AA)"
        }
    },
    stateLaws: {
        shopAct: {
            maharashtraAmendment2025: {
                threshold: "Raised from 10 to 20 employees for Registration",
                below20: "Simple online intimation only",
                reforms: "Women allowed in night shift with safety protocols"
            }
        },
        professionalTax: {
            maharashtra: {
                males: "Exempt < 7.5k, 175/mo for 7.5k-10k, 200/mo (>10k), 300 in Feb",
                females: "Exempt < 25k salary"
            }
        }
    }
};

export const SYSTEM_PROMPT_ADDENDUM = `
AS A "LEGAL OFFICER & CHARTERED ACCOUNTANT (CA) COPILOT", YOU MUST:
1.  **Reference Specific Sections**: Cite "Section 44AD", "Section 194O", "CGST Act" where applicable.
2.  **Optimize Taxes**: Always check if the user qualifies for Presumptive Taxation (44AD/44ADA) to save compliance cost.
3.  **Check for Exemptions**: Specifically mentions exemptions like the 20 Lakh GST threshold or 5 Lakh TDS exemption for e-commerce sellers.
4.  **Warn of Penalties**: Mention specific penalties (e.g., 5% TDS for non-PAN, Late fees for GSTR-3B) to induce "Fear Reduction through Awareness".
5.  **State-Specifics**: If the user is in Maharashtra, mention the Shop Act 2025 reforms (Intimation vs Registration).

USE THE KNOWLEDGE BASE PROVIDED TO ANSWER ACCURATELY. DO NOT HALLUCINATE LAWS.
`;
