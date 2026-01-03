"""
SQLite Storage for TaxAlly

Persistent storage for:
- User profiles
- Entities (businesses)
- Documents
- Compliance history
- Conversation history
"""

import sqlite3
import json
from datetime import datetime
from typing import Optional, Any
from pathlib import Path
import uuid


class SQLiteStore:
    """SQLite-based persistent storage for TaxAlly."""

    def __init__(self, db_path: str = "taxally.db"):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        """Get database connection."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initialize database schema."""
        conn = self._get_conn()
        cursor = conn.cursor()

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                email TEXT,
                phone TEXT,
                name TEXT,
                preferences TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Entities table (businesses/individuals)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS entities (
                entity_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                entity_type TEXT DEFAULT 'individual',
                pan TEXT,
                gstin TEXT,
                gst_registered INTEGER DEFAULT 0,
                tan TEXT,
                state TEXT,
                income_sources TEXT DEFAULT '[]',
                preferred_tax_regime TEXT,
                is_primary INTEGER DEFAULT 0,
                metadata TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        """)

        # Financial years table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS financial_years (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_id TEXT NOT NULL,
                fy TEXT NOT NULL,
                turnover REAL DEFAULT 0,
                gross_income REAL DEFAULT 0,
                tax_paid REAL DEFAULT 0,
                tds_collected REAL DEFAULT 0,
                gst_collected REAL DEFAULT 0,
                gst_paid REAL DEFAULT 0,
                filings TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(entity_id, fy),
                FOREIGN KEY (entity_id) REFERENCES entities(entity_id)
            )
        """)

        # Documents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                document_id TEXT PRIMARY KEY,
                entity_id TEXT NOT NULL,
                document_type TEXT NOT NULL,
                filename TEXT,
                financial_year TEXT,
                extracted_data TEXT DEFAULT '{}',
                processing_status TEXT DEFAULT 'pending',
                source TEXT DEFAULT 'upload',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (entity_id) REFERENCES entities(entity_id)
            )
        """)

        # Compliance risks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS compliance_risks (
                risk_id TEXT PRIMARY KEY,
                entity_id TEXT NOT NULL,
                category TEXT NOT NULL,
                severity TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                financial_year TEXT,
                deadline TIMESTAMP,
                detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP,
                resolution_notes TEXT,
                FOREIGN KEY (entity_id) REFERENCES entities(entity_id)
            )
        """)

        # Compliance snapshots table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS compliance_snapshots (
                snapshot_id TEXT PRIMARY KEY,
                entity_id TEXT NOT NULL,
                overall_status TEXT,
                gst_status TEXT,
                income_tax_status TEXT,
                tds_status TEXT,
                score INTEGER DEFAULT 0,
                active_risks TEXT DEFAULT '[]',
                metadata TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (entity_id) REFERENCES entities(entity_id)
            )
        """)

        # Conversations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                entity_id TEXT,
                user_message TEXT NOT NULL,
                assistant_message TEXT NOT NULL,
                tool_calls TEXT DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        """)

        # Deadlines table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS deadlines (
                deadline_id TEXT PRIMARY KEY,
                entity_id TEXT NOT NULL,
                deadline_type TEXT NOT NULL,
                due_date TIMESTAMP NOT NULL,
                financial_year TEXT,
                status TEXT DEFAULT 'pending',
                completed_at TIMESTAMP,
                reminder_sent INTEGER DEFAULT 0,
                calendar_event_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (entity_id) REFERENCES entities(entity_id)
            )
        """)

        conn.commit()
        conn.close()

    # ============ User Operations ============

    def create_user(self, email: str = None, phone: str = None, name: str = None) -> str:
        """Create a new user."""
        user_id = str(uuid.uuid4())
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO users (user_id, email, phone, name)
            VALUES (?, ?, ?, ?)
        """, (user_id, email, phone, name))

        conn.commit()
        conn.close()
        return user_id

    def get_user(self, user_id: str) -> Optional[dict]:
        """Get user by ID."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return dict(row)
        return None

    def update_user(self, user_id: str, **updates) -> bool:
        """Update user fields."""
        conn = self._get_conn()
        cursor = conn.cursor()

        updates['updated_at'] = datetime.now().isoformat()
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [user_id]

        cursor.execute(f"UPDATE users SET {set_clause} WHERE user_id = ?", values)
        conn.commit()
        conn.close()
        return cursor.rowcount > 0

    # ============ Entity Operations ============

    def create_entity(
        self,
        user_id: str,
        name: str,
        entity_type: str = "individual",
        **kwargs
    ) -> str:
        """Create a new entity for a user."""
        entity_id = str(uuid.uuid4())
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO entities (
                entity_id, user_id, name, entity_type, pan, gstin,
                gst_registered, state, income_sources, is_primary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entity_id, user_id, name, entity_type,
            kwargs.get('pan'), kwargs.get('gstin'),
            kwargs.get('gst_registered', False),
            kwargs.get('state'),
            json.dumps(kwargs.get('income_sources', [])),
            kwargs.get('is_primary', False)
        ))

        conn.commit()
        conn.close()
        return entity_id

    def get_entity(self, entity_id: str) -> Optional[dict]:
        """Get entity by ID."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM entities WHERE entity_id = ?", (entity_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            entity = dict(row)
            entity['income_sources'] = json.loads(entity['income_sources'])
            entity['metadata'] = json.loads(entity['metadata'])
            return entity
        return None

    def get_user_entities(self, user_id: str) -> list[dict]:
        """Get all entities for a user."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM entities WHERE user_id = ?", (user_id,))
        rows = cursor.fetchall()
        conn.close()

        entities = []
        for row in rows:
            entity = dict(row)
            entity['income_sources'] = json.loads(entity['income_sources'])
            entity['metadata'] = json.loads(entity['metadata'])
            entities.append(entity)

        return entities

    def update_entity(self, entity_id: str, **updates) -> bool:
        """Update entity fields."""
        conn = self._get_conn()
        cursor = conn.cursor()

        # Handle JSON fields
        if 'income_sources' in updates:
            updates['income_sources'] = json.dumps(updates['income_sources'])
        if 'metadata' in updates:
            updates['metadata'] = json.dumps(updates['metadata'])

        updates['updated_at'] = datetime.now().isoformat()
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [entity_id]

        cursor.execute(f"UPDATE entities SET {set_clause} WHERE entity_id = ?", values)
        conn.commit()
        conn.close()
        return cursor.rowcount > 0

    # ============ Financial Year Operations ============

    def update_financial_year(self, entity_id: str, fy: str, **data) -> bool:
        """Update or insert financial year data."""
        conn = self._get_conn()
        cursor = conn.cursor()

        # Check if exists
        cursor.execute(
            "SELECT id FROM financial_years WHERE entity_id = ? AND fy = ?",
            (entity_id, fy)
        )

        if cursor.fetchone():
            # Update
            if 'filings' in data:
                data['filings'] = json.dumps(data['filings'])
            set_clause = ", ".join(f"{k} = ?" for k in data.keys())
            values = list(data.values()) + [entity_id, fy]
            cursor.execute(
                f"UPDATE financial_years SET {set_clause} WHERE entity_id = ? AND fy = ?",
                values
            )
        else:
            # Insert
            filings = json.dumps(data.pop('filings', {}))
            cursor.execute("""
                INSERT INTO financial_years (entity_id, fy, turnover, gross_income, filings)
                VALUES (?, ?, ?, ?, ?)
            """, (
                entity_id, fy,
                data.get('turnover', 0),
                data.get('gross_income', 0),
                filings
            ))

        conn.commit()
        conn.close()
        return True

    def get_financial_year(self, entity_id: str, fy: str) -> Optional[dict]:
        """Get financial year data."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM financial_years WHERE entity_id = ? AND fy = ?",
            (entity_id, fy)
        )
        row = cursor.fetchone()
        conn.close()

        if row:
            data = dict(row)
            data['filings'] = json.loads(data['filings'])
            return data
        return None

    # ============ Document Operations ============

    def store_document(
        self,
        entity_id: str,
        document_type: str,
        filename: str,
        financial_year: str = None,
        extracted_data: dict = None
    ) -> str:
        """Store a document record."""
        document_id = str(uuid.uuid4())
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO documents (
                document_id, entity_id, document_type, filename,
                financial_year, extracted_data
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            document_id, entity_id, document_type, filename,
            financial_year, json.dumps(extracted_data or {})
        ))

        conn.commit()
        conn.close()
        return document_id

    def get_documents(
        self,
        entity_id: str,
        document_type: str = None
    ) -> list[dict]:
        """Get documents for an entity."""
        conn = self._get_conn()
        cursor = conn.cursor()

        if document_type:
            cursor.execute(
                "SELECT * FROM documents WHERE entity_id = ? AND document_type = ?",
                (entity_id, document_type)
            )
        else:
            cursor.execute(
                "SELECT * FROM documents WHERE entity_id = ?",
                (entity_id,)
            )

        rows = cursor.fetchall()
        conn.close()

        return [
            {**dict(row), 'extracted_data': json.loads(row['extracted_data'])}
            for row in rows
        ]

    # ============ Compliance Risk Operations ============

    def add_risk(
        self,
        entity_id: str,
        category: str,
        severity: str,
        title: str,
        description: str = None,
        deadline: datetime = None
    ) -> str:
        """Add a compliance risk."""
        risk_id = str(uuid.uuid4())
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO compliance_risks (
                risk_id, entity_id, category, severity, title, description, deadline
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (risk_id, entity_id, category, severity, title, description, deadline))

        conn.commit()
        conn.close()
        return risk_id

    def get_active_risks(self, entity_id: str) -> list[dict]:
        """Get unresolved risks for an entity."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM compliance_risks WHERE entity_id = ? AND resolved_at IS NULL",
            (entity_id,)
        )
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def resolve_risk(self, risk_id: str, notes: str = None) -> bool:
        """Mark a risk as resolved."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE compliance_risks
            SET resolved_at = ?, resolution_notes = ?
            WHERE risk_id = ?
        """, (datetime.now().isoformat(), notes, risk_id))

        conn.commit()
        conn.close()
        return cursor.rowcount > 0

    # ============ Conversation Operations ============

    def save_conversation(
        self,
        session_id: str,
        user_id: str,
        user_message: str,
        assistant_message: str,
        entity_id: str = None,
        tool_calls: list = None
    ) -> int:
        """Save a conversation turn."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO conversations (
                session_id, user_id, entity_id, user_message, assistant_message, tool_calls
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            session_id, user_id, entity_id,
            user_message, assistant_message,
            json.dumps(tool_calls or [])
        ))

        conn.commit()
        last_id = cursor.lastrowid
        conn.close()
        return last_id

    def get_conversation_history(
        self,
        session_id: str,
        limit: int = 10
    ) -> list[dict]:
        """Get recent conversation history."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM conversations
            WHERE session_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (session_id, limit))

        rows = cursor.fetchall()
        conn.close()

        return [
            {**dict(row), 'tool_calls': json.loads(row['tool_calls'])}
            for row in reversed(rows)
        ]

    # ============ Deadline Operations ============

    def add_deadline(
        self,
        entity_id: str,
        deadline_type: str,
        due_date: datetime,
        financial_year: str = None
    ) -> str:
        """Add a deadline."""
        deadline_id = str(uuid.uuid4())
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO deadlines (
                deadline_id, entity_id, deadline_type, due_date, financial_year
            ) VALUES (?, ?, ?, ?, ?)
        """, (deadline_id, entity_id, deadline_type, due_date, financial_year))

        conn.commit()
        conn.close()
        return deadline_id

    def get_upcoming_deadlines(self, entity_id: str, days: int = 30) -> list[dict]:
        """Get upcoming deadlines."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM deadlines
            WHERE entity_id = ?
            AND status = 'pending'
            AND due_date <= datetime('now', '+' || ? || ' days')
            ORDER BY due_date
        """, (entity_id, days))

        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def complete_deadline(self, deadline_id: str) -> bool:
        """Mark deadline as completed."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE deadlines
            SET status = 'completed', completed_at = ?
            WHERE deadline_id = ?
        """, (datetime.now().isoformat(), deadline_id))

        conn.commit()
        conn.close()
        return cursor.rowcount > 0

    # ============ Aggregate State ============

    def get_user_state(self, user_id: str) -> dict:
        """Get aggregated state for agent context."""
        user = self.get_user(user_id)
        entities = self.get_user_entities(user_id)

        state = {
            "profile": user,
            "entities": entities,
            "active_risks": [],
            "upcoming_deadlines": []
        }

        for entity in entities:
            risks = self.get_active_risks(entity['entity_id'])
            deadlines = self.get_upcoming_deadlines(entity['entity_id'])

            state["active_risks"].extend([
                {"entity": entity['name'], **risk}
                for risk in risks
            ])
            state["upcoming_deadlines"].extend([
                {"entity": entity['name'], **dl}
                for dl in deadlines
            ])

        return state


# Test
if __name__ == "__main__":
    print("Testing SQLite Store...")
    store = SQLiteStore(":memory:")  # In-memory for testing

    # Create user
    user_id = store.create_user(email="test@example.com", name="Test User")
    print(f"Created user: {user_id}")

    # Create entity
    entity_id = store.create_entity(
        user_id=user_id,
        name="My Freelance Business",
        entity_type="proprietorship",
        gst_registered=True,
        income_sources=["profession"]
    )
    print(f"Created entity: {entity_id}")

    # Add risk
    risk_id = store.add_risk(
        entity_id=entity_id,
        category="gst",
        severity="medium",
        title="GSTR-3B pending",
        description="December GSTR-3B not filed"
    )
    print(f"Added risk: {risk_id}")

    # Get state
    state = store.get_user_state(user_id)
    print(f"User state: {json.dumps(state, indent=2, default=str)}")

    print("\n✅ SQLite store working!")
