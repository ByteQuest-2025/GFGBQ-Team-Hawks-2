"""
PDF Document Parser for TaxAlly

Parses Indian tax documents:
- Form 16 (TDS Certificate from employer)
- Form 26AS (Tax Credit Statement)
- Bank Statements
- Invoices
- ITR Acknowledgements
"""

import re
from datetime import datetime
from typing import Optional, Any
from dataclasses import dataclass
import json

try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    from PIL import Image
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


@dataclass
class ParsedDocument:
    """Parsed document result."""
    document_type: str
    confidence: float
    extracted_fields: dict
    raw_text: str
    pages: int
    warnings: list
    metadata: dict


class TaxDocumentParser:
    """Parser for Indian tax documents."""

    # PAN pattern: 5 letters, 4 digits, 1 letter
    PAN_PATTERN = r'[A-Z]{5}[0-9]{4}[A-Z]'

    # GSTIN pattern: 2 digits, PAN, 1 alphanumeric, Z, 1 alphanumeric
    GSTIN_PATTERN = r'[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]'

    # TAN pattern: 4 letters, 5 digits, 1 letter
    TAN_PATTERN = r'[A-Z]{4}[0-9]{5}[A-Z]'

    # Amount pattern (Indian format)
    AMOUNT_PATTERN = r'[₹Rs.\s]*([\d,]+(?:\.\d{2})?)'

    def __init__(self):
        if not PDF_AVAILABLE:
            raise ImportError(
                "pdfplumber not installed. Run: pip install pdfplumber"
            )

    def parse_pdf(self, pdf_path: str) -> ParsedDocument:
        """
        Parse a PDF and auto-detect document type.

        Args:
            pdf_path: Path to PDF file

        Returns:
            ParsedDocument with extracted data
        """
        with pdfplumber.open(pdf_path) as pdf:
            # Extract all text
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() or ""
                full_text += "\n"

            pages = len(pdf.pages)

        # Detect document type
        doc_type = self._detect_document_type(full_text)

        # Parse based on type
        if doc_type == "form_16":
            result = self._parse_form16(full_text)
        elif doc_type == "form_26as":
            result = self._parse_form26as(full_text)
        elif doc_type == "bank_statement":
            result = self._parse_bank_statement(full_text)
        elif doc_type == "invoice":
            result = self._parse_invoice(full_text)
        elif doc_type == "itr_ack":
            result = self._parse_itr_acknowledgement(full_text)
        else:
            result = self._parse_generic(full_text)

        return ParsedDocument(
            document_type=doc_type,
            confidence=result.get('confidence', 0.5),
            extracted_fields=result.get('fields', {}),
            raw_text=full_text[:5000],  # First 5000 chars
            pages=pages,
            warnings=result.get('warnings', []),
            metadata=result.get('metadata', {})
        )

    def _detect_document_type(self, text: str) -> str:
        """Detect document type from content."""
        text_lower = text.lower()

        # Form 16 indicators
        if any(x in text_lower for x in ['form no. 16', 'form 16', 'certificate under section 203']):
            return "form_16"

        # Form 26AS indicators
        if any(x in text_lower for x in ['form 26as', 'annual tax statement', 'tax credit statement']):
            return "form_26as"

        # Bank statement indicators
        if any(x in text_lower for x in ['account statement', 'bank statement', 'opening balance', 'closing balance']):
            return "bank_statement"

        # Invoice indicators
        if any(x in text_lower for x in ['tax invoice', 'invoice no', 'gstin', 'cgst', 'sgst', 'igst']):
            return "invoice"

        # ITR Acknowledgement
        if any(x in text_lower for x in ['itr-', 'acknowledgement number', 'income tax return']):
            return "itr_ack"

        return "unknown"

    def _parse_form16(self, text: str) -> dict:
        """Parse Form 16 (TDS Certificate)."""
        fields = {}
        warnings = []
        confidence = 0.0

        # Extract PAN of employee
        pan_matches = re.findall(self.PAN_PATTERN, text)
        if pan_matches:
            fields['employee_pan'] = pan_matches[0]
            if len(pan_matches) > 1:
                fields['employer_pan'] = pan_matches[1]
            confidence += 0.2

        # Extract TAN of employer
        tan_matches = re.findall(self.TAN_PATTERN, text)
        if tan_matches:
            fields['employer_tan'] = tan_matches[0]
            confidence += 0.2

        # Extract Assessment Year
        ay_match = re.search(r'Assessment Year[:\s]*(20\d{2}-\d{2})', text, re.IGNORECASE)
        if ay_match:
            fields['assessment_year'] = ay_match.group(1)
            confidence += 0.1

        # Extract Gross Salary
        gross_patterns = [
            r'Gross Salary[^0-9]*([\d,]+)',
            r'1\.\s*Gross salary[^0-9]*([\d,]+)',
            r'Total Salary[^0-9]*([\d,]+)',
        ]
        for pattern in gross_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['gross_salary'] = self._parse_amount(match.group(1))
                confidence += 0.2
                break

        # Extract Tax Deducted
        tax_patterns = [
            r'Tax Deducted at Source[^0-9]*([\d,]+)',
            r'Total Tax Deducted[^0-9]*([\d,]+)',
            r'TDS[^0-9]*([\d,]+)',
        ]
        for pattern in tax_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['tax_deducted'] = self._parse_amount(match.group(1))
                confidence += 0.2
                break

        # Extract deductions under Chapter VI-A
        deductions_80c = re.search(r'80C[^0-9]*([\d,]+)', text, re.IGNORECASE)
        if deductions_80c:
            fields['deduction_80c'] = self._parse_amount(deductions_80c.group(1))

        deductions_80d = re.search(r'80D[^0-9]*([\d,]+)', text, re.IGNORECASE)
        if deductions_80d:
            fields['deduction_80d'] = self._parse_amount(deductions_80d.group(1))

        # Extract employer name
        employer_match = re.search(r'Name of (?:the )?Employer[:\s]*([^\n]+)', text, re.IGNORECASE)
        if employer_match:
            fields['employer_name'] = employer_match.group(1).strip()

        # Validate
        if 'employee_pan' not in fields:
            warnings.append("Employee PAN not found")
        if 'gross_salary' not in fields:
            warnings.append("Gross salary not found")

        return {
            'fields': fields,
            'confidence': min(confidence, 1.0),
            'warnings': warnings,
            'metadata': {'document_type': 'Form 16', 'category': 'TDS Certificate'}
        }

    def _parse_form26as(self, text: str) -> dict:
        """Parse Form 26AS (Tax Credit Statement)."""
        fields = {}
        warnings = []
        confidence = 0.0

        # Extract PAN
        pan_matches = re.findall(self.PAN_PATTERN, text)
        if pan_matches:
            fields['pan'] = pan_matches[0]
            confidence += 0.2

        # Extract Assessment Year
        ay_match = re.search(r'Assessment Year[:\s]*(20\d{2}-\d{2})', text, re.IGNORECASE)
        if ay_match:
            fields['assessment_year'] = ay_match.group(1)
            confidence += 0.1

        # Extract TDS entries
        # Pattern: TAN, Name, Amount, Tax Deducted
        tds_entries = []
        tan_matches = re.findall(self.TAN_PATTERN, text)

        # Look for amounts near TANs
        for tan in tan_matches[:10]:  # Limit to first 10
            tds_entries.append({'tan': tan})

        if tds_entries:
            fields['tds_entries_count'] = len(tds_entries)
            confidence += 0.2

        # Extract total TDS
        total_match = re.search(r'Total[^0-9]*([\d,]+(?:\.\d{2})?)', text, re.IGNORECASE)
        if total_match:
            fields['total_tds'] = self._parse_amount(total_match.group(1))
            confidence += 0.2

        # Extract advance tax paid
        advance_tax = re.search(r'Advance Tax[^0-9]*([\d,]+)', text, re.IGNORECASE)
        if advance_tax:
            fields['advance_tax_paid'] = self._parse_amount(advance_tax.group(1))

        # Extract self-assessment tax
        self_assessment = re.search(r'Self Assessment Tax[^0-9]*([\d,]+)', text, re.IGNORECASE)
        if self_assessment:
            fields['self_assessment_tax'] = self._parse_amount(self_assessment.group(1))

        return {
            'fields': fields,
            'confidence': min(confidence, 1.0),
            'warnings': warnings,
            'metadata': {'document_type': 'Form 26AS', 'category': 'Tax Credit Statement'}
        }

    def _parse_bank_statement(self, text: str) -> dict:
        """Parse bank statement."""
        fields = {}
        warnings = []
        confidence = 0.0

        # Extract account number
        acc_match = re.search(r'Account\s*(?:No|Number)[:\s]*(\d{9,18})', text, re.IGNORECASE)
        if acc_match:
            fields['account_number'] = acc_match.group(1)
            confidence += 0.2

        # Extract IFSC
        ifsc_match = re.search(r'IFSC[:\s]*([A-Z]{4}0[A-Z0-9]{6})', text, re.IGNORECASE)
        if ifsc_match:
            fields['ifsc_code'] = ifsc_match.group(1)
            confidence += 0.1

        # Extract statement period
        period_match = re.search(r'(?:Period|From)[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*(?:to|-)\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', text, re.IGNORECASE)
        if period_match:
            fields['period_from'] = period_match.group(1)
            fields['period_to'] = period_match.group(2)
            confidence += 0.1

        # Extract opening/closing balance
        opening_match = re.search(r'Opening Balance[:\s]*([\d,]+(?:\.\d{2})?)', text, re.IGNORECASE)
        if opening_match:
            fields['opening_balance'] = self._parse_amount(opening_match.group(1))
            confidence += 0.15

        closing_match = re.search(r'Closing Balance[:\s]*([\d,]+(?:\.\d{2})?)', text, re.IGNORECASE)
        if closing_match:
            fields['closing_balance'] = self._parse_amount(closing_match.group(1))
            confidence += 0.15

        # Try to extract transactions
        # Look for date patterns followed by descriptions and amounts
        transactions = []
        date_pattern = r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s+([^\d]+?)\s+([\d,]+(?:\.\d{2})?)'
        matches = re.findall(date_pattern, text)

        for match in matches[:50]:  # Limit to 50
            transactions.append({
                'date': match[0],
                'description': match[1].strip(),
                'amount': self._parse_amount(match[2])
            })

        if transactions:
            fields['transaction_count'] = len(transactions)
            fields['sample_transactions'] = transactions[:10]  # First 10
            confidence += 0.2

        return {
            'fields': fields,
            'confidence': min(confidence, 1.0),
            'warnings': warnings,
            'metadata': {'document_type': 'Bank Statement', 'category': 'Financial Statement'}
        }

    def _parse_invoice(self, text: str) -> dict:
        """Parse GST invoice."""
        fields = {}
        warnings = []
        confidence = 0.0

        # Extract GSTIN (seller)
        gstin_matches = re.findall(self.GSTIN_PATTERN, text)
        if gstin_matches:
            fields['seller_gstin'] = gstin_matches[0]
            if len(gstin_matches) > 1:
                fields['buyer_gstin'] = gstin_matches[1]
            confidence += 0.2

        # Extract invoice number
        inv_match = re.search(r'Invoice\s*(?:No|Number|#)[:\s]*([A-Z0-9/-]+)', text, re.IGNORECASE)
        if inv_match:
            fields['invoice_number'] = inv_match.group(1)
            confidence += 0.15

        # Extract invoice date
        date_match = re.search(r'(?:Invoice\s*)?Date[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', text, re.IGNORECASE)
        if date_match:
            fields['invoice_date'] = date_match.group(1)
            confidence += 0.1

        # Extract amounts
        # Taxable value
        taxable_match = re.search(r'Taxable\s*(?:Value|Amount)[:\s]*([\d,]+(?:\.\d{2})?)', text, re.IGNORECASE)
        if taxable_match:
            fields['taxable_value'] = self._parse_amount(taxable_match.group(1))
            confidence += 0.1

        # CGST
        cgst_match = re.search(r'CGST[^0-9]*([\d,]+(?:\.\d{2})?)', text, re.IGNORECASE)
        if cgst_match:
            fields['cgst'] = self._parse_amount(cgst_match.group(1))

        # SGST
        sgst_match = re.search(r'SGST[^0-9]*([\d,]+(?:\.\d{2})?)', text, re.IGNORECASE)
        if sgst_match:
            fields['sgst'] = self._parse_amount(sgst_match.group(1))

        # IGST
        igst_match = re.search(r'IGST[^0-9]*([\d,]+(?:\.\d{2})?)', text, re.IGNORECASE)
        if igst_match:
            fields['igst'] = self._parse_amount(igst_match.group(1))

        # Total
        total_patterns = [
            r'Grand Total[:\s]*([\d,]+(?:\.\d{2})?)',
            r'Total Amount[:\s]*([\d,]+(?:\.\d{2})?)',
            r'Net Amount[:\s]*([\d,]+(?:\.\d{2})?)',
        ]
        for pattern in total_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['total_amount'] = self._parse_amount(match.group(1))
                confidence += 0.15
                break

        # Calculate GST rate if possible
        if 'taxable_value' in fields and 'cgst' in fields:
            try:
                rate = (fields['cgst'] / fields['taxable_value']) * 100 * 2  # *2 for CGST+SGST
                fields['gst_rate'] = f"{rate:.0f}%"
            except:
                pass

        return {
            'fields': fields,
            'confidence': min(confidence, 1.0),
            'warnings': warnings,
            'metadata': {'document_type': 'Invoice', 'category': 'GST Invoice'}
        }

    def _parse_itr_acknowledgement(self, text: str) -> dict:
        """Parse ITR Acknowledgement."""
        fields = {}
        warnings = []
        confidence = 0.0

        # Extract PAN
        pan_matches = re.findall(self.PAN_PATTERN, text)
        if pan_matches:
            fields['pan'] = pan_matches[0]
            confidence += 0.2

        # Extract Acknowledgement Number
        ack_match = re.search(r'Acknowledgement\s*(?:No|Number)[:\s]*(\d+)', text, re.IGNORECASE)
        if ack_match:
            fields['acknowledgement_number'] = ack_match.group(1)
            confidence += 0.2

        # Extract ITR form type
        itr_match = re.search(r'ITR-(\d)', text)
        if itr_match:
            fields['itr_form'] = f"ITR-{itr_match.group(1)}"
            confidence += 0.1

        # Extract Assessment Year
        ay_match = re.search(r'Assessment Year[:\s]*(20\d{2}-\d{2})', text, re.IGNORECASE)
        if ay_match:
            fields['assessment_year'] = ay_match.group(1)
            confidence += 0.1

        # Extract filing date
        filed_match = re.search(r'(?:Filed|Date)[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', text, re.IGNORECASE)
        if filed_match:
            fields['filing_date'] = filed_match.group(1)
            confidence += 0.1

        # Extract total income
        income_match = re.search(r'Total Income[:\s]*([\d,]+)', text, re.IGNORECASE)
        if income_match:
            fields['total_income'] = self._parse_amount(income_match.group(1))
            confidence += 0.1

        # Extract tax payable/refund
        tax_match = re.search(r'Tax (?:Payable|Paid)[:\s]*([\d,]+)', text, re.IGNORECASE)
        if tax_match:
            fields['tax_payable'] = self._parse_amount(tax_match.group(1))

        refund_match = re.search(r'Refund[:\s]*([\d,]+)', text, re.IGNORECASE)
        if refund_match:
            fields['refund_amount'] = self._parse_amount(refund_match.group(1))

        return {
            'fields': fields,
            'confidence': min(confidence, 1.0),
            'warnings': warnings,
            'metadata': {'document_type': 'ITR Acknowledgement', 'category': 'Tax Return'}
        }

    def _parse_generic(self, text: str) -> dict:
        """Generic parsing for unrecognized documents."""
        fields = {}

        # Extract any PANs
        pan_matches = re.findall(self.PAN_PATTERN, text)
        if pan_matches:
            fields['pan_found'] = list(set(pan_matches))

        # Extract any GSTINs
        gstin_matches = re.findall(self.GSTIN_PATTERN, text)
        if gstin_matches:
            fields['gstin_found'] = list(set(gstin_matches))

        # Extract any amounts
        amount_matches = re.findall(r'[₹Rs.\s]*([\d,]+(?:\.\d{2})?)', text)
        amounts = [self._parse_amount(a) for a in amount_matches if self._parse_amount(a) > 100]
        if amounts:
            fields['amounts_found'] = sorted(set(amounts), reverse=True)[:10]

        # Extract dates
        date_matches = re.findall(r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}', text)
        if date_matches:
            fields['dates_found'] = list(set(date_matches))[:10]

        return {
            'fields': fields,
            'confidence': 0.3,
            'warnings': ['Document type not recognized. Generic extraction performed.'],
            'metadata': {'document_type': 'Unknown', 'category': 'Unclassified'}
        }

    def _parse_amount(self, amount_str: str) -> float:
        """Parse amount string to float."""
        try:
            # Remove commas and currency symbols
            clean = re.sub(r'[₹Rs.,\s]', '', amount_str)
            clean = clean.replace(',', '')
            return float(clean) if clean else 0.0
        except:
            return 0.0

    def parse_and_export_to_sheets(
        self,
        pdf_path: str,
        sheets_integration: Any,
        spreadsheet_id: str
    ) -> dict:
        """
        Parse PDF and export extracted data to Google Sheets.

        Args:
            pdf_path: Path to PDF
            sheets_integration: GoogleSheetsIntegration instance
            spreadsheet_id: Target spreadsheet ID

        Returns:
            Parsing result and export status
        """
        # Parse document
        result = self.parse_pdf(pdf_path)

        # Add to Documents sheet
        import uuid
        doc_id = str(uuid.uuid4())[:8]

        sheets_integration.add_document_record(
            spreadsheet_id=spreadsheet_id,
            document_id=doc_id,
            doc_type=result.document_type,
            filename=pdf_path.split('/')[-1],
            financial_year=result.extracted_fields.get('assessment_year', 'Unknown'),
            processing_status='completed' if result.confidence > 0.5 else 'review_needed',
            extracted_data=result.extracted_fields
        )

        # If it's an invoice, add as transaction
        if result.document_type == 'invoice':
            sheets_integration.append_transaction(
                spreadsheet_id=spreadsheet_id,
                date=result.extracted_fields.get('invoice_date', ''),
                description=f"Invoice {result.extracted_fields.get('invoice_number', '')}",
                amount=result.extracted_fields.get('total_amount', 0),
                transaction_type='debit',
                category='business_expense',
                gst_applicable=True,
                notes=f"GSTIN: {result.extracted_fields.get('seller_gstin', '')}"
            )

        return {
            'document_id': doc_id,
            'document_type': result.document_type,
            'confidence': result.confidence,
            'fields_extracted': len(result.extracted_fields),
            'exported_to_sheets': True
        }


# Test
if __name__ == "__main__":
    print("TaxAlly Document Parser")
    print("=" * 50)

    if not PDF_AVAILABLE:
        print("pdfplumber not installed. Run: pip install pdfplumber")
    else:
        print("✅ PDF parsing available")

    if not OCR_AVAILABLE:
        print("OCR not available. Install: pip install pytesseract pillow")
    else:
        print("✅ OCR available")

    print("\nUsage:")
    print("  parser = TaxDocumentParser()")
    print("  result = parser.parse_pdf('form16.pdf')")
    print("  print(result.extracted_fields)")
