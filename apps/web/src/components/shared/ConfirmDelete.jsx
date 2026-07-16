import { useState } from "react";

export function ConfirmDelete({ label = "Delete", onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span>
        <button className="btn danger" onClick={onConfirm} style={{ marginRight: 8 }}>
          Confirm delete
        </button>
        <button className="btn secondary" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button className="btn danger" onClick={() => setConfirming(true)}>
      {label}
    </button>
  );
}
