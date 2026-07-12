"""
AI Workspace - Flask Backend
Serves the frontend and proxies chat requests to OpenRouter API.
"""

import os
import time
import requests
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Models offered in the Model Selection dropdown.
# Any valid OpenRouter model ID can be added here.
AVAILABLE_MODELS = [
    {"id": "openai/gpt-4o-mini", "label": "GPT-4o Mini"},
    {"id": "anthropic/claude-3.5-haiku", "label": "Claude 3.5 Haiku"},
    {"id": "meta-llama/llama-3.1-8b-instruct", "label": "Llama 3.1 8B"},
    {"id": "google/gemini-flash-1.5", "label": "Gemini 1.5 Flash"},
    {"id": "mistralai/mistral-7b-instruct", "label": "Mistral 7B"},
]


@app.route("/")
def index():
    return render_template("index.html", models=AVAILABLE_MODELS)


@app.route("/api/models", methods=["GET"])
def get_models():
    return jsonify({"models": AVAILABLE_MODELS})


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}

    messages = data.get("messages", [])
    model = data.get("model", AVAILABLE_MODELS[0]["id"])
    system_prompt = data.get("system_prompt", "").strip()

    # --- Validate empty prompt (checked first, regardless of key status) ---
    user_messages = [m for m in messages if m.get("role") == "user"]
    if not user_messages or not user_messages[-1].get("content", "").strip():
        return jsonify({
            "error": "empty_prompt",
            "message": "Please enter a message before sending."
        }), 400

    # --- Validate API key presence ---
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY.startswith("your_"):
        return jsonify({
            "error": "missing_api_key",
            "message": "No OpenRouter API key configured. Add OPENROUTER_API_KEY to your .env file."
        }), 401

    payload_messages = []
    if system_prompt:
        payload_messages.append({"role": "system", "content": system_prompt})
    payload_messages.extend(messages)

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "AI Workspace",
    }

    body = {
        "model": model,
        "messages": payload_messages,
    }

    start_time = time.time()

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=body, timeout=30)
    except requests.exceptions.Timeout:
        return jsonify({
            "error": "timeout",
            "message": "The request timed out. Please try again."
        }), 504
    except requests.exceptions.ConnectionError:
        return jsonify({
            "error": "connection_failed",
            "message": "Could not connect to OpenRouter. Check your internet connection."
        }), 503
    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "request_failed",
            "message": f"Request failed: {str(e)}"
        }), 500

    elapsed = round(time.time() - start_time, 2)

    # --- Handle OpenRouter error responses ---
    if response.status_code == 401:
        return jsonify({
            "error": "invalid_api_key",
            "message": "Invalid OpenRouter API key. Please check your .env file."
        }), 401

    if response.status_code == 429:
        return jsonify({
            "error": "rate_limited",
            "message": "Rate limit exceeded. Please wait a moment and try again."
        }), 429

    if response.status_code != 200:
        return jsonify({
            "error": "api_error",
            "message": f"OpenRouter returned an error (status {response.status_code})."
        }), response.status_code

    try:
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        usage = result.get("usage", {})
    except (KeyError, IndexError, ValueError):
        return jsonify({
            "error": "parse_error",
            "message": "Received an unexpected response format from the API."
        }), 500

    return jsonify({
        "content": content,
        "model": model,
        "response_time": elapsed,
        "usage": {
            "prompt_tokens": usage.get("prompt_tokens", 0),
            "completion_tokens": usage.get("completion_tokens", 0),
            "total_tokens": usage.get("total_tokens", 0),
        }
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
