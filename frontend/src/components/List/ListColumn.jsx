import { useState, useRef, useEffect } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import CardItem from "../Card/CardItem";
import { useBoard } from "../../context/BoardContext";

export default function ListColumn({ list, index, onCardClick, filterFn }) {
  const { addCard, editList, removeList } = useBoard();

  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [cardTitle]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    await addCard(list.id, cardTitle.trim());
    setCardTitle(""); setAddingCard(false);
  };

  const handleTitleBlur = async () => {
    setEditingTitle(false);
    if (listTitle.trim() && listTitle !== list.title) await editList(list.id, { title: listTitle });
    else setListTitle(list.title);
  };

  const visibleCards = list.cards?.filter(c => !c.is_archived) ?? [];

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="list-col flex flex-col rounded-2xl"
          style={{
            ...provided.draggableProps.style,
            background: "rgba(255,255,255,0.96)",
            boxShadow: snapshot.isDragging
              ? "0 16px 40px rgba(0,0,0,0.28)"
              : "0 1px 4px rgba(9,30,66,0.12), 0 0 0 1px rgba(9,30,66,0.06)",
            opacity: snapshot.isDragging ? 0.95 : 1,
            maxHeight: "520px",
            zIndex: snapshot.isDragging ? 9999 : "auto",
          }}
        >
          {/* ── Header ── */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center gap-1.5 px-3 pt-3 pb-1.5 select-none cursor-grab active:cursor-grabbing"
          >
            {editingTitle ? (
              <input autoFocus value={listTitle}
                onChange={e => setListTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={e => e.key === "Enter" && handleTitleBlur()}
                className="font-bold text-sm rounded-lg px-2 py-1 w-full focus:outline-none"
                style={{ color: "#172b4d", border: "2px solid #2684ff", backgroundColor: "#fff" }}
              />
            ) : (
              <h3
                className="font-bold text-sm flex-1 truncate cursor-pointer rounded-lg px-1 py-0.5 -ml-1 transition-colors"
                style={{ color: "#172b4d" }}
                onClick={() => setEditingTitle(true)}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.06)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {list.title}
                <span className="ml-1.5 font-normal text-xs" style={{ color: "#5e6c84" }}>
                  {visibleCards.length}
                </span>
              </h3>
            )}

            {/* ··· menu */}
            <div ref={menuRef} className="relative flex-shrink-0">
              <button onClick={() => setShowMenu(v => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-colors"
                style={{ color: "#5e6c84" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.08)"; e.currentTarget.style.color = "#172b4d"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#5e6c84"; }}
                aria-label="List actions"
              >···</button>

              {showMenu && (
                <div className="absolute right-0 top-9 w-52 rounded-xl shadow-2xl z-30 overflow-hidden animate-pop-in"
                  style={{ backgroundColor: "#fff", border: "1px solid rgba(9,30,66,0.10)" }}>
                  <div className="px-4 py-2.5 text-xs font-semibold text-center"
                    style={{ color: "#5e6c84", borderBottom: "1px solid rgba(9,30,66,0.06)" }}>
                    List actions
                  </div>
                  <div className="py-1">
                    {[
                      { label: "Add a card", action: () => { setShowMenu(false); setAddingCard(true); } },
                      { label: "Rename list", action: () => { setShowMenu(false); setEditingTitle(true); } },
                    ].map(item => (
                      <button key={item.label} onClick={item.action}
                        className="w-full text-left text-sm px-4 py-2 transition-colors"
                        style={{ color: "#172b4d" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f4f5f7"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(9,30,66,0.06)", margin: "4px 0" }} />
                    <button onClick={() => { setShowMenu(false); removeList(list.id); }}
                      className="w-full text-left text-sm px-4 py-2 transition-colors"
                      style={{ color: "#DE350B" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ffebe6"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      Delete this list
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Cards (scrollable) ── */}
          <Droppable droppableId={String(list.id)} type="CARD">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-1 transition-colors duration-150"
                style={{
                  backgroundColor: snapshot.isDraggingOver ? "rgba(38,132,255,0.05)" : "transparent",
                  minHeight: "8px",
                  WebkitOverflowScrolling: "touch",
                }}>
                {visibleCards.map((card, i) => (
                  <CardItem key={card.id} card={card} index={i} onClick={onCardClick}
                    dimmed={filterFn ? !filterFn(card) : false} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* ── Add card ── */}
          <div className="px-2 pb-2 pt-1 flex-shrink-0">
            {addingCard ? (
              <div className="rounded-xl p-2 shadow-sm" style={{ backgroundColor: "#fff", border: "1px solid rgba(9,30,66,0.08)" }}>
                <textarea ref={textareaRef} autoFocus value={cardTitle}
                  onChange={e => setCardTitle(e.target.value)}
                  placeholder="Enter a title for this card…" rows={2}
                  className="w-full text-sm resize-none focus:outline-none leading-snug"
                  style={{ color: "#172b4d", minHeight: "56px" }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCard(e); }
                    if (e.key === "Escape") { setAddingCard(false); setCardTitle(""); }
                  }} />
                <div className="flex gap-2 items-center mt-1">
                  <button onClick={handleAddCard}
                    className="text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity"
                    style={{ background: "linear-gradient(135deg, #2684ff, #0052cc)" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    Add card
                  </button>
                  <button onClick={() => { setAddingCard(false); setCardTitle(""); }}
                    className="w-8 h-8 flex items-center justify-center text-xl rounded-lg transition-colors"
                    style={{ color: "#5e6c84" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingCard(true)}
                className="w-full text-left text-sm px-2 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 font-medium"
                style={{ color: "#5e6c84" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(9,30,66,0.07)"; e.currentTarget.style.color = "#172b4d"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#5e6c84"; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add a card
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
