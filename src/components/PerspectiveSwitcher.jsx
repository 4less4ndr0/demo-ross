import { useEffect, useState } from "react";
import { Building2, ChevronUp, Compass, FlaskConical, HeartHandshake, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDemo } from "../state/DemoContext";
import { startTour } from "./GuidedTour";
import { Dialog, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui";

const perspectives = [
  { id: "structure", label: "Struttura", description: "Operatori", icon: Building2, path: "/", key: "1" },
  { id: "family", label: "Famiglia", description: "Anna", icon: HeartHandshake, path: "/famiglia", key: "2" },
  { id: "ross", label: "ROSS", description: "Elena", icon: Sparkles, path: "/ross", key: "3" },
];

// Cosa dire a chi guarda la demo: è uno strumento di ricerca, non un prodotto finito.
const simulated = [
  ["Dati inventati", "Residenza Aurora, gli otto ospiti, Elena e Anna non esistono."],
  ["Risposte preparate", "La chat della struttura risponde con testi scritti in anticipo: non c'è un modello AI collegato."],
  ["Conversazione con copione", "Il dialogo tra ROSS ed Elena è scritto e avanza a tocchi: nessun riconoscimento vocale."],
  ["Meteo, ora e ricorrenze", "Gli spunti del giorno sul tablet di Elena sono scritti per la demo, non letti da un servizio esterno."],
  ["Nessun dispositivo collegato", "Niente tablet o companion reale, nessuna chiamata, nessun avviso inviato a qualcuno."],
];
const principles = [
  ["La struttura sa come sta, non di cosa ha parlato", "Mai trascrizioni, citazioni o ricordi: solo segnali nel tempo, bisogni e interessi per categoria."],
  ["La famiglia vede ciò che l'ospite sceglie", "ROSS chiede a Elena se può raccontarlo ad Anna, un racconto alla volta."],
  ["Ognuno confrontato con sé stesso", "Niente voti né classifiche: solo \"rispetto alla sua media\"."],
  ["Non è clinico né un sistema di emergenza", "ROSS non giudica la salute e non sostituisce campanello, personale o relazioni."],
  ["Elaborazione sul dispositivo", "È la direzione tecnica del progetto, non una capacità già verificata."],
];

const isTyping = (target) => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

// Selettore della vista demo: pillola discreta in basso a destra, uguale in tutte le viste.
export function PerspectiveSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useDemo();
  const active = location.pathname.startsWith("/famiglia") ? "family" : location.pathname.startsWith("/ross") ? "ross" : "structure";
  const current = perspectives.find((p) => p.id === active);
  const [aboutOpen, setAboutOpen] = useState(false);

  const goTo = (perspective) => {
    if (perspective.id === "structure" && state.rossJourney.candidateId && !state.rossJourney.confirmedAt) {
      navigate("/?q=emerso");
      return;
    }
    navigate(perspective.path);
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
          <DropdownMenuItem icon={FlaskConical} onSelect={() => setAboutOpen(true)}>Cosa è reale e cosa è simulato</DropdownMenuItem>
          <DropdownMenuItem icon={Compass} onSelect={startTour}>Visita guidata</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={aboutOpen} onClose={() => setAboutOpen(false)} title="Cosa è reale e cosa è simulato" size="lg">
        <div className="demo-about">
          <p className="demo-about-lead">Questa demo è uno strumento per discutere e raccogliere reazioni: mostra come ROSS potrebbe stare accanto a Elena, ad Anna e alla struttura. Non è un prodotto finito né una prova che funzioni.</p>
          <section><h3>Simulato</h3><ul>{simulated.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}</ul></section>
          <section><h3>Principi che stiamo progettando</h3><ul>{principles.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}</ul></section>
        </div>
      </Dialog>
    </div>
  );
}
