import { useEffect } from "react";
import { ArrowRight, Building2, ChevronUp, HeartHandshake, MonitorPlay, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDemo } from "../state/DemoContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui";

const perspectives = [
  { id: "structure", label: "Struttura", description: "Operatori", icon: Building2, path: "/", key: "1" },
  { id: "family", label: "Famiglia", description: "Anna", icon: HeartHandshake, path: "/famiglia", key: "2" },
  { id: "ross", label: "ROSS", description: "Elena", icon: Sparkles, path: "/ross", key: "3" },
];
const presentationRoutes = ["/", "/ross", "/ross/conversazione", "/?q=emerso", "/ospiti/elena", "/ospiti/elena?tab=avvicinare", "/famiglia", "/panoramica", "/report?ospite=elena", "/ospiti/elena?tab=documenti"];

const isTyping = (target) => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

// Selettore della vista demo: pillola discreta in basso a destra, uguale in tutte le viste.
export function PerspectiveSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, actions } = useDemo();
  const active = location.pathname.startsWith("/famiglia") ? "family" : location.pathname.startsWith("/ross") ? "ross" : "structure";
  const current = perspectives.find((p) => p.id === active);

  const goTo = (perspective) => {
    if (perspective.id === "structure" && state.rossJourney.candidateId && !state.rossJourney.confirmedAt) {
      navigate("/?q=emerso");
      return;
    }
    navigate(perspective.path);
  };

  const next = () => {
    const here = `${location.pathname}${location.search}`;
    const exact = presentationRoutes.indexOf(here);
    const index = exact >= 0 ? exact : presentationRoutes.findIndex((r) => r.split("?")[0] === location.pathname);
    navigate(presentationRoutes[(index + 1) % presentationRoutes.length]);
  };

  useEffect(() => {
    const handler = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target) || document.querySelector("[role=dialog],[role=menu],[role=listbox]")) return;
      const target = perspectives.find((p) => p.key === event.key);
      if (target) { event.preventDefault(); goTo(target); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className={`demo-view demo-view-${active}`} data-testid="perspective-switcher">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="demo-view-trigger" aria-label={`Vista demo: ${current.label}. Cambia vista`}>
            <span className="demo-view-caption">Vista demo</span>
            <current.icon size={15} />
            <strong>{current.label}</strong>
            <ChevronUp size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="ui-menu-wide demo-view-menu">
          <DropdownMenuLabel>Vista demo</DropdownMenuLabel>
          {perspectives.map((p) => <DropdownMenuItem key={p.id} icon={p.icon} shortcut={p.key} className={p.id === active ? "demo-view-current" : ""} onSelect={() => goTo(p)}>{p.label} <small>· {p.description}</small></DropdownMenuItem>)}
          <DropdownMenuSeparator />
          <DropdownMenuItem icon={MonitorPlay} onSelect={actions.togglePresentation}>{state.presentation ? "Esci dalla presentazione" : "Modalità presentazione"}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {state.presentation && <button type="button" className="demo-view-next" onClick={next}>Avanti <ArrowRight size={15} /></button>}
    </div>
  );
}
