import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function GuestChat() {
  const nav = useNavigate();
  const { user, authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const listRef = useRef(null);

  const token = useMemo(() => localStorage.getItem("token") || "", []);
  const guestId = useMemo(() => localStorage.getItem("guest_id") || "", []);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const fetchThread = async () => {
    setErr("");
    setLoading(true);
    try {
      const data = await api.get(`/guest/chat/thread`);
      const cid = data?.chat_id || null;
      setChatId(cid);
    } catch (e) {
      setErr(e.message || "Failed to load chat thread");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (cid) => {
    if (!cid) return;
    setErr("");
    try {
      const data = await api.get(
        `/guest/chat/messages?chat_id=${encodeURIComponent(cid)}`
      );
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      requestAnimationFrame(scrollToBottom);
    } catch (e) {
      setErr(e.message || "Failed to load messages");
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      nav("/guest/login", { replace: true });
      return;
    }
    fetchThread();
  }, [authLoading, user, nav]);

  useEffect(() => {
    if (!chatId) return;
    fetchMessages(chatId);
    const t = setInterval(() => fetchMessages(chatId), 2000);
    return () => clearInterval(t);
  }, [chatId]);

  const sendMessage = async () => {
    const v = String(text || "").trim();
    if (!v || sending || !chatId) return;

    setSending(true);
    setErr("");

    const optimistic = {
      id: `tmp-${Date.now()}`,
      sender_role: "GUEST",
      message: v,
      created_at: new Date().toISOString(),
      pending: true,
    };

    setMessages((p) => [...p, optimistic]);
    setText("");
    requestAnimationFrame(scrollToBottom);

    try {
      await api.post("/guest/chat/send", {
        chat_id: chatId,
        message: v,
      });
      await fetchMessages(chatId);
    } catch (e) {
      setErr(e.message || "Failed to send message");
      setMessages((p) => p.filter((m) => m.id !== optimistic.id));
      setText(v);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={head}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Guest Chat</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Message the front desk</div>
          </div>

          <button
            type="button"
            style={btn}
            onClick={() => chatId && fetchMessages(chatId)}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {err && <div style={errorBox}>{err}</div>}

        <div style={body}>
          {loading ? (
            <div style={{ padding: 16, opacity: 0.8 }}>Loading...</div>
          ) : (
            <div ref={listRef} style={list}>
              {messages.length === 0 ? (
                <div style={{ padding: 16, opacity: 0.7 }}>No messages yet. Say hello 👋</div>
              ) : (
                messages.map((m) => {
                  const mine = String(m.sender_role || "").toUpperCase() === "GUEST";
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        justifyContent: mine ? "flex-end" : "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "78%",
                          padding: "10px 12px",
                          borderRadius: 14,
                          background: mine ? "#4f46e5" : "#1f2937",
                          color: "#fff",
                          border: mine ? "1px solid #4f46e5" : "1px solid #374151",
                          opacity: m.pending ? 0.7 : 1,
                        }}
                      >
                        <div style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{m.message}</div>
                        <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>
                          {formatTime(m.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <form onSubmit={onSubmit} style={composer}>
            <input
              style={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              style={btnPrimary}
              type="submit"
              disabled={loading || sending || !String(text).trim()}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const wrap = {
  width: "100%",
  maxWidth: 1000,
  margin: "24px auto",
  padding: "0 12px",
};

const card = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  color: "#e5e7eb",
  overflow: "hidden",
};

const head = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  borderBottom: "1px solid #1f2937",
};

const body = {
  display: "flex",
  flexDirection: "column",
  height: "70vh",
};

const list = {
  flex: 1,
  overflowY: "auto",
  padding: 16,
  background: "#0b1220",
};

const composer = {
  display: "flex",
  gap: 10,
  padding: 12,
  borderTop: "1px solid #1f2937",
  background: "#111827",
};

const input = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#e5e7eb",
  outline: "none",
  fontSize: 14,
};

const btn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#e5e7eb",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};

const btnPrimary = {
  ...btn,
  border: "1px solid #4f46e5",
  background: "#4f46e5",
};

const errorBox = {
  margin: 16,
  padding: 12,
  borderRadius: 12,
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fecaca",
  fontSize: 14,
};
