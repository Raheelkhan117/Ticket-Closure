import { useState, useRef } from "react";

const categories = ["Incident", "Service Request", "Change", "Problem", "Alert"];
const impactOptions = ["No service impact.", "Minor service impact.", "Moderate service impact.", "Major service impact.", "Critical service impact."];

function calcDuration(start, end) {
  if (!start || !end) return "";
  const diff = new Date(end) - new Date(start);
  if (diff < 0) return "Invalid range";
  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${days}d, ${String(hours).padStart(2, "0")}h, ${String(mins).padStart(2, "0")}m, ${String(secs).padStart(2, "0")}s`;
}

function formatDateTime(val) {
  if (!val) return "";
  const d = new Date(val);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${mins}:00 ${ampm}`;
}

export default function App() {
  const [form, setForm] = useState({
    ticket: "",
    category: "Incident",
    issue: "",
    start: "",
    end: "",
    impact: "No service impact.",
    rca: "",
  });
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const tableRef = useRef(null);

  const isRequest = form.category === "Service Request";
  const duration = calcDuration(form.start, form.end);
  const ready = form.ticket && form.issue && form.start && form.end && (isRequest || form.rca) && duration !== "Invalid range" && duration !== "";

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setGenerated(false);
    setCopied(false);
  }

  function handleGenerate() {
    if (ready) setGenerated(true);
  }

  function handleCopy() {
    const rows = [
      ["Ticket#", form.ticket],
      ["Category", form.category],
      ["Issue", form.issue],
      ["Start", formatDateTime(form.start)],
      ["End", formatDateTime(form.end)],
      ["Duration", duration],
      ...(!isRequest ? [["Impact", form.impact], ["Root Cause (RCA)", form.rca]] : []),
    ];
    const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const rows = [
    ["Ticket#", form.ticket],
    ["Category", form.category],
    ["Issue", form.issue],
    ["Start", formatDateTime(form.start)],
    ["End", formatDateTime(form.end)],
    ["Duration", duration],
    ...(!isRequest ? [["Impact", form.impact], ["Root Cause (RCA)", form.rca]] : []),
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1923 0%, #1a2a3a 60%, #0d2137 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "32px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 720 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #c8a96e, #e8c98a, #c8a96e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: 28,
            fontWeight: "bold",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 6,
          }}>Ticket Closure Generator</div>
          <div style={{ color: "#7a9bb5", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>Support · Incident Management</div>
        </div>

        {/* Form Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(200,169,110,0.2)",
          borderRadius: 12,
          padding: "32px 36px",
          marginBottom: 28,
          backdropFilter: "blur(8px)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 28px" }}>

            {/* Ticket Number */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>Ticket #</Label>
              <Input name="ticket" value={form.ticket} onChange={handleChange} placeholder="e.g. 1763458692553" />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <select name="category" value={form.category} onChange={handleChange} style={selectStyle}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Issue */}
            <div>
              <Label>Issue</Label>
              <Input name="issue" value={form.issue} onChange={handleChange} placeholder="e.g. Intellicon not working." />
            </div>

            {/* Start */}
            <div>
              <Label>Start Date & Time</Label>
              <Input type="datetime-local" name="start" value={form.start} onChange={handleChange} />
            </div>

            {/* End */}
            <div>
              <Label>End Date & Time</Label>
              <Input type="datetime-local" name="end" value={form.end} onChange={handleChange} />
            </div>

            {/* Impact */}
            {!isRequest && <div>
              <Label>Impact</Label>
              <select name="impact" value={form.impact} onChange={handleChange} style={selectStyle}>
                {impactOptions.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>}

            {/* RCA */}
            {!isRequest && <div>
              <Label>Root Cause (RCA)</Label>
              <Input name="rca" value={form.rca} onChange={handleChange} placeholder="e.g. Internal network issues | Network performance." />
            </div>}

          </div>

          {/* Duration preview */}
          {form.start && form.end && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(200,169,110,0.08)", borderRadius: 7, border: "1px solid rgba(200,169,110,0.18)", color: "#c8a96e", fontSize: 13, letterSpacing: 1 }}>
              ⏱ Duration: <strong>{duration}</strong>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!ready}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "13px 0",
              background: ready ? "linear-gradient(90deg, #b8943e, #e8c98a, #b8943e)" : "rgba(255,255,255,0.07)",
              color: ready ? "#0f1923" : "#4a6070",
              border: "none",
              borderRadius: 8,
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: "bold",
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: ready ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            Generate Closure Table
          </button>
        </div>

        {/* Output Table */}
        {generated && (
          <div style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid rgba(200,169,110,0.4)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}>
            <table ref={tableRef} style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              <tbody>
                {rows.map(([key, val], i) => (
                  <tr key={key} style={{ background: i % 2 === 0 ? "#f2f5f7" : "#ffffff" }}>
                    <td style={{
                      padding: "10px 14px",
                      fontWeight: "600",
                      color: "#1a2a3a",
                      border: "1px solid #ccc",
                      width: "38%",
                      whiteSpace: "nowrap",
                    }}>{key}</td>
                    <td style={{
                      padding: "10px 14px",
                      color: "#222",
                      border: "1px solid #ccc",
                    }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Copy Button */}
            <div style={{ padding: "14px 18px", background: "#f8f9fa", borderTop: "1px solid #ddd", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: "9px 24px",
                  background: copied ? "#2e7d52" : "#1a2a3a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: "600",
                  letterSpacing: 1,
                  cursor: "pointer",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {copied ? "✓ Copied!" : "⎘ Copy to Clipboard"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ color: "#a0b8cc", fontSize: 11.5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Georgia', serif" }}>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "9px 12px",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(200,169,110,0.25)",
        borderRadius: 7,
        color: "#e8e8e8",
        fontSize: 13.5,
        fontFamily: "'Georgia', serif",
        outline: "none",
        boxSizing: "border-box",
        colorScheme: "dark",
        ...props.style,
      }}
    />
  );
}

const selectStyle = {
  width: "100%",
  padding: "9px 12px",
  background: "#1a2d3f",
  border: "1px solid rgba(200,169,110,0.25)",
  borderRadius: 7,
  color: "#e8e8e8",
  fontSize: 13.5,
  fontFamily: "'Georgia', serif",
  outline: "none",
  boxSizing: "border-box",
};
