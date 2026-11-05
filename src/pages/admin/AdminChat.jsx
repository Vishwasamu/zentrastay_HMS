import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../lib/api";

export default function AdminChat() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const listRef = useRef(null);

  useMemo(() => localStorage.getItem("token") || "", []);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const fetchChats = async () => {
    setErr("");
    setLoading(true);
    try {
      const data = await api.get(`/admin/chats/list`);
      const chatsList = Array.isArray(data?.chats) ? data.chats : [];
      setChats(chatsList);
      if (chatsList.length > 0 && !activeChatId) setActiveChatId(chatsList[0].id);
    } catch (e) {
      setErr(e.message || "Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (cid) => {
    if (!cid) return;
    try {
      const data = await api.get(
        `/admin/chats/messages?chat_id=${encodeURIComponent(cid)}`
      );
      const msgs = Array.isArray(data?.messages) ? data.messages : [];
      setMessages(msgs);
      requestAnimationFrame(scrollToBottom);
    } catch (e) {
      setErr(e.message || "Failed to load messages");
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    fetchMessages(activeChatId);
    const t = setInterval(() => fetchMessages(activeChatId), 2000);
    return () => clearInterval(t);
  }, [activeChatId]);

  const send = async () => {
    const v = String(text || "").trim();
    if (!v || sending || !activeChatId) return;

    setSending(true);
    setErr("");

    try {
      await api.post("/admin/chats/send", {
        chat_id: activeChatId,
        message: v,
      });
      setText("");
      await fetchMessages(activeChatId);
    } catch (e) {
      setErr(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const filteredChats = chats.filter((c) => {
    const name = (c.guest_name || c.name || "").toLowerCase();
    const email = (c.guest_email || c.email || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const activeChat = chats.find((c) => c.id === activeChatId);

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  return (
    <div style={wrap}>
      <aside style={left}>
        <div style={leftTop}>
          <div style={{ fontWeight: 800 }}>Support Chat</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{chats.length} chats</div>
        </div>

        <div style={searchWrap}>
          <input
            style={searchInput}
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {err && <div style={errorBox}>{err}</div>}

        <div style={chatList}>
          {loading ? (
            <div style={{ padding: 12, opacity: 0.8 }}>Loading chats...</div>
          ) : filteredChats.length === 0 ? (
            <div style={{ padding: 12, opacity: 0.8 }}>No chats yet</div>
          ) : (
            filteredChats.map((c) => {
              const active = c.id === activeChatId;
              const guestName = c.guest_name || c.name || "Guest";
              const lastMsg = c.last_message || "No messages yet";
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveChatId(c.id)}
                  style={{
                    ...chatRow,
                    background: active ? "rgba(34,197,94,0.12)" : "transparent",
                    borderColor: active ? "rgba(34,197,94,0.45)" : "transparent",
                  }}
                >
                  <div style={avatar}>{guestName?.slice(0, 1) || "G"}</div>
                  <div style={{ minWidth: 0, textAlign: "left" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {guestName}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {lastMsg}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <main style={right}>
        <header style={topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={avatarBig}>{(activeChat?.guest_name || activeChat?.name || "G").slice(0, 1)}</div>
            <div>
              <div style={{ fontWeight: 800 }}>
                {activeChat?.guest_name || activeChat?.name || "Select a chat"}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {activeChat?.guest_email || activeChat?.email || "No guest selected"}
              </div>
            </div>
          </div>
        </header>

        {!activeChatId ? (
          <div style={emptyState}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No chat selected</div>
            <div style={{ opacity: 0.8 }}>Select a conversation from the list</div>
          </div>
        ) : (
          <>
            <div style={messagesArea} ref={listRef}>
              {messages.length === 0 ? (
                <div style={{ padding: 16, opacity: 0.7 }}>No messages in this chat</div>
              ) : (
                messages.map((m) => {
                  const isFromAdmin = String(m.sender_role || "").toUpperCase() === "ADMIN";
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        justifyContent: isFromAdmin ? "flex-end" : "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <div style={isFromAdmin ? bubbleMine : bubbleOther}>
                        <div style={{ whiteSpace: "pre-wrap" }}>{m.message}</div>
                        <div style={timeText}>{formatTime(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={composer}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a message..."
                style={inputBox}
                rows={1}
              />
              <button onClick={send} style={sendBtn} disabled={sending || !text.trim()}>
                {sending ? "..." : "Send"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const wrap = {
  width: "100%",
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  background: "#0b1220",
  color: "#e5e7eb",
};

const left = {
  borderRight: "1px solid #1f2937",
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
};

const leftTop = {
  padding: 14,
  background: "#111827",
  borderBottom: "1px solid #1f2937",
};

const searchWrap = { padding: 12, borderBottom: "1px solid #1f2937" };

const searchInput = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#e5e7eb",
  outline: "none",
  fontSize: 13,
};

const errorBox = {
  margin: 12,
  padding: 10,
  borderRadius: 8,
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fecaca",
  fontSize: 12,
};

const chatList = { padding: 10, display: "grid", gap: 8, overflowY: "auto" };

const chatRow = {
  width: "100%",
  border: "1px solid transparent",
  borderRadius: 14,
  padding: 10,
  display: "flex",
  gap: 10,
  alignItems: "center",
  cursor: "pointer",
  color: "#e5e7eb",
  background: "transparent",
};

const avatar = {
  width: 42,
  height: 42,
  borderRadius: 999,
  background: "#1f2937",
  display: "grid",
  placeItems: "center",
  fontWeight: 800,
  flex: "0 0 auto",
};

const right = { display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 };

const topBar = {
  height: 64,
  padding: "0 14px",
  background: "#111827",
  borderBottom: "1px solid #1f2937",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

const avatarBig = {
  width: 42,
  height: 42,
  borderRadius: 999,
  background: "rgba(34,197,94,0.18)",
  border: "1px solid rgba(34,197,94,0.35)",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const emptyState = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.7,
};

const messagesArea = {
  flex: 1,
  padding: 14,
  overflowY: "auto",
  background:
    "radial-gradient(1200px 600px at 30% 0%, rgba(34,197,94,0.07), transparent), #0b1220",
};

const bubbleMine = {
  maxWidth: "72%",
  background: "rgba(34,197,94,0.22)",
  border: "1px solid rgba(34,197,94,0.32)",
  padding: "10px 12px",
  borderRadius: 14,
  borderTopRightRadius: 6,
};

const bubbleOther = {
  maxWidth: "72%",
  background: "#111827",
  border: "1px solid #1f2937",
  padding: "10px 12px",
  borderRadius: 14,
  borderTopLeftRadius: 6,
};

const timeText = {
  marginTop: 6,
  fontSize: 11,
  opacity: 0.75,
  textAlign: "right",
};

const composer = {
  padding: 12,
  borderTop: "1px solid #1f2937",
  background: "#0b1220",
  display: "flex",
  gap: 10,
  alignItems: "flex-end",
};

const inputBox = {
  flex: 1,
  resize: "none",
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid #374151",
  background: "#111827",
  color: "#e5e7eb",
  minHeight: 42,
  outline: "none",
  fontFamily: "inherit",
};

const sendBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #22c55e",
  background: "#22c55e",
  color: "#04120a",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 13,
};
