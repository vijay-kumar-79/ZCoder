import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { CODE_SNIPPETS } from "./constants";
import LanguageSelector from "./LanguageSelector";
import "./CodeEditor.css";

const JUDGE_POLL_INTERVAL_MS = 500;
const JUDGE_POLL_TIMEOUT_MS = 30000;
const MAX_CODE_BYTES = 100 * 1024;
const EDITOR_THEME = "zcoder-dark";

// Custom Monaco theme built from the ZCoder design tokens (see index.css) so
// the editor blends with the app instead of stock vs-dark.
const defineEditorTheme = (monaco) => {
  monaco.editor.defineTheme(EDITOR_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6B7589", fontStyle: "italic" },
      { token: "keyword", foreground: "4CC9F0" },
      { token: "string", foreground: "6FDB9E" },
      { token: "number", foreground: "F0B24B" },
      { token: "type", foreground: "7FC9EF" },
      { token: "type.identifier", foreground: "9AD9F0" },
      { token: "predefined", foreground: "6FD3F5" },
      { token: "function", foreground: "E8EDF6" },
    ],
    colors: {
      "editor.background": "#141925",
      "editor.foreground": "#E8EDF6",
      "editorCursor.foreground": "#4CC9F0",
      "editor.selectionBackground": "rgba(76, 201, 240, 0.20)",
      "editor.inactiveSelectionBackground": "rgba(76, 201, 240, 0.10)",
      "editor.lineHighlightBackground": "rgba(76, 201, 240, 0.05)",
      "editorLineNumber.foreground": "#4E5870",
      "editorLineNumber.activeForeground": "#8A94A9",
      "editorIndentGuide.background": "#202838",
      "editorIndentGuide.activeBackground": "#3A455C",
      "scrollbarSlider.background": "#2E3648CC",
      "scrollbarSlider.hoverBackground": "#4CC9F066",
      "scrollbarSlider.activeBackground": "#4CC9F099",
      "editorWidget.background": "#1A2030",
      "editorWidget.border": "#242B3B",
      "editorSuggestWidget.background": "#1A2030",
      "editorSuggestWidget.border": "#242B3B",
      "editorSuggestWidget.selectedBackground": "#243043",
      "editorSuggestWidget.highlightForeground": "#4CC9F0",
      "focusBorder": "#4CC9F0",
    },
  });
};

export default function CodeEditor({
  value,
  onChange,
  inputValue,
  onInputChange,
  language,
  onLanguageChange,
}) {
  const [output, setOutput] = useState({ text: "", tone: null });
  const [isRunning, setIsRunning] = useState(false);
  const backend = process.env.REACT_APP_BACKEND_URL;

  // When the language changes from outside (mount, or a room peer switching
  // languages), an empty buffer — or one still showing a starter template —
  // is replaced with the new language's snippet. Keyed on language only on
  // purpose: onChange/value change on every keystroke.
  useEffect(() => {
    const isDefaultSnippet = Object.values(CODE_SNIPPETS).includes(value);
    if (isDefaultSnippet || !value) {
      onChange(CODE_SNIPPETS[language]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Swap the starter template synchronously when the user picks a language in
  // the dropdown, so the editor refreshes immediately regardless of value state.
  const handleLanguageChange = (newLanguage) => {
    if (newLanguage === language) return;
    const isDefaultSnippet = Object.values(CODE_SNIPPETS).includes(value);
    if (isDefaultSnippet || !value) {
      onChange(CODE_SNIPPETS[newLanguage]);
    }
    onLanguageChange(newLanguage);
  };

  // Turn a judge result into the text + color tone shown in the output box
  const buildOutput = (data) => {
    const { status, stdout, stderr, exitCode, timeMs } = data;
    const stderrText = stderr || "";
    let verdict;
    let tone;

    if (status === "completed") {
      verdict = timeMs != null ? `Passed (${timeMs} ms)` : "Passed";
      tone = "pass";
    } else if (status === "error") {
      if (stderrText.includes("Time limit exceeded")) {
        verdict = "Time Limit Exceeded";
        tone = "warn";
      } else if (exitCode === 137) {
        verdict = "Out of Memory";
        tone = "fail";
      } else if (exitCode === null) {
        verdict = "Killed / timed out";
        tone = "warn";
      } else {
        verdict = `Error (exit code ${exitCode})`;
        tone = "fail";
      }
    } else {
      verdict = String(status);
      tone = "fail";
    }

    const lines = [`Verdict: ${verdict}`];
    if (stdout) lines.push("", "stdout:", stdout.replace(/\s+$/, ""));
    if (stderrText) lines.push("", "stderr:", stderrText.replace(/\s+$/, ""));
    return { text: lines.join("\n"), tone };
  };

  const runCode = async () => {
    if (!value || isRunning) return;

    if (new Blob([value]).size > MAX_CODE_BYTES) {
      setOutput({ tone: "fail", text: "Error: code is too large (max 100 KB)." });
      return;
    }

    setIsRunning(true);
    setOutput({ tone: null, text: "Running..." });
    try {
      const submitRes = await axios.post(`${backend}/api/judge/submissions`, {
        language,
        code: value,
        stdin: inputValue || "",
      });
      const { id } = submitRes.data;

      // The judge API has no push channel — poll until the run finishes.
      const deadline = Date.now() + JUDGE_POLL_TIMEOUT_MS;
      let result = null;
      while (Date.now() < deadline) {
        const res = await axios.get(`${backend}/api/judge/submissions/${id}`);
        if (res.data.status !== "queued") {
          result = res.data;
          break;
        }
        await new Promise((r) => setTimeout(r, JUDGE_POLL_INTERVAL_MS));
      }
      if (!result) throw new Error("Timed out waiting for the judge result");
      setOutput(buildOutput(result));
    } catch (err) {
      console.error(err);
      setOutput({
        tone: "fail",
        text: err.response?.data?.error || err.message || "Error running code",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="editor-container">
      <h1 className="editor-heading">Online IDE</h1>

      <LanguageSelector
        language={language}
        setLanguage={handleLanguageChange}
      />

      <div className="monaco-shell">
        <Editor
          height="300px"
          language={language === "cpp" ? "cpp" : language}
          theme={EDITOR_THEME}
          beforeMount={defineEditorTheme}
          value={value}
          onChange={onChange}
          options={{
            // Disable autosuggestions
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            wordBasedSuggestions: false,
            snippetsSuggestions: "none",
            parameterHints: { enabled: false },
            minimap: { enabled: false },
            fontSize: 13.5,
            fontFamily:
              'ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Consolas, "Liberation Mono", monospace',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      <textarea
        className="input-box"
        rows="4"
        placeholder="Enter input here..."
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
      />

      <button onClick={runCode} disabled={isRunning} className="run-button">
        {isRunning ? "Running..." : "Run Code"}
      </button>

      <h2 className="output-heading">Output:</h2>
      <pre className={`output-box ${output.tone || ""}`}>{output.text}</pre>
    </div>
  );
}
