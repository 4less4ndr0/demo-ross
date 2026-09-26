import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FileText, Menu, MessageCircle, Palette, Play, Settings, Users, X } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { ModeBadge } from "./Common";

const nav = [
  ["/", "Chiedi a ROSS", MessageCircle], ["/ospiti", "Ospiti", Users], ["/report", "Report", FileText],
];
const presentationRoutes = ["/", "/ross", "/ross/conversazione", "/?q=emerso", "/ospiti/elena?tab=memorie", "/ospiti/elena?tab=relazioni", "/famiglia", "/report", "/ospiti/elena?tab=documenti"];

export function Layout() {
  const { state, actions } = useDemo();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        navigate("/", { state: { focus: true } });
        window.dispatchEvent(new Event("ross:focus-chat"));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  const nextPresentation = () => {
    const here = `${location.pathname}${location.search}`;
    const exact = presentationRoutes.indexOf(here);
    const current = exact >= 0 ? exact : presentationRoutes.findIndex((r) => r.split("?")[0] === location.pathname);
    navigate(presentationRoutes[(current + 1) % presentationRoutes.length]);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><span className="brand-mark">R</span><strong>R.O.S.S.</strong><button className="sidebar-close" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
        <nav>{nav.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === "/"} onClick={() => setMenuOpen(false)}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
        <div className="sidebar-bottom">
          <NavLink to="/impostazioni"><Settings size={18} /><span>Impostazioni</span></NavLink>
          <div className="operator"><span>GS</span><div><strong>Giulia Serra</strong><small>Coordinatrice</small></div></div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Apri menu"><Menu /></button>
          <div><span className="facility">RESIDENZA AURORA</span><span className="date">Lunedì, 21 settembre 2026</span></div>
          <div className="top-actions">
            <button className={`presentation-toggle ${state.presentation ? "active" : ""}`} onClick={actions.togglePresentation}><Play size={15} fill="currentColor" /> Presentazione</button>
            <button className="theme-quick" onClick={() => navigate("/impostazioni")} title="Tema e impostazioni"><Palette size={18} /></button>
            <ModeBadge mode="Attiva" />
          </div>
        </header>
        <main className="page"><Outlet /></main>
      </div>
      {state.presentation && <button className="demo-next" onClick={nextPresentation}>Avanti nella demo <span>→</span></button>}
    </div>
  );
}
