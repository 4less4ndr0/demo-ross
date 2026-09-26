import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronsUpDown, FileText, Menu, MessageCircle, Palette, Play, RotateCcw, Settings, Users } from "lucide-react";
import { roles } from "../data/chatScript";
import { InsightRail } from "./InsightRail";
import { themeOptions } from "../data/demoData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, Sheet } from "./ui";
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

  const isChat = location.pathname === "/";
  const role = roles.find((r) => r.id === state.role) || roles[1];
  const closeMenu = () => setMenuOpen(false);

  const sidebar = (
    <>
      <div className="brand"><span className="brand-mark">R</span><strong>R.O.S.S.</strong></div>
      {isChat && <div className="sidebar-insights"><InsightRail onDone={closeMenu} /></div>}
      <div className="sidebar-bottom">
        <NavLink to="/impostazioni" onClick={closeMenu} title="Impostazioni"><Settings size={18} /><span>Impostazioni</span></NavLink>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button className="operator" title={`Giulia Serra · ${role.label}`}><span>GS</span><div><strong>Giulia Serra</strong><small>{role.label}</small></div><ChevronsUpDown size={15} /></button></DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="ui-menu-wide">
            <DropdownMenuLabel>Sto chiedendo come</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={role.id} onValueChange={actions.setRole}>{roles.map((r) => <DropdownMenuRadioItem key={r.id} value={r.id}>{r.label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={Settings} onSelect={() => { closeMenu(); navigate("/impostazioni"); }}>Impostazioni</DropdownMenuItem>
            <DropdownMenuItem icon={Play} onSelect={actions.togglePresentation}>{state.presentation ? "Esci dalla presentazione" : "Modalità presentazione"}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={RotateCcw} destructive onSelect={actions.reset}>Ripristina dati demo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className={`app-shell ${isChat ? "shell-chat" : "shell-slim"}`}>
      <aside className="sidebar">{sidebar}</aside>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen} side="left" title="Menu" className="sidebar-sheet">{sidebar}</Sheet>
      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Apri menu"><Menu /></button>
          <div className="topbar-place"><span className="facility">RESIDENZA AURORA</span><span className="date">Lunedì, 21 settembre 2026</span></div>
          <nav className="top-tabs" aria-label="Sezioni">{nav.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === "/"}><Icon size={16} /><span>{label}</span></NavLink>)}</nav>
          <div className="top-actions">
            <button className={`presentation-toggle ${state.presentation ? "active" : ""}`} onClick={actions.togglePresentation}><Play size={15} fill="currentColor" /> Presentazione</button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="theme-quick" aria-label="Tema"><Palette size={18} /></button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Tema</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={state.theme} onValueChange={actions.setTheme}>{themeOptions.map((theme) => <DropdownMenuRadioItem key={theme.id} value={theme.id}>{theme.name}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon={Settings} onSelect={() => navigate("/impostazioni")}>Tutte le impostazioni</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModeBadge mode="Attiva" />
          </div>
        </header>
        <main className="page"><Outlet /></main>
      </div>
      {state.presentation && <button className="demo-next" onClick={nextPresentation}>Avanti nella demo <span>→</span></button>}
    </div>
  );
}
