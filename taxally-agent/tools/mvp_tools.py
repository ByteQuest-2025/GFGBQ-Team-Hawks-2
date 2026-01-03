"""
MVP Tools - Core functionality for hackathon demo.

Tools implemented:
1. ProfileCollector - Gather user tax profile
2. TransactionInterpreter - Parse and categorize transactions
3. ComplianceRuleEngine - Check compliance status
4. CalendarTracker - Track deadlines
5. PDFParser - Extract data from documents
"""

from typing import Any, Optional
from datetime import datetime, timedelta
from .base import BaseTool, ToolExecutionError
import sys
sys.path.append('..')
from agent.core import AgentContext
import json
import re


class ProfileCollector(BaseTool):
    """Collects and validates user tax profile."""

    @property
    def name(self) -> str:
        return "profile_collector"

    @property
    def description(self) -> str:
        return "Collect user tax profile information including PAN, GST status, income sources, and entity type"

    @property
    def parameters_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["get", "update", "validate"],
                    "description": "Action to perform"
                },
                "data": {
                    "type": "object",
                    "description": "Profile data to update/validate",
                    "properties": {
                        "pan": {"type": "string"},
                        "name": {"type": "string"},
                        "entity_type": {
                            "type": "string",
                            "enum": ["individual", "huf", "partnership", "llp", "pvt_ltd", "proprietorship"]
                        },
                        "gst_registered": {"type": "boolean"},
                        "gstin": {"type": "string"},
                        "annual_turnover_estimate": {"type": "number"},
                        "income_sources": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": ["salary", "business", "profession", "capital_gains", "house_property", "other"]
                            }
                        },
                        "state": {"type": "string"},
                        "financial_year": {"type": "string"}
                    }
                }
            },
            "required": ["action"]
        }

    @property
    def category(self) -> str:
        return "profile"

    def execute(self, params: dict, context: AgentContext) -> Any:
        action = params["action"]
        data = params.get("data", {})

        if action == "get":
            # Would fetch from state store in production
            return {"status": "profile_needed", "missing_fields": ["pan", "entity_type", "income_sources"]}

        elif action == "validate":
            errors = []
            if "pan" in data:
                if not self._validate_pan(data["pan"]):
                    errors.append("Invalid PAN format. Expected: ABCDE1234F")
            if "gstin" in data:
                if not self._validate_gstin(data["gstin"]):
                    errors.append("Invalid GSTIN format")
            return {"valid": len(errors) == 0, "errors": errors}

        elif action == "update":
            # Would update state store in production
            return {"status": "updated", "profile": data}

        raise ToolExecutionError(f"Unknown action: {action}")

    def _validate_pan(self, pan: str) -> bool:
        """Validate Indian PAN format: ABCDE1234F"""
        pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
        return bool(re.match(pattern, pan.upper()))

    def _validate_gstin(self, gstin: str) -> bool:
        """Validate Indian GSTIN format."""
        pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
        return bool(re.match(pattern, gstin.upper()))


class TransactionInterpreter(BaseTool):
    """Parses and categorizes financial transactions."""

    @property
    def name(self) -> str:
        return "transaction_interpreter"

    @property
    def description(self) -> str:
        return "Parse and categorize financial transactions for tax classification"

    @property
    def parameters_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["categorize", "analyze_pattern", "suggest_gst"]
                },
                "transactions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "date": {"type": "string"},
                            "description": {"type": "string"},
                            "amount": {"type": "number"},
                            "type": {"type": "string", "enum": ["credit", "debit"]}
                        }
                    }
                },
                "description": {
                    "type": "string",
                    "description": "Single transaction description to categorize"
                }
            },
            "required": ["action"]
        }

    @property
    def category(self) -> str:
        return "transactions"

    # Common transaction patterns for India
    PATTERNS = {
        "salary": ["salary", "sal cr", "payroll", "wages"],
        "rent_received": ["rent received", "rental income"],
        "rent_paid": ["rent paid", "house rent", "office rent"],
        "professional_income": ["professional fees", "consulting", "freelance"],
        "gst_payment": ["gst", "cgst", "sgst", "igst"],
        "tds": ["tds", "tax deducted"],
        "investment": ["mutual fund", "mf purchase", "sip", "stocks", "equity"],
        "interest_income": ["interest", "fd interest", "savings interest"],
        "utility": ["electricity", "water bill", "internet", "phone bill"],
        "business_expense": ["office supplies", "business expense", "travel"]
    }

    def execute(self, params: dict, context: AgentContext) -> Any:
        action = params["action"]

        if action == "categorize":
            if "description" in params:
                return self._categorize_single(params["description"])
            elif "transactions" in params:
                return self._categorize_batch(params["transactions"])

        elif action == "analyze_pattern":
            return self._analyze_patterns(params.get("transactions", []))

        elif action == "suggest_gst":
            return self._suggest_gst_treatment(params.get("description", ""))

        raise ToolExecutionError(f"Unknown action: {action}")

    def _categorize_single(self, description: str) -> dict:
        desc_lower = description.lower()
        for category, patterns in self.PATTERNS.items():
            if any(p in desc_lower for p in patterns):
                return {
                    "category": category,
                    "confidence": 0.8,
                    "tax_relevant": category not in ["utility"]
                }
        return {"category": "uncategorized", "confidence": 0.0, "tax_relevant": True}

    def _categorize_batch(self, transactions: list) -> list:
        return [
            {**txn, **self._categorize_single(txn.get("description", ""))}
            for txn in transactions
        ]

    def _analyze_patterns(self, transactions: list) -> dict:
        categorized = self._categorize_batch(transactions)
        summary = {}
        for txn in categorized:
            cat = txn.get("category", "uncategorized")
            if cat not in summary:
                summary[cat] = {"count": 0, "total": 0}
            summary[cat]["count"] += 1
            summary[cat]["total"] += txn.get("amount", 0)
        return {"summary": summary, "total_transactions": len(transactions)}

    def _suggest_gst_treatment(self, description: str) -> dict:
        desc_lower = description.lower()

        # Simplified GST suggestions
        if any(x in desc_lower for x in ["export", "foreign"]):
            return {"gst_rate": 0, "type": "zero_rated", "note": "Exports are zero-rated"}
        elif any(x in desc_lower for x in ["software", "consulting", "professional"]):
            return {"gst_rate": 18, "type": "service", "note": "Standard service rate"}
        elif any(x in desc_lower for x in ["food", "restaurant"]):
            return {"gst_rate": 5, "type": "service", "note": "Restaurant services"}
        else:
            return {"gst_rate": 18, "type": "standard", "note": "Default rate, verify for specific item"}


class ComplianceRuleEngine(BaseTool):
    """Checks compliance status against Indian tax rules."""

    @property
    def name(self) -> str:
        return "compliance_rule_engine"

    @property
    def description(self) -> str:
        return "Check compliance status for GST, Income Tax, TDS and identify risks"

    @property
    def parameters_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "check_type": {
                    "type": "string",
                    "enum": ["gst_registration", "gst_filing", "income_tax", "tds", "advance_tax", "all"]
                },
                "profile": {
                    "type": "object",
                    "description": "User profile for context"
                },
                "financial_year": {
                    "type": "string",
                    "description": "FY in format 2024-25"
                },
                "turnover": {"type": "number"},
                "income": {"type": "number"}
            },
            "required": ["check_type"]
        }

    @property
    def category(self) -> str:
        return "compliance"

    # FY 2024-25 thresholds (configurable for future)
    THRESHOLDS = {
        "gst_registration": 2000000,  # 20 lakh for services
        "gst_registration_goods": 4000000,  # 40 lakh for goods
        "advance_tax": 10000,  # Tax liability threshold
        "tax_audit_44ab": 10000000,  # 1 crore for business
        "tax_audit_44ab_profession": 5000000,  # 50 lakh for profession
        "presumptive_44ad": 20000000,  # 2 crore limit
        "presumptive_44ada": 5000000  # 50 lakh for professionals
    }

    def execute(self, params: dict, context: AgentContext) -> Any:
        check_type = params["check_type"]
        profile = params.get("profile", {})
        turnover = params.get("turnover", 0)
        income = params.get("income", 0)

        if check_type == "all":
            return {
                "gst": self._check_gst(profile, turnover),
                "income_tax": self._check_income_tax(profile, income),
                "advance_tax": self._check_advance_tax(income),
                "tds": self._check_tds(profile, turnover)
            }

        elif check_type == "gst_registration":
            return self._check_gst(profile, turnover)

        elif check_type == "income_tax":
            return self._check_income_tax(profile, income)

        elif check_type == "advance_tax":
            return self._check_advance_tax(income)

        elif check_type == "tds":
            return self._check_tds(profile, turnover)

        raise ToolExecutionError(f"Unknown check type: {check_type}")

    def _check_gst(self, profile: dict, turnover: float) -> dict:
        threshold = self.THRESHOLDS["gst_registration"]
        is_registered = profile.get("gst_registered", False)

        result = {
            "status": "compliant",
            "risks": [],
            "recommendations": []
        }

        if turnover > threshold and not is_registered:
            result["status"] = "non_compliant"
            result["risks"].append({
                "severity": "high",
                "issue": "GST registration required",
                "detail": f"Turnover ₹{turnover:,.0f} exceeds ₹{threshold:,.0f} threshold"
            })
            result["recommendations"].append("Apply for GST registration immediately")

        if is_registered:
            result["recommendations"].append("Ensure timely GSTR-1 and GSTR-3B filing")

        return result

    def _check_income_tax(self, profile: dict, income: float) -> dict:
        result = {
            "status": "compliant",
            "risks": [],
            "tax_regime_suggestion": None
        }

        # Basic exemption limit check (new regime FY 2024-25)
        if income > 300000:
            result["filing_required"] = True
            result["recommendations"] = ["File ITR before due date"]

            # Suggest regime based on deductions
            deductions = profile.get("estimated_deductions", 0)
            if deductions > 150000:
                result["tax_regime_suggestion"] = "old_regime"
            else:
                result["tax_regime_suggestion"] = "new_regime"
        else:
            result["filing_required"] = False

        return result

    def _check_advance_tax(self, income: float) -> dict:
        # Simplified tax calculation
        estimated_tax = self._calculate_tax(income)

        result = {
            "required": estimated_tax > self.THRESHOLDS["advance_tax"],
            "estimated_tax": estimated_tax,
            "deadlines": []
        }

        if result["required"]:
            result["deadlines"] = [
                {"date": "June 15", "percentage": 15},
                {"date": "September 15", "percentage": 45},
                {"date": "December 15", "percentage": 75},
                {"date": "March 15", "percentage": 100}
            ]

        return result

    def _check_tds(self, profile: dict, turnover: float) -> dict:
        is_registered = profile.get("gst_registered", False)

        result = {
            "tds_deduction_required": turnover > 10000000,
            "tds_applicable_on_receipts": True,
            "recommendations": []
        }

        if result["tds_deduction_required"]:
            result["recommendations"].append("Obtain TAN and deduct TDS on applicable payments")

        return result

    def _calculate_tax(self, income: float) -> float:
        """Simplified new regime calculation FY 2024-25."""
        if income <= 300000:
            return 0
        elif income <= 700000:
            return (income - 300000) * 0.05
        elif income <= 1000000:
            return 20000 + (income - 700000) * 0.10
        elif income <= 1200000:
            return 50000 + (income - 1000000) * 0.15
        elif income <= 1500000:
            return 80000 + (income - 1200000) * 0.20
        else:
            return 140000 + (income - 1500000) * 0.30


class CalendarTracker(BaseTool):
    """Tracks tax compliance deadlines."""

    @property
    def name(self) -> str:
        return "calendar_tracker"

    @property
    def description(self) -> str:
        return "Track and manage tax compliance deadlines for GST, Income Tax, TDS"

    @property
    def parameters_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["get_upcoming", "get_overdue", "add_reminder", "check_deadline"]
                },
                "deadline_type": {
                    "type": "string",
                    "enum": ["gst", "income_tax", "tds", "advance_tax", "all"]
                },
                "days_ahead": {
                    "type": "integer",
                    "default": 30
                },
                "profile": {
                    "type": "object",
                    "description": "User profile for relevant deadlines"
                }
            },
            "required": ["action"]
        }

    @property
    def category(self) -> str:
        return "calendar"

    # Standard deadlines (day of month)
    DEADLINES = {
        "gstr1": {"day": 11, "description": "GSTR-1 (Outward supplies)", "frequency": "monthly"},
        "gstr3b": {"day": 20, "description": "GSTR-3B (Summary return)", "frequency": "monthly"},
        "tds_payment": {"day": 7, "description": "TDS payment for previous month", "frequency": "monthly"},
        "tds_return": {"day": 31, "description": "TDS return (quarterly)", "frequency": "quarterly"},
        "advance_tax_q1": {"month": 6, "day": 15, "description": "Advance Tax Q1 (15%)", "frequency": "yearly"},
        "advance_tax_q2": {"month": 9, "day": 15, "description": "Advance Tax Q2 (45%)", "frequency": "yearly"},
        "advance_tax_q3": {"month": 12, "day": 15, "description": "Advance Tax Q3 (75%)", "frequency": "yearly"},
        "advance_tax_q4": {"month": 3, "day": 15, "description": "Advance Tax Q4 (100%)", "frequency": "yearly"},
        "itr_individual": {"month": 7, "day": 31, "description": "ITR filing (non-audit)", "frequency": "yearly"},
        "itr_audit": {"month": 10, "day": 31, "description": "ITR filing (audit cases)", "frequency": "yearly"}
    }

    def execute(self, params: dict, context: AgentContext) -> Any:
        action = params["action"]
        deadline_type = params.get("deadline_type", "all")
        days_ahead = params.get("days_ahead", 30)
        profile = params.get("profile", {})

        today = datetime.now()

        if action == "get_upcoming":
            return self._get_upcoming(today, days_ahead, deadline_type, profile)

        elif action == "get_overdue":
            return self._get_overdue(today, profile)

        elif action == "check_deadline":
            return self._check_specific_deadline(deadline_type, today)

        raise ToolExecutionError(f"Unknown action: {action}")

    def _get_upcoming(self, today: datetime, days_ahead: int, deadline_type: str, profile: dict) -> list:
        upcoming = []
        end_date = today + timedelta(days=days_ahead)

        gst_registered = profile.get("gst_registered", False)

        for key, deadline in self.DEADLINES.items():
            # Filter by type
            if deadline_type != "all":
                if deadline_type == "gst" and not key.startswith("gst"):
                    continue
                elif deadline_type == "tds" and not key.startswith("tds"):
                    continue

            # Skip GST deadlines if not registered
            if key.startswith("gst") and not gst_registered:
                continue

            # Calculate next occurrence
            next_date = self._get_next_occurrence(deadline, today)
            if next_date and next_date <= end_date:
                days_until = (next_date - today).days
                upcoming.append({
                    "deadline": key,
                    "description": deadline["description"],
                    "date": next_date.strftime("%Y-%m-%d"),
                    "days_until": days_until,
                    "urgency": "high" if days_until <= 3 else "medium" if days_until <= 7 else "low"
                })

        return sorted(upcoming, key=lambda x: x["days_until"])

    def _get_overdue(self, today: datetime, profile: dict) -> list:
        # Simplified - would check against filing records
        return []

    def _check_specific_deadline(self, deadline_type: str, today: datetime) -> dict:
        if deadline_type in self.DEADLINES:
            deadline = self.DEADLINES[deadline_type]
            next_date = self._get_next_occurrence(deadline, today)
            return {
                "deadline": deadline_type,
                "description": deadline["description"],
                "next_date": next_date.strftime("%Y-%m-%d") if next_date else None,
                "days_until": (next_date - today).days if next_date else None
            }
        return {"error": f"Unknown deadline type: {deadline_type}"}

    def _get_next_occurrence(self, deadline: dict, today: datetime) -> Optional[datetime]:
        freq = deadline.get("frequency", "monthly")

        if freq == "monthly":
            day = deadline["day"]
            # This month or next
            this_month = today.replace(day=min(day, 28))
            if this_month > today:
                return this_month
            # Next month
            if today.month == 12:
                return today.replace(year=today.year + 1, month=1, day=min(day, 28))
            return today.replace(month=today.month + 1, day=min(day, 28))

        elif freq == "yearly":
            month = deadline["month"]
            day = deadline["day"]
            this_year = today.replace(month=month, day=day)
            if this_year > today:
                return this_year
            return this_year.replace(year=today.year + 1)

        return None


class PDFParser(BaseTool):
    """Extracts structured data from tax documents."""

    @property
    def name(self) -> str:
        return "pdf_parser"

    @property
    def description(self) -> str:
        return "Extract data from tax documents like Form 16, Form 26AS, bank statements"

    @property
    def parameters_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "document_type": {
                    "type": "string",
                    "enum": ["form_16", "form_26as", "bank_statement", "gst_return", "invoice", "unknown"]
                },
                "content": {
                    "type": "string",
                    "description": "Extracted text content from PDF"
                },
                "extract_fields": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Specific fields to extract"
                }
            },
            "required": ["document_type", "content"]
        }

    @property
    def category(self) -> str:
        return "documents"

    def execute(self, params: dict, context: AgentContext) -> Any:
        doc_type = params["document_type"]
        content = params["content"]

        if doc_type == "form_16":
            return self._parse_form16(content)
        elif doc_type == "form_26as":
            return self._parse_form26as(content)
        elif doc_type == "bank_statement":
            return self._parse_bank_statement(content)
        elif doc_type == "invoice":
            return self._parse_invoice(content)
        else:
            return self._generic_parse(content)

    def _parse_form16(self, content: str) -> dict:
        """Extract key fields from Form 16."""
        # Pattern matching for common Form 16 fields
        result = {
            "document_type": "form_16",
            "extracted_fields": {},
            "confidence": 0.0
        }

        patterns = {
            "pan": r'PAN[:\s]*([A-Z]{5}[0-9]{4}[A-Z])',
            "employer_tan": r'TAN[:\s]*([A-Z]{4}[0-9]{5}[A-Z])',
            "gross_salary": r'Gross[:\s]*(?:Salary|Total)[:\s]*[₹Rs.\s]*([\d,]+)',
            "tax_deducted": r'(?:Tax|TDS)[:\s]*(?:Deducted|Paid)[:\s]*[₹Rs.\s]*([\d,]+)',
            "assessment_year": r'Assessment Year[:\s]*(20\d{2}-\d{2})'
        }

        for field, pattern in patterns.items():
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                value = match.group(1).replace(',', '')
                result["extracted_fields"][field] = value
                result["confidence"] += 0.2

        return result

    def _parse_form26as(self, content: str) -> dict:
        """Extract TDS entries from Form 26AS."""
        result = {
            "document_type": "form_26as",
            "tds_entries": [],
            "total_tds": 0
        }

        # Would implement actual parsing logic
        return result

    def _parse_bank_statement(self, content: str) -> dict:
        """Extract transactions from bank statement."""
        result = {
            "document_type": "bank_statement",
            "transactions": [],
            "summary": {
                "total_credits": 0,
                "total_debits": 0,
                "opening_balance": None,
                "closing_balance": None
            }
        }

        # Would implement actual parsing logic
        return result

    def _parse_invoice(self, content: str) -> dict:
        """Extract invoice details."""
        result = {
            "document_type": "invoice",
            "extracted_fields": {}
        }

        patterns = {
            "invoice_number": r'Invoice\s*(?:No|Number|#)[:\s]*(\S+)',
            "date": r'Date[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
            "gstin": r'GSTIN[:\s]*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])',
            "total": r'(?:Grand\s*)?Total[:\s]*[₹Rs.\s]*([\d,]+)',
            "cgst": r'CGST[:\s]*[₹Rs.\s]*([\d,]+)',
            "sgst": r'SGST[:\s]*[₹Rs.\s]*([\d,]+)',
            "igst": r'IGST[:\s]*[₹Rs.\s]*([\d,]+)'
        }

        for field, pattern in patterns.items():
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                result["extracted_fields"][field] = match.group(1)

        return result

    def _generic_parse(self, content: str) -> dict:
        """Attempt to identify document type and extract relevant fields."""
        doc_type = "unknown"

        if "form 16" in content.lower() or "form no. 16" in content.lower():
            doc_type = "form_16"
            return self._parse_form16(content)
        elif "26as" in content.lower():
            doc_type = "form_26as"
            return self._parse_form26as(content)
        elif "invoice" in content.lower():
            doc_type = "invoice"
            return self._parse_invoice(content)

        return {
            "document_type": doc_type,
            "message": "Could not determine document type. Please specify."
        }


# Tool registry setup
def create_mvp_tools() -> list[BaseTool]:
    """Create all MVP tools."""
    return [
        ProfileCollector(),
        TransactionInterpreter(),
        ComplianceRuleEngine(),
        CalendarTracker(),
        PDFParser()
    ]
