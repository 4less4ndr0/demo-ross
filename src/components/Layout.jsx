import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronsUpDown, FileText, LayoutDashboard, Menu, MessageCircle, Play, RotateCcw, Settings, Users } from "lucide-react";
import { roleFor, roles } from "../data/chatScript";
import { InsightRail } from "./InsightRail";
import { overviewGuide, reportsGuide, residentsGuide, SidebarGuide } from "./PageGuide";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, Sheet } from "./ui";
import { useDemo } from "../state/DemoContext";

const nav = [
  ["/", "Chiedi a ROSS", MessageCircle], ["/ospiti", "Ospiti", Users], ["/report", "Report", FileText], ["/panoramica", "Panoramica", LayoutDashboard],
];

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

  const isChat = location.pathname === "/";
  // Ospiti, Report e Panoramica: la sidebar resta larga con lo specchietto "Cosa ti dice ROSS" della pagina.
  const guide = { "/ospiti": residentsGuide, "/report": reportsGuide, "/panoramica": overviewGuide }[location.pathname] || null;
  const wide = isChat || Boolean(guide);
  const role = roleFor(state.role);
  const closeMenu = () => setMenuOpen(false);

  const sidebar = (
    <>
      <div className="brand" title="Residenza Aurora · Lunedì, 21 settembre 2026"><span className="brand-mark">R</span><div className="brand-text"><strong>R.O.S.S.</strong><span className="brand-place">Residenza Aurora</span><span className="brand-date">Lunedì, 21 settembre 2026</span></div></div>
      {isChat && <div className="sidebar-insights"><InsightRail onDone={closeMenu} /></div>}
      {guide && <div className="sidebar-insights"><SidebarGuide key={guide.id} {...guide} onDone={closeMenu} /></div>}
      <div className="sidebar-bottom">
        <NavLink to="/impostazioni" onClick={closeMenu} title="Impostazioni"><Settings size={18} /><span>Impostazioni</span></NavLink>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button className="operator" title={`${role.account.name} · ${role.account.detail}`}><span>{role.account.initials}</span><div><strong>{role.account.name}</strong><small>{role.account.detail}</small></div><ChevronsUpDown size={15} /></button></DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="ui-menu-wide">
            <DropdownMenuLabel>Sto chiedendo come</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={role.id} onValueChange={actions.setRole}>{roles.map((r) => <DropdownMenuRadioItem key={r.id} value={r.id}><span className="role-option">{r.label}<small>{r.access}</small></span></DropdownMenuRadioItem>)}</DropdownMenuRadioGroup>
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
    <div className={`app-shell ${wide ? "shell-chat" : "shell-slim"}`}>
      <aside className="sidebar">{sidebar}</aside>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen} side="left" title="Menu" className="sidebar-sheet">{sidebar}</Sheet>
      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Apri menu"><Menu /></button>
          <nav className="top-tabs" aria-label="Sezioni">{nav.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === "/"}><Icon size={16} /><span>{label}</span></NavLink>)}</nav>
        </header>
        <main className="page"><Outlet /></main>
      </div>
    </div>
  );
}
