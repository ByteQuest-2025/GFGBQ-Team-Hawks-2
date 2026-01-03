# TaxAlly - Real-Time Tax & Compliance Copilot

AI-powered tax assistant for Indian individuals and micro-businesses.

## Features

- **AI Tax Copilot** - Natural language tax guidance
- **Compliance Checking** - GST, Income Tax, TDS status
- **Deadline Tracking** - Never miss a filing date
- **Document Parsing** - Extract data from Form 16, 26AS, invoices
- **Google Workspace** - Sync to Sheets & Calendar
- **MCP Server** - Use with Claude Desktop
- **n8n Workflows** - Automation pipelines

## Quick Start

### Option 1: Colab (Demo)
1. Open `notebooks/TaxAlly_HuggingFace.ipynb` in Google Colab
2. Enable GPU runtime (T4)
3. Run all cells
4. Use Gradio interface

### Option 2: Local Development
```bash
# Clone and setup
cd taxally
pip install -r requirements.txt

# Run API server
python -m api.server

# Or run CLI
python main.py
```

### Option 3: MCP with Claude Desktop
```bash
# Install MCP package
pip install mcp

# Add to Claude Desktop config (~/.config/claude/claude_desktop_config.json)
{
  "mcpServers": {
    "taxally": {
      "command": "python",
      "args": ["-m", "mcp.server"],
      "cwd": "/path/to/taxally"
    }
  }
}
```

## Project Structure
```
taxally/
├── agent/
│   ├── core.py              # Agent architecture
│   └── llm_providers.py     # LLM backends (Groq, HF, Ollama)
├── tools/
│   ├── base.py              # Tool interface
│   ├── mvp_tools.py         # Core tools
│   └── pdf_parser.py        # Document parsing
├── state/
│   ├── schema.py            # Data models
│   └── sqlite_store.py      # Persistent storage
├── integrations/
│   ├── google_calendar.py   # Calendar sync
│   └── google_workspace.py  # Sheets & Docs
├── mcp/
│   └── server.py            # MCP server for Claude
├── api/
│   └── server.py            # FastAPI backend
├── n8n/
│   ├── document_pipeline.json
│   ├── deadline_reminders.json
│   └── ai_chat_workflow.json
├── notebooks/
│   ├── TaxAlly_Demo.ipynb        # Groq version
│   └── TaxAlly_HuggingFace.ipynb # Local model version
└── config/
```

## Tools Available

| Tool | Description |
|------|-------------|
| `check_gst_compliance` | GST registration requirement check |
| `calculate_income_tax` | Tax calculation with regime comparison |
| `check_advance_tax` | Advance tax schedule |
| `get_tax_deadlines` | Upcoming compliance deadlines |
| `categorize_transaction` | Transaction classification |
| `check_presumptive_taxation` | 44AD/44ADA eligibility |
| `parse_document` | PDF data extraction |

## Integrations

### Google Workspace
```python
from integrations.google_workspace import GoogleSheetsIntegration

sheets = GoogleSheetsIntegration()
sheets.authenticate()

# Create TaxAlly spreadsheet
result = sheets.create_taxally_spreadsheet()

# Add transactions
sheets.append_transaction(
    spreadsheet_id=result['spreadsheet_id'],
    date="2024-01-15",
    description="Consulting fees",
    amount=50000,
    category="professional",
    gst_applicable=True
)
```

### n8n Workflows
Import these workflows into n8n:
- `n8n/document_pipeline.json` - Auto-process uploaded documents
- `n8n/deadline_reminders.json` - Daily deadline notifications
- `n8n/ai_chat_workflow.json` - AI chat endpoint

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Chat with TaxAlly |
| `/profile` | GET/PATCH | User profile |
| `/entities` | GET/POST | Business entities |
| `/compliance/check` | POST | Run compliance check |
| `/deadlines` | GET | Get upcoming deadlines |
| `/documents/parse` | POST | Parse tax document |

## Configuration

### Environment Variables
```bash
# LLM Provider
GROQ_API_KEY=your-groq-key        # For Groq
OPENAI_API_KEY=your-openai-key    # For OpenAI

# Notifications
NOTIFY_EMAIL=user@example.com
TELEGRAM_BOT_TOKEN=your-bot-token

# Database
DATABASE_URL=sqlite:///taxally.db
```

### Google API Setup
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Calendar API, Sheets API, Drive API
3. Create OAuth 2.0 credentials
4. Download `credentials.json` to project root

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full evolution plan.

**MVP (Current)**
- AI chat with tax tools
- Basic document parsing
- Google Sheets export

**Next**
- Full ITR preparation
- E-invoicing
- Bank feed integration
- Mobile app

## License
MIT
