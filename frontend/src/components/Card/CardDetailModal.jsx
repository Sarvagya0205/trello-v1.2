import { useState, useEffect, useRef } from "react";
import * as api from "../../api";
import Avatar from "../common/Avatar";
import { useBoard } from "../../context/BoardContext";

/* ─── Section heading ─────────────────────────────── */
function SectionHeading({ icon, children }) {
  return (
    <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: "#172b4d" }}>
      <span className="text-base">{icon}</span>
      {children}
    </h3>
  );
}

/* ─── Sidebar button ──────────────────────────────── */
function SidebarBtn({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left text-sm px-3 py-2 rounded-md transition-colors font-medium"
      style={{
        backgroundColor: danger ? "rgba(197,34,34,0.08)" : "rgba(9,30,66,0.06)",
        color: danger ? "#AE2A19" : "#172b4d",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = danger ? "rgba(197,34,34,0.16)" : "rgba(9,30,66,0.13)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = danger ? "rgba(197,34,34,0.08)" : "rgba(9,30,66,0.06)")}
    >
      {children}
    </button>
  );
}

/* ─── Main component ──────────────────────────────── */
export default function CardDetailModal({ card, boardId, onClose }) {
  const { editCard, removeCard, board } = useBoard();

  // Get board members (users who are members of this board)
  const boardUsers = (board?.members || []).map((m) => m.user).filter(Boolean);

  const [data,              setData]              = useState(card);
  const [labels,            setLabels]            = useState([]);
  const [editingTitle,      setEditingTitle]      = useState(false);
  const [editingDesc,       setEditingDesc]       = useState(false);
  const [addingChecklist,   setAddingChecklist]   = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newItemTitle,      setNewItemTitle]      = useState({});
  const [coverColorPicker,  setCoverColorPicker]  = useState(false);
  const [creatingLabel,     setCreatingLabel]     = useState(false);
  const [newLabelName,      setNewLabelName]      = useState("");
  const [newLabelColor,     setNewLabelColor]     = useState("#0052CC");
  const [memberSearch,      setMemberSearch]      = useState("");

  const LABEL_COLORS = ["#0052CC","#00875A","#DE350B","#FF8B00","#6554C0","#00B8D9","#36B37E","#FF5630","#C62828","#E91E63"];

  const modalRef = useRef(null);

  // Load fresh card data + board labels
  useEffect(() => {
    api.getCard(card.id).then((r) => setData(r.data)).catch(() => {});
    api.getBoardLabels(boardId).then((r) => setLabels(r.data)).catch(() => {});
  }, [card.id, boardId]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ── Helpers ──────────────────────────────────── */
  const save = async (updates) => {
    const res = await api.updateCard(data.id, updates);
    setData(res.data);
    editCard(res.data);
  };

  const refresh = async () => {
    const res = await api.getCard(data.id);
    setData(res.data);
    editCard(res.data);
  };

  /* ── Labels ─────────────────────────────────── */
  const toggleLabel = async (label) => {
    const has = data.labels?.find((l) => l.id === label.id);
    if (has) await api.removeCardLabel(data.id, label.id);
    else     await api.addCardLabel(data.id, label.id);
    await refresh();
  };

  /* ── Members ─────────────────────────────────── */
  const toggleMember = async (user) => {
    const has = data.members?.find((m) => m.id === user.id);
    if (has) await api.removeCardMember(data.id, user.id);
    else     await api.addCardMember(data.id, user.id);
    await refresh();
  };

  /* ── Checklists ──────────────────────────────── */
  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    await api.createChecklist(data.id, { title: newChecklistTitle });
    await refresh();
    setNewChecklistTitle("");
    setAddingChecklist(false);
  };

  const handleToggleItem = async (item) => {
    const res = await api.updateChecklistItem(item.id, { is_completed: !item.is_completed });
    setData((d) => ({
      ...d,
      checklists: d.checklists.map((cl) => ({
        ...cl,
        items: cl.items.map((i) => (i.id === item.id ? res.data : i)),
      })),
    }));
  };

  const handleAddItem = async (e, checklistId) => {
    e.preventDefault();
    const title = newItemTitle[checklistId];
    if (!title?.trim()) return;
    const pos = (data.checklists.find((c) => c.id === checklistId)?.items?.length || 0) + 1;
    const res = await api.createChecklistItem(checklistId, { title, position: pos });
    setData((d) => ({
      ...d,
      checklists: d.checklists.map((cl) =>
        cl.id === checklistId ? { ...cl, items: [...cl.items, res.data] } : cl
      ),
    }));
    setNewItemTitle((n) => ({ ...n, [checklistId]: "" }));
  };

  const handleDeleteChecklist = async (id) => {
    await api.deleteChecklist(id);
    setData((d) => ({ ...d, checklists: d.checklists.filter((c) => c.id !== id) }));
  };

  const handleDeleteItem = async (itemId, checklistId) => {
    await api.deleteChecklistItem(itemId);
    setData((d) => ({
      ...d,
      checklists: d.checklists.map((cl) =>
        cl.id === checklistId ? { ...cl, items: cl.items.filter((i) => i.id !== itemId) } : cl
      ),
    }));
  };

  /* ── Cover colors ─────────────────────────────── */
  const COVER_COLORS = ["#0079BF","#D29034","#519839","#B04632","#89609E","#CD5A91","#4BBF6B","#00AECC","#838C91","#506A6B","#FF5630","#36B37E","#6554C0","#00B8D9","#FF8B00"];

  /* ── Delete card ─────────────────────────────── */
  const handleDeleteCard = async () => {
    await removeCard(data.id);
    onClose();
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-modal-fade"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", padding: "0", overflowY: "auto" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Dialog */}
      <div
        ref={modalRef}
        className="relative w-full sm:w-[680px] sm:mx-4 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up overflow-hidden"
        style={{ backgroundColor: "#fff", maxHeight: "90dvh", display: "flex", flexDirection: "column" }}
      >
        {/* Cover strip */}
        {data.cover_color && (
          <div className="flex-shrink-0 h-28 sm:h-36" style={{ backgroundColor: data.cover_color }} />
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* ── Title row ─────────────────────── */}
            <div className="flex gap-3 mb-5">
              <span className="text-xl mt-0.5 flex-shrink-0">🗂</span>
              <div className="flex-1 min-w-0">
                {editingTitle ? (
                  <input
                    autoFocus
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    onBlur={() => { setEditingTitle(false); save({ title: data.title }); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setEditingTitle(false); save({ title: data.title }); } }}
                    className="w-full text-lg font-bold rounded-lg px-2 py-1 focus:outline-none"
                    style={{ color: "#172b4d", border: "2px solid #0c66e4", backgroundColor: "#fff" }}
                  />
                ) : (
                  <h2
                    className="text-lg font-bold cursor-pointer rounded-lg px-2 py-1 -ml-2 transition-colors hover:bg-black/5"
                    style={{ color: "#172b4d" }}
                    onClick={() => setEditingTitle(true)}
                  >
                    {data.title}
                  </h2>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-2xl rounded-lg transition-colors"
                style={{ color: "#626f86" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.08)"; e.currentTarget.style.color = "#172b4d"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#626f86"; }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* ── Two-column layout ──────────────── */}
            {/* On mobile: stacks. On sm+: side by side. */}
            <div className="flex flex-col sm:flex-row gap-5">

              {/* ── Main column ───────────────────── */}
              <div className="flex-1 min-w-0 space-y-5">

                {/* Active labels */}
                {data.labels?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {data.labels.map((l) => (
                      <span
                        key={l.id}
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: l.color }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div>
                  <SectionHeading icon="📝">Description</SectionHeading>
                  {editingDesc ? (
                    <div>
                      <textarea
                        autoFocus
                        value={data.description || ""}
                        onChange={(e) => setData({ ...data, description: e.target.value })}
                        className="w-full rounded-lg p-3 text-sm focus:outline-none resize-vertical"
                        rows={4}
                        style={{ backgroundColor: "#f8f9fa", color: "#172b4d", border: "2px solid #0c66e4" }}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => { setEditingDesc(false); save({ description: data.description }); }}
                          className="text-white text-sm px-4 py-1.5 rounded-md font-semibold transition-colors"
                          style={{ backgroundColor: "#0c66e4" }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingDesc(false)}
                          className="text-sm px-3 py-1.5 rounded-md transition-colors"
                          style={{ color: "#626f86" }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.08)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingDesc(true)}
                      className="text-sm rounded-lg p-3 cursor-pointer transition-colors min-h-[48px]"
                      style={{
                        backgroundColor: "rgba(9,30,66,0.04)",
                        color: data.description ? "#172b4d" : "#8c9bab",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.04)")}
                    >
                      {data.description || <em>Add a description…</em>}
                    </div>
                  )}
                </div>

                {/* Checklists */}
                {data.checklists?.map((cl) => {
                  const done  = cl.items.filter((i) => i.is_completed).length;
                  const total = cl.items.length;
                  const pct   = total ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={cl.id}>
                      <div className="flex items-center justify-between mb-2">
                        <SectionHeading icon="☑">
                          {cl.title}
                        </SectionHeading>
                        <button
                          onClick={() => handleDeleteChecklist(cl.id)}
                          className="text-xs px-3 py-1 rounded-md transition-colors"
                          style={{ backgroundColor: "rgba(9,30,66,0.06)", color: "#626f86" }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.13)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.06)"}
                        >
                          Delete
                        </button>
                      </div>
                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: "#626f86" }}>{pct}%</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(9,30,66,0.10)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#1f845a" : "#0c66e4" }}
                          />
                        </div>
                      </div>
                      {/* Items */}
                      {cl.items.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-start gap-2.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors group"
                          style={{ color: item.is_completed ? "#8c9bab" : "#172b4d" }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.04)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <input
                            type="checkbox"
                            checked={item.is_completed}
                            onChange={() => handleToggleItem(item)}
                            className="w-4 h-4 mt-0.5 flex-shrink-0 accent-blue-600 cursor-pointer"
                          />
                          <span className={`text-sm flex-1 leading-snug ${item.is_completed ? "line-through" : ""}`}>
                            {item.title}
                          </span>
                          <button
                            onClick={(e) => { e.preventDefault(); handleDeleteItem(item.id, cl.id); }}
                            className="opacity-0 group-hover:opacity-100 text-xs px-1 py-0.5 rounded transition-opacity"
                            style={{ color: "#626f86" }}
                          >
                            ×
                          </button>
                        </label>
                      ))}
                      {/* Add item */}
                      <form onSubmit={(e) => handleAddItem(e, cl.id)} className="mt-1.5 flex gap-2">
                        <input
                          value={newItemTitle[cl.id] || ""}
                          onChange={(e) => setNewItemTitle((n) => ({ ...n, [cl.id]: e.target.value }))}
                          placeholder="Add an item…"
                          className="flex-1 rounded-md px-3 py-1.5 text-sm focus:outline-none"
                          style={{ backgroundColor: "#f8f9fa", color: "#172b4d", border: "1px solid #dfe1e6" }}
                        />
                        <button
                          type="submit"
                          className="text-white text-xs px-3 py-1.5 rounded-md font-semibold transition-colors flex-shrink-0"
                          style={{ backgroundColor: "#0c66e4" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0055cc")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0c66e4")}
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>

              {/* ── Sidebar ────────────────────────── */}
              {/* On mobile: full width below main. On sm+: fixed 160px column on right */}
              <div className="w-full sm:w-40 flex-shrink-0 space-y-4">

                {/* Members */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#626f86" }}>Members</h4>
                  {data.members?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {data.members.map((m) => <Avatar key={m.id} user={m} size="md" />)}
                    </div>
                  )}
                  {/* Member search */}
                  {boardUsers.length > 3 && (
                    <div style={{ position: "relative", marginBottom: 6 }}>
                      <svg
                        style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8c9bab" strokeWidth="2.5"
                      >
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                      <input
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Search…"
                        className="w-full text-xs rounded-md py-1.5 pr-2 focus:outline-none"
                        style={{
                          paddingLeft: 24, backgroundColor: "#f8f9fa", color: "#172b4d",
                          border: "1px solid #dfe1e6",
                        }}
                      />
                    </div>
                  )}
                  {/* Scrollable member list */}
                  <div className="space-y-0.5" style={{ maxHeight: 200, overflowY: "auto" }}>
                    {boardUsers.length === 0 && (
                      <p className="text-xs italic" style={{ color: "#8c9bab" }}>No board members</p>
                    )}
                    {boardUsers
                      .filter((u) => !memberSearch || u.name.toLowerCase().includes(memberSearch.toLowerCase()))
                      .map((u) => {
                      const assigned = data.members?.find((m) => m.id === u.id);
                      return (
                        <button
                          key={u.id}
                          onClick={() => toggleMember(u)}
                          className="w-full text-left text-xs flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
                          style={{ backgroundColor: assigned ? "rgba(9,30,66,0.10)" : "transparent", color: assigned ? "#172b4d" : "#626f86" }}
                          onMouseEnter={(e) => !assigned && (e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.05)")}
                          onMouseLeave={(e) => !assigned && (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Avatar user={u} size="sm" />
                          <span className="truncate flex-1">{u.name.split(" ")[0]}</span>
                          {assigned && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0c66e4" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Labels */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#626f86" }}>Labels</h4>
                  <div className="space-y-1 mb-1">
                    {labels.length === 0 && !creatingLabel && (
                      <p className="text-xs italic" style={{ color: "#8c9bab" }}>No labels yet</p>
                    )}
                    {labels.map((label) => {
                      const active = data.labels?.find((l) => l.id === label.id);
                      return (
                        <button
                          key={label.id}
                          onClick={() => toggleLabel(label)}
                          className="w-full text-left text-xs px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all"
                          style={{ backgroundColor: label.color, color: "#fff", opacity: active ? 1 : 0.45 }}
                        >
                          {active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          {label.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Create new label */}
                  {creatingLabel ? (
                    <div className="space-y-1.5 animate-fade-in">
                      <input
                        autoFocus
                        value={newLabelName}
                        onChange={e => setNewLabelName(e.target.value)}
                        placeholder="Label name"
                        className="w-full rounded-md px-2 py-1.5 text-xs focus:outline-none"
                        style={{ backgroundColor: "#f8f9fa", color: "#172b4d", border: "1px solid #dfe1e6" }}
                        onKeyDown={e => e.key === "Escape" && setCreatingLabel(false)}
                      />
                      {/* Color swatches */}
                      <div className="flex flex-wrap gap-1">
                        {LABEL_COLORS.map(c => (
                          <button key={c} type="button"
                            onClick={() => setNewLabelColor(c)}
                            className="w-5 h-5 rounded transition-transform"
                            style={{
                              backgroundColor: c,
                              transform: newLabelColor === c ? "scale(1.25)" : "scale(1)",
                              boxShadow: newLabelColor === c ? `0 0 0 2px #fff, 0 0 0 3px ${c}` : "none"
                            }}
                          />
                        ))}
                      </div>
                      {/* Preview */}
                      <div className="w-full rounded-md px-3 py-1 text-xs font-semibold text-white text-center"
                        style={{ backgroundColor: newLabelColor }}>
                        {newLabelName || "Preview"}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={async () => {
                            if (!newLabelName.trim()) return;
                            const res = await api.createBoardLabel(boardId, { name: newLabelName.trim(), color: newLabelColor });
                            setLabels(l => [...l, res.data]);
                            setCreatingLabel(false); setNewLabelName(""); setNewLabelColor("#0052CC");
                          }}
                          className="flex-1 text-xs py-1.5 rounded-md font-semibold text-white transition-opacity"
                          style={{ backgroundColor: "#0c66e4" }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >Create</button>
                        <button onClick={() => setCreatingLabel(false)}
                          className="text-xs px-2 py-1.5 rounded-md"
                          style={{ color: "#626f86", backgroundColor: "rgba(9,30,66,0.06)" }}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCreatingLabel(true)}
                      className="w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors font-medium"
                      style={{ color: "#626f86", backgroundColor: "rgba(9,30,66,0.04)" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.10)"; e.currentTarget.style.color = "#172b4d"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.04)"; e.currentTarget.style.color = "#626f86"; }}
                    >+ Create label</button>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#626f86" }}>Due Date</h4>
                  <input
                    type="date"
                    value={data.due_date ? data.due_date.split("T")[0] : ""}
                    onChange={(e) => save({ due_date: e.target.value || null })}
                    className="w-full rounded-md px-2 py-1.5 text-xs focus:outline-none"
                    style={{ backgroundColor: "#f8f9fa", color: "#172b4d", border: "1px solid #dfe1e6" }}
                  />
                </div>

                {/* Checklist */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#626f86" }}>Checklist</h4>
                  {addingChecklist ? (
                    <form onSubmit={handleAddChecklist}>
                      <input
                        autoFocus
                        value={newChecklistTitle}
                        onChange={(e) => setNewChecklistTitle(e.target.value)}
                        placeholder="Checklist title…"
                        className="w-full rounded-md px-2 py-1.5 text-xs mb-2 focus:outline-none"
                        style={{ backgroundColor: "#f8f9fa", color: "#172b4d", border: "1px solid #dfe1e6" }}
                      />
                      <div className="flex gap-1.5">
                        <button type="submit" className="text-white text-xs px-3 py-1.5 rounded-md font-semibold flex-1" style={{ backgroundColor: "#0c66e4" }}>Add</button>
                        <button type="button" onClick={() => setAddingChecklist(false)} className="text-xs px-2 py-1.5 rounded-md" style={{ color: "#626f86", backgroundColor: "rgba(9,30,66,0.06)" }}>✕</button>
                      </div>
                    </form>
                  ) : (
                    <SidebarBtn onClick={() => setAddingChecklist(true)}>+ Add checklist</SidebarBtn>
                  )}
                </div>

                {/* Cover color */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#626f86" }}>Cover</h4>
                  {coverColorPicker ? (
                    <div>
                      <div className="grid grid-cols-5 gap-1 mb-1.5">
                        {COVER_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => { save({ cover_color: c }); setCoverColorPicker(false); }}
                            className="h-6 rounded-md transition-transform hover:scale-105"
                            style={{ backgroundColor: c, outline: data.cover_color === c ? "2px solid #172b4d" : "none", outlineOffset: "1px" }}
                          />
                        ))}
                      </div>
                      {data.cover_color && (
                        <button
                          onClick={() => { save({ cover_color: null }); setCoverColorPicker(false); }}
                          className="w-full text-xs py-1 rounded-md transition-colors"
                          style={{ color: "#AE2A19", backgroundColor: "rgba(197,34,34,0.06)" }}
                        >
                          Remove cover
                        </button>
                      )}
                    </div>
                  ) : (
                    <SidebarBtn onClick={() => setCoverColorPicker(true)}>
                      {data.cover_color ? "Change cover" : "+ Add cover"}
                    </SidebarBtn>
                  )}
                </div>

                {/* Archive / Delete */}
                <div className="space-y-1.5 pt-2" style={{ borderTop: "1px solid rgba(9,30,66,0.10)" }}>
                  <SidebarBtn onClick={() => { save({ is_archived: !data.is_archived }); onClose(); }}>
                    {data.is_archived ? "📥 Unarchive" : "🗄 Archive"}
                  </SidebarBtn>
                  <SidebarBtn onClick={handleDeleteCard} danger>
                    🗑 Delete card
                  </SidebarBtn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
