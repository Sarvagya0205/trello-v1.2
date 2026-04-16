import { Draggable } from "@hello-pangea/dnd";
import Avatar from "../common/Avatar";

export default function CardItem({ card, index, onClick, dimmed = false }) {
  const isOverdue = card.due_date && new Date(card.due_date) < new Date();
  const isUpcoming = card.due_date && !isOverdue;
  const isUrgent = isUpcoming && (new Date(card.due_date) - new Date()) < 7 * 24 * 60 * 60 * 1000; // within 7 days

  const dueBg = isOverdue ? "#FFEBE6" : isUrgent ? "#FFF7E6" : isUpcoming ? "#E9F2FF" : "rgba(9,30,66,0.07)";
  const dueColor = isOverdue ? "#BF2600" : isUrgent ? "#A54800" : isUpcoming ? "#0055CC" : "#5e6c84";

  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => {
        const draggingStyle = snapshot.isDragging
          ? {
            boxShadow: "0 12px 32px rgba(9,30,66,0.22)",
            zIndex: 9999,
          }
          : {
            boxShadow: "0 1px 0 rgba(9,30,66,0.14)",
          };

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-2"
            style={{
              ...provided.draggableProps.style,
              ...draggingStyle,
            }}
          >
            <div
              onClick={() => onClick(card)}
              className="rounded-xl cursor-pointer transition-shadow duration-150 overflow-hidden"
              style={{
                backgroundColor: "#fff",
                opacity: dimmed ? 0.28 : 1,
              }}
              onMouseEnter={e => !snapshot.isDragging && (e.currentTarget.style.boxShadow = "0 3px 12px rgba(9,30,66,0.14)")}
              onMouseLeave={e => !snapshot.isDragging && (e.currentTarget.style.boxShadow = "")}
            >
              {/* Cover strip */}
              {card.cover_color && (
                <div className="h-8 w-full" style={{ backgroundColor: card.cover_color }} />
              )}

              <div className="px-3 pt-2 pb-2.5">
                {/* Label dots */}
                {card.labels?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {card.labels.map(label => (
                      <span key={label.id}
                        className="h-2 w-10 rounded-full inline-block"
                        style={{ backgroundColor: label.color }}
                        title={label.name} />
                    ))}
                  </div>
                )}

                {/* Title */}
                <p className="text-sm font-medium leading-snug break-words" style={{ color: "#172b4d" }}>
                  {card.title}
                </p>

                {/* Footer badges */}
                {(card.due_date || card.checklists?.length || card.description || card.members?.length) && (
                  <div className="flex items-center justify-between mt-2 gap-1">
                    {/* Left badges */}
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {/* Due date */}
                      {card.due_date && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: dueBg,
                            color: dueColor,
                          }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {new Date(card.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}

                      {/* Checklist progress */}
                      {card.checklists?.length > 0 && (() => {
                        const total = card.checklists.reduce((s, cl) => s + (cl.items?.length || 0), 0);
                        const done = card.checklists.reduce((s, cl) => s + (cl.items?.filter(i => i.is_completed).length || 0), 0);
                        const all = total > 0 && done === total;
                        return (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: all ? "#E3FCEF" : "rgba(9,30,66,0.07)",
                              color: all ? "#006644" : "#5e6c84",
                            }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9 11 12 14 22 4" />
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                            {done}/{total}
                          </span>
                        );
                      })()}

                      {/* Description indicator */}
                      {card.description && (
                        <span className="inline-flex items-center px-1 py-0.5" style={{ color: "#5e6c84" }} title="Has description">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
                            <line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Member avatars */}
                    {card.members?.length > 0 && (
                      <div className="flex -space-x-1.5 flex-shrink-0">
                        {card.members.slice(0, 3).map(m => <Avatar key={m.id} user={m} size="sm" />)}
                        {card.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white"
                            style={{ backgroundColor: "#dfe1e6", color: "#5e6c84" }}>
                            +{card.members.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
}
