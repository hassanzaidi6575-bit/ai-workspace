// markdown.js - renders AI responses as formatted HTML with code highlighting

function renderMarkdown(text) {
  if (typeof marked === "undefined") {
    return escapeHtml(text);
  }
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
  const html = marked.parse(text);
  return html;
}

function highlightCodeBlocks(container) {
  if (typeof hljs === "undefined") return;
  container.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
