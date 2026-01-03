"""
State Schema - Future-safe design for multi-entity, multi-user support.

Key design decisions:
1. User can have multiple entities (businesses)
2. Each entity has its own compliance state
3. Document lineage tracked for audit
4. Risk evolution captured over time
5. Conversation context preserved
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Optional
from abc import ABC, abstractmethod
import json


# ============ Enums ============

class EntityType(Enum):
    INDIVIDUAL = "individual"
    HUF = "huf"
    PROPRIETORSHIP = "proprietorship"
    PARTNERSHIP = "partnership"
    LLP = "llp"
    PRIVATE_LIMITED = "pvt_ltd"


class ComplianceStatus(Enum):
    COMPLIANT = "compliant"
    AT_RISK = "at_risk"
    NON_COMPLIANT = "non_compliant"
    PENDING_REVIEW = "pending_review"
    UNKNOWN = "unknown"


class DocumentType(Enum):
    FORM_16 = "form_16"
    FORM_26AS = "form_26as"
    BANK_STATEMENT = "bank_statement"
    GST_RETURN = "gst_return"
    INVOICE = "invoice"
    ITR = "itr"
    OTHER = "other"


class RiskSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ============ Core Schemas ============

@dataclass
class UserProfile:
    """User account information."""
    user_id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    preferences: dict = field(default_factory=dict)
    # Future: roles, permissions, subscription tier


@dataclass
class TaxProfile:
    """Tax-specific profile for an entity."""
    pan: Optional[str] = None
    entity_type: EntityType = EntityType.INDIVIDUAL
    gst_registered: bool = False
    gstin: Optional[str] = None
    tan: Optional[str] = None  # For TDS deductors
    state: Optional[str] = None
    income_sources: list[str] = field(default_factory=list)
    preferred_tax_regime: Optional[str] = None  # "old" or "new"


@dataclass
class Entity:
    """
    Business or individual entity.
    Users can have multiple entities.
    """
    entity_id: str
    user_id: str
    name: str
    entity_type: EntityType
    tax_profile: TaxProfile = field(default_factory=TaxProfile)
    is_primary: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    metadata: dict = field(default_factory=dict)


@dataclass
class FinancialYear:
    """Represents a financial year's data for an entity."""
    fy: str  # Format: "2024-25"
    entity_id: str
    turnover: float = 0.0
    gross_income: float = 0.0
    tax_paid: float = 0.0
    tds_collected: float = 0.0
    gst_collected: float = 0.0
    gst_paid: float = 0.0
    estimated_tax_liability: float = 0.0
    filings: dict = field(default_factory=dict)  # Filing status per return type


@dataclass
class Document:
    """
    Document with lineage tracking.
    Supports future audit requirements.
    """
    document_id: str
    entity_id: str
    document_type: DocumentType
    filename: str
    upload_timestamp: datetime = field(default_factory=datetime.utcnow)
    financial_year: Optional[str] = None
    extracted_data: dict = field(default_factory=dict)
    processing_status: str = "pending"  # pending, processed, failed
    source: str = "upload"  # upload, email, api
    lineage: dict = field(default_factory=dict)  # Parent docs, derived docs
    metadata: dict = field(default_factory=dict)


@dataclass
class ComplianceRisk:
    """Individual compliance risk item."""
    risk_id: str
    entity_id: str
    category: str  # gst, income_tax, tds, etc.
    severity: RiskSeverity
    title: str
    description: str
    detected_at: datetime = field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    deadline: Optional[datetime] = None
    financial_year: Optional[str] = None


@dataclass
class ComplianceSnapshot:
    """
    Point-in-time compliance status.
    Enables tracking evolution over time.
    """
    snapshot_id: str
    entity_id: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    overall_status: ComplianceStatus = ComplianceStatus.UNKNOWN
    gst_status: ComplianceStatus = ComplianceStatus.UNKNOWN
    income_tax_status: ComplianceStatus = ComplianceStatus.UNKNOWN
    tds_status: ComplianceStatus = ComplianceStatus.UNKNOWN
    active_risks: list[str] = field(default_factory=list)  # risk_ids
    score: int = 0  # 0-100 compliance score
    metadata: dict = field(default_factory=dict)


@dataclass
class ConversationEntry:
    """Single conversation turn."""
    turn_id: str
    session_id: str
    user_message: str
    assistant_message: str
    tool_calls: list[dict] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    entity_context: Optional[str] = None  # Which entity was being discussed


@dataclass
class Session:
    """User session with conversation history."""
    session_id: str
    user_id: str
    started_at: datetime = field(default_factory=datetime.utcnow)
    last_activity: datetime = field(default_factory=datetime.utcnow)
    active_entity_id: Optional[str] = None
    conversation: list[ConversationEntry] = field(default_factory=list)
    context_summary: Optional[str] = None  # LLM-generated summary for long convos


@dataclass
class Deadline:
    """Compliance deadline tracking."""
    deadline_id: str
    entity_id: str
    deadline_type: str  # gstr1, gstr3b, itr, etc.
    due_date: datetime
    financial_year: str
    status: str = "pending"  # pending, completed, overdue, extended
    completed_at: Optional[datetime] = None
    reminder_sent: bool = False


# ============ State Store Interface ============

class StateStore(ABC):
    """
    Abstract state store interface.
    Implementations: InMemory (MVP), SQLite, PostgreSQL, etc.
    """

    # User operations
    @abstractmethod
    def get_user(self, user_id: str) -> Optional[UserProfile]:
        pass

    @abstractmethod
    def create_user(self, user: UserProfile) -> str:
        pass

    @abstractmethod
    def update_user(self, user_id: str, updates: dict) -> None:
        pass

    # Entity operations
    @abstractmethod
    def get_entities(self, user_id: str) -> list[Entity]:
        pass

    @abstractmethod
    def get_entity(self, entity_id: str) -> Optional[Entity]:
        pass

    @abstractmethod
    def create_entity(self, entity: Entity) -> str:
        pass

    @abstractmethod
    def update_entity(self, entity_id: str, updates: dict) -> None:
        pass

    # Financial year operations
    @abstractmethod
    def get_financial_year(self, entity_id: str, fy: str) -> Optional[FinancialYear]:
        pass

    @abstractmethod
    def update_financial_year(self, entity_id: str, fy: str, updates: dict) -> None:
        pass

    # Document operations
    @abstractmethod
    def store_document(self, doc: Document) -> str:
        pass

    @abstractmethod
    def get_documents(self, entity_id: str, doc_type: Optional[DocumentType] = None) -> list[Document]:
        pass

    # Compliance operations
    @abstractmethod
    def add_risk(self, risk: ComplianceRisk) -> str:
        pass

    @abstractmethod
    def get_active_risks(self, entity_id: str) -> list[ComplianceRisk]:
        pass

    @abstractmethod
    def resolve_risk(self, risk_id: str, notes: str) -> None:
        pass

    @abstractmethod
    def save_compliance_snapshot(self, snapshot: ComplianceSnapshot) -> str:
        pass

    @abstractmethod
    def get_compliance_history(self, entity_id: str, limit: int = 10) -> list[ComplianceSnapshot]:
        pass

    # Session operations
    @abstractmethod
    def get_session(self, session_id: str) -> Optional[Session]:
        pass

    @abstractmethod
    def create_session(self, session: Session) -> str:
        pass

    @abstractmethod
    def add_conversation_turn(self, session_id: str, entry: ConversationEntry) -> None:
        pass

    # Deadline operations
    @abstractmethod
    def get_upcoming_deadlines(self, entity_id: str, days: int = 30) -> list[Deadline]:
        pass

    @abstractmethod
    def update_deadline_status(self, deadline_id: str, status: str) -> None:
        pass


# ============ In-Memory Implementation (MVP) ============

class InMemoryStateStore(StateStore):
    """
    In-memory state store for MVP.
    Replace with persistent store in production.
    """

    def __init__(self):
        self.users: dict[str, UserProfile] = {}
        self.entities: dict[str, Entity] = {}
        self.financial_years: dict[str, FinancialYear] = {}
        self.documents: dict[str, Document] = {}
        self.risks: dict[str, ComplianceRisk] = {}
        self.snapshots: dict[str, ComplianceSnapshot] = {}
        self.sessions: dict[str, Session] = {}
        self.deadlines: dict[str, Deadline] = {}

    def get_user(self, user_id: str) -> Optional[UserProfile]:
        return self.users.get(user_id)

    def create_user(self, user: UserProfile) -> str:
        self.users[user.user_id] = user
        return user.user_id

    def update_user(self, user_id: str, updates: dict) -> None:
        if user_id in self.users:
            user = self.users[user_id]
            for key, value in updates.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            user.updated_at = datetime.utcnow()

    def get_entities(self, user_id: str) -> list[Entity]:
        return [e for e in self.entities.values() if e.user_id == user_id]

    def get_entity(self, entity_id: str) -> Optional[Entity]:
        return self.entities.get(entity_id)

    def create_entity(self, entity: Entity) -> str:
        self.entities[entity.entity_id] = entity
        return entity.entity_id

    def update_entity(self, entity_id: str, updates: dict) -> None:
        if entity_id in self.entities:
            entity = self.entities[entity_id]
            for key, value in updates.items():
                if hasattr(entity, key):
                    setattr(entity, key, value)

    def get_financial_year(self, entity_id: str, fy: str) -> Optional[FinancialYear]:
        key = f"{entity_id}:{fy}"
        return self.financial_years.get(key)

    def update_financial_year(self, entity_id: str, fy: str, updates: dict) -> None:
        key = f"{entity_id}:{fy}"
        if key not in self.financial_years:
            self.financial_years[key] = FinancialYear(fy=fy, entity_id=entity_id)
        for k, v in updates.items():
            if hasattr(self.financial_years[key], k):
                setattr(self.financial_years[key], k, v)

    def store_document(self, doc: Document) -> str:
        self.documents[doc.document_id] = doc
        return doc.document_id

    def get_documents(self, entity_id: str, doc_type: Optional[DocumentType] = None) -> list[Document]:
        docs = [d for d in self.documents.values() if d.entity_id == entity_id]
        if doc_type:
            docs = [d for d in docs if d.document_type == doc_type]
        return docs

    def add_risk(self, risk: ComplianceRisk) -> str:
        self.risks[risk.risk_id] = risk
        return risk.risk_id

    def get_active_risks(self, entity_id: str) -> list[ComplianceRisk]:
        return [
            r for r in self.risks.values()
            if r.entity_id == entity_id and r.resolved_at is None
        ]

    def resolve_risk(self, risk_id: str, notes: str) -> None:
        if risk_id in self.risks:
            self.risks[risk_id].resolved_at = datetime.utcnow()
            self.risks[risk_id].resolution_notes = notes

    def save_compliance_snapshot(self, snapshot: ComplianceSnapshot) -> str:
        self.snapshots[snapshot.snapshot_id] = snapshot
        return snapshot.snapshot_id

    def get_compliance_history(self, entity_id: str, limit: int = 10) -> list[ComplianceSnapshot]:
        snapshots = [s for s in self.snapshots.values() if s.entity_id == entity_id]
        return sorted(snapshots, key=lambda x: x.timestamp, reverse=True)[:limit]

    def get_session(self, session_id: str) -> Optional[Session]:
        return self.sessions.get(session_id)

    def create_session(self, session: Session) -> str:
        self.sessions[session.session_id] = session
        return session.session_id

    def add_conversation_turn(self, session_id: str, entry: ConversationEntry) -> None:
        if session_id in self.sessions:
            self.sessions[session_id].conversation.append(entry)
            self.sessions[session_id].last_activity = datetime.utcnow()

    def get_upcoming_deadlines(self, entity_id: str, days: int = 30) -> list[Deadline]:
        from datetime import timedelta
        cutoff = datetime.utcnow() + timedelta(days=days)
        return [
            d for d in self.deadlines.values()
            if d.entity_id == entity_id
            and d.status == "pending"
            and d.due_date <= cutoff
        ]

    def update_deadline_status(self, deadline_id: str, status: str) -> None:
        if deadline_id in self.deadlines:
            self.deadlines[deadline_id].status = status
            if status == "completed":
                self.deadlines[deadline_id].completed_at = datetime.utcnow()

    # Convenience method for agent
    def get_user_state(self, user_id: str) -> dict:
        """Get aggregated user state for agent context."""
        user = self.get_user(user_id)
        entities = self.get_entities(user_id)

        state = {
            "profile": None,
            "entities": [],
            "active_risks": [],
            "upcoming_deadlines": [],
            "conversation_history": []
        }

        if user:
            state["profile"] = {
                "name": user.name,
                "email": user.email
            }

        for entity in entities:
            entity_data = {
                "entity_id": entity.entity_id,
                "name": entity.name,
                "type": entity.entity_type.value,
                "is_primary": entity.is_primary,
                "tax_profile": {
                    "pan": entity.tax_profile.pan,
                    "gst_registered": entity.tax_profile.gst_registered,
                    "gstin": entity.tax_profile.gstin
                }
            }
            state["entities"].append(entity_data)

            # Add risks and deadlines
            state["active_risks"].extend([
                {"entity": entity.name, "title": r.title, "severity": r.severity.value}
                for r in self.get_active_risks(entity.entity_id)
            ])

            state["upcoming_deadlines"].extend([
                {"entity": entity.name, "type": d.deadline_type, "due": d.due_date.isoformat()}
                for d in self.get_upcoming_deadlines(entity.entity_id)
            ])

        return state

    def update_user_state(self, user_id: str, updates: dict) -> None:
        """Update user state from agent."""
        if "profile" in updates:
            self.update_user(user_id, updates["profile"])
