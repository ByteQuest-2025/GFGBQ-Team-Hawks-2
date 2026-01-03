"""
TaxAlly - Real-Time Tax & Compliance Copilot

Entry point for local development and testing.
"""

import os
import sys
from datetime import datetime
import json

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agent.core import TaxAllyAgent, AgentContext, AgentMode, ToolRegistry
from agent.llm_providers import get_llm_provider
from tools.mvp_tools import create_mvp_tools
from state.schema import InMemoryStateStore


def create_agent(provider: str = "groq") -> TaxAllyAgent:
    """Create and configure the TaxAlly agent."""

    # Initialize LLM provider
    llm = get_llm_provider(provider)

    # Initialize tool registry
    tool_registry = ToolRegistry()
    for tool in create_mvp_tools():
        tool_registry.register(tool)

    # Initialize state store
    state_store = InMemoryStateStore()

    # Create agent
    agent = TaxAllyAgent(
        llm=llm,
        tool_registry=tool_registry,
        state_store=state_store
    )

    return agent


def interactive_session():
    """Run an interactive chat session."""

    print("=" * 60)
    print("🧾 TaxAlly - Tax & Compliance Copilot")
    print("=" * 60)
    print("\nType 'quit' to exit, 'tools' to list tools\n")

    # Check for API key
    if not os.getenv("GROQ_API_KEY"):
        print("⚠️  GROQ_API_KEY not set. Using mock provider.")
        provider = "mock"
    else:
        provider = "groq"

    agent = create_agent(provider)
    session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    context = AgentContext(
        user_id="demo_user",
        session_id=session_id,
        mode=AgentMode.INDIVIDUAL
    )

    print(f"Session: {session_id}")
    print("-" * 60)

    while True:
        try:
            user_input = input("\n👤 You: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye! Remember to file your returns on time!")
                break

            if user_input.lower() == 'tools':
                print("\n📦 Available Tools:")
                for tool in agent.tools.list_tools():
                    print(f"  - {tool['name']}: {tool['description']}")
                continue

            if user_input.lower() == 'profile':
                state = agent.state.get_user_state(context.user_id)
                print(f"\n📋 Profile: {json.dumps(state, indent=2, default=str)}")
                continue

            # Run agent
            response = agent.run(user_input, context)

            print(f"\n🤖 TaxAlly: {response.message}")

            # Show tool usage if any
            if response.tool_calls:
                print(f"\n   [Used tools: {', '.join(t.tool_name for t in response.tool_calls)}]")

        except KeyboardInterrupt:
            print("\n\n👋 Session ended.")
            break
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")


def demo_queries():
    """Run demo queries for testing."""

    print("=" * 60)
    print("🧾 TaxAlly Demo")
    print("=" * 60)

    agent = create_agent("mock")
    context = AgentContext(
        user_id="demo_user",
        session_id="demo_session",
        mode=AgentMode.INDIVIDUAL
    )

    queries = [
        "I'm a freelance software developer earning 15 lakh per year. What are my tax obligations?",
        "Do I need to register for GST?",
        "What are my upcoming tax deadlines?",
    ]

    for query in queries:
        print(f"\n👤 User: {query}")
        print("-" * 40)
        response = agent.run(query, context)
        print(f"🤖 TaxAlly: {response.message}")
        print("=" * 60)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="TaxAlly - Tax & Compliance Copilot")
    parser.add_argument("--demo", action="store_true", help="Run demo queries")
    parser.add_argument("--provider", default="groq", choices=["groq", "mock", "ollama"],
                        help="LLM provider to use")

    args = parser.parse_args()

    if args.demo:
        demo_queries()
    else:
        interactive_session()
