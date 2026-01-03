"""
LLM Provider Implementations

MVP: Groq (free, fast) or HuggingFace (Colab-friendly)
Future: OpenAI, Anthropic, Azure, custom fine-tuned models
"""

from abc import ABC, abstractmethod
from typing import Any, Optional
import json
import os
import sys
sys.path.append('..')
from agent.core import AgentContext, LLMProvider


class GroqProvider(LLMProvider):
    """
    Groq LLM provider - fast inference for open-source models.
    Free tier available, great for hackathon.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "llama-3.1-70b-versatile"):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model = model
        self.base_url = "https://api.groq.com/openai/v1"

    def generate(self, prompt: str, context: AgentContext) -> str:
        """Generate completion using Groq."""
        try:
            import requests

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 2048
            }

            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )

            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                return f"Error: {response.status_code} - {response.text}"

        except ImportError:
            return "Error: requests library not installed"
        except Exception as e:
            return f"Error: {str(e)}"

    def generate_structured(self, prompt: str, schema: dict, context: AgentContext) -> dict:
        """Generate structured output."""
        structured_prompt = f"""{prompt}

Respond ONLY with valid JSON matching this schema:
{json.dumps(schema, indent=2)}

JSON Response:"""

        response = self.generate(structured_prompt, context)

        try:
            # Extract JSON from response
            json_match = response.strip()
            if "```json" in json_match:
                json_match = json_match.split("```json")[1].split("```")[0]
            elif "```" in json_match:
                json_match = json_match.split("```")[1].split("```")[0]

            return json.loads(json_match)
        except json.JSONDecodeError:
            return {"error": "Failed to parse structured response", "raw": response}


class HuggingFaceProvider(LLMProvider):
    """
    HuggingFace Transformers provider for Colab.
    Uses local inference with open-source models.

    Recommended models for TaxAlly:
    - "Qwen/Qwen2.5-7B-Instruct" (best reasoning, needs T4/A100)
    - "microsoft/Phi-3.5-mini-instruct" (fast, 8GB VRAM)
    - "meta-llama/Meta-Llama-3.1-8B-Instruct" (needs HF token)
    """

    # Model-specific chat templates
    CHAT_TEMPLATES = {
        "qwen": "<|im_start|>system\n{system}<|im_end|>\n<|im_start|>user\n{user}<|im_end|>\n<|im_start|>assistant\n",
        "phi": "<|system|>\n{system}<|end|>\n<|user|>\n{user}<|end|>\n<|assistant|>\n",
        "llama": "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{user}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
        "default": "System: {system}\n\nUser: {user}\n\nAssistant: "
    }

    def __init__(
        self,
        model_name: str = "Qwen/Qwen2.5-7B-Instruct",
        load_in_4bit: bool = True,  # Quantize for memory efficiency
        max_new_tokens: int = 1024
    ):
        self.model_name = model_name
        self.load_in_4bit = load_in_4bit
        self.max_new_tokens = max_new_tokens
        self._model = None
        self._tokenizer = None
        self._pipeline = None

    def _get_chat_template(self) -> str:
        """Get appropriate chat template for model."""
        model_lower = self.model_name.lower()
        if "qwen" in model_lower:
            return "qwen"
        elif "phi" in model_lower:
            return "phi"
        elif "llama" in model_lower:
            return "llama"
        return "default"

    def _load_model(self):
        """Lazy load model with optimizations for Colab."""
        if self._model is None:
            try:
                from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
                import torch

                print(f"Loading {self.model_name}...")

                # Check GPU availability
                device = "cuda" if torch.cuda.is_available() else "cpu"
                print(f"Using device: {device}")

                # Tokenizer
                self._tokenizer = AutoTokenizer.from_pretrained(
                    self.model_name,
                    trust_remote_code=True
                )

                # Ensure pad token
                if self._tokenizer.pad_token is None:
                    self._tokenizer.pad_token = self._tokenizer.eos_token

                # Quantization config for memory efficiency
                if self.load_in_4bit and torch.cuda.is_available():
                    quantization_config = BitsAndBytesConfig(
                        load_in_4bit=True,
                        bnb_4bit_compute_dtype=torch.float16,
                        bnb_4bit_use_double_quant=True,
                        bnb_4bit_quant_type="nf4"
                    )
                    self._model = AutoModelForCausalLM.from_pretrained(
                        self.model_name,
                        quantization_config=quantization_config,
                        device_map="auto",
                        trust_remote_code=True
                    )
                else:
                    # CPU or non-quantized
                    self._model = AutoModelForCausalLM.from_pretrained(
                        self.model_name,
                        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                        device_map="auto" if torch.cuda.is_available() else None,
                        trust_remote_code=True
                    )

                print(f"Model loaded successfully!")

            except ImportError as e:
                raise ImportError(
                    "Required packages not installed. Run:\n"
                    "pip install transformers torch accelerate bitsandbytes"
                ) from e

    def _format_prompt(self, system: str, user: str) -> str:
        """Format prompt using model-specific template."""
        template_key = self._get_chat_template()
        template = self.CHAT_TEMPLATES[template_key]
        return template.format(system=system, user=user)

    def generate(self, prompt: str, context: AgentContext) -> str:
        """Generate completion using local model."""
        self._load_model()

        # Use tokenizer's chat template if available
        if hasattr(self._tokenizer, 'apply_chat_template'):
            messages = [{"role": "user", "content": prompt}]
            formatted = self._tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
        else:
            formatted = prompt

        inputs = self._tokenizer(
            formatted,
            return_tensors="pt",
            truncation=True,
            max_length=4096
        )

        # Move to model device
        if hasattr(self._model, 'device'):
            inputs = {k: v.to(self._model.device) for k, v in inputs.items()}

        # Generate
        with __import__('torch').no_grad():
            outputs = self._model.generate(
                **inputs,
                max_new_tokens=self.max_new_tokens,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                pad_token_id=self._tokenizer.pad_token_id,
                eos_token_id=self._tokenizer.eos_token_id
            )

        # Decode only new tokens
        response = self._tokenizer.decode(
            outputs[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        )

        return response.strip()

    def generate_with_system(self, system_prompt: str, user_message: str, context: AgentContext) -> str:
        """Generate with explicit system prompt."""
        self._load_model()

        if hasattr(self._tokenizer, 'apply_chat_template'):
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            formatted = self._tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
        else:
            formatted = self._format_prompt(system_prompt, user_message)

        inputs = self._tokenizer(formatted, return_tensors="pt", truncation=True, max_length=4096)

        if hasattr(self._model, 'device'):
            inputs = {k: v.to(self._model.device) for k, v in inputs.items()}

        with __import__('torch').no_grad():
            outputs = self._model.generate(
                **inputs,
                max_new_tokens=self.max_new_tokens,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                pad_token_id=self._tokenizer.pad_token_id
            )

        response = self._tokenizer.decode(
            outputs[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        )

        return response.strip()

    def generate_structured(self, prompt: str, schema: dict, context: AgentContext) -> dict:
        """Generate structured output."""
        structured_prompt = f"""{prompt}

You must respond with ONLY valid JSON matching this schema (no other text):
{json.dumps(schema, indent=2)}"""

        response = self.generate(structured_prompt, context)

        try:
            # Try to extract JSON from response
            import re
            # Look for JSON object
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"error": "No JSON found", "raw": response}
        except json.JSONDecodeError:
            return {"error": "Invalid JSON", "raw": response}


class OllamaProvider(LLMProvider):
    """
    Ollama provider for local inference.
    Good for development and privacy-sensitive deployments.
    """

    def __init__(self, model: str = "llama3.1:8b", base_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = base_url

    def generate(self, prompt: str, context: AgentContext) -> str:
        """Generate completion using Ollama."""
        try:
            import requests

            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False
                }
            )

            if response.status_code == 200:
                return response.json()["response"]
            else:
                return f"Error: {response.status_code}"

        except Exception as e:
            return f"Error: {str(e)}"

    def generate_structured(self, prompt: str, schema: dict, context: AgentContext) -> dict:
        """Generate structured output."""
        structured_prompt = f"""{prompt}

Respond ONLY with valid JSON:
{json.dumps(schema, indent=2)}"""

        response = self.generate(structured_prompt, context)

        try:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"error": "No JSON found"}
        except json.JSONDecodeError:
            return {"error": "Invalid JSON"}


class MockProvider(LLMProvider):
    """
    Mock provider for testing without API calls.
    """

    def __init__(self):
        self.responses = []

    def set_response(self, response: str):
        """Set next response."""
        self.responses.append(response)

    def generate(self, prompt: str, context: AgentContext) -> str:
        if self.responses:
            return self.responses.pop(0)

        # Default intelligent response based on prompt keywords
        if "deadline" in prompt.lower():
            return "Based on your profile, here are your upcoming deadlines:\n1. GSTR-3B due on 20th\n2. Advance tax Q4 due March 15"
        elif "gst" in prompt.lower():
            return "For GST queries, I need to check your registration status and turnover. Could you confirm if you're GST registered?"
        else:
            return "I understand your query. Let me help you with that. Could you provide more details about your specific situation?"

    def generate_structured(self, prompt: str, schema: dict, context: AgentContext) -> dict:
        return {"response": "mock", "data": {}}


# Factory function
def get_llm_provider(provider_type: str = "groq", **kwargs) -> LLMProvider:
    """
    Factory to get LLM provider.

    Args:
        provider_type: One of "groq", "huggingface", "ollama", "mock"
        **kwargs: Provider-specific arguments

    Returns:
        LLMProvider instance
    """
    providers = {
        "groq": GroqProvider,
        "huggingface": HuggingFaceProvider,
        "ollama": OllamaProvider,
        "mock": MockProvider
    }

    if provider_type not in providers:
        raise ValueError(f"Unknown provider: {provider_type}. Available: {list(providers.keys())}")

    return providers[provider_type](**kwargs)
