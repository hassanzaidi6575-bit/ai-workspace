// chat.js - handles sending messages to backend and rendering the conversation

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const text = input.value.trim();

  hideError();

  // --- Empty prompt validation ---
  if (!text) {
    showError("Please type a message before sending.");
    return;
  }

  const session = getActiveSession();
  const model = document.getElementById("modelSelect").value;
  const systemPrompt = document.getElementById("systemPromptInput").value.trim();

  session.model = model;
  session.systemPrompt = systemPrompt;

  // Render user message immediately
  addMessageToActiveSession("user", text);
  renderMessage("user", text);
  input.value = "";
  renderSessionList();

  // Show typing indicator
  const typingEl = showTypingIndicator();
  sendBtn.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: session.messages
          .filter(m => m.role === "user" || m.role === "assistant")
          .map(m => ({ role: m.role, content: m.content })),
        model: model,
        system_prompt: systemPrompt,
      }),
    });

    const data = await response.json();
    typingEl.remove();

    if (!response.ok) {
      showError(data.message || "Something went wrong. Please try again.");
      return;
    }

    const meta = {
      model: data.model,
      response_time: data.response_time,
      tokens: data.usage?.total_tokens || 0,
    };

    addMessageToActiveSession("assistant", data.content, meta);
    renderMessage("assistant", data.content, meta);
    updateStats(meta);

  } catch (err) {
    typingEl.remove();
    showError("Connection failed. Please check your internet connection and try again.");
  } finally {
    sendBtn.disabled = false;
  }
}

function renderMessage(role, content, meta) {
  const chatWindow = document.getElementById("chatWindow");
  const emptyState = document.getElementById("emptyState");
  if (emptyState) emptyState.remove();

  const msgEl = document.createElement("div");
  msgEl.className = `message ${role}`;

  if (role === "assistant") {
    msgEl.innerHTML = renderMarkdown(content);
    highlightCodeBlocks(msgEl);
  } else {
    msgEl.textContent = content;
  }

  if (meta) {
    const metaEl = document.createElement("div");
    metaEl.className = "message-meta";
    metaEl.textContent = `${meta.model} · ${meta.response_time}s · ${meta.tokens} tokens`;
    msgEl.appendChild(metaEl);
  }

  chatWindow.appendChild(msgEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  const chatWindow = document.getElementById("chatWindow");
  const el = document.createElement("div");
  el.className = "typing-indicator";
  el.textContent = "AI is thinking...";
  chatWindow.appendChild(el);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return el;
}

function showError(message) {
  const banner = document.getElementById("errorBanner");
  banner.textContent = "⚠ " + message;
  banner.style.display = "block";
}

function hideError() {
  document.getElementById("errorBanner").style.display = "none";
}

function updateStats(meta) {
  document.getElementById("tokenStat").textContent = `Tokens: ${meta.tokens}`;
  document.getElementById("timeStat").textContent = `Time: ${meta.response_time}s`;
}

function loadActiveSessionIntoUI() {
  const session = getActiveSession();
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.innerHTML = "";

  if (session.messages.length === 0) {
    chatWindow.innerHTML = `<div class="empty-state" id="emptyState"><p>👋 Start a conversation, pick a template, or set a system prompt above.</p></div>`;
  } else {
    session.messages.forEach((m) => renderMessage(m.role, m.content, m.meta));
  }

  document.getElementById("systemPromptInput").value = session.systemPrompt || "";
  if (session.model) {
    document.getElementById("modelSelect").value = session.model;
  }

  hideError();
  document.getElementById("tokenStat").textContent = "Tokens: 0";
  document.getElementById("timeStat").textContent = "Time: 0s";
}

function exportActiveSession() {
  const session = getActiveSession();
  if (!session.messages.length) {
    alert("Nothing to export yet.");
    return;
  }

  let md = `# ${session.title}\n\n`;
  md += `_Exported from AI Workspace on ${new Date().toLocaleString()}_\n\n---\n\n`;

  session.messages.forEach((m) => {
    const speaker = m.role === "user" ? "**You**" : "**AI**";
    md += `${speaker}:\n\n${m.content}\n\n---\n\n`;
  });

  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${session.title.replace(/[^a-z0-9]/gi, "_")}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
