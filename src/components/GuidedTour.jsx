import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Check, DoorOpen, HeartHandshake, Sparkles, Sprout, X } from "lucide-react";

// Visita guidata: un passo alla volta, con l'elemento evidenziato e una spiegazione breve.
// Si apre da "Vista demo", dalla card in basso a sinistra, da Impostazioni o con ?visita=1.
// Accessibilità: il resto della pagina diventa inert, il focus entra nella scheda del passo,
// Esc chiude, le frecce scorrono i passi; il passo si può sempre saltare.
export const startTour = () => window.dispatchEvent(new CustomEvent("ross:tour"));

// Tre capitoli, uno per vista. Ogni capitolo si apre con una scheda più grande che dice cosa lo
// caratterizza e cosa guarderemo; poi i passi, uno per elemento.
const chapters = [
  {
    id: "struttura", label: "Struttura", who: "Lo staff della residenza", icon: Building2, route: "/",
    title: "Ora vediamo la struttura",
    body: "Quello che vede l'équipe: come sta ogni ospite e di cosa ha bisogno, mai di cosa ha parlato con ROSS. ROSS sta sopra i sistemi della residenza, non li sostituisce.",
    features: ["Chiedi a ROSS: domande a parole proprie, anche dal telefono", "Chi accompagnare: chi vorrebbe partecipare alla vita della residenza", "Il polso: cosa va bene e cosa è da osservare", "Il ritratto di ogni ospite, a partire dalle sue risorse", "Cosa la struttura riceve, e cosa no"],
    steps: [
      { route: "/", target: ".ask-empty, .ask-chat", title: "Chiedi a ROSS", lens: "Comprensibile", body: "Lo staff chiede a parole sue, anche dal telefono: chi ha bisogno di più attenzione, come avvicinare qualcuno. Ogni risposta cita la fonte." },
      { route: "/", target: ".ask-suggestions", title: "Chi accompagnare", lens: "Gestibile", body: "ROSS invita gli ospiti a partecipare; lo staff chiede «Chi vorrebbe partecipare ma ha bisogno di essere accompagnato?» e sa dove serve un braccio, un invito, una sedia in più." },
      { route: "/", target: ".sidebar .sidebar-insights", title: "Il polso di ROSS", lens: "Prima le risorse", body: "Cosa va bene e cosa è da osservare, ognuno rispetto alla sua media. ROSS segnala, l'équipe osserva e decide." },
      { route: "/ospiti/elena", target: ".resident-resources", title: "Il ritratto di Elena", lens: "Risorse", body: "In cima le sue risorse: cosa le dà significato, cosa la aiuta a farcela, cosa va bene. Poi come sta, come avvicinarla, quando parla con ROSS. Mai di cosa ha parlato." },
      { route: "/impostazioni#privacy", target: "#privacy", title: "Cosa riceve la struttura", lens: "Decide la persona", body: "Come sta e di cosa ha bisogno ogni ospite, mai il contenuto delle conversazioni. È la regola d'oro di ROSS." },
    ],
  },
  {
    id: "famiglia", label: "Famiglia", who: "Anna, la figlia di Elena", icon: HeartHandshake, route: "/famiglia",
    title: "Ora vediamo la famiglia",
    body: "Quello che vede Anna: un racconto, non dei dati. Solo ciò che Elena sceglie di condividere, e la struttura non sta in mezzo.",
    features: ["Il racconto di oggi, anche di ciò che Elena ha fatto fuori da ROSS", "Come sta questa settimana: solo ciò che va bene, partecipazione compresa", "Come puoi esserle vicina: la famiglia come risorsa, in tutte e due le direzioni", "Condividi: foto, ricordi e canzoni che arrivano a ROSS"],
    steps: [
      { route: "/famiglia", target: ".family-story", title: "Il racconto di oggi", lens: "Significativo", body: "Anna non riceve dati né trascrizioni: un breve racconto, solo di ciò che Elena ha scelto di condividere. Se Elena va al canto e decide di dirlo, compare anche qui." },
      { route: "/famiglia", target: ".family-residence-note", title: "Come sta questa settimana", lens: "Prima le risorse", body: "Solo ciò che va bene, rispetto al solito di Elena: questa settimana anche più partecipazione alla vita della residenza. Niente dati da controllare." },
      { route: "/famiglia", target: ".family-resource-card", title: "Come puoi esserle vicina", lens: "Reciprocità", body: "Anche Anna è una risorsa, e lo è anche Elena per lei: tre spunti concreti, dal ricordo che la accende al consiglio da chiederle." },
      { route: "/famiglia", target: ".family-add-button", title: "Condividi con ROSS", lens: "Risorse", body: "Anna può mandare una foto, un ricordo, un argomento o una canzone: ROSS li proporrà a Elena nel momento giusto." },
    ],
  },
  {
    id: "ross", label: "Elena", who: "Il tablet di Elena", icon: Sparkles, route: "/ross",
    title: "Ora vediamo il tablet di Elena",
    body: "Il cuore di ROSS: un compagno di conversazione che non vuole tenere Elena davanti allo schermo. Porta spunti, ascolta e la invita a uscire e partecipare. Qui decide lei.",
    features: ["Oggi, fuori da qui: gli inviti a uscire e partecipare", "Spunti per oggi, dal meteo e dalle ricorrenze", "Da Anna, per te: ciò che la famiglia ha condiviso", "Aiuto con parole proprie, e quanto ROSS si fa sentire", "Una conversazione, e il consenso a condividere"],
    steps: [
      { route: "/ross", target: ".ross-hero", title: "Un compagno di conversazione", lens: "Comprensibile", body: "Elena tocca «Parla con ROSS» e parla con la sua voce. ROSS dice sempre di essere un programma, e che quello che si dicono resta lì." },
      { route: "/ross", target: ".ross-outside, .ross-away", title: "Oggi, fuori da qui", lens: "Gestibile", body: "ROSS è un ponte, non la meta: legge il calendario della residenza e invita Elena a ciò che le piace. Lei va, ROSS resta in silenzio, e al ritorno le chiede com'è andata. Elena decide se dirlo ad Anna." },
      { route: "/ross", target: ".ross-outside ~ .ross-section .ross-prompt-grid, .ross-away ~ .ross-section .ross-prompt-grid", title: "Spunti per oggi", lens: "Significativo", body: "Il meteo e le ricorrenze diventano occasioni per chiacchierare: la pioggia porta alle fotografie, il compleanno di un cantante a una sua canzone." },
      { route: "/ross", target: ".ross-family-grid", title: "Da Anna, per te", lens: "Risorse", body: "Quello che la famiglia ha condiviso arriva qui come spunto. ROSS lo propone nel momento giusto; Elena decide se parlarne." },
      { route: "/ross", target: ".ross-touch-grid > button:last-child", title: "Aiuto, con parole proprie", lens: "Gestibile", body: "Non servono frasi fisse. ROSS non è un sistema di emergenza e lo dice: per un aiuto urgente ci sono il campanello e il personale." },
      { route: "/ross", target: ".ross-modes", title: "Decide Elena", lens: "Decide la persona", body: "È lei a scegliere quanto ROSS si fa sentire: propone, aspetta di essere chiamato o resta in silenzio." },
      { route: "/ross/conversazione", target: ".ross-dialogue, .ross-conversation-complete article", title: "Una conversazione", lens: "Significativo", body: "ROSS riprende ciò che conosce e lascia scegliere. Quando emerge un ricordo nuovo chiede a Elena se può raccontarlo ad Anna, e chiude con un invito: alle 17:30 in salone si canta." },
    ],
  },
];

// Sequenza piatta: benvenuto, poi per ogni capitolo la sua scheda d'apertura e i suoi passi, infine la chiusura.
const sequence = [
  { kind: "welcome", route: "/" },
  { kind: "method", page: 0, route: "/" },
  { kind: "method", page: 1, route: "/" },
  ...chapters.flatMap((chapter, c) => [
    { kind: "chapter", chapter: c, route: chapter.route },
    ...chapter.steps.map((step, i) => ({ kind: "step", chapter: c, position: i, ...step })),
  ]),
  { kind: "theme", route: "/ross" },
  { kind: "end", route: null, target: "[data-testid=perspective-switcher]", title: "Fine della visita", body: "Da questa pillola passate tra le tre viste (tasti 1, 2, 3) e trovate «Cosa è reale e cosa è simulato»: in questa demo dati e risposte sono preparati." },
];
const methodStart = 1;
// Il metodo: la salutogenesi (Antonovsky) come cornice di progetto, non come prova di efficacia.
const method = [
  {
    title: "Partiamo da ciò che fa stare bene",
    body: "ROSS è progettato con la lente della salutogenesi (Aaron Antonovsky): non chiederci solo che cosa manca a una persona, ma quali risorse la aiutano a stare bene. Interessi, persone, attività, abitudini: spesso ci sono già, ma vanno riconosciute e rese raggiungibili. ROSS fa da ponte verso queste risorse, non le sostituisce.",
    points: [["Risorse prima", "In tutta la demo ciò che va bene viene prima di ciò che è da osservare."], ["Ognuno rispetto a sé stesso", "Il benessere è un equilibrio personale che cambia nel tempo: niente classifiche."], ["Cosa non è", "Non è pensiero positivo e non è una promessa di salute: è la cornice con cui progettiamo, da verificare sul campo."]],
  },
  {
    title: "Comprensibile, gestibile, significativa",
    body: "Il cuore del metodo è il senso di coerenza: la persona sente la propria vita comprensibile, gestibile e significativa. Nella visita, un'etichetta su ogni passo indica a quale di queste dimensioni risponde.",
    points: [["Comprensibile", "Capisco cosa succede: il racconto per Anna, i confronti con la propria media, ROSS che dice cos'è."], ["Gestibile", "Posso farcela con ciò che ho: inviti piccoli, aiuto con parole proprie, chi accompagnare."], ["Significativa", "Ne vale la pena: spunti dagli interessi e dalla storia di Elena."], ["Decide la persona", "Co-power: non si «dà» autonomia, si creano con Elena le condizioni per esercitarla. Può scegliere, rifiutare, tenere per sé."]],
  },
];
const chapterStart = (c) => sequence.findIndex((item) => item.kind === "chapter" && item.chapter === c);

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
  const step = active ? sequence[index] : null;

  const close = useCallback(() => { setIndex(null); setRect(null); }, []);
  const go = useCallback((next) => setIndex(next < 0 ? 0 : next >= sequence.length ? null : next), []);

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
  const last = index === sequence.length - 1;
  const big = ["welcome", "method", "chapter", "theme"].includes(step.kind);
  const pos = !big && box && placePopover(rect, box, { width: window.innerWidth, height: window.innerHeight });
  const spot = rect && !big ? { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 } : null;
  const chapter = step.chapter != null ? chapters[step.chapter] : null;
  const ChapterIcon = chapter?.icon;

  // Stepper dei capitoli: dove siamo, cosa abbiamo visto; ogni capitolo si apre con un clic.
  const stepper = <nav className="tour-stepper" aria-label="Parti della visita">{chapters.map((item, c) => {
    const state = step.kind === "end" || step.kind === "theme" || (chapter && c < step.chapter) ? "done" : chapter && c === step.chapter ? "current" : "todo";
    const Icon = item.icon;
    return <button key={item.id} type="button" className={`tour-stepper-item is-${state}`} aria-current={state === "current" ? "step" : undefined} onClick={() => go(chapterStart(c))}>
      <span>{state === "done" ? <Check size={12} /> : <Icon size={12} />}</span>{item.label}
    </button>;
  })}</nav>;

  let content;
  if (step.kind === "welcome") {
    content = <>
      <span className="tour-chapter">Visita guidata</span>
      <h2 id="tour-title">Una visita in tre parti</h2>
      <p id="tour-body">Prima il metodo con cui è pensato, poi ROSS da tre punti di vista, uno alla volta, e il filo che li lega: ROSS invita a uscire e partecipare, non a restare davanti allo schermo. Potete saltare a una parte o uscire quando volete con Esc.</p>
      <ol className="tour-agenda"><li><button type="button" onClick={() => go(methodStart)}><span className="tour-agenda-icon tour-agenda-icon-green"><Sprout size={18} /></span><span><strong>Il metodo</strong><small>La salutogenesi, in due schede</small></span><ArrowRight size={15} /></button></li>{chapters.map((item, c) => { const Icon = item.icon; return <li key={item.id}><button type="button" onClick={() => go(chapterStart(c))}><span className="tour-agenda-icon"><Icon size={18} /></span><span><strong>{item.label}</strong><small>{item.who}</small></span><ArrowRight size={15} /></button></li>; })}</ol>
    </>;
  } else if (step.kind === "method") {
    const page = method[step.page];
    content = <>
      <span className="tour-chapter-hero tour-chapter-hero-green"><Sprout size={22} /></span>
      <span className="tour-chapter">Il metodo · {step.page + 1} di {method.length}</span>
      <h2 id="tour-title">{page.title}</h2>
      <p id="tour-body">{page.body}</p>
      <ul className="tour-points">{page.points.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}</ul>
    </>;
  } else if (step.kind === "theme") {
    content = <>
      {stepper}
      <span className="tour-chapter-hero tour-chapter-hero-green"><DoorOpen size={22} /></span>
      <span className="tour-chapter">Il filo che lega le tre viste</span>
      <h2 id="tour-title">ROSS è un ponte verso la vita fuori</h2>
      <p id="tour-body">Il successo di ROSS non è il tempo passato a parlare con lui, ma quello passato fuori: alle attività, in giardino, al telefono con chi si vuole bene. È la stessa lente salutogenica: attivare le risorse della persona, non sostituirle.</p>
      <h3 className="tour-features-title">Come si vede in ogni vista</h3>
      <ol className="tour-features">
        <li><span><strong>Elena:</strong> ROSS la invita al canto, resta in silenzio mentre è fuori e al ritorno le chiede com'è andata.</span></li>
        <li><span><strong>Famiglia:</strong> se Elena lo vuole, Anna legge che è andata al canto e ha uno spunto per la telefonata.</span></li>
        <li><span><strong>Struttura:</strong> lo staff vede chi vorrebbe partecipare ma ha bisogno di essere accompagnato, e la partecipazione rispetto alla media di ognuno.</span></li>
      </ol>
    </>;
  } else if (step.kind === "chapter") {
    content = <>
      {stepper}
      <span className="tour-chapter-hero"><ChapterIcon size={22} /></span>
      <span className="tour-chapter">Parte {step.chapter + 1} di {chapters.length} · {chapter.who}</span>
      <h2 id="tour-title">{chapter.title}</h2>
      <p id="tour-body">{chapter.body}</p>
      <h3 className="tour-features-title">Cosa guarderemo</h3>
      <ol className="tour-features">{chapter.features.map((feature) => <li key={feature}>{feature}</li>)}</ol>
    </>;
  } else {
    content = <>
      {chapter && stepper}
      {step.lens && <span className="tour-lens"><Sprout size={12} /> {step.lens}</span>}
      <h2 id="tour-title">{step.title}</h2>
      <p id="tour-body">{step.body}</p>
      {chapter && <div className="tour-progress" aria-hidden="true"><i style={{ width: `${((step.position + 1) / chapter.steps.length) * 100}%` }} /></div>}
    </>;
  }
  const count = step.kind === "step" ? `${step.position + 1} di ${chapter.steps.length} · ${chapter.label}` : step.kind === "chapter" ? `Parte ${step.chapter + 1} di ${chapters.length}` : "";
  const primary = last ? "Fine" : step.kind === "welcome" ? "Iniziamo" : step.kind === "chapter" ? "Guardiamoli" : "Avanti";

  return createPortal(
    <div className="tour" data-testid="guided-tour">
      {spot ? <div className="tour-spotlight" style={spot} aria-hidden="true" /> : <div className="tour-dim" aria-hidden="true" />}
      <div className="tour-blocker" aria-hidden="true" onClick={() => cardRef.current?.focus()} />
      <section ref={cardRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body"
        className={`tour-card${big ? " tour-card-big tour-card-center" : pos ? "" : rect ? " tour-card-sheet" : " tour-card-center"}`} style={pos || undefined}>
        <button type="button" className="tour-close" onClick={close} aria-label="Chiudi la visita guidata"><X size={16} /></button>
        {content}
        <footer>
          <span className="tour-count" aria-live="polite">{count}</span>
          <div>
            {index === 0 ? <button type="button" className="tour-secondary" onClick={close}>Salta</button>
              : <button type="button" className="tour-secondary" onClick={() => go(index - 1)}><ArrowLeft size={15} /> Indietro</button>}
            <button type="button" className="tour-primary" onClick={() => go(index + 1)}>{primary}{!last && <ArrowRight size={15} />}</button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
