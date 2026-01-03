"""
TaxAlly Agent Core - The reasoning engine orchestrator.

Design Principles:
- LLM orchestrates, tools calculate
- Tool-agnostic core (swap LLM/tools without rewrite)
- Explicit state management
- Mode-based behavior control
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Optional
import json
from datetime import datetime


class AgentMode(Enum):
    """Agent operating modes - extensible for future."""
    INDIVIDUAL = "individual"
    MICRO_BUSINESS = "micro_business"
    ACCOUNTANT_ASSIST = "accountant_assist"  # Future
    COMPLIANCE_AUDIT = "compliance_audit"    # Future


@dataclass
class AgentContext:
    """Immutable context passed through reasoning loop."""
    user_id: str
    session_id: str
    mode: AgentMode
    entity_id: Optional[str] = None  # For multi-business support
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: dict = field(default_factory=dict)


@dataclass
class ToolCall:
    """Represents a tool invocation request."""
    tool_name: str
    parameters: dict
    reasoning: str  # Why the agent chose this tool


@dataclass
class ToolResult:
    """Result from tool execution."""
    success: bool
    data: Any
    error: Optional[str] = None
    metadata: dict = field(default_factory=dict)


@dataclass
class AgentResponse:
    """Final agent response to user."""
    message: str
    tool_calls: list[ToolCall] = field(default_factory=list)
    tool_results: list[ToolResult] = field(default_factory=list)
    reasoning_trace: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)
    confidence: float = 1.0


class LLMProvider(ABC):
    """Abstract LLM interface - swap models without agent rewrite."""

    @abstractmethod
    def generate(self, prompt: str, context: AgentContext) -> str:
        """Generate completion from prompt."""
        pass

    @abstractmethod
    def generate_structured(self, prompt: str, schema: dict, context: AgentContext) -> dict:
        """Generate structured output matching schema."""
        pass


class ToolRegistry:
    """Central registry for all agent tools."""

    def __init__(self):
        self._tools: dict[str, 'BaseTool'] = {}

    def register(self, tool: 'BaseTool') -> None:
        """Register a tool."""
        self._tools[tool.name] = tool

    def get(self, name: str) -> Optional['BaseTool']:
        """Get tool by name."""
        return self._tools.get(name)

    def list_tools(self) -> list[dict]:
        """List all tools with their schemas."""
        return [
            {
                "name": t.name,
                "description": t.description,
                "parameters": t.parameters_schema,
                "category": t.category
            }
            for t in self._tools.values()
        ]

    def execute(self, call: ToolCall, context: AgentContext) -> ToolResult:
        """Execute a tool call."""
        tool = self.get(call.tool_name)
        if not tool:
            return ToolResult(
                success=False,
                data=None,
                error=f"Unknown tool: {call.tool_name}"
            )
        try:
            result = tool.execute(call.parameters, context)
            return ToolResult(success=True, data=result)
        except Exception as e:
            return ToolResult(success=False, data=None, error=str(e))


class BaseTool(ABC):
    """Abstract base for all tools."""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        pass

    @property
    @abstractmethod
    def parameters_schema(self) -> dict:
        """JSON Schema for parameters."""
        pass

    @property
    def category(self) -> str:
        return "general"

    @abstractmethod
    def execute(self, params: dict, context: AgentContext) -> Any:
        pass


class PolicyLayer:
    """Safety and compliance policy enforcement."""

    def __init__(self):
        self.policies: list[Callable[[str, AgentContext], tuple[bool, str]]] = []

    def add_policy(self, policy: Callable[[str, AgentContext], tuple[bool, str]]) -> None:
        """Add a policy check function."""
        self.policies.append(policy)

    def check(self, action: str, context: AgentContext) -> tuple[bool, str]:
        """Check all policies. Returns (allowed, reason)."""
        for policy in self.policies:
            allowed, reason = policy(action, context)
            if not allowed:
                return False, reason
        return True, ""


class TaxAllyAgent:
    """
    Main agent class - the reasoning loop orchestrator.

    Flow:
    1. Receive user input
    2. Build context from state
    3. Run reasoning loop (plan → act → observe)
    4. Execute tools as needed
    5. Return response with explanation
    """

    def __init__(
        self,
        llm: LLMProvider,
        tool_registry: ToolRegistry,
        state_store: 'StateStore',
        policy_layer: Optional[PolicyLayer] = None
    ):
        self.llm = llm
        self.tools = tool_registry
        self.state = state_store
        self.policy = policy_layer or PolicyLayer()
        self._setup_default_policies()

    def _setup_default_policies(self):
        """Set up default safety policies."""
        # Disclaimer policy
        def disclaimer_policy(action: str, ctx: AgentContext) -> tuple[bool, str]:
            # Always allow, but track for audit
            return True, ""

        self.policy.add_policy(disclaimer_policy)

    def _build_system_prompt(self, context: AgentContext) -> str:
        """Build system prompt based on mode and context."""
        mode_prompts = {
            AgentMode.INDIVIDUAL: """You are TaxAlly, an AI tax compliance assistant for Indian individuals.
You help with income tax, GST (if applicable), and financial compliance.
Always explain your reasoning. Flag uncertainties. Recommend professional consultation for complex cases.""",

            AgentMode.MICRO_BUSINESS: """You are TaxAlly, an AI tax compliance assistant for Indian micro-businesses.
You help with GST compliance, income tax, TDS, and business finances.
Proactively identify compliance risks. Explain in simple terms. Track deadlines."""
        }

        base = mode_prompts.get(context.mode, mode_prompts[AgentMode.INDIVIDUAL])

        tools_desc = "\n".join([
            f"- {t['name']}: {t['description']}"
            for t in self.tools.list_tools()
        ])

        return f"""{base}

AVAILABLE TOOLS:
{tools_desc}

RESPONSE FORMAT:
1. Acknowledge the user's query
2. If you need information, ask clearly
3. If using tools, explain why
4. Provide actionable advice
5. Flag any compliance risks
6. Suggest next steps

IMPORTANT DISCLAIMERS:
- You provide guidance, not legal/tax advice
- Complex cases need professional consultation
- Tax laws change; verify with official sources"""

    def _parse_tool_calls(self, llm_response: str) -> list[ToolCall]:
        """Parse tool calls from LLM response."""
        # Look for JSON tool call blocks
        tool_calls = []
        if "```tool" in llm_response:
            import re
            pattern = r"```tool\n(.*?)\n```"
            matches = re.findall(pattern, llm_response, re.DOTALL)
            for match in matches:
                try:
                    data = json.loads(match)
                    tool_calls.append(ToolCall(
                        tool_name=data["tool"],
                        parameters=data.get("params", {}),
                        reasoning=data.get("reasoning", "")
                    ))
                except json.JSONDecodeError:
                    continue
        return tool_calls

    def run(
        self,
        user_input: str,
        context: AgentContext,
        max_iterations: int = 5
    ) -> AgentResponse:
        """
        Main reasoning loop.

        Extensibility notes:
        - Add hooks for pre/post processing
        - Add streaming support via callbacks
        - Add parallel tool execution for independent calls
        """
        reasoning_trace = []
        tool_results = []
        all_tool_calls = []

        # Load user state
        user_state = self.state.get_user_state(context.user_id)

        # Build conversation history
        conversation = self._build_conversation(user_input, user_state, context)

        for iteration in range(max_iterations):
            reasoning_trace.append(f"Iteration {iteration + 1}")

            # Generate LLM response
            system_prompt = self._build_system_prompt(context)
            full_prompt = f"{system_prompt}\n\n{conversation}"

            llm_response = self.llm.generate(full_prompt, context)
            reasoning_trace.append(f"LLM: {llm_response[:200]}...")

            # Parse any tool calls
            tool_calls = self._parse_tool_calls(llm_response)

            if not tool_calls:
                # No more tools needed, return response
                return AgentResponse(
                    message=llm_response,
                    tool_calls=all_tool_calls,
                    tool_results=tool_results,
                    reasoning_trace=reasoning_trace
                )

            # Execute tools
            for call in tool_calls:
                # Policy check
                allowed, reason = self.policy.check(
                    f"tool:{call.tool_name}", context
                )
                if not allowed:
                    tool_results.append(ToolResult(
                        success=False,
                        data=None,
                        error=f"Policy blocked: {reason}"
                    ))
                    continue

                result = self.tools.execute(call, context)
                tool_results.append(result)
                all_tool_calls.append(call)

                # Add result to conversation
                conversation += f"\n\nTool {call.tool_name} result: {json.dumps(result.data)}"

        # Max iterations reached
        return AgentResponse(
            message="I need more information to complete this request. Could you provide more details?",
            tool_calls=all_tool_calls,
            tool_results=tool_results,
            reasoning_trace=reasoning_trace
        )

    def _build_conversation(
        self,
        user_input: str,
        user_state: dict,
        context: AgentContext
    ) -> str:
        """Build conversation context from history and state."""
        parts = []

        # Add relevant user state
        if user_state.get("profile"):
            parts.append(f"USER PROFILE:\n{json.dumps(user_state['profile'], indent=2)}")

        if user_state.get("entities"):
            parts.append(f"USER ENTITIES:\n{json.dumps(user_state['entities'], indent=2)}")

        # Add recent conversation history
        if user_state.get("conversation_history"):
            recent = user_state["conversation_history"][-5:]  # Last 5 exchanges
            parts.append("RECENT CONVERSATION:")
            for entry in recent:
                parts.append(f"User: {entry['user']}")
                parts.append(f"Assistant: {entry['assistant']}")

        # Add current input
        parts.append(f"\nCURRENT USER INPUT:\n{user_input}")

        return "\n\n".join(parts)


# Type alias for state store (implemented separately)
class StateStore(ABC):
    @abstractmethod
    def get_user_state(self, user_id: str) -> dict:
        pass

    @abstractmethod
    def update_user_state(self, user_id: str, updates: dict) -> None:
        pass
