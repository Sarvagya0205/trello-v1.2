import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoard } from "../context/BoardContext";
import * as api from "../api";
import Navbar from "../components/common/Navbar";
import MembersPanel from "../components/common/MembersPanel";

const BOARD_COLORS = [
  "#0052CC", "#5243AA", "#00875A", "#DE350B",
  "#FF8B00", "#00A3BF", "#403294", "#36B37E",
  "#172B4D", "#C62828",
];

export default function BoardsPage() {
  const { boards, fetchBoards } = useBoard();
  const [title,         setTitle]         = useState("");
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);
  const [creating,      setCreating]      = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.createBoard({ title: title.trim(), background_color: selectedColor });
      setTitle(""); setCreating(false);
      fetchBoards();
    } catch (err) {
      console.error("Failed to create board:", err);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--t-bg)" }}>
      {/* Top gradient accent behind navbar */}
      <div style={{ background: "linear-gradient(180deg, rgba(38,132,255,0.10) 0%, transparent 100%)", position: "relative", zIndex: 20 }}>
        <Navbar>
          <MembersPanel />
        </Navbar>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2684ff 0%, #5243AA 100%)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M3 3h7v9H3zm0 11h7v7H3zm11-11h7v5h-7zm0 7h7v9h-7z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: "var(--t-text)" }}>Your Boards</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--t-subtle)" }}>
              {boards.length} board{boards.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {boards.map((board, i) => (
            <button
              key={board.id}
              id={`board-${board.id}`}
              onClick={() => navigate(`/board/${board.id}`)}
              className="board-card rounded-xl text-left group transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{
                paddingTop: "75%",
                position: "relative",
                backgroundColor: board.background_color || BOARD_COLORS[i % BOARD_COLORS.length],
                boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
              }}
            >
              {/* Bottom gradient for readability */}
              <div className="absolute inset-0 rounded-xl"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-200 rounded-xl" />
              <span className="absolute bottom-0 left-0 right-0 p-3 font-bold text-sm text-white leading-snug line-clamp-2 z-10"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.40)" }}>
                {board.title}
              </span>
            </button>
          ))}

          {/* Create form */}
          {creating ? (
            <form onSubmit={handleCreate} className="rounded-xl p-4 flex flex-col gap-3 animate-fade-in"
              style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
              <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Board title" className="rounded-lg px-3 py-2 text-sm w-full focus:outline-none"
                style={{ backgroundColor: "var(--t-hover)", color: "var(--t-text)", border: "1px solid var(--t-border)" }}
                onKeyDown={e => e.key === "Escape" && setCreating(false)} />

              {/* Color swatches */}
              <div className="flex flex-wrap gap-1.5">
                {BOARD_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setSelectedColor(c)}
                    className="w-7 h-6 rounded-md transition-all duration-150"
                    style={{
                      backgroundColor: c,
                      boxShadow: selectedColor === c ? `0 0 0 2px var(--t-bg), 0 0 0 4px ${c}` : "none",
                      transform: selectedColor === c ? "scale(1.15)" : "scale(1)",
                    }} />
                ))}
              </div>

              {/* Color preview strip */}
              <div className="w-full h-9 rounded-lg flex items-center justify-center transition-colors duration-200"
                style={{ backgroundColor: selectedColor }}>
                <span className="text-white text-xs font-semibold opacity-75 select-none">Preview</span>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="text-white text-sm px-4 py-2 rounded-lg font-semibold flex-1 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #2684ff, #5243AA)" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  Create board
                </button>
                <button type="button" onClick={() => setCreating(false)}
                  className="text-sm px-3 py-2 rounded-lg transition-colors font-medium"
                  style={{ color: "var(--t-subtle)", backgroundColor: "var(--t-hover)" }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button id="create-board-btn" onClick={() => setCreating(true)}
              className="rounded-xl flex flex-col items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 min-h-[90px] group"
              style={{ backgroundColor: "var(--t-surface)", color: "var(--t-subtle)", border: "1.5px dashed var(--t-border)" }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--t-blue)";
                e.currentTarget.style.color = "var(--t-blue)";
                e.currentTarget.style.backgroundColor = "var(--t-hover)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--t-border)";
                e.currentTarget.style.color = "var(--t-subtle)";
                e.currentTarget.style.backgroundColor = "var(--t-surface)";
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create new board
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
