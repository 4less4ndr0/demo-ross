import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { AlarmClock, BatteryFull, CalendarDays, Camera, Check, ChevronLeft, ChevronRight, Eye, EyeOff, Flashlight, Gift, HandHeart, Heart, Home, Lock, MessageCircle, MessageCircleHeart, MessageCircleQuestion, Mic, Music2, Paperclip, Phone, Plus, Send, Signal, Sparkles, Wifi, X } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { Dialog, Tabs, TabsList, TabsTrigger, Textarea } from "../components/ui";
import { asset } from "../asset.js";
import { signalDetail, signalsFor } from "../data/careInsights";
import { familyResourceTips } from "../data/salutogenesis";
import { consumeLockScreen } from "../state/lockScreen";
import { elaborate, kindLabels, sampleDictation, titleFor } from "../data/familyMessages";

// Vista Famiglia come app per iPhone (Apple HIG): margini 16pt, tocchi ≥ 44pt, testo di base 17pt,
// barra di navigazione in alto, tab bar in basso, sheet dal basso. Su schermi larghi l'app sta in una cornice iPhone.

// Ciò che Anna manda è libero: ROSS ne capisce il tipo (vedi src/data/familyMessages.js). Qui solo icone ed etichette.
const kindIcons = { photo: Camera, memory: Heart, topic: MessageCircleQuestion, music: Music2, reminder: AlarmClock, message: MessageCircle };
const kindShort = (kind) => kindLabels[kind] || (kind === "photo" ? "Foto" : "Pensiero");

// Le schede seguono la direzione delle cose: ciò che arriva da Elena (Da lei), ciò che parte da Anna (Da te),
// e in mezzo il + che porta qualcosa a ROSS. Oggi è il punto d'ingresso, Insieme è la relazione (il metodo).
const familyTabs = [
  { id: "oggi", to: "/famiglia", label: "Oggi", icon: Home },
  { id: "da-lei", to: "/famiglia/da-lei", label: "Da lei", icon: MessageCircleHeart },
  { id: "da-te", to: "/famiglia/da-te", label: "Da te", icon: Gift },
  { id: "insieme", to: "/famiglia/insieme", label: "Insieme", icon: HandHeart },
];

// Consenso: la famiglia vede un racconto di Elena solo se Elena ha scelto di condividerlo.
// I contributi della famiglia vanno direttamente a ROSS, senza verifica della struttura.
const fromFamily = (memory) => Boolean(memory.familyContributionId) || /^(Famiglia|Contributo)/i.test(memory.source || "");
const visibleToFamily = (memory) => fromFamily(memory) || (memory.sharedWithFamily ?? memory.id !== "mem-vongole");
const originLabel = (memory) => fromFamily(memory) ? "Dalla famiglia" : "Raccontato da Elena";
const contributionStatus = (status) => status === "Confermato" || status === "Ripreso con Elena" ? "Ripreso con Elena" : "Disponibile a ROSS";

// Lo schermo del telefono: i dialog si aprono lì dentro, come sheet.
const PhoneScreen = createContext(null);

function SharedBadge() { return <span className="fam-badge"><Heart size={13} /> Elena ha voluto raccontartelo</span>; }

function StatusBar() {
  return <div className="fam-statusbar" aria-hidden="true"><span>17:20</span><i className="fam-island" /><span className="fam-status-icons"><Signal size={16} /><Wifi size={16} /><BatteryFull size={20} /></span></div>;
}

// Il racconto di oggi cambia con ciò che Elena ha scelto di condividere (conversazione con ROSS, uscita).
function todayLines(state) {
  const conversationDone = Boolean(state.rossJourney.completedAt);
  // Un'uscita raccontata a ROSS arriva ad Anna solo se Elena ha scelto di condividerla.
  const outingShared = state.outing?.status === "back" && state.outing.shared;
  const basePrompt = conversationDone ? "Chiedile della piccola macchina fotografica rossa che Paolo portava sul lungomare." : "Chiedile delle passeggiate sul lungomare di Cefalù e delle fotografie del 1998.";
  return {
    conversationDone, outingShared,
    prompt: outingShared ? "Chiedile del canto in salone: cosa avete cantato?" : basePrompt,
    story: (conversationDone ? "Elena ha ripreso il viaggio in Sicilia e ha voluto raccontarti della piccola macchina fotografica rossa che Paolo portava sul lungomare." : "Elena ha scelto Mina per iniziare il pomeriggio. Più tardi ha sfogliato fotografie di viaggio e ricordato le passeggiate serali a Cefalù con Paolo.") + (outingShared ? " Poi è andata al canto in salone, come le aveva proposto ROSS, e al ritorno gliel'ha raccontato." : ""),
    headline: outingShared ? (conversationDone ? "Un ricordo ritrovato, poi tutti a cantare." : "Musica, fotografie e poi tutti a cantare.") : conversationDone ? "Una macchina fotografica rossa riapre un ricordo." : "Musica, fotografie e una passeggiata sul mare.",
    // Il sorriso di oggi: un solo momento, e solo tra quelli che Elena ha scelto di condividere.
    smile: outingShared ? "al canto in salone, e al ritorno ha voluto raccontarlo." : conversationDone ? "la macchina fotografica rossa di Paolo, ritrovata in un ricordo." : "Mina, riconosciuta dopo poche note.",
  };
}

const tourActive = () => Boolean(document.getElementById("root")?.inert) || new URLSearchParams(window.location.search).has("visita");

// Schermata di blocco: la prima cosa che Anna vede è una notifica, e arriva solo perché Elena ha scelto di raccontare.
function LockScreen({ lines, onOpen }) {
  const [leaving, setLeaving] = useState(false);
  const lockRef = useRef(null);
  const start = useRef(null);
  useEffect(() => { lockRef.current?.focus({ preventScroll: true }); }, []);
  const open = (to) => {
    if (leaving) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setLeaving(true);
    window.setTimeout(() => onOpen(to), reduced ? 0 : 380);
  };
  return <div ref={lockRef} tabIndex={-1} className={`fam-lock${leaving ? " is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Schermata di blocco dell'iPhone di Anna"
    onKeyDown={(event) => { if (event.key === "Escape") open(null); }}
    onWheel={(event) => { if (event.deltaY > 30) open(null); }}
    onPointerDown={(event) => { start.current = event.clientY; }}
    onPointerUp={(event) => { if (start.current != null && start.current - event.clientY > 60) open(null); start.current = null; }}>
    <div className="fam-lock-clock"><Lock size={16} aria-hidden="true" /><span>lunedì 21 settembre</span><strong>17:20</strong></div>
    <div className="fam-lock-stack">
      <button type="button" className="fam-lock-note" onClick={() => open("/famiglia")}>
        <span className="fam-lock-app" aria-hidden="true">R</span>
        <span className="fam-lock-text"><span className="fam-lock-meta"><strong>ROSS</strong><small>ora</small></span><strong>Elena ha voluto raccontarti una cosa</strong><span>Il sorriso di oggi: {lines.smile}</span></span>
      </button>
      <button type="button" className="fam-lock-note is-older" onClick={() => open("/famiglia/attivita/cartolina")}>
        <span className="fam-lock-app" aria-hidden="true">R</span>
        <span className="fam-lock-text"><span className="fam-lock-meta"><strong>ROSS</strong><small>ieri</small></span><strong>La tua cartolina è arrivata a Elena</strong><span>Ha riconosciuto subito Cefalù: guarda com'è andata.</span></span>
      </button>
    </div>
    <div className="fam-lock-bottom" aria-hidden="true"><span><Flashlight size={20} /></span><span><Camera size={20} /></span></div>
    <button type="button" className="fam-lock-hint" onClick={() => open(null)}>Scorri verso l'alto per aprire</button>
  </div>;
}

function FamilyShell({ title, tab, back, onContribute, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [screen, setScreen] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { state } = useDemo();
  const phone = state.familyPhone !== false;
  // Cornice iPhone forzata anche nelle finestre strette: il telefono si rimpicciolisce per starci.
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!phone) return undefined;
    const fit = () => setScale(Math.min(1, (window.innerWidth - 24) / 417));
    fit(); window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [phone]);
  const { actions } = useDemo();
  const [locked, setLocked] = useState(() => pathname === "/famiglia" && consumeLockScreen(tourActive(), phone));
  // La schermata di blocco esiste solo dentro la cornice iPhone: se è richiesta, la cornice si accende.
  useEffect(() => { if (locked && !phone) actions.setFamilyPhone(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const show = () => { if (consumeLockScreen()) { setLocked(true); actions.setFamilyPhone(true); } };
    const hide = () => setLocked(false);
    window.addEventListener("ross:lockscreen", show); window.addEventListener("ross:unlock", hide); window.addEventListener("ross:tour", hide);
    return () => { window.removeEventListener("ross:lockscreen", show); window.removeEventListener("ross:unlock", hide); window.removeEventListener("ross:tour", hide); };
  }, []);
  const unlock = (to) => { setLocked(false); if (to && to !== pathname) navigate(to); };
  return <div className={`family-app ${phone ? "is-phone" : "is-full"}`} style={phone ? { "--fam-scale": scale } : undefined}><div className="fam-stage">
    <p className="fam-stage-caption" aria-hidden="true"><strong>Vista Famiglia</strong>L'app di Anna, sul suo iPhone</p>
    <div className="fam-device"><div className={`fam-screen${locked ? " is-locked" : ""}`} ref={setScreen}><PhoneScreen.Provider value={screen}>
      <StatusBar />
      <div className="fam-scroll" inert={locked || undefined} onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 64)}>
        <header className={`fam-navbar${scrolled ? " is-scrolled" : ""}`}>
          <div className="fam-navbar-side">{back ? <button type="button" className="fam-nav-back" onClick={() => navigate(back.to)}><ChevronLeft size={26} strokeWidth={2.2} />{back.label}</button> : <NavLink className="fam-brand" to="/famiglia" aria-label="ROSS per la famiglia: Oggi"><span>R</span><small>ROSS</small></NavLink>}</div>
          <strong className="fam-navbar-title" aria-hidden={!scrolled}>{title}</strong>
          <div className="fam-navbar-side fam-navbar-end" />
        </header>
        <main className="fam-main screen-enter">{children}</main>
      </div>
      {/* Tab bar: due schede, il + al centro (l'azione principale: portare qualcosa a ROSS), due schede */}
      <nav className="fam-tabbar" aria-label="Navigazione famiglia" inert={locked || undefined}>{[...familyTabs.slice(0, 2), null, ...familyTabs.slice(2)].map((item) => {
        if (!item) return <button key="add" type="button" className="fam-add" onClick={onContribute} aria-label="Condividi con ROSS"><Plus size={26} strokeWidth={2.2} /></button>;
        const { id, to, label, icon: Icon } = item; const active = id === tab;
        return <NavLink key={to} to={to} end className={active ? "active" : ""} aria-current={active ? "page" : undefined}><Icon size={24} strokeWidth={active ? 2.3 : 1.8} /><span>{label}</span></NavLink>;
      })}</nav>
      {locked && phone && <LockScreen lines={todayLines(state)} onOpen={unlock} />}
      <span className="fam-home-indicator" aria-hidden="true" />
    </PhoneScreen.Provider></div></div>
  </div></div>;
}

function LargeTitle({ kicker, title, children }) {
  return <header className="fam-title">{kicker && <span className="fam-kicker">{kicker}</span>}<h1>{title}</h1>{children && <p>{children}</p>}</header>;
}

function Row({ icon, tone = "mint", title, subtitle, onClick, trailing }) {
  return <button type="button" className="fam-row" onClick={onClick}>{icon && <span className={`fam-icon ${tone}`}>{icon}</span>}<span className="fam-row-text"><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>{trailing}<ChevronRight className="fam-chevron" size={18} /></button>;
}

const demoImages = [[asset("cefalu-postcard.svg"), "Cartolina di Cefalù"], [asset("garden-photo.svg"), "Gerani sul balcone"]];

// Il + : niente modulo. Un campo libero ("raccontale qualcosa, o mandale qualcosa"), il microfono per dettare
// e la graffetta per allegare. ROSS lo rielabora e mostra subito come lo racconterà a Elena.
function ComposerSheet({ open, onClose }) {
  const { actions } = useDemo();
  const container = useContext(PhoneScreen);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [listening, setListening] = useState(false);
  const [dictated, setDictated] = useState(false);
  const [picker, setPicker] = useState(false);
  const recRef = useRef(null); const timerRef = useRef(null); const fileRef = useRef(null); const textRef = useRef(text);
  textRef.current = text;
  const stopListening = () => { try { recRef.current?.abort(); } catch { /* già fermo */ } recRef.current = null; window.clearInterval(timerRef.current); setListening(false); };
  useEffect(() => () => stopListening(), []); // eslint-disable-line react-hooks/exhaustive-deps
  const parts = elaborate({ text, image: attachment?.image, attachmentName: attachment && !attachment.image ? attachment.name : undefined });
  const medicine = parts.some((part) => part.kind === "reminder" && /medicin|pastigli|pillol|gocce|compress|farmac/i.test(part.text));

  // Dettatura: quella del browser se c'è (it-IT), altrimenti una frase d'esempio scritta come se la stessi dicendo.
  const simulate = (base) => {
    let i = 0;
    timerRef.current = window.setInterval(() => { i += 2; setText(base + sampleDictation.slice(0, i)); if (i >= sampleDictation.length) { window.clearInterval(timerRef.current); setListening(false); } }, 30);
  };
  const toggleMic = () => {
    if (listening) { stopListening(); return; }
    const base = textRef.current ? `${textRef.current.trimEnd()} ` : "";
    setListening(true); setDictated(true); setPicker(false);
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { simulate(base); return; }
    let heard = false; let fallback = false; let audio = false;
    const useSample = () => { if (fallback || heard) return; fallback = true; try { recRef.current?.abort(); } catch { /* già fermo */ } recRef.current = null; simulate(base); };
    try {
      const rec = new Recognition();
      rec.lang = "it-IT"; rec.interimResults = true; rec.continuous = true;
      rec.onaudiostart = () => { audio = true; };
      rec.onresult = (event) => { heard = true; setText(base + Array.from(event.results).map((result) => result[0].transcript).join(" ")); };
      rec.onerror = useSample;
      rec.onend = () => { if (!fallback) setListening(false); };
      recRef.current = rec; rec.start();
      // Se il microfono non parte (permesso negato, nessun microfono), si usa la frase d'esempio.
      window.setTimeout(() => { if (!audio) useSample(); }, 2000);
    } catch { useSample(); }
  };
  const pickFile = (event) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    setPicker(false);
    if (!file.type.startsWith("image/")) { setAttachment({ name: file.name }); return; }
    // Le foto si rimpiccioliscono (640px) prima di salvarle nella demo.
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => { const scale = Math.min(1, 640 / Math.max(img.width, img.height)); const canvas = document.createElement("canvas"); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale); canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height); setAttachment({ image: canvas.toDataURL("image/jpeg", 0.8), name: file.name }); URL.revokeObjectURL(url); };
    img.src = url;
  };
  const reset = () => { stopListening(); setText(""); setAttachment(null); setDictated(false); setPicker(false); };
  const close = () => { reset(); onClose(); };
  const send = () => {
    if (!parts.length) return;
    const main = parts[0];
    actions.addFamilyContribution({ kind: main.kind, title: titleFor({ text, attachmentName: attachment?.name, kind: main.kind }), detail: text.trim() || attachment?.name || "", image: attachment?.image || null, attachmentName: attachment && !attachment.image ? attachment.name : null, parts, via: dictated ? "voce" : "testo", author: "Anna" });
    close();
  };
  return <Dialog open={open} title="Per Elena" onClose={close} container={container} className="family-dialog fam-sheet fam-composer">
    <div className={`fam-composer-box${listening ? " is-listening" : ""}`}>
      <Textarea autoFocus value={text} onChange={(event) => setText(event.target.value)} placeholder="Raccontale qualcosa, o mandale qualcosa…" aria-label="Il tuo messaggio per Elena" />
      {attachment && <div className="fam-attachment">{attachment.image ? <img src={attachment.image} alt="" /> : <span className="fam-icon coral"><Paperclip size={18} /></span>}<span>{attachment.name}</span><button type="button" onClick={() => setAttachment(null)} aria-label="Togli l'allegato"><X size={18} /></button></div>}
      <div className="fam-composer-tools">
        <button type="button" className="fam-tool" onClick={() => setPicker(!picker)} aria-expanded={picker} aria-label="Allega una foto o un file"><Paperclip size={22} /></button>
        <button type="button" className={`fam-tool fam-mic${listening ? " is-on" : ""}`} onClick={toggleMic} aria-pressed={listening} aria-label={listening ? "Smetti di dettare" : "Parla: ROSS trascrive quello che dici"}><Mic size={22} /></button>
        <span className="fam-listening" aria-live="polite">{listening ? "Ti ascolto… parla pure" : ""}</span>
        <button type="button" className="fam-send" onClick={send} disabled={!parts.length}><Send size={18} /> Manda</button>
      </div>
      {picker && <div className="fam-attach-picker">{demoImages.map(([src, alt]) => <button type="button" key={src} onClick={() => { setAttachment({ image: src, name: alt }); setPicker(false); }}><img src={src} alt="" /><span>{alt}</span></button>)}<button type="button" className="fam-attach-device" onClick={() => fileRef.current?.click()}><Paperclip size={20} /><span>Dal telefono…</span></button></div>}
      <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={pickFile} />
    </div>
    {parts.length > 0 ? <section className="fam-preview" aria-live="polite">
      <span className="fam-kicker">Come lo racconterà ROSS a Elena</span>
      <ol>{parts.map((part, index) => <li key={index}><em>{kindShort(part.kind)}</em><p>{part.rossLine}</p></li>)}</ol>
      {medicine && <p className="fam-note">ROSS glielo dirà con le tue parole, ma non controlla se l'ha presa: per le medicine c'è il personale della residenza.</p>}
    </section> : <p className="fam-note">Scrivi o parla come ti viene, anche tutto insieme: ROSS lo riordina e lo racconta a Elena con parole semplici, nel momento giusto. In questa demo resta sul dispositivo.</p>}
  </Dialog>;
}

function useContributionSheet() { const [open, setOpen] = useState(false); return { openContribution: () => setOpen(true), sheet: <ComposerSheet open={open} onClose={() => setOpen(false)} /> }; }

// Un finto campo di scrittura che apre il + (in Da te): stesso gesto, nessun modulo.
function ComposeBar({ onOpen }) {
  return <button type="button" className="fam-compose-bar" onClick={onOpen}><span>Raccontale qualcosa, o mandale qualcosa…</span><Mic size={20} /><Paperclip size={20} /></button>;
}

export function FamilyExperience() {
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const contribution = useContributionSheet();
  const { conversationDone, outingShared, prompt, story, headline, smile } = todayLines(state);
  const weekSignals = signalsFor("elena").filter((item) => item.positive);
  const activityCount = useMemo(() => Math.max(3, state.interactions.filter((item) => item.residentId === "elena" && item.date === "2026-09-21").length), [state.interactions]);
  const listIt = (items) => items.length > 1 ? `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}` : items[0];
  // Oggi rimanda ai racconti in Da lei invece di ripeterne l'elenco.
  const momentsLine = ["Mina", "fotografie di viaggio", conversationDone ? "la macchina fotografica rossa" : "Cefalù", ...(outingShared ? ["il canto in salone"] : [])];
  const promptSaved = (state.savedPrompts || []).some((item) => item.text === prompt);
  return <FamilyShell title="Oggi" tab="oggi" onContribute={() => contribution.openContribution("memory")}>
    <LargeTitle kicker="Lunedì 21 settembre" title="Oggi con Elena">Ciao Anna: ecco ciò che può aiutarti a sentirla più vicina, senza trasformare la sua giornata in dati da controllare.</LargeTitle>

    <div className="fam-source fam-today"><Heart size={18} /><p><strong>Con ROSS è stata una bella giornata.</strong> Il sorriso di oggi: {smile}</p></div>

    <section className="fam-card fam-story">
      <div className="fam-card-head"><span className="fam-kicker">Il racconto di oggi</span><small>Alle 17:18</small></div>
      <h2>{headline}</h2>
      <p>{story}</p>
      <SharedBadge />
      <div className="fam-list fam-inset"><Row icon={<MessageCircleHeart size={20} />} title="I suoi racconti di oggi" subtitle={listIt(momentsLine)} onClick={() => navigate("/famiglia/da-lei")} /></div>
      <dl className="fam-stats"><div><dt>momenti condivisi</dt><dd>{activityCount}</dd></div><div><dt>con ROSS</dt><dd>40 min</dd></div><div><dt>ricordi ripresi</dt><dd>2</dd></div></dl>
    </section>

    <section className="fam-card fam-call">
      <div className="fam-card-head"><span className="fam-call-icon"><Phone size={18} /></span><span className="fam-kicker">Un filo per la prossima chiamata</span></div>
      <h2>{prompt}</h2>
      <p>Uno spunto, non una scaletta: sarà Elena a decidere dove portare il racconto.</p>
      {promptSaved
        ? <button type="button" className="fam-button light" onClick={() => navigate("/famiglia/insieme")}><Check size={18} /> Salvato: lo trovi in Insieme</button>
        : <button type="button" className="fam-button light" onClick={() => actions.saveCallPrompt(prompt)}><Phone size={18} /> Salva lo spunto</button>}
    </section>

    <section className="fam-card fam-week">
      <span className="fam-kicker">Come sta questa settimana</span>
      <h2>{weekSignals.length ? `Più ${listIt(weekSignals.map((item) => item.signal))} del solito` : "Una settimana tranquilla"}</h2>
      <ul>{weekSignals.map((item) => <li key={item.signal}><strong>{item.signal.charAt(0).toUpperCase() + item.signal.slice(1)}</strong><small>{signalDetail(item)}</small></li>)}</ul>
      <p>ROSS ti racconta come sta, senza trasformare la sua settimana in dati da controllare. Partiamo da ciò che va bene: è il metodo di ROSS.</p>
    </section>


    {contribution.sheet}
  </FamilyShell>;
}

export function FamilyMemoryDetail() {
  const { id } = useParams(); const { state } = useDemo(); const navigate = useNavigate(); const contribution = useContributionSheet();
  const found = state.memories.find((item) => item.id === id);
  const memory = found && visibleToFamily(found) ? found : state.memories.find((item) => item.id === "mem-cefalu");
  const related = state.memories.filter((item) => item.residentId === "elena" && visibleToFamily(item) && item.id !== memory.id && (item.tags || []).some((tag) => (memory.tags || []).includes(tag))).slice(0, 3);
  const facts = [["Periodo", memory.period || memory.tags?.find((tag) => /\d{4}/.test(tag)) || "Da precisare"], ["Luogo", memory.place || (memory.tags?.includes("Sicilia") ? "Sicilia" : "Treviso")], ["Persone", memory.people?.join(", ") || "—"], ["Da dove arriva", originLabel(memory)]];
  const mine = fromFamily(memory);
  return <FamilyShell title={memory.title} tab={mine ? "da-te" : "da-lei"} back={mine ? { to: "/famiglia/da-te", label: "Da te" } : { to: "/famiglia/da-lei#ricordi", label: "Da lei" }} onContribute={() => contribution.openContribution("memory")}>
    <article className="fam-detail">
      {(memory.image || memory.tags?.includes("Sicilia")) && <img className="fam-hero-img" src={memory.image || asset("cefalu-postcard.svg")} alt={`Immagine illustrata collegata al ricordo ${memory.title}`} />}
      <LargeTitle kicker={`${memory.category} · ${originLabel(memory)}`} title={memory.title} />
      <p className="fam-lead">{memory.description}</p>
      <dl className="fam-card fam-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="fam-source"><Check size={18} /><p>{fromFamily(memory) ? "L'hai condiviso tu: ROSS lo proporrà con delicatezza, e se Elena lo riconosce entra nella sua storia." : "Elena l'ha raccontato a ROSS e ha scelto di condividerlo con te. ROSS lo usa per dare continuità alle vostre conversazioni."}</p></div>
      <button type="button" className="fam-button" onClick={() => contribution.openContribution("photo")}><Plus size={18} /> Aggiungi un dettaglio</button>
    </article>
    <section className="fam-section">
      <header className="fam-section-head"><h2>Altri fili della storia</h2></header>
      {related.length ? <div className="fam-list fam-card">{related.map((item) => <Row key={item.id} title={item.title} subtitle={item.category} onClick={() => navigate(`/famiglia/ricordi/${item.id}`)} />)}</div> : <p className="fam-empty">Altri ricordi saranno collegati quando emergeranno nuovi dettagli.</p>}
    </section>
    {contribution.sheet}
  </FamilyShell>;
}

// Momenti inventati per la demo: oggi, la settimana (15–21 settembre) e il mese di settembre.
// Regole: il racconto arriva solo se Elena l'ha condiviso; se l'ha tenuto per sé il titolo resta generico
// ("Conversazione libera") e si dice solo com'è andata. Le uscite (outside) le sa ROSS perché è Elena a raccontarle.
const activityDetails = {
  song: { title: "Indovina la canzone", day: "Oggi", short: "Oggi", at: "11:40", duration: "12 minuti", why: "La musica italiana è un interesse stabile di Elena e spesso apre conversazioni spontanee.", episode: "Dopo poche note Elena ha riconosciuto Mina e ha ricordato i pomeriggi in cucina.", links: ["Le canzoni di Mina", "Pomeriggi in cucina"], shared: true },
  photos: { title: "Fotografie di viaggio", day: "Oggi", short: "Oggi", at: "15:58", duration: "14 minuti", why: "Fotografia e Sicilia collegano Sofia, Paolo e il viaggio del 1998.", episode: "Elena ha scelto da sola la cartolina di Cefalù e si è soffermata sulla luce della sera.", links: ["Viaggio a Palermo", "La spiaggia di Cefalù"], shared: true },
  "free-talk": { title: "Conversazione libera", day: "Oggi", short: "Oggi", at: "17:18", duration: "14 minuti", why: "Dopo un’attività guidata, ROSS lascia spazio a un racconto senza una consegna.", episode: "Il discorso è tornato alle passeggiate con Paolo e a una macchina fotografica rossa.", links: ["Paolo", "Cefalù e fotografie"], sharedAfterConversation: true, privateSummary: "Una bella chiacchierata." },
  canto: { title: "Al canto in salone", day: "Oggi", short: "Oggi", at: "17:30", duration: "Raccontato al ritorno", outside: true, why: "ROSS gliel'ha proposto leggendo il calendario della residenza: ad andarci ha deciso lei.", episode: "È andata al canto in salone e al ritorno l'ha raccontato a ROSS: c'era anche Mina in scaletta.", links: ["Le canzoni di Mina", "Vita in residenza"], sharedIfOuting: true },
  cartolina: { title: "La cartolina di Anna", day: "Domenica 20 settembre", short: "Dom 20", at: "16:10", duration: "11 minuti", why: "L'hai condivisa tu: ROSS l'ha proposta quando Elena aveva voglia di guardare fotografie.", episode: "Ha riconosciuto subito la cartolina di Cefalù e ha detto che quel giorno il mare era più verde che blu.", links: ["Da te: Cartolina di Cefalù", "La spiaggia di Cefalù"], shared: true },
  palermo: { title: "Indovina il luogo", day: "Sabato 19 settembre", short: "Sab 19", at: "10:40", duration: "15 minuti", why: "Un gioco leggero sui luoghi: ROSS parte dalle città che Elena conosce e lascia che sia lei a raccontare.", episode: "Dal mercato ha riconosciuto Palermo, e ne ha approfittato per raccontare delle arance comprate con Paolo.", links: ["Viaggio a Palermo", "Paolo"], shared: true },
  "evening-talk": { title: "Conversazione libera", day: "Sabato 19 settembre", short: "Sab 19", at: "18:30", duration: "9 minuti", why: "Prima di cena ROSS lascia spazio a due parole, senza una proposta.", privateSummary: "Una chiacchierata tranquilla prima di cena." },
  "garden-walk": { title: "In giardino con un'amica", day: "Venerdì 18 settembre", short: "Ven 18", at: "15:30", duration: "Raccontato al ritorno", outside: true, why: "C'era il sole e ROSS le ha ricordato la passeggiata del pomeriggio: ad andarci ha deciso lei.", episode: "È uscita in giardino con un'amica della residenza e al ritorno ha raccontato a ROSS che i gerani di là sono più piccoli dei suoi.", links: ["Gerani sul balcone", "Vita in residenza"], shared: true },
  garden: { title: "Cura dei gerani", day: "Giovedì 17 settembre", short: "Gio 17", at: "10:20", duration: "18 minuti", why: "Il giardinaggio fa parte della routine biografica di Elena.", episode: "Ha raccontato come sceglieva i vasi per il balcone.", links: ["Gerani sul balcone"], shared: true },
  modugno: { title: "Musica degli anni Cinquanta", day: "Mercoledì 16 settembre", short: "Mer 16", at: "11:15", duration: "16 minuti", why: "Dopo Mina, ROSS ha provato con un'altra voce della sua giovinezza.", episode: "Con “Nel blu dipinto di blu” ha raccontato che era la canzone con cui ballava con Paolo alle feste di paese.", links: ["Paolo", "Musica italiana"], shared: true },
  "quiet-talk": { title: "Conversazione libera", day: "Martedì 15 settembre", short: "Mar 15", at: "16:45", duration: "20 minuti", why: "Una conversazione aperta, partita da Elena.", privateSummary: "L'ha cercata lei." },
  radio: { title: "La radio del mattino", day: "Venerdì 11 settembre", short: "Ven 11", at: "09:50", duration: "13 minuti", why: "La musica la accompagna fin dal mattino: ROSS propone, Elena sceglie.", episode: "Ha chiesto lei a ROSS di mettere Modugno, “quella del mare”, e l'ha cantata a mezza voce.", links: ["Musica italiana"], shared: true },
  festa: { title: "La festa dei compleanni", day: "Mercoledì 9 settembre", short: "Mer 9", at: "16:00", duration: "Raccontato al ritorno", outside: true, why: "ROSS l'ha letta nel calendario della residenza e gliel'ha ricordata: ad andarci ha deciso lei.", episode: "Alla festa dei compleanni di settembre ha mangiato la torta di mele e ha raccontato a ROSS che quella di sua madre era più alta.", links: ["Vita in residenza", "Ricette di famiglia"], shared: true },
  caponata: { title: "Ricette di famiglia", day: "Giovedì 3 settembre", short: "Gio 3", at: "11:30", duration: "17 minuti", why: "La cucina è un modo semplice per tornare alla Sicilia e alle persone care.", episode: "Ha spiegato a ROSS la caponata “come la faceva la zia”: con il cioccolato, ma poco.", links: ["Ricette di famiglia", "Sicilia"], shared: true },
  "september-talk": { title: "Conversazione libera", day: "Martedì 1 settembre", short: "Mar 1", at: "17:05", duration: "18 minuti", why: "Il primo giorno del mese ROSS ha lasciato a Elena la scelta dell'argomento.", privateSummary: "Una conversazione lunga, serena." },
};

const isShared = (item, conversationDone, outingShared) => item.shared || (item.sharedAfterConversation && conversationDone) || (item.sharedIfOuting && outingShared);
const privateLine = "Elena ha tenuto questo racconto per sé.";

function TimelineRow({ id, item, conversationDone, outingShared }) {
  const navigate = useNavigate();
  return <button type="button" className="fam-timeline-row" onClick={() => navigate(`/famiglia/attivita/${id}`)}><time><strong>{item.at}</strong><small>{item.short}</small></time><div><h3>{item.title}</h3>{isShared(item, conversationDone, outingShared) ? <><p>{item.episode}</p><SharedBadge /></> : <p className="fam-private">{privateLine} {item.privateSummary}</p>}<small>{item.outside ? `Fuori da ROSS · ${item.duration.toLowerCase()}` : item.duration}</small></div><ChevronRight className="fam-chevron" size={18} /></button>;
}

function MomentGroup({ kicker, title, text, ids, ...rowProps }) {
  return <section className="fam-section">
    <header className="fam-day"><CalendarDays size={20} /><div><span className="fam-kicker">{kicker}</span><h2>{title}</h2></div></header>
    {text && <p className="fam-group-text">{text}</p>}
    <div className="fam-list fam-card fam-timeline">{ids.map((id) => <TimelineRow key={id} id={id} item={activityDetails[id]} {...rowProps} />)}</div>
  </section>;
}

// Da lei: tutto ciò che arriva da Elena, solo se ha scelto di condividerlo.
// Racconti (cosa ha fatto e raccontato con ROSS: giorno, settimana, mese) e Ricordi (la sua storia).
export function FamilyFromHer() {
  const { state } = useDemo(); const navigate = useNavigate(); const { hash } = useLocation(); const contribution = useContributionSheet();
  const view = hash === "#ricordi" ? "ricordi" : "racconti";
  const [period, setPeriod] = useState("Oggi"); const [filter, setFilter] = useState("Tutti");
  const conversationDone = Boolean(state.rossJourney.completedAt);
  const outingShared = state.outing?.status === "back" && state.outing.shared;
  const rowProps = { conversationDone, outingShared };
  const today = ["song", "photos", "free-talk", ...(outingShared ? ["canto"] : [])];
  const week = [
    { kicker: "Lunedì 21 settembre · oggi", title: "Musica e fotografie", ids: today },
    { kicker: "Domenica 20 settembre", title: "La cartolina che le hai mandato", ids: ["cartolina"] },
    { kicker: "Sabato 19 settembre", title: "Palermo, e una chiacchierata sua", ids: ["palermo", "evening-talk"] },
    { kicker: "Venerdì 18 settembre", title: "Fuori, in giardino", ids: ["garden-walk"] },
    { kicker: "Giovedì 17 settembre", title: "I gerani sul balcone", ids: ["garden"] },
    { kicker: "Mercoledì 16 settembre", title: "Un ballo con Paolo, in musica", ids: ["modugno"] },
    { kicker: "Martedì 15 settembre", title: "Un momento suo", ids: ["quiet-talk"] },
  ];
  const month = [
    { kicker: "15–21 settembre", title: "La settimana della Sicilia", text: "La tua cartolina ha riaperto Cefalù, Palermo è tornata con un gioco, ed è uscita in giardino.", ids: ["cartolina", "palermo", "garden-walk"] },
    { kicker: "8–14 settembre", title: "Torna la musica", text: "Ha scelto lei le canzoni quasi ogni mattina, e alla festa dei compleanni c'era anche lei.", ids: ["radio", "festa"] },
    { kicker: "1–7 settembre", title: "Si riprende il filo dopo l'estate", text: "Ricette di famiglia e lunghe chiacchierate: una l'ha tenuta per sé.", ids: ["caponata", "september-talk"] },
  ];
  const threads = ["La musica di Mina e Modugno", "La Sicilia e Cefalù", "Paolo", "I gerani sul balcone", "Le ricette di famiglia", "Le uscite in residenza"];
  const herMemories = state.memories.filter((item) => item.residentId === "elena" && visibleToFamily(item) && !fromFamily(item));
  const categories = ["Tutti", ...new Set(herMemories.map((item) => item.category))];
  const memories = herMemories.filter((item) => filter === "Tutti" || item.category === filter);
  return <FamilyShell title="Da lei" tab="da-lei" onContribute={() => contribution.openContribution("memory")}>
    <LargeTitle kicker="Da Elena, per te" title="Cosa ha scelto di raccontarti">I suoi racconti con ROSS e i suoi ricordi. Arrivano qui solo se è lei a volerlo.</LargeTitle>
    <Tabs value={view} onValueChange={(next) => navigate({ hash: next === "ricordi" ? "#ricordi" : "#racconti" }, { replace: true })}><TabsList className="fam-segmented is-two" aria-label="Cosa vuoi vedere">{[["racconti", "Racconti"], ["ricordi", "Ricordi"]].map(([value, label]) => <TabsTrigger key={value} value={value} active={view === value}>{label}</TabsTrigger>)}</TabsList></Tabs>
    {view === "racconti" ? <>
      <Tabs value={period} onValueChange={setPeriod}><TabsList className="fam-chips" aria-label="Periodo">{["Oggi", "Settimana", "Mese"].map((item) => <TabsTrigger key={item} value={item} active={period === item}>{item}</TabsTrigger>)}</TabsList></Tabs>
      {period === "Oggi" && <MomentGroup kicker="Lunedì 21 settembre" title="Una giornata con musica e fotografie" ids={today} {...rowProps} />}
      {period === "Settimana" && week.map((group) => <MomentGroup key={group.kicker} {...group} {...rowProps} />)}
      {period === "Mese" && <>
        <section className="fam-card"><span className="fam-kicker">Settembre 2026 · i fili del mese</span><h2>Cosa è tornato più spesso</h2><p>Gli interessi che hanno acceso di più le sue conversazioni con ROSS, tra quelle che ha scelto di condividere con te.</p><div className="fam-tags">{threads.map((thread) => <span key={thread}>{thread}</span>)}</div></section>
        {month.map((group) => <MomentGroup key={group.kicker} {...group} {...rowProps} />)}
      </>}
    </> : <>
      <Tabs value={filter} onValueChange={setFilter}><TabsList className="fam-chips" aria-label="Filtra i ricordi">{categories.map((item) => <TabsTrigger key={item} value={item} active={filter === item}>{item}</TabsTrigger>)}</TabsList></Tabs>
      <section className="fam-gallery">{memories.map((item) => <button type="button" key={item.id} className="fam-card fam-memory" onClick={() => navigate(`/famiglia/ricordi/${item.id}`)}>{(item.image || item.id === "mem-palermo" || item.id === "mem-cefalu") && <img src={item.image || asset("cefalu-postcard.svg")} alt={item.image ? `Immagine collegata a ${item.title}` : "Cartolina illustrata del lungomare di Cefalù"} />}<div><span className="fam-kicker">{item.category} · Raccontato da Elena</span><h2>{item.title}</h2><p>{item.description}</p><small>{item.people?.join(" · ") || "Dalla storia di Elena"}</small></div></button>)}</section>
      <p className="fam-empty fam-private">Altri ricordi Elena li ha tenuti per sé: restano tra lei e ROSS.</p>
    </>}
    {contribution.sheet}
  </FamilyShell>;
}

export function FamilyActivityDetail() {
  const { id } = useParams(); const contribution = useContributionSheet(); const { state } = useDemo();
  const item = activityDetails[id] || activityDetails.garden;
  const shared = isShared(item, Boolean(state.rossJourney.completedAt), state.outing?.status === "back" && state.outing.shared);
  return <FamilyShell title={item.title} tab="da-lei" back={{ to: "/famiglia/da-lei", label: "Da lei" }} onContribute={() => contribution.openContribution("topic")}>
    <article className="fam-detail">
      <header className="fam-activity-hero"><Sparkles size={30} /><span className="fam-kicker">{item.outside ? "Fuori da ROSS, raccontato da Elena" : "Attività con ROSS"}</span><h1>{item.title}</h1><p>{item.day} · {item.at} · {item.duration}</p></header>
      {shared ? <>
        <section className="fam-card"><span className="fam-kicker">Un piccolo episodio</span><h2>{item.episode}</h2><SharedBadge /></section>
        <section className="fam-card"><span className="fam-kicker">{item.outside ? "Come c’è arrivata" : "Perché ROSS l’ha proposta"}</span><p>{item.why}</p></section>
        <section className="fam-card"><span className="fam-kicker">Collegamenti</span><div className="fam-tags">{item.links.map((link) => <span key={link}>{link}</span>)}</div></section>
      </> : <>
        <section className="fam-card"><span className="fam-kicker">Un momento suo</span><h2>{privateLine}</h2><p>{item.privateSummary} ROSS racconta alla famiglia solo ciò che Elena sceglie di condividere.</p></section>
        <section className="fam-card"><span className="fam-kicker">{item.outside ? "Come c’è arrivata" : "Perché ROSS l’ha proposta"}</span><p>{item.why}</p></section>
      </>}
      <button type="button" className="fam-button" onClick={() => contribution.openContribution("topic")}><MessageCircle size={18} /> Raccontale qualcosa</button>
    </article>
    {contribution.sheet}
  </FamilyShell>;
}

// Da te: tutto ciò che è partito da Anna (con il + al centro) e che fine ha fatto.
export function FamilyFromYou() {
  const { state } = useDemo(); const navigate = useNavigate(); const contribution = useContributionSheet(); const [selected, setSelected] = useState(null);
  const counts = [[state.familyContributions.length, "cose portate a ROSS"], [state.familyContributions.filter((item) => contributionStatus(item.status) === "Ripreso con Elena").length, "già riprese con Elena"], [state.familyContributions.filter((item) => contributionStatus(item.status) === "Disponibile a ROSS").length, "in attesa del momento giusto"]];
  // Ricordi della famiglia arrivati prima dell'app (biografia d'ingresso): quelli nati da un contributo sono già nell'elenco sopra.
  const familyMemories = state.memories.filter((item) => item.residentId === "elena" && fromFamily(item) && !item.familyContributionId);
  return <FamilyShell title="Da te" tab="da-te" onContribute={() => contribution.openContribution("memory")}>
    <LargeTitle kicker="Da te, per Elena" title="Cosa le hai portato">Foto, ricordi, argomenti e canzoni arrivano subito a ROSS, che li proporrà a Elena nel momento giusto. Qui vedi com'è andata.</LargeTitle>
    <dl className="fam-card fam-stats fam-stats-card">{counts.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <section className="fam-section">
      <div className="fam-list fam-card">{state.familyContributions.map((item) => { const Icon = kindIcons[item.kind] || Heart; const status = contributionStatus(item.status); return <button type="button" key={item.id} className="fam-shared-row" onClick={() => setSelected(item)}>{item.image ? <img src={item.image} alt="" /> : <span className="fam-icon coral"><Icon size={20} /></span>}<span className="fam-row-text"><small className="fam-kicker">{kindShort(item.kind)}{item.via === "voce" ? " · detto a voce" : ""}</small><strong>{item.title}</strong><small>{item.detail}</small><em className={status === "Ripreso con Elena" ? "done" : ""}>{status}</em></span><ChevronRight className="fam-chevron" size={18} /></button>; })}</div>
    </section>
    {familyMemories.length > 0 && <section className="fam-section">
      <header className="fam-section-head"><h2>I ricordi che hai raccontato</h2></header>
      <div className="fam-list fam-card">{familyMemories.map((item) => <Row key={item.id} icon={item.category[0]} tone="coral" title={item.title} subtitle={`${item.category} · dalla biografia d'ingresso`} onClick={() => navigate(`/famiglia/ricordi/${item.id}`)} />)}</div>
    </section>}
    <section className="fam-section fam-contribute">
      <header className="fam-section-head"><h2>Cosa vuoi portarle?</h2></header>
      <ComposeBar onOpen={contribution.openContribution} />
    </section>
    {contribution.sheet}
    <SharedDetail item={selected} onClose={() => setSelected(null)} />
  </FamilyShell>;
}

// Insieme: la relazione tra Anna ed Elena. Gli spunti per le chiamate, il metodo (salutogenesi) e la trasparenza sul consenso.
export function FamilyTogether() {
  const { state, actions } = useDemo(); const contribution = useContributionSheet();
  const prompts = state.savedPrompts || [];
  const sees = ["I racconti che Elena sceglie di condividere con te", "Com'è andata, quando un racconto lo tiene per sé", "Come sta questa settimana: ciò che va bene, rispetto al suo solito", "Le uscite, quando è lei a raccontarle"];
  const notSees = ["Le conversazioni con ROSS, parola per parola", "Ciò che Elena tiene per sé", "Valutazioni sulla salute: non sono il compito di ROSS"];
  return <FamilyShell title="Insieme" tab="insieme" onContribute={() => contribution.openContribution("topic")}>
    <LargeTitle kicker="Anche tu sei una risorsa" title="Come esserle vicina">Non solo cosa manca, ma cosa aiuta Elena a stare bene, anche nella relazione tra voi due. E lei lo è per te.</LargeTitle>
    <section className="fam-section">
      <header className="fam-section-head"><h2>Spunti per le prossime chiamate</h2></header>
      {prompts.length ? <ul className="fam-list fam-card fam-prompts">{prompts.map((item) => <li key={item.id}><span className="fam-icon"><Phone size={18} /></span><span className="fam-row-text"><strong>{item.text}</strong><small>Salvato {item.savedAt}</small></span><button type="button" className="fam-prompt-remove" onClick={() => actions.removeCallPrompt(item.id)} aria-label={`Togli lo spunto: ${item.text}`}><X size={18} /></button></li>)}</ul>
        : <p className="fam-empty">Salva uno spunto da Oggi: lo ritrovi qui prima di chiamarla.</p>}
    </section>
    <section className="fam-card fam-resource">
      <span className="fam-kicker">Il metodo di ROSS</span>
      <h2>Tre spunti da ciò che la fa stare bene</h2>
      <p>ROSS è pensato con la lente della salutogenesi: partire dalle risorse di Elena, e la famiglia è una di queste, in tutte e due le direzioni.</p>
      <ul>{familyResourceTips.map((tip) => <li key={tip.title}><em>{tip.lens}</em><strong>{tip.title}</strong><span>{tip.text}</span></li>)}</ul>
    </section>
    <section className="fam-card fam-consent">
      <span className="fam-kicker">Cosa vedi e cosa no</span>
      <h2>Decide Elena</h2>
      <h3><Eye size={18} /> Vedi</h3>
      <ul>{sees.map((item) => <li key={item}>{item}</li>)}</ul>
      <h3><EyeOff size={18} /> Non vedi</h3>
      <ul>{notSees.map((item) => <li key={item}>{item}</li>)}</ul>
      <p>Elena può cambiare idea quando vuole: può chiedere a ROSS di non raccontarti più qualcosa, o di dimenticarlo.</p>
    </section>
    {contribution.sheet}
  </FamilyShell>;
}

// Un contributo ripreso con Elena porta al racconto di com'è andata (in Da lei).
const contributionRacconto = { "family-cefalu-postcard": "cartolina" };

function SharedDetail({ item, onClose }) {
  const container = useContext(PhoneScreen); const navigate = useNavigate();
  const racconto = item && contributionStatus(item.status) === "Ripreso con Elena" && contributionRacconto[item.id];
  return <Dialog open={Boolean(item)} title={item?.title || "Contributo"} onClose={onClose} container={container} className="family-dialog fam-sheet">{item && <div className="fam-shared-detail">{item.image && <img src={item.image} alt={`Immagine collegata a ${item.title}`} />}<span className="fam-badge">{contributionStatus(item.status)}</span><p>{item.detail}</p>{item.parts?.length > 0 && <section className="fam-preview"><span className="fam-kicker">Come lo racconta ROSS a Elena</span><ol>{item.parts.map((part, index) => <li key={index}><em>{kindShort(part.kind)}</em><p>{part.rossLine}</p></li>)}</ol></section>}<dl className="fam-card fam-facts">{[["Persone", item.people?.join(", ") || "—"], ["Luogo", item.place || "—"], ["Periodo", item.period || "—"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{racconto && <button type="button" className="fam-button" onClick={() => { onClose(); navigate(`/famiglia/attivita/${racconto}`); }}><MessageCircleHeart size={18} /> Guarda com'è andata</button>}</div>}</Dialog>;
}
