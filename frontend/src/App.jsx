import { useEffect, useState } from "react";

import Editor from "react-simple-code-editor";
import "prismjs/themes/prism-tomorrow.css";
import { highlight, languages } from "prismjs/components/prism-core";

import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/atom-one-dark.css";

import "./App.css";

const App = () => {
  const [code, setCode] = useState(`function add(a,b){
  return a+b
}
console.log(add(1+3))`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    prism.highlightAll();
  }, []);

  const reviewCode = async () => {
    setLoading(true);
    setError("");
    setReview("");
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch review. Please try again.");
      }
      const data = await response.text();
      setReview(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <>
      <header className="header">
        <span className="header-title">AI Code Reviewer</span>
        <span className="header-subtitle">Get instant, AI-powered code reviews</span>
      </header>
      <main>
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) =>
                prism.highlight(code, prism.languages.javascript, "javascript")
              }
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                border: "1px solid #ddd",
                borderRadius: "5px",
                height: "100%",
                width: "100%",
              }}
            />
          </div>
          <div
            className={`review-btn${loading ? " disabled" : ""}`}
            onClick={!loading ? reviewCode : undefined}
            tabIndex={loading ? -1 : 0}
            aria-disabled={loading}
            style={{ pointerEvents: loading ? "none" : "auto", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Reviewing..." : "Review"}
          </div>
        </div>
        <div className="right">
          {error && <div className="error-message">{error}</div>}
          {loading && !error && <div className="loader">Loading review...</div>}
          {!loading && !error && review && (
            <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
          )}
        </div>
      </main>
      <footer className="footer">
        Made by Rohit Kumar — powered by Gemini AI
      </footer>
    </>
  );
};

export default App;
