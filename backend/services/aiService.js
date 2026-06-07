// ─── STRICTNESS MODES ─────────────────────────────────────────────────────────
const STRICTNESS_CONFIG = {
  standard: {
    label: "Standard Review",
    extra: "Provide a balanced, well-rounded review covering quality, bugs, and best practices.",
  },
  nitpicky: {
    label: "Nitpicky (Detailed)",
    extra:
      "Be extremely thorough. Point out every minor style inconsistency, naming issue, redundant line, and potential edge case. Leave nothing unchecked.",
  },
  security: {
    label: "Security-Focused",
    extra:
      "Prioritize security above all else. Deeply analyze for injection vulnerabilities (SQL, XSS, CSRF), insecure data exposure, broken auth, improper error handling that leaks info, and dependency risks. Reference OWASP where relevant.",
  },
  performance: {
    label: "Performance-Focused",
    extra:
      "Focus primarily on performance. Identify algorithmic inefficiencies (Big-O), memory leaks, unnecessary re-renders or re-computations, blocking I/O, and suggest profiling strategies.",
  },
};

// ─── SYSTEM PROMPT BUILDER ────────────────────────────────────────────────────
const buildSystemPrompt = (language, strictness) => {
  const mode = STRICTNESS_CONFIG[strictness] || STRICTNESS_CONFIG.standard;
  const lang = language || "the given";

  return `You are an elite code reviewer with 10+ years of experience across systems programming, web development, and distributed systems. You are reviewing ${lang} code.

## Your Core Responsibilities:
- **Code Quality**: Ensure clean, maintainable, well-structured code.
- **Best Practices**: Suggest industry-standard patterns for ${lang}.
- **Efficiency & Performance**: Identify costly computations and redundant operations.
- **Error Detection**: Spot bugs, security risks, logical flaws, and edge cases.
- **Scalability**: Advise on architecture improvements for future growth.
- **Readability**: Ensure the code is easy to understand and modify.

## Review Mode: ${mode.label}
${mode.extra}

## Output Format (ALWAYS follow this structure):

### 📊 Overall Score
Give a score out of 10 with a one-line summary.

### 🔍 Issues Found
List all issues using this format for EACH issue:
**[SEVERITY: 🔴 Critical | 🟠 Major | 🟡 Minor | 🔵 Suggestion]** — Issue title
- *What:* Brief description of the problem.
- *Why:* Why this is an issue (impact).
- *Fix:* Show the corrected code snippet.

### ✅ What's Done Well
Briefly acknowledge 2-3 genuine strengths.

### 🚀 Key Recommendations Summary
A numbered list of the top 3-5 actionable improvements in priority order.

## Tone Guidelines:
- Be precise, direct, and professional. No unnecessary flattery.
- Always show corrected code snippets where possible.
- Assume the developer is competent — give expert-level explanations.
`;
};

// ─── STREAMING AI SERVICE ─────────────────────────────────────────────────────
/**
 * Streams the AI review response using Server-Sent Events.
 * @param {string} code - The code to review
 * @param {string} language - Programming language (e.g. "javascript")
 * @param {string} strictness - Review mode key ("standard" | "nitpicky" | "security" | "performance")
 * @param {import('express').Response} res - Express response object (SSE stream)
 */
const streamAIReview = async (code, language, strictness, res) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not configured on the server.");

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`;

  const payload = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt(language, strictness) }],
    },
    contents: [
      {
        parts: [{ text: code }],
      },
    ],
    generationConfig: {
      temperature: 0.4, // More deterministic for code reviews
      maxOutputTokens: 8192,
    },
  };

  const geminiResponse = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!geminiResponse.ok) {
    const errorBody = await geminiResponse.text();
    console.error("Gemini API error:", errorBody);
    throw new Error(`Gemini API returned ${geminiResponse.status}: ${errorBody}`);
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const reader = geminiResponse.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE lines are separated by "\n\n". Each line may start with "data: "
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (chunk) {
            // Send chunk as SSE event
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
        } catch {
          // Non-JSON line — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
    // Send a final "done" event so the client knows streaming is complete
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
};

export { streamAIReview, STRICTNESS_CONFIG };
