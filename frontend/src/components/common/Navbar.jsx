import { useNavigate } from "react-router-dom";

function TrelloLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#2684FF" />
      <rect x="3" y="3" width="7.5" height="14" rx="1.5" fill="white" />
      <rect x="13.5" y="3" width="7.5" height="9" rx="1.5" fill="white" />
    </svg>
  );
}

export default function Navbar({ children }) {
  const navigate = useNavigate();

  return (
    <nav
      className="flex items-center gap-3 px-3 sm:px-4 flex-shrink-0"
      style={{
        height: "48px",
        backgroundColor: "rgba(0,0,0,0.32)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <button
        id="nav-logo"
        onClick={() => navigate("/")}
        className="flex items-center gap-2 flex-shrink-0 rounded-lg px-2 py-1 transition-colors"
        style={{ color: "#fff" }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        aria-label="Go to boards"
      >
        <TrelloLogo />
        <span className="font-bold text-base tracking-tight hidden sm:block" style={{ color: "#fff" }}>
          Trello
        </span>
      </button>

      {children && (
        <>
          <div className="w-px h-5 flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.16)" }} />
          {children}
        </>
      )}
    </nav>
  );
}
