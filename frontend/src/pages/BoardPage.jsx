import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useBoard } from "../context/BoardContext";
import ListColumn from "../components/List/ListColumn";
import CardDetailModal from "../components/Card/CardDetailModal";
import Navbar from "../components/common/Navbar";
import MembersPanel from "../components/common/MembersPanel";
import * as api from "../api";

/* ─── Filter Popover ────────────────────────────── */
function FilterPopover({ boardId, board, users, filters, setFilters, onClose }) {
  const [labels, setLabels] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    api.getBoardLabels(boardId).then((r) => setLabels(r.data)).catch(() => { });
  }, [boardId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const toggleLabel = (id) => setFilters((f) => ({ ...f, labels: toggle(f.labels, id) }));
  const toggleMember = (id) => setFilters((f) => ({ ...f, members: toggle(f.members, id) }));
  const toggleDue = (v) => setFilters((f) => ({ ...f, due: f.due === v ? "" : v }));
  const clearAll = () => setFilters({ labels: [], members: [], due: "" });
  const hasAny = filters.labels.length || filters.members.length || filters.due;

  const boardUsers = board?.members?.map((m) => m.user) || [];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 w-72 rounded-xl shadow-2xl z-50 animate-pop-in overflow-hidden"
      style={{ backgroundColor: "#fff", border: "1px solid #dfe1e6" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid #f1f2f4" }}>
        <span className="text-sm font-semibold" style={{ color: "#172b4d" }}>Filter cards</span>
        <div className="flex items-center gap-2">
          {hasAny && (
            <button onClick={clearAll} className="text-xs font-medium" style={{ color: "#0c66e4" }}>
              Clear all
            </button>
          )}
          <button onClick={onClose} className="text-xl leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100" style={{ color: "#626f86" }}>
            ×
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 overflow-y-auto" style={{ maxHeight: "70vh" }}>
        {/* Labels */}
        {labels.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#626f86" }}>Labels</h4>
            <div className="space-y-1">
              {labels.map((label) => {
                const on = filters.labels.includes(label.id);
                return (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    className="w-full text-left text-xs px-3 py-2 rounded-md font-semibold flex items-center gap-2 transition-opacity"
                    style={{ backgroundColor: label.color, color: "#fff", opacity: on ? 1 : 0.45 }}
                  >
                    <span className="w-4 text-center flex-shrink-0">{on ? "✓" : ""}</span>
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Members */}
        {boardUsers.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#626f86" }}>Members</h4>
            <div className="space-y-0.5">
              {boardUsers.map((u) => {
                const on = filters.members.includes(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggleMember(u.id)}
                    className="w-full text-left text-sm flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
                    style={{ backgroundColor: on ? "#e8f0fe" : "transparent", color: on ? "#172b4d" : "#626f86" }}
                  >
                    {u.avatar_url
                      ? <img src={u.avatar_url} alt={u.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      : <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{u.name[0]}</div>
                    }
                    <span className="truncate flex-1">{u.name}</span>
                    {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0c66e4" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Due Date */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#626f86" }}>Due Date</h4>
          <div className="flex gap-2">
            {[
              { v: "overdue", label: "Overdue", bg: "#FFEBE6", active: "#AE2A19", text: "#AE2A19" },
              { v: "upcoming", label: "Upcoming", bg: "#E9F2FF", active: "#0C66E4", text: "#0C66E4" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => toggleDue(o.v)}
                className="flex-1 text-xs py-2 rounded-md font-semibold transition-colors"
                style={{
                  backgroundColor: filters.due === o.v ? o.active : o.bg,
                  color: filters.due === o.v ? "#fff" : o.text,
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────── */
function toggle(arr, id) {
  return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}

function cardMatchesFilter(card, filters) {
  if (filters.labels.length) {
    const ids = (card.labels || []).map((l) => l.id);
    if (!filters.labels.some((id) => ids.includes(id))) return false;
  }
  if (filters.members.length) {
    const ids = (card.members || []).map((m) => m.id);
    if (!filters.members.some((id) => ids.includes(id))) return false;
  }
  if (filters.due) {
    if (!card.due_date) return false;
    const d = new Date(card.due_date), now = new Date();
    if (filters.due === "overdue" && d >= now) return false;
    if (filters.due === "upcoming" && d < now) return false;
  }
  return true;
}

/* ─── Main Component ──────────────────────────────── */
export default function BoardPage() {
  const { id } = useParams();
  const { board, loading, fetchBoard, fetchUsers, users, addList, reorderLists, reorderCards } = useBoard();

  const refreshBoard = useCallback(() => fetchBoard(id), [id, fetchBoard]);

  const [selectedCard, setSelectedCard] = useState(null);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ labels: [], members: [], due: "" });

  useEffect(() => {
    fetchBoard(id);
    fetchUsers();
  }, [id, fetchBoard, fetchUsers]);

  /* ── Drag & Drop ─────────────────────────────── */
  const handleDragEnd = async ({ source, destination, type }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "LIST") {
      const lists = Array.from(board.lists);
      const [m] = lists.splice(source.index, 1);
      lists.splice(destination.index, 0, m);
      const updated = lists.map((l, i) => ({ ...l, position: i + 1 }));
      reorderLists(updated);
      await Promise.all(updated.map((l) => api.updateList(l.id, { position: l.position })));
      return;
    }

    if (type === "CARD") {
      const lists = board.lists.map((l) => ({ ...l, cards: [...l.cards] }));
      const src = lists.find((l) => String(l.id) === source.droppableId);
      const dst = lists.find((l) => String(l.id) === destination.droppableId);
      const [moved] = src.cards.splice(source.index, 1);
      moved.list_id = dst.id;
      dst.cards.splice(destination.index, 0, moved);
      dst.cards = dst.cards.map((c, i) => ({ ...c, position: i + 1 }));
      reorderCards(lists);
      await Promise.all(dst.cards.map((c) => api.updateCard(c.id, { position: c.position, list_id: dst.id })));
    }
  };

  /* ── Add List ────────────────────────────────── */
  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    await addList(Number(id), newListTitle.trim());
    setNewListTitle("");
    setAddingList(false);
  };

  /* ── Search ──────────────────────────────────── */
  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const res = await api.searchCards(id, { q });
      setSearchResults(res.data);
    } else {
      setSearchResults(null);
    }
  };

  const closeFilter = useCallback(() => setShowFilter(false), []);
  const hasActiveFilters = filters.labels.length || filters.members.length || filters.due;
  const filterCount = filters.labels.length + filters.members.length + (filters.due ? 1 : 0);

  const boardBg = board?.background_color || "#0079BF";

  /* ── Loading ─────────────────────────────────── */
  if (loading || !board) {
    return (
      <div className="h-screen flex flex-col" style={{ backgroundColor: boardBg }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center gap-3" style={{ color: "rgba(255,255,255,0.8)" }}>
          <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <span className="text-sm font-medium">Loading board…</span>
        </div>
      </div>
    );
  }

  return (
    /* Root: full viewport height, flex column */
    <div className="flex flex-col" style={{ minHeight: "100dvh", backgroundColor: boardBg }}>

      {/* ── Global Navbar ─────────────────────── */}
      <Navbar />

      {/* ── Board sub-header ──────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 flex-wrap"
        style={{
          minHeight: "48px",
          backgroundColor: "rgba(0,0,0,0.18)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Board title */}
        <h1
          className="font-bold text-base sm:text-lg text-white truncate flex-1 min-w-0 py-2"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
        >
          {board.title}
        </h1>

        {/* Right-side controls — wrap on small screens */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end py-1">

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              id="board-search"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search…"
              className="search-input rounded-md pl-8 pr-3 py-1.5 text-sm w-32 sm:w-44 focus:outline-none focus:w-56 transition-all duration-200"
              style={{ backgroundColor: "rgba(255,255,255,0.20)", color: "#fff", border: "none" }}
              onFocus={(e) => (e.target.style.backgroundColor = "rgba(255,255,255,0.32)")}
              onBlur={(e) => (e.target.style.backgroundColor = "rgba(255,255,255,0.20)")}
            />
            {/* Search dropdown */}
            {searchResults && (
              <div
                className="absolute top-10 left-0 w-72 rounded-xl shadow-2xl z-50 overflow-hidden animate-pop-in"
                style={{ backgroundColor: "#fff", border: "1px solid #dfe1e6", maxHeight: "70vh", overflowY: "auto" }}
              >
                {searchResults.length === 0
                  ? <p className="text-sm p-4 text-center" style={{ color: "#626f86" }}>No cards found</p>
                  : searchResults.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => { setSelectedCard(card); setSearchResults(null); setSearchQuery(""); }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 flex items-center gap-2"
                      style={{ color: "#172b4d", borderBottom: "1px solid #f1f2f4" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8c9bab" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
                      </svg>
                      {card.title}
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          {/* Filter button */}
          <div className="relative">
            <button
              id="filter-btn"
              onClick={() => setShowFilter((v) => !v)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md font-medium transition-colors"
              style={{
                backgroundColor: hasActiveFilters ? "#fff" : "rgba(255,255,255,0.20)",
                color: hasActiveFilters ? "#0c66e4" : "#fff",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span className="hidden sm:inline">Filter</span>
              {!!filterCount && (
                <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                  {filterCount}
                </span>
              )}
            </button>
            {showFilter && (
              <FilterPopover
                boardId={id}
                board={board}
                users={users}
                filters={filters}
                setFilters={setFilters}
                onClose={closeFilter}
              />
            )}
          </div>

          {/* Board member avatars */}
          {board.members?.length > 0 && (
            <div className="flex -space-x-1.5 flex-shrink-0" style={{ marginRight: 4 }}>
              {board.members.slice(0, 5).map((m) => (
                <img
                  key={m.user.id}
                  src={m.user.avatar_url}
                  alt={m.user.name}
                  title={m.user.name}
                  className="w-7 h-7 rounded-full object-cover"
                  style={{ border: "2px solid rgba(255,255,255,0.5)" }}
                />
              ))}
              {board.members.length > 5 && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: "rgba(0,0,0,0.30)", border: "2px solid rgba(255,255,255,0.4)" }}
                >
                  +{board.members.length - 5}
                </div>
              )}
            </div>
          )}

          {/* Members management panel */}
          <MembersPanel
            boardId={Number(id)}
            boardMembers={board.members}
            onBoardMembersChange={refreshBoard}
          />
        </div>
      </div>

      {/* ── Board Canvas ───────────────────────── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="LIST" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-wrap gap-3 p-3 sm:p-4 flex-1 items-start overflow-y-auto content-start"
              style={{ WebkitOverflowScrolling: "touch" }}  /* smooth touch scroll */
            >
              {board.lists
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((list, idx) => (
                  <ListColumn
                    key={list.id}
                    list={list}
                    index={idx}
                    onCardClick={setSelectedCard}
                    filterFn={hasActiveFilters ? (c) => cardMatchesFilter(c, filters) : null}
                  />
                ))}
              {provided.placeholder}

              {/* Add another list */}
              {addingList ? (
                <form
                  onSubmit={handleAddList}
                  className="list-col rounded-xl flex-shrink-0 p-3 animate-slide-up"
                  style={{ backgroundColor: "rgba(255,255,255,0.22)", backdropFilter: "blur(4px)" }}
                >
                  <input
                    autoFocus
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="List title…"
                    className="w-full rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none"
                    style={{ backgroundColor: "#fff", color: "#172b4d", border: "none" }}
                  />
                  <div className="flex gap-2 items-center">
                    <button
                      type="submit"
                      className="text-white text-xs px-4 py-1.5 rounded-md font-semibold transition-colors"
                      style={{ backgroundColor: "#0c66e4" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0055cc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0c66e4")}
                    >
                      Add list
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingList(false); setNewListTitle(""); }}
                      className="text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-md transition-colors"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      ×
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  id="add-list-btn"
                  onClick={() => setAddingList(true)}
                  className="list-col rounded-xl flex-shrink-0 p-3 text-sm font-semibold text-left transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.22)", color: "#fff", alignSelf: "flex-start" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.32)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)")}
                >
                  + Add another list
                </button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* ── Card Detail Modal ──────────────────── */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          boardId={id}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
