"""
Tool Interface Contracts

All tools inherit from BaseTool and implement:
- name: Unique identifier
- description: What the tool does (for LLM)
- parameters_schema: JSON Schema for inputs
- category: For grouping/filtering
- execute(): The actual logic

Future tools just implement this interface.
"""

from abc import ABC, abstractmethod
from typing import Any
import sys
sys.path.append('..')
from agent.core import AgentContext


class BaseTool(ABC):
    """
    Abstract base for all TaxAlly tools.

    Contract:
    - Tools are stateless
    - All state comes via context or parameters
    - Tools return structured data, not formatted text
    - LLM handles presentation
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique tool identifier."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description for LLM."""
        pass

    @property
    @abstractmethod
    def parameters_schema(self) -> dict:
        """JSON Schema for parameters."""
        pass

    @property
    def category(self) -> str:
        """Tool category for grouping."""
        return "general"

    @property
    def requires_confirmation(self) -> bool:
        """Whether tool needs user confirmation before execution."""
        return False

    @abstractmethod
    def execute(self, params: dict, context: AgentContext) -> Any:
        """
        Execute the tool.

        Args:
            params: Validated parameters matching schema
            context: Agent context with user/session info

        Returns:
            Structured data (dict, list, or primitive)

        Raises:
            ToolExecutionError: On failure
        """
        pass

    def validate_params(self, params: dict) -> tuple[bool, str]:
        """
        Validate parameters against schema.
        Override for custom validation.
        """
        # Basic required field check
        schema = self.parameters_schema
        required = schema.get("required", [])
        for field in required:
            if field not in params:
                return False, f"Missing required field: {field}"
        return True, ""


class ToolExecutionError(Exception):
    """Raised when tool execution fails."""
    pass
