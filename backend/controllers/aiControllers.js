import { streamAIReview } from "../services/aiService.js";

// ─── Max code length: 15,000 characters (~500 lines of code) ─────────────────
const MAX_CODE_LENGTH = 15000;

// ─── Allowed language values ──────────────────────────────────────────────────
const ALLOWED_LANGUAGES = new Set([
  "javascript", "typescript", "python", "java", "c", "cpp", "csharp",
  "go", "rust", "php", "ruby", "swift", "kotlin", "scala", "r",
  "html", "css", "sql", "shell", "plaintext",
]);

const ALLOWED_STRICTNESS = new Set(["standard", "nitpicky", "security", "performance"]);

// ─── CONTROLLER ───────────────────────────────────────────────────────────────
const getReview = async (req, res) => {
  const { code, language = "plaintext", strictness = "standard" } = req.body;

  // Input validation
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "code (string) is required in the request body." });
  }

  const trimmedCode = code.trim();
  if (!trimmedCode) {
    return res.status(400).json({ error: "code cannot be empty." });
  }

  if (trimmedCode.length > MAX_CODE_LENGTH) {
    return res.status(413).json({
      error: `Code exceeds the maximum allowed length of ${MAX_CODE_LENGTH.toLocaleString()} characters. Please shorten your code.`,
    });
  }

  if (!ALLOWED_LANGUAGES.has(language)) {
    return res.status(400).json({
      error: `Unsupported language: "${language}". Use one of: ${[...ALLOWED_LANGUAGES].join(", ")}.`,
    });
  }

  if (!ALLOWED_STRICTNESS.has(strictness)) {
    return res.status(400).json({
      error: `Invalid strictness mode: "${strictness}". Use: standard, nitpicky, security, or performance.`,
    });
  }

  try {
    await streamAIReview(trimmedCode, language, strictness, res);
  } catch (err) {
    console.error("❌ Review stream error:", err.message);
    // Only send error if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || "An unexpected error occurred." });
    }
  }
};

export { getReview };
