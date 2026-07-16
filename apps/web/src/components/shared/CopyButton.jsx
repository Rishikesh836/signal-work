import { useState } from "react";

export function CopyButton({ text, onCopied }) {
  const [state, setState] = useState("idle"); // idle | copied | manual

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      onCopied?.();
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("manual");
    }
  }

  if (state === "manual") {
    return (
      <div>
        <textarea readOnly value={text} rows={4} onFocus={(e) => e.target.select()} />
        <p style={{ fontSize: "0.8em", color: "var(--danger)" }}>
          Clipboard access is blocked here — select the text above and copy manually.
        </p>
      </div>
    );
  }

  return (
    <button className="btn secondary" onClick={handleClick}>
      {state === "copied" ? "Copied!" : "Copy"}
    </button>
  );
}
