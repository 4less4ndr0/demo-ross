import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

// Visita guidata: un passo alla volta, con l'elemento evidenziato e una spiegazione breve.
// Si apre da "Vista demo", dalla card in basso a sinistra, da Impostazioni o con ?visita=1.
// Accessibilità: il resto della pagina diventa inert, il focus entra nella scheda del passo,
// Esc chiude, le frecce scorrono i passi; il passo si può sempre saltare.
export const startTour = () => window.dispatchEvent(new CustomEvent("ross:tour"));

const steps = [
  { chapter: "Benvenuti", route: "/ross", title: "Una visita in pochi passi", body: "Vediamo ROSS da tre punti di vista: il tablet di Elena, la figlia Anna e la struttura. Potete uscire quando volete con Esc o con la ×." },
  { chapter: "Il tablet di Elena", route: "/ross", target: ".ross-hero", title: "Un compagno di conversazione", body: "Elena tocca «Parla con ROSS» e parla con la sua voce. ROSS dice sempre di essere un programma, e che quello che si dicono resta lì." },
  { chapter: "Il tablet di Elena", route: "/ross", target: ".ross-prompt-grid", title: "Spunti per oggi", body: "Il meteo e le ricorrenze diventano occasioni per chiacchierare: la pioggia porta alle fotografie, il compleanno di un cantante a una sua canzone." },
  { chapter: "Il tablet di Elena", route: "/ross", target: ".ross-family-grid", title: "Da Anna, per te", body: "Quello che la famiglia sceglie di condividere arriva qui come spunto. ROSS lo propone nel momento giusto; Elena decide se parlarne." },
  { chapter: "Il tablet di Elena", route: "/ross", target: ".ross-touch-grid > button:last-child", title: "Aiuto, con parole proprie", body: "Non servono frasi fisse. ROSS non è un sistema di emergenza e lo dice: per un aiuto urgente ci sono il campanello e il personale." },
  { chapter: "Il tablet di Elena", route: "/ross", target: ".ross-modes", title: "Decide Elena", body: "È lei a scegliere quanto ROSS si fa sentire: propone, aspetta di essere chiamato o resta in silenzio." },
  { chapter: "Il tablet di Elena", route: "/ross/conversazione", target: ".ross-dialogue, .ross-conversation-complete article", title: "Una conversazione", body: "ROSS riprende ciò che conosce e lascia scegliere. Quando emerge un ricordo nuovo, chiede a Elena se può raccontarlo ad Anna." },
  { chapter: "La famiglia", route: "/famiglia", target: ".family-story", title: "Il racconto di oggi", body: "Anna non riceve dati né trascrizioni: un breve racconto, solo di ciò che Elena ha scelto di condividere." },
  { chapter: "La famiglia", route: "/famiglia", target: ".family-residence-note", title: "Come sta questa settimana", body: "Solo ciò che va bene, rispetto al solito di Elena. Niente dati da controllare." },
  { chapter: "La famiglia", route: "/famiglia", target: ".family-add-button", title: "Condividi con ROSS", body: "Anna può mandare una foto, un ricordo, un argomento o una canzone: li ritrovate sul tablet, in «Da Anna, per te»." },
  { chapter: "La struttura", route: "/", target: ".ask-empty, .ask-chat", title: "Chiedi a ROSS", body: "Lo staff chiede a parole sue, anche dal telefono: chi ha bisogno di più attenzione, come avvicinare qualcuno. Ogni risposta cita la fonte." },
  { chapter: "La struttura", route: "/", target: ".sidebar .sidebar-insights", title: "Il polso di ROSS", body: "Cosa va bene e cosa è da osservare, ognuno rispetto alla sua media. ROSS segnala, l'équipe osserva e decide." },
  { chapter: "La struttura", route: "/ospiti/elena", target: ".profile-tabs", title: "Il ritratto di Elena", body: "Come sta, come avvicinarla, quando parla con ROSS. Mai di cosa ha parlato." },
  { chapter: "La struttura", route: "/impostazioni#privacy", target: "#privacy", title: "Cosa riceve la struttura", body: "Come sta e di cosa ha bisogno ogni ospite, mai il contenuto delle conversazioni. È la regola d'oro di ROSS." },
  { chapter: "Per chi presenta", route: null, target: "[data-testid=perspective-switcher]", title: "Vista demo", body: "Da qui passate tra le tre viste (tasti 1, 2, 3) e trovate «Cosa è reale e cosa è simulato»: in questa demo dati e risposte sono preparati." },
];

const PAD = 8;
const GAP = 14;
const visibleRect = (el) => { const r = el?.getBoundingClientRect(); return r && r.width > 0 && r.height > 0 ? r : null; };
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function placePopover(rect, box, viewport) {
  if (!rect || viewport.width < 640) return null; // senza bersaglio o su telefono: scheda in basso
  const clampTop = (top) => Math.min(Math.max(16, top), viewport.height - box.height - 16);
  const clampLeft = (left) => Math.min(Math.max(16, left), viewport.width - box.width - 16);
  const below = rect.bottom + GAP;
  const above = rect.top - GAP - box.height;
  if (below + box.height <= viewport.height - 16) return { top: below, left: clampLeft(rect.left + rect.width / 2 - box.width / 2) };
  if (above >= 16) return { top: above, left: clampLeft(rect.left + rect.width / 2 - box.width / 2) };
  // Elementi alti (sidebar, chat): la scheda va di fianco, se c'è posto.
  const middle = clampTop(rect.top + rect.height / 2 - box.height / 2);
  if (rect.right + GAP + box.width <= viewport.width - 16) return { top: middle, left: rect.right + GAP };
  if (rect.left - GAP - box.width >= 16) return { top: middle, left: rect.left - GAP - box.width };
  return { top: viewport.height - box.height - 16, left: clampLeft(rect.left + rect.width / 2 - box.width / 2) };
}

export function GuidedTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const [index, setIndex] = useState(null);
  const [rect, setRect] = useState(null);
  const [box, setBox] = useState(null);
  const cardRef = useRef(null);
  const active = index !== null;
  const step = active ? steps[index] : null;

  const close = useCallback(() => { setIndex(null); setRect(null); }, []);
  const go = useCallback((next) => setIndex(next < 0 ? 0 : next >= steps.length ? null : next), []);

  // Avvio: evento dai menu o ?visita=1 (anche il vecchio ?presentation=true).
  useEffect(() => {
    const start = () => setIndex(0);
    window.addEventListener("ross:tour", start);
    const params = new URLSearchParams(window.location.search);
    if (params.get("visita") === "1" || params.get("presentation") === "true") start();
    return () => window.removeEventListener("ross:tour", start);
  }, []);

  // Il resto della pagina è inerte durante la visita: niente tab né clic sullo sfondo.
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return undefined;
    root.inert = active;
    return () => { root.inert = false; };
  }, [active]);

  // Cambio passo: porta alla pagina giusta e aspetta che l'elemento compaia.
  useEffect(() => {
    if (!step) return undefined;
    const [path, hash = ""] = (step.route || "").split("#");
    if (step.route && (location.pathname !== path || (hash && location.hash !== `#${hash}`))) { navigate(step.route); return undefined; }
    setRect(null);
    let frame; let tries = 0; let settled;
    const find = () => {
      const el = step.target ? document.querySelector(step.target) : null;
      if (el && visibleRect(el)) {
        el.scrollIntoView({ block: window.innerWidth < 640 ? "start" : "center", behavior: reducedMotion() ? "auto" : "smooth" });
        settled = window.setTimeout(() => setRect(visibleRect(el)), reducedMotion() ? 0 : 380);
        return;
      }
      if (step.target && tries++ < 90) { frame = requestAnimationFrame(find); return; }
      setRect(null); // bersaglio assente: la scheda resta al centro
    };
    find();
    return () => { cancelAnimationFrame(frame); window.clearTimeout(settled); };
  }, [step, location.pathname, location.hash, navigate]);

  // Segue l'elemento se la finestra cambia o la pagina scorre.
  useEffect(() => {
    if (!step?.target) return undefined;
    const update = () => setRect(visibleRect(document.querySelector(step.target)));
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [step]);

  // Si misura solo la scheda; la posizione si calcola a ogni render dal bersaglio corrente.
  useLayoutEffect(() => {
    if (!active || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    setBox((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
  });

  // Il focus entra nella scheda a ogni passo; tastiera: Esc, frecce, Tab confinato nella scheda.
  useEffect(() => { if (active) cardRef.current?.focus(); }, [active, index]);
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      else if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, index, close, go]);

  if (!active) return null;
  const last = index === steps.length - 1;
  const pos = box && placePopover(rect, box, { width: window.innerWidth, height: window.innerHeight });
  const spot = rect ? { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 } : null;

  return createPortal(
    <div className="tour" data-testid="guided-tour">
      {spot ? <div className="tour-spotlight" style={spot} aria-hidden="true" /> : <div className="tour-dim" aria-hidden="true" />}
      <div className="tour-blocker" aria-hidden="true" onClick={() => cardRef.current?.focus()} />
      <section ref={cardRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body"
        className={`tour-card${pos ? "" : rect ? " tour-card-sheet" : " tour-card-center"}`} style={pos || undefined}>
        <header>
          <span className="tour-chapter">{step.chapter}</span>
          <button type="button" className="tour-close" onClick={close} aria-label="Chiudi la visita guidata"><X size={16} /></button>
        </header>
        <h2 id="tour-title">{step.title}</h2>
        <p id="tour-body">{step.body}</p>
        <div className="tour-progress" aria-hidden="true"><i style={{ width: `${((index + 1) / steps.length) * 100}%` }} /></div>
        <footer>
          <span className="tour-count" aria-live="polite">{index + 1} di {steps.length}</span>
          <div>
            {index === 0 ? <button type="button" className="tour-secondary" onClick={close}>Salta</button>
              : <button type="button" className="tour-secondary" onClick={() => go(index - 1)}><ArrowLeft size={15} /> Indietro</button>}
            <button type="button" className="tour-primary" onClick={() => go(index + 1)}>{last ? "Fine" : index === 0 ? "Iniziamo" : "Avanti"}{!last && <ArrowRight size={15} />}</button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
