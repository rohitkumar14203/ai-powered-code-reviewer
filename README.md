<p align="center">
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-Free_Tier-8E75FF?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Monaco_Editor-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" />
</p>

# ⚡ CodePulse

> A real-time, AI-powered code review and execution platform built with **Gemini 2.5 Flash (Free Tier)**.  
> Paste code → get senior-developer-level feedback in seconds, streamed token-by-token.

---

## ✨ Features

### Core
| Feature | Description |
|---------|-------------|
| **Real-time SSE Streaming** | Reviews stream token-by-token via Server-Sent Events — no waiting for the full response |
| **Monaco Editor** | The same editor powering VS Code — syntax highlighting, minimap, bracket pairs, and IntelliSense |
| **18 Languages** | JavaScript, TypeScript, Python, Java, C++, Go, Rust, PHP, Ruby, Swift, Kotlin, and more |
| **4 Review Modes** | Standard, Nitpicky, Security-Focused, and Performance-Focused — each injects a tailored system prompt |
| **Built-in JS Runner** | Execute JavaScript directly in the browser via sandboxed Web Workers — zero API dependency |

### Intelligence
| Feature | Description |
|---------|-------------|
| **Auto Language Detection** | Identifies the programming language from code content using pattern-matching heuristics |
| **Animated Score Ring** | Parses the AI's overall score (X/10) and renders it as an animated SVG progress ring |
| **Structured Output** | AI returns organized sections: Score → Issues (by severity) → Strengths → Recommendations |

### UX & Design
| Feature | Description |
|---------|-------------|
| **Dark / Light Mode** | Toggle with zero flash-of-wrong-theme via inline `<script>` in HTML |
| **Skeleton Loading** | Shimmering placeholder blocks while the AI generates the first token |
| **Toast Notifications** | Non-intrusive slide-in feedback for copy, export, errors, and rate limits |
| **Keyboard Shortcuts** | `Ctrl+Enter` to review, `Ctrl+L` to clear, `Ctrl+/` for shortcut cheat-sheet |
| **Review History** | Last 10 reviews saved to `localStorage` with per-item delete |
| **Copy & Export** | One-click copy to clipboard or export as `.md` file |
| **PWA Support** | Installable as a desktop/mobile app with offline shell caching |

### Backend & Security
| Feature | Description |
|---------|-------------|
| **Rate Limiting** | 10 requests/minute per IP via `express-rate-limit` — protects the free API quota |
| **Input Validation** | 15,000 char limit, language allowlist, strictness allowlist, and type checks |
| **CORS Allowlist** | Dynamic origin validation instead of wildcard `*` |
| **Global Error Handler** | Catches unhandled errors and returns clean JSON responses |
---

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Gemini API Key** — [Get one free](https://aistudio.google.com/apikey)

### 1. Clone & Install

```bash
git clone https://github.com/rohitkumar14203/codepulse.git
cd codepulse

# Install root + backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
# Root .env (backend)
PORT=3000
GOOGLE_API_KEY=your_gemini_api_key_here
```

```bash
# frontend/.env
VITE_BACKEND_API=http://localhost:3000/ai/get-review
```

### 3. Run

```bash
npm run dev
```

Starts both backend (port 3000) and frontend (port 5173) concurrently.



## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Submit code for review |
| `Ctrl + L` | Clear the editor |
| `Ctrl + /` | Toggle shortcuts panel |
| `Escape` | Close sidebar / modal |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Tailwind CSS v4, Monaco Editor, Lucide Icons |
| **Markdown** | react-markdown + rehype-highlight |
| **Backend** | Express 5, Node.js |
| **AI Model** | Gemini 2.5 Flash (Free Tier) |
| **Streaming** | Server-Sent Events (SSE) |
| **Code Runner** | Sandboxed Web Worker (client-side JS) |
| **PWA** | Service Worker, Web App Manifest |

---

## 📄 License

MIT — Built by [Rohit Kumar](https://github.com/rohitkumar14203)
