// sessions.js - manages multiple chat sessions, persisted in localStorage

const SESSIONS_KEY = "ai_workspace_sessions";
const ACTIVE_SESSION_KEY = "ai_workspace_active_session";

let sessions = {};
let activeSessionId = null;

function loadSessions() {
  try {
    sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || {};
  } catch {
    sessions = {};
  }
  activeSessionId = localStorage.getItem(ACTIVE_SESSION_KEY);

  if (!activeSessionId || !sessions[activeSessionId]) {
    createSession();
  }
}

function persistSessions() {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
}

function createSession() {
  const id = "session-" + Date.now();
  sessions[id] = {
    id,
    title: "New Chat",
    messages: [],       // [{role, content}]
    systemPrompt: "",
    model: null,
    createdAt: Date.now(),
  };
  activeSessionId = id;
  persistSessions();
  return id;
}

function getActiveSession() {
  return sessions[activeSessionId];
}

function switchSession(id) {
  if (sessions[id]) {
    activeSessionId = id;
    persistSessions();
  }
}

function deleteSession(id) {
  delete sessions[id];
  if (activeSessionId === id) {
    const remaining = Object.keys(sessions);
    activeSessionId = remaining.length ? remaining[0] : createSession();
  }
  persistSessions();
}

function addMessageToActiveSession(role, content, meta) {
  const session = getActiveSession();
  session.messages.push({ role, content, meta: meta || null });

  // Auto-title the session from the first user message
  if (session.title === "New Chat" && role === "user") {
    session.title = content.slice(0, 40) + (content.length > 40 ? "..." : "");
  }
  persistSessions();
}

function renderSessionList() {
  const list = document.getElementById("sessionList");
  list.innerHTML = "";

  const sortedSessions = Object.values(sessions).sort((a, b) => b.createdAt - a.createdAt);

  sortedSessions.forEach((session) => {
    const item = document.createElement("div");
    item.className = "session-item" + (session.id === activeSessionId ? " active" : "");

    const title = document.createElement("span");
    title.className = "session-title";
    title.textContent = session.title;
    item.appendChild(title);

    const delBtn = document.createElement("span");
    delBtn.className = "delete-session";
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Delete chat "${session.title}"?`)) {
        deleteSession(session.id);
        renderSessionList();
        loadActiveSessionIntoUI();
      }
    });
    item.appendChild(delBtn);

    item.addEventListener("click", () => {
      switchSession(session.id);
      renderSessionList();
      loadActiveSessionIntoUI();
    });

    list.appendChild(item);
  });
}
