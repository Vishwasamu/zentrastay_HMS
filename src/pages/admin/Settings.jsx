import { useEffect, useMemo, useState } from "react";

const LS_KEY = "zs_admin_settings_v1";

const currencyOptions = [
  { code: "LKR", label: "Sri Lankan Rupee (LKR)", symbol: "Rs" },
  { code: "USD", label: "US Dollar (USD)", symbol: "$" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€" },
  { code: "GBP", label: "British Pound (GBP)", symbol: "£" },
  { code: "INR", label: "Indian Rupee (INR)", symbol: "₹" },
];

const timeFormatOptions = [
  { key: "12h", label: "12-hour (AM/PM)" },
  { key: "24h", label: "24-hour" },
];

const dateFormatOptions = [
  { key: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-01-18)" },
  { key: "DD/MM/YYYY", label: "DD/MM/YYYY (18/01/2026)" },
  { key: "MM/DD/YYYY", label: "MM/DD/YYYY (01/18/2026)" },
];

const langOptions = [
  { key: "en", label: "English" },
  { key: "si", label: "Sinhala" },
];

function safeParse(json, fallback) {
  try {
    const x = JSON.parse(json);
    return x && typeof x === "object" ? x : fallback;
  } catch {
    return fallback;
  }
}

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function fmtMoney(amount, code) {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(n);
  } catch {
    const m = currencyOptions.find((x) => x.code === code)?.symbol || code;
    return `${m} ${n.toFixed(2)}`;
  }
}

export default function AdminSettings() {
  const defaultSettings = useMemo(
    () => ({
      theme: "dark",
      currency: "LKR",
      timeFormat: "12h",
      dateFormat: "YYYY-MM-DD",
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      taxEnabled: false,
      taxRate: 0,
      serviceChargeEnabled: false,
      serviceChargeRate: 0,
      rounding: "none",
      compactTables: false,
      animations: true,
    }),
    []
  );

  const [settings, setSettings] = useState(defaultSettings);
  const [savedMsg, setSavedMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setSettings((p) => ({ ...p, ...safeParse(raw, {}) }));
  }, []);

  useEffect(() => {
    const t = settings.theme;
    const root = document.documentElement;
    root.setAttribute("data-zs-theme", t);
  }, [settings.theme]);

  const set = (k, v) => {
    setSavedMsg("");
    setErr("");
    setSettings((p) => ({ ...p, [k]: v }));
  };

  const save = () => {
    setErr("");
    try {
      if (settings.taxRate < 0 || settings.taxRate > 100) return setErr("Tax rate must be between 0 and 100");
      if (settings.serviceChargeRate < 0 || settings.serviceChargeRate > 100) return setErr("Service charge rate must be between 0 and 100");
      localStorage.setItem(LS_KEY, JSON.stringify(settings));
      setSavedMsg("Saved ✅");
      setTimeout(() => setSavedMsg(""), 1500);
    } catch {
      setErr("Save failed. Check browser storage.");
    }
  };

  const reset = () => {
    setErr("");
    setSavedMsg("");
    localStorage.removeItem(LS_KEY);
    setSettings(defaultSettings);
  };

  const preview = useMemo(() => {
    const base = 50000;
    const tax = settings.taxEnabled ? (base * Number(settings.taxRate || 0)) / 100 : 0;
    const svc = settings.serviceChargeEnabled ? (base * Number(settings.serviceChargeRate || 0)) / 100 : 0;
    let total = base + tax + svc;

    if (settings.rounding === "nearest") total = Math.round(total);
    if (settings.rounding === "ceil") total = Math.ceil(total);
    if (settings.rounding === "floor") total = Math.floor(total);

    return { base, tax, svc, total };
  }, [settings]);

  return (
    <div className="zs-page">
      <style>{`
        :root{
          --zs-bg:#0b1220;
          --zs-panel:#0f172a;
          --zs-panel2:#111c33;
          --zs-border:#1f2a44;
          --zs-text:#e5e7eb;
          --zs-muted:#9ca3af;
          --zs-primary:#6366f1;
          --zs-success:#10b981;
          --zs-danger:#ef4444;
          --zs-shadow: 0 18px 45px rgba(0,0,0,.35);
        }

        :root[data-zs-theme="light"]{
          --zs-bg:#f6f7fb;
          --zs-panel:#ffffff;
          --zs-panel2:#ffffff;
          --zs-border:#e5e7eb;
          --zs-text:#0f172a;
          --zs-muted:#64748b;
          --zs-primary:#4f46e5;
          --zs-shadow: 0 18px 45px rgba(2,6,23,.10);
        }

        .zs-page{
          min-height: 100vh;
          padding: 18px;
          background:
            radial-gradient(1100px 600px at 20% -10%, rgba(99,102,241,.20), transparent 60%),
            radial-gradient(900px 500px at 95% 10%, rgba(16,185,129,.14), transparent 55%),
            var(--zs-bg);
          color: var(--zs-text);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        }

        .zs-shell{
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          gap: 14px;
        }

        .zs-top{
          display:flex;
          flex-wrap:wrap;
          align-items:flex-end;
          justify-content:space-between;
          gap: 12px;
        }

        .zs-title{
          font-size: 22px;
          font-weight: 900;
          letter-spacing: .2px;
        }

        .zs-sub{
          margin-top: 4px;
          font-size: 13px;
          color: var(--zs-muted);
        }

        .zs-actions{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items:center;
        }

        .zs-btn{
          height: 40px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid var(--zs-border);
          background: rgba(255,255,255,.05);
          color: var(--zs-text);
          cursor:pointer;
          transition: .15s;
          white-space: nowrap;
        }
        :root[data-zs-theme="light"] .zs-btn{ background: rgba(2,6,23,.03); }

        .zs-btn:hover{ background: rgba(255,255,255,.08); }
        :root[data-zs-theme="light"] .zs-btn:hover{ background: rgba(2,6,23,.06); }

        .zs-btn-primary{
          border-color: rgba(99,102,241,.45);
          background: rgba(99,102,241,.18);
        }
        .zs-btn-primary:hover{ background: rgba(99,102,241,.26); }

        .zs-btn-danger{
          border-color: rgba(239,68,68,.35);
          background: rgba(239,68,68,.12);
          color: ${"#fecaca"};
        }
        :root[data-zs-theme="light"] .zs-btn-danger{ color: #7f1d1d; }

        .zs-note{
          font-size: 12px;
          color: var(--zs-muted);
        }

        .zs-alert{
          border-radius: 14px;
          border: 1px solid rgba(239,68,68,.35);
          background: rgba(239,68,68,.10);
          padding: 12px 14px;
          color: ${"#fecaca"};
          font-size: 13px;
        }
        :root[data-zs-theme="light"] .zs-alert{ color: #7f1d1d; }

        .zs-card{
          background: linear-gradient(180deg, var(--zs-panel), var(--zs-panel2));
          border: 1px solid var(--zs-border);
          border-radius: 18px;
          box-shadow: var(--zs-shadow);
          overflow:hidden;
        }

        .zs-cardHead{
          padding: 14px 16px;
          border-bottom: 1px solid var(--zs-border);
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap: 10px;
        }

        .zs-cardTitle{
          font-size: 15px;
          font-weight: 900;
        }

        .zs-cardDesc{
          margin-top: 4px;
          font-size: 12px;
          color: var(--zs-muted);
        }

        .zs-cardBody{ padding: 14px 16px 16px; }

        .zs-grid{
          display:grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media(min-width: 860px){
          .zs-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
        .zs-span2{ grid-column: 1 / -1; }

        .zs-field{
          display:flex;
          flex-direction:column;
          gap: 6px;
          min-width: 0;
        }
        .zs-label{
          font-size: 11px;
          color: var(--zs-muted);
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
        }

        .zs-input, .zs-select{
          height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid var(--zs-border);
          background: rgba(255,255,255,.05);
          color: var(--zs-text);
          outline: none;
          transition: .15s;
          width: 100%;
        }
        :root[data-zs-theme="light"] .zs-input,
        :root[data-zs-theme="light"] .zs-select{
          background: rgba(2,6,23,.03);
        }

        .zs-input:focus, .zs-select:focus{
          border-color: rgba(99,102,241,.55);
          box-shadow: 0 0 0 4px rgba(99,102,241,.14);
        }

        .zs-row{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items:center;
          justify-content:space-between;
        }

        .zs-toggle{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 12px;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid var(--zs-border);
          background: rgba(255,255,255,.03);
        }
        :root[data-zs-theme="light"] .zs-toggle{ background: rgba(2,6,23,.02); }

        .zs-toggleLeft{
          display:flex;
          flex-direction:column;
          gap: 2px;
          min-width: 0;
        }
        .zs-toggleTitle{
          font-weight: 900;
          font-size: 13px;
        }
        .zs-toggleSub{
          color: var(--zs-muted);
          font-size: 12px;
        }

        .zs-switch{
          width: 46px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid var(--zs-border);
          background: rgba(255,255,255,.04);
          position: relative;
          cursor: pointer;
          flex: none;
          transition: .15s;
        }

        .zs-knob{
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: var(--zs-text);
          position: absolute;
          top: 2px;
          left: 2px;
          transition: .15s;
        }

        .zs-switch[data-on="true"]{
          background: rgba(99,102,241,.22);
          border-color: rgba(99,102,241,.55);
        }
        .zs-switch[data-on="true"] .zs-knob{
          left: 22px;
          background: #fff;
        }

        .zs-kpi{
          display:grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media(min-width: 860px){
          .zs-kpi{ grid-template-columns: repeat(4, minmax(0,1fr)); }
        }

        .zs-stat{
          padding: 12px;
          border: 1px solid var(--zs-border);
          border-radius: 16px;
          background: rgba(255,255,255,.03);
        }
        :root[data-zs-theme="light"] .zs-stat{ background: rgba(2,6,23,.02); }

        .zs-statT{
          font-size: 11px;
          color: var(--zs-muted);
        }
        .zs-statV{
          margin-top: 3px;
          font-size: 16px;
          font-weight: 900;
        }

        .zs-pill{
          display:inline-flex;
          align-items:center;
          border: 1px solid rgba(99,102,241,.35);
          background: rgba(99,102,241,.10);
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          color: var(--zs-text);
        }
      `}</style>

      <div className="zs-shell">
        <div className="zs-top">
          <div>
            <div className="zs-title">Admin Settings</div>
            <div className="zs-sub">Theme, currency, formatting, taxes, UI preferences.</div>
          </div>

          <div className="zs-actions">
            {savedMsg ? <span className="zs-pill">{savedMsg}</span> : <span className="zs-note">Saved to browser (localStorage)</span>}
            <button className="zs-btn" onClick={reset}>Reset</button>
            <button className="zs-btn zs-btn-primary" onClick={save}>Save</button>
          </div>
        </div>

        {err ? <div className="zs-alert">{err}</div> : null}

        <div className="zs-card">
          <div className="zs-cardHead">
            <div>
              <div className="zs-cardTitle">Appearance</div>
              <div className="zs-cardDesc">Switch between light and dark mode + UI behavior.</div>
            </div>
          </div>

          <div className="zs-cardBody">
            <div className="zs-grid">
              <div className="zs-field">
                <div className="zs-label">
                  <span>Theme</span>
                  <span className="zs-note">Applied instantly</span>
                </div>
                <select className="zs-select" value={settings.theme} onChange={(e) => set("theme", e.target.value)}>
                  <option value="dark">dark</option>
                  <option value="light">light</option>
                </select>
              </div>

              <div className="zs-toggle">
                <div className="zs-toggleLeft">
                  <div className="zs-toggleTitle">Compact tables</div>
                  <div className="zs-toggleSub">Smaller row height for dense admin screens</div>
                </div>
                <div
                  className="zs-switch"
                  role="switch"
                  aria-checked={settings.compactTables}
                  data-on={String(settings.compactTables)}
                  onClick={() => set("compactTables", !settings.compactTables)}
                >
                  <div className="zs-knob" />
                </div>
              </div>

              <div className="zs-toggle">
                <div className="zs-toggleLeft">
                  <div className="zs-toggleTitle">Animations</div>
                  <div className="zs-toggleSub">Reduce motion if device is slow</div>
                </div>
                <div
                  className="zs-switch"
                  role="switch"
                  aria-checked={settings.animations}
                  data-on={String(settings.animations)}
                  onClick={() => set("animations", !settings.animations)}
                >
                  <div className="zs-knob" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="zs-card">
          <div className="zs-cardHead">
            <div>
              <div className="zs-cardTitle">Localization</div>
              <div className="zs-cardDesc">Currency + date/time formatting options.</div>
            </div>
          </div>

          <div className="zs-cardBody">
            <div className="zs-grid">
              <div className="zs-field">
                <div className="zs-label">Currency</div>
                <select className="zs-select" value={settings.currency} onChange={(e) => set("currency", e.target.value)}>
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="zs-field">
                <div className="zs-label">Language</div>
                <select className="zs-select" value={settings.language} onChange={(e) => set("language", e.target.value)}>
                  {langOptions.map((l) => (
                    <option key={l.key} value={l.key}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="zs-field">
                <div className="zs-label">Time format</div>
                <select className="zs-select" value={settings.timeFormat} onChange={(e) => set("timeFormat", e.target.value)}>
                  {timeFormatOptions.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="zs-field">
                <div className="zs-label">Date format</div>
                <select className="zs-select" value={settings.dateFormat} onChange={(e) => set("dateFormat", e.target.value)}>
                  {dateFormatOptions.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="zs-field zs-span2">
                <div className="zs-label">
                  <span>Timezone</span>
                  <span className="zs-note">Auto-detected</span>
                </div>
                <input className="zs-input" value={settings.timezone} onChange={(e) => set("timezone", e.target.value)} placeholder="Asia/Colombo" />
              </div>
            </div>
          </div>
        </div>

        <div className="zs-card">
          <div className="zs-cardHead">
            <div>
              <div className="zs-cardTitle">Billing Rules</div>
              <div className="zs-cardDesc">Tax/service charge and rounding settings (used in invoices & reports).</div>
            </div>
          </div>

          <div className="zs-cardBody">
            <div className="zs-grid">
              <div className="zs-toggle zs-span2">
                <div className="zs-toggleLeft">
                  <div className="zs-toggleTitle">Tax</div>
                  <div className="zs-toggleSub">Apply tax percentage to totals</div>
                </div>
                <div
                  className="zs-switch"
                  role="switch"
                  aria-checked={settings.taxEnabled}
                  data-on={String(settings.taxEnabled)}
                  onClick={() => set("taxEnabled", !settings.taxEnabled)}
                >
                  <div className="zs-knob" />
                </div>
              </div>

              <div className="zs-field">
                <div className="zs-label">Tax rate (%)</div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="zs-input"
                  value={settings.taxRate}
                  onChange={(e) => set("taxRate", Number(e.target.value))}
                  disabled={!settings.taxEnabled}
                />
              </div>

              <div className="zs-toggle zs-span2">
                <div className="zs-toggleLeft">
                  <div className="zs-toggleTitle">Service charge</div>
                  <div className="zs-toggleSub">Optional service charge percentage</div>
                </div>
                <div
                  className="zs-switch"
                  role="switch"
                  aria-checked={settings.serviceChargeEnabled}
                  data-on={String(settings.serviceChargeEnabled)}
                  onClick={() => set("serviceChargeEnabled", !settings.serviceChargeEnabled)}
                >
                  <div className="zs-knob" />
                </div>
              </div>

              <div className="zs-field">
                <div className="zs-label">Service charge rate (%)</div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="zs-input"
                  value={settings.serviceChargeRate}
                  onChange={(e) => set("serviceChargeRate", Number(e.target.value))}
                  disabled={!settings.serviceChargeEnabled}
                />
              </div>

              <div className="zs-field">
                <div className="zs-label">Rounding</div>
                <select className="zs-select" value={settings.rounding} onChange={(e) => set("rounding", e.target.value)}>
                  <option value="none">none</option>
                  <option value="nearest">nearest</option>
                  <option value="ceil">ceil</option>
                  <option value="floor">floor</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 14 }} className="zs-kpi">
              <div className="zs-stat">
                <div className="zs-statT">Sample base</div>
                <div className="zs-statV">{fmtMoney(preview.base, settings.currency)}</div>
              </div>
              <div className="zs-stat">
                <div className="zs-statT">Tax</div>
                <div className="zs-statV">{fmtMoney(preview.tax, settings.currency)}</div>
              </div>
              <div className="zs-stat">
                <div className="zs-statT">Service</div>
                <div className="zs-statV">{fmtMoney(preview.svc, settings.currency)}</div>
              </div>
              <div className="zs-stat">
                <div className="zs-statT">Total</div>
                <div className="zs-statV">{fmtMoney(preview.total, settings.currency)}</div>
              </div>
            </div>

            <div style={{ marginTop: 10 }} className="zs-note">
              Tip: later you can store these in DB (admin_settings table) instead of localStorage.
            </div>
          </div>
        </div>

        <div className="zs-card">
          <div className="zs-cardHead">
            <div>
              <div className="zs-cardTitle">How to use these settings in other pages</div>
              <div className="zs-cardDesc">Helper you can paste into reports/invoices pages.</div>
            </div>
          </div>

          <div className="zs-cardBody">
            <div className="zs-note" style={{ lineHeight: 1.7 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Read settings anywhere:</div>
              <div style={{ border: `1px solid var(--zs-border)`, borderRadius: 14, padding: 12, background: "rgba(255,255,255,.03)" }}>
                <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12 }}>
                  {[
                    `const s = JSON.parse(localStorage.getItem("${LS_KEY}") || "{}");`,
                    `const currency = s.currency || "LKR";`,
                    `const theme = s.theme || "dark";`,
                    `document.documentElement.setAttribute("data-zs-theme", theme);`,
                  ].join("\n")}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
