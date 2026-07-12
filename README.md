# AI Workspace

A unified web interface for interacting with multiple AI models through [OpenRouter](https://openrouter.ai). Built with Flask (Python) and vanilla HTML/CSS/JavaScript — no frontend build tools required.

## Features

- **Chat Interface** — clean, chat-style conversation UI
- **System Prompt** — define custom AI behavior/persona per session
- **Model Selection** — switch between multiple real models via OpenRouter (GPT-4o Mini, Claude 3.5 Haiku, Llama 3.1, Gemini Flash, Mistral 7B)
- **Prompt Templates** — Summarize Text, Explain Code, Generate Ideas, Rewrite Content, Translate, Create Email, Brainstorm — plus save-your-own custom templates
- **Conversation History** — multiple chat sessions, persisted in browser localStorage
- **Markdown Rendering** — formatted responses with syntax-highlighted code blocks
- **Error Handling** — invalid API key, connection failures, empty prompts, rate limits, timeouts all handled gracefully
- **Responsive UI** — clean, professional layout that works on desktop and mobile

### Bonus Features Implemented
- 🌙 Dark / Light mode toggle
- 📤 Export chat as Markdown (`.md`)
- ⭐ Save custom prompt templates
- 🔢 Token usage counter (per response, from OpenRouter's usage data)
- ⏱ Response time measurement
- 🗂 Multiple chat sessions (sidebar, switch/delete)

## Project Structure

```
ai-workspace/
├── app.py                  # Flask app + OpenRouter proxy
├── requirements.txt
├── .env                    # your API key goes here (not committed)
├── .env.example
├── static/
│   ├── css/style.css
│   └── js/
│       ├── main.js         # app init + event wiring
│       ├── chat.js         # send/receive messages, rendering
│       ├── templates.js    # prompt templates
│       ├── sessions.js     # multi-session history (localStorage)
│       └── markdown.js     # markdown rendering helper
└── templates/
    └── index.html
```

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Add your OpenRouter API key

Get a free key at https://openrouter.ai/keys, then edit `.env`:

```
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

### 3. Run the app

```bash
python app.py
```

Open **http://localhost:5000** in your browser.

## How It Works

- The Flask backend (`app.py`) receives chat requests from the frontend, attaches your system prompt, and forwards them to OpenRouter's `/chat/completions` endpoint using the model you selected.
- Your API key stays server-side only — it's never exposed to the browser.
- Conversation history and custom templates are stored in the browser's `localStorage`, so they persist across page reloads within the same browser (session-based, per assignment requirements).
- Markdown responses are rendered client-side using `marked.js`, with code blocks syntax-highlighted using `highlight.js` (both loaded via CDN — no npm install needed).

## Error Handling Covered

| Scenario | Behavior |
|---|---|
| Missing/invalid API key | Clear error banner, HTTP 401 |
| Empty prompt submitted | Blocked client-side and server-side |
| Network/connection failure | Caught and shown as a friendly error |
| API timeout | 504 with retry message |
| Rate limiting | 429 with wait message |
| Malformed API response | Caught and reported as parse error |

## Notes

- Adding more models is as simple as adding entries to `AVAILABLE_MODELS` in `app.py` — any valid OpenRouter model ID works.
- No database is used; this fits the assignment's "conversation history during the session" requirement. If persistent storage across browsers/devices is needed later, swap `localStorage` for a backend DB.
