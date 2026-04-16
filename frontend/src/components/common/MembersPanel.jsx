import { useState, useEffect, useRef, useCallback } from "react";
import * as api from "../../api";

/* ── Random avatar helpers ──────────────────────────────── */
const AVATAR_STYLES = [
  "adventurer", "avataaars", "bottts", "fun-emoji",
  "lorelei", "micah", "miniavs", "open-peeps", "personas",
];

function randomAvatarUrl(seed) {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

/* ── Gradient helpers for initials ──────────────────────── */
const GRADIENT_PAIRS = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a18cd1", "#fbc2eb"],
  ["#fccb90", "#d57eeb"],
  ["#e0c3fc", "#8ec5fc"],
];

function getGradient(id) {
  const pair = GRADIENT_PAIRS[id % GRADIENT_PAIRS.length];
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

function getInitials(name) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ─── User Form (add / edit) ───────────────────────────── */
function UserForm({ initial, onSave, onCancel, saving }) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url || "");
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({ name: name.trim(), email: email.trim(), avatar_url: avatarUrl.trim() || null });
  };

  const generateAvatar = () => {
    setAvatarUrl(randomAvatarUrl(name || Date.now()));
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Avatar preview */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{
                  width: 48, height: 48, borderRadius: "50%", objectFit: "cover",
                  border: "2px solid rgba(99,152,211,0.3)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: getGradient(name.length),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 16, fontWeight: 700,
                }}
              >
                {getInitials(name)}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={generateAvatar}
            style={{
              fontSize: 11, color: "var(--t-blue)", background: "none",
              border: "1px solid rgba(38,132,255,0.3)", borderRadius: 6,
              padding: "4px 10px", cursor: "pointer", fontWeight: 600,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(38,132,255,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
          >
            🎲 Random Avatar
          </button>
        </div>

        {/* Name */}
        <input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
          style={{
            backgroundColor: "var(--t-hover)", color: "var(--t-text)",
            border: "1px solid var(--t-border)", borderRadius: 8,
            padding: "8px 12px", fontSize: 13, outline: "none", width: "100%",
          }}
        />

        {/* Email */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          type="email"
          required
          style={{
            backgroundColor: "var(--t-hover)", color: "var(--t-text)",
            border: "1px solid var(--t-border)", borderRadius: 8,
            padding: "8px 12px", fontSize: 13, outline: "none", width: "100%",
          }}
        />

        {/* Avatar URL */}
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Avatar URL (optional)"
          style={{
            backgroundColor: "var(--t-hover)", color: "var(--t-text)",
            border: "1px solid var(--t-border)", borderRadius: 8,
            padding: "8px 12px", fontSize: 13, outline: "none", width: "100%",
          }}
        />

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1, background: "linear-gradient(135deg, #2684ff, #5243AA)",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 0", fontSize: 13, fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {saving ? "Saving…" : initial ? "Update" : "Add Member"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 14px", fontSize: 13, fontWeight: 500,
              color: "var(--t-subtle)", backgroundColor: "var(--t-hover)",
              border: "1px solid var(--t-border)", borderRadius: 8,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

/* ─── Member Row ───────────────────────────────────────── */
function MemberRow({ user, onEdit, onDelete, isBoardMember, onToggleBoardMember, boardId }) {
  const [confirming, setConfirming] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    if (!boardId) return;
    setToggling(true);
    try {
      if (isBoardMember) {
        await api.removeBoardMember(boardId, user.id);
      } else {
        await api.addBoardMember(boardId, user.id);
      }
      onToggleBoardMember(user.id, !isBoardMember);
    } catch (err) {
      console.error("Failed to toggle board member:", err);
    }
    setToggling(false);
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px", borderRadius: 10, transition: "background 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--t-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; setConfirming(false); }}
    >
      {/* Avatar */}
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          style={{
            width: 36, height: 36, borderRadius: "50%", objectFit: "cover",
            border: "2px solid rgba(99,152,211,0.2)", flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: getGradient(user.id),
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 13, fontWeight: 700,
          }}
        >
          {getInitials(user.name)}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: "var(--t-text)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {user.name}
        </div>
        <div style={{
          fontSize: 11, color: "var(--t-subtle)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {user.email}
        </div>
      </div>

      {/* Board member toggle (only shown when on a board page) */}
      {boardId && (
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={isBoardMember ? "Remove from board" : "Add to board"}
          style={{
            width: 28, height: 28, borderRadius: 6, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: toggling ? "not-allowed" : "pointer",
            background: isBoardMember ? "rgba(38,132,255,0.15)" : "transparent",
            color: isBoardMember ? "var(--t-blue)" : "var(--t-subtle)",
            transition: "all 0.15s", flexShrink: 0,
          }}
        >
          {isBoardMember ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      )}

      {/* Edit */}
      <button
        onClick={() => onEdit(user)}
        title="Edit member"
        style={{
          width: 28, height: 28, borderRadius: 6, border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", background: "transparent", color: "var(--t-subtle)",
          transition: "all 0.15s", flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--t-blue)"; e.currentTarget.style.background = "rgba(38,132,255,0.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--t-subtle)"; e.currentTarget.style.background = "transparent"; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </button>

      {/* Delete */}
      {confirming ? (
        <button
          onClick={() => { onDelete(user.id); setConfirming(false); }}
          title="Confirm delete"
          style={{
            width: 28, height: 28, borderRadius: 6,
            border: "1px solid #e74c3c", background: "rgba(231,76,60,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#e74c3c", transition: "all 0.15s", flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          title="Delete member"
          style={{
            width: 28, height: 28, borderRadius: 6, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", background: "transparent", color: "var(--t-subtle)",
            transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#e74c3c"; e.currentTarget.style.background = "rgba(231,76,60,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--t-subtle)"; e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─── Main Members Panel ───────────────────────────────── */
export default function MembersPanel({ boardId, boardMembers, onBoardMembersChange }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("list"); // "list" | "add" | "edit"
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const panelRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchUsers();
  }, [open, fetchUsers]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setMode("list");
        setEditingUser(null);
        setSearchTerm("");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleAdd = async (data) => {
    setSaving(true);
    try {
      const res = await api.createUser(data);
      setUsers((prev) => [...prev, res.data]);
      // If on a board, auto-add to board
      if (boardId) {
        await api.addBoardMember(boardId, res.data.id);
        onBoardMembersChange?.();
      }
      setMode("list");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create user");
    }
    setSaving(false);
  };

  const handleEdit = async (data) => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await api.updateUser(editingUser.id, data);
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? res.data : u)));
      onBoardMembersChange?.();
      setMode("list");
      setEditingUser(null);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update user");
    }
    setSaving(false);
  };

  const handleDelete = async (userId) => {
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      onBoardMembersChange?.();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleToggleBoardMember = (userId, isNowMember) => {
    onBoardMembersChange?.();
  };

  const boardMemberIds = (boardMembers || []).map((m) => m.user?.id || m.user_id);
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      {/* Trigger button */}
      <button
        id="members-panel-btn"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 8, border: "none",
          backgroundColor: open ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
          color: "#fff", fontSize: 13, fontWeight: 600,
          cursor: "pointer", transition: "all 0.15s",
          backdropFilter: "blur(4px)",
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.20)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="hidden sm:inline">Members</span>
        {users.length > 0 && open && (
          <span style={{
            background: "rgba(255,255,255,0.25)", borderRadius: 10,
            padding: "1px 7px", fontSize: 11, fontWeight: 700,
          }}>
            {users.length}
          </span>
        )}
      </button>

      {/* Panel dropdown */}
      {open && (
        <div
          className="animate-pop-in"
          style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            width: 360, maxHeight: "80vh", overflowY: "auto",
            background: "var(--t-surface)", borderRadius: 14,
            border: "1px solid var(--t-border)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05) inset",
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px 10px", borderBottom: "1px solid var(--t-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {mode !== "list" && (
                <button
                  onClick={() => { setMode("list"); setEditingUser(null); }}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "none",
                    background: "var(--t-hover)", color: "var(--t-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--t-text)", margin: 0 }}>
                {mode === "add" ? "Add Member" : mode === "edit" ? "Edit Member" : "Members"}
              </h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {mode === "list" && (
                <button
                  id="add-member-btn"
                  onClick={() => setMode("add")}
                  title="Add new member"
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "none",
                    background: "linear-gradient(135deg, #2684ff, #5243AA)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => { setOpen(false); setMode("list"); setEditingUser(null); setSearchTerm(""); }}
                style={{
                  width: 28, height: 28, borderRadius: 6, border: "none",
                  background: "transparent", color: "var(--t-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: 18, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--t-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "12px 14px" }}>
            {mode === "add" && (
              <UserForm onSave={handleAdd} onCancel={() => setMode("list")} saving={saving} />
            )}

            {mode === "edit" && editingUser && (
              <UserForm
                initial={editingUser}
                onSave={handleEdit}
                onCancel={() => { setMode("list"); setEditingUser(null); }}
                saving={saving}
              />
            )}

            {mode === "list" && (
              <>
                {/* Search */}
                <div style={{ position: "relative", marginBottom: 10 }}>
                  <svg
                    style={{
                      position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                    width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="var(--t-subtle)" strokeWidth="2.5"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search members…"
                    style={{
                      width: "100%", padding: "8px 12px 8px 32px", fontSize: 13,
                      backgroundColor: "var(--t-hover)", color: "var(--t-text)",
                      border: "1px solid var(--t-border)", borderRadius: 8, outline: "none",
                    }}
                  />
                </div>

                {/* Board members section */}
                {boardId && boardMemberIds.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.8px", color: "var(--t-subtle)",
                      padding: "4px 12px", marginBottom: 2,
                    }}>
                      Board Members ({boardMemberIds.length})
                    </div>
                  </div>
                )}

                {/* User list */}
                {loading ? (
                  <div style={{
                    textAlign: "center", padding: "24px 0",
                    color: "var(--t-subtle)", fontSize: 13,
                  }}>
                    <div style={{
                      width: 20, height: 20, border: "2px solid var(--t-border)",
                      borderTopColor: "var(--t-blue)", borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                      margin: "0 auto 8px",
                    }} />
                    Loading…
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "24px 0",
                    color: "var(--t-subtle)", fontSize: 13,
                  }}>
                    {searchTerm ? "No members found" : "No members yet. Add one!"}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {filtered.map((user) => (
                      <MemberRow
                        key={user.id}
                        user={user}
                        boardId={boardId}
                        isBoardMember={boardMemberIds.includes(user.id)}
                        onEdit={(u) => { setEditingUser(u); setMode("edit"); }}
                        onDelete={handleDelete}
                        onToggleBoardMember={handleToggleBoardMember}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
