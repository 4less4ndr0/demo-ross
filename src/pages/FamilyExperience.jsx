import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { BatteryFull, CalendarDays, Camera, Check, ChevronLeft, ChevronRight, Heart, Home, Images, Lightbulb, Music2, Phone, Plus, Send, Signal, Sparkles, Wifi } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { Dialog, Input, Tabs, TabsList, TabsTrigger, Textarea } from "../components/ui";
import { asset } from "../asset.js";
import { signalDetail, signalsFor } from "../data/careInsights";
import { familyResourceTips } from "../data/salutogenesis";

// Vista Famiglia come app per iPhone (Apple HIG): margini 16pt, tocchi ≥ 44pt, testo di base 17pt,
// barra di navigazione in alto, tab bar in basso, sheet dal basso. Su schermi larghi l'app sta in una cornice iPhone.

const contributionTypes = {
  photo: { title: "Aggiungi una foto", short: "Foto", icon: Camera, label: "Titolo della foto", placeholder: "Elena e Paolo a Cefalù", help: "Scegli una delle immagini demo e aggiungi il contesto che la rende significativa." },
  memory: { title: "Racconta un ricordo", short: "Ricordo", icon: Heart, label: "Titolo del ricordo", placeholder: "Le domeniche in giardino", help: "ROSS lo userà con delicatezza, nel momento giusto: se Elena lo riconosce, entra nella sua storia." },
  topic: { title: "Suggerisci un argomento", short: "Argomento", icon: Lightbulb, label: "Argomento", placeholder: "La festa di pensionamento", help: "ROSS potrà proporlo con delicatezza, nel momento adatto." },
  music: { title: "Suggerisci una canzone", short: "Canzone", icon: Music2, label: "Titolo e artista", placeholder: "Il cielo in una stanza · Gino Paoli", help: "La canzone entrerà tra gli spunti disponibili a ROSS." },
};

const familyTabs = [
  { to: "/famiglia", label: "Oggi", icon: Home, match: (path) => path === "/famiglia" },
  { to: "/famiglia/storia", label: "Ricordi", icon: Images, match: (path) => path.startsWith("/famiglia/storia") || path.startsWith("/famiglia/ricordi") },
  { to: "/famiglia/attivita", label: "Momenti", icon: Sparkles, match: (path) => path.startsWith("/famiglia/attivita") },
  { to: "/famiglia/condivisi", label: "Da te", icon: Heart, match: (path) => path.startsWith("/famiglia/condivisi") },
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

function FamilyShell({ title, back, onContribute, children }) {
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
  return <div className={`family-app ${phone ? "is-phone" : "is-full"}`} style={phone ? { "--fam-scale": scale } : undefined}><div className="fam-stage">
    <p className="fam-stage-caption" aria-hidden="true"><strong>Vista Famiglia</strong>L'app di Anna, sul suo iPhone</p>
    <div className="fam-device"><div className="fam-screen" ref={setScreen}><PhoneScreen.Provider value={screen}>
      <StatusBar />
      <div className="fam-scroll" onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 64)}>
        <header className={`fam-navbar${scrolled ? " is-scrolled" : ""}`}>
          <div className="fam-navbar-side">{back ? <button type="button" className="fam-nav-back" onClick={() => navigate(back.to)}><ChevronLeft size={26} strokeWidth={2.2} />{back.label}</button> : <NavLink className="fam-brand" to="/famiglia" aria-label="ROSS per la famiglia: Oggi"><span>R</span><small>ROSS</small></NavLink>}</div>
          <strong className="fam-navbar-title" aria-hidden={!scrolled}>{title}</strong>
          <div className="fam-navbar-side fam-navbar-end"><button type="button" className="fam-add" onClick={onContribute} aria-label="Condividi con ROSS"><Plus size={22} strokeWidth={2.2} /></button></div>
        </header>
        <main className="fam-main screen-enter">{children}</main>
      </div>
      <nav className="fam-tabbar" aria-label="Navigazione famiglia">{familyTabs.map(({ to, label, icon: Icon, match }) => { const active = match(pathname); return <NavLink key={to} to={to} end={to === "/famiglia"} className={active ? "active" : ""} aria-current={active ? "page" : undefined}><Icon size={24} strokeWidth={active ? 2.3 : 1.8} /><span>{label}</span></NavLink>; })}</nav>
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

function ContributionSheet({ kind, onClose }) {
  const { actions } = useDemo();
  const container = useContext(PhoneScreen);
  const [form, setForm] = useState({ title: "", detail: "", people: "", place: "", period: "", image: asset("cefalu-postcard.svg") });
  if (!kind) return null;
  const config = contributionTypes[kind];
  const Icon = config.icon;
  const field = (key) => ({ value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }) });
  const save = (event) => { event.preventDefault(); actions.addFamilyContribution({ kind, title: form.title, detail: form.detail, people: form.people.split(",").map((item) => item.trim()).filter(Boolean), place: form.place, period: form.period, image: kind === "photo" ? form.image : null, author: "Anna" }); onClose(); };
  return <Dialog open title={config.title} onClose={onClose} container={container} className="family-dialog fam-sheet"><form className="fam-form" onSubmit={save}>
    <div className="fam-form-lead"><span className="fam-icon coral"><Icon size={20} /></span><p>{config.help}</p></div>
    {kind === "photo" && <fieldset className="fam-photo-picker"><legend>Immagine demo</legend>{[[asset("cefalu-postcard.svg"), "Cartolina di Cefalù"], [asset("garden-photo.svg"), "Gerani sul balcone"]].map(([src, alt]) => <label key={src} className={form.image === src ? "selected" : ""}><input type="radio" name="image" value={src} checked={form.image === src} onChange={(event) => setForm({ ...form, image: event.target.value })} /><img src={src} alt={alt} /><span>{alt}</span></label>)}</fieldset>}
    <label>{config.label}<Input required {...field("title")} placeholder={config.placeholder} /></label>
    <label>La storia<Textarea required {...field("detail")} placeholder="Racconta in poche righe perché è importante…" /></label>
    <label>Persone collegate<Input {...field("people")} placeholder="Paolo, Sofia" /></label>
    <div className="fam-form-pair"><label>Luogo<Input {...field("place")} placeholder="Cefalù" /></label><label>Periodo o anno<Input {...field("period")} placeholder="Estate 1998" /></label></div>
    <p className="fam-note">Resta sul dispositivo in questa demo. ROSS lo proporrà a Elena solo se ne ha voglia, e la fonte resta sempre visibile.</p>
    <div className="fam-sheet-actions"><button type="button" className="fam-button secondary" onClick={onClose}>Annulla</button><button className="fam-button"><Send size={18} /> Salva e condividi</button></div>
  </form></Dialog>;
}

function useContributionSheet() { const [kind, setKind] = useState(null); return { openContribution: (next = "memory") => setKind(next), sheet: <ContributionSheet key={kind || "closed"} kind={kind} onClose={() => setKind(null)} /> }; }

function ContributeTiles({ onPick }) {
  return <div className="fam-tiles">{Object.entries(contributionTypes).map(([kind, item]) => { const Icon = item.icon; return <button type="button" key={kind} onClick={() => onPick(kind)}><Icon size={22} /><span>{item.title}</span></button>; })}</div>;
}

export function FamilyExperience() {
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const contribution = useContributionSheet();
  const conversationDone = Boolean(state.rossJourney.completedAt);
  const weekSignals = signalsFor("elena").filter((item) => item.positive);
  const activityCount = useMemo(() => Math.max(3, state.interactions.filter((item) => item.residentId === "elena" && item.date === "2026-09-21").length), [state.interactions]);
  // Un'uscita raccontata a ROSS arriva ad Anna solo se Elena ha scelto di condividerla.
  const outingShared = state.outing?.status === "back" && state.outing.shared;
  const listIt = (items) => items.length > 1 ? `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}` : items[0];
  const basePrompt = conversationDone ? "Chiedile della piccola macchina fotografica rossa che Paolo portava sul lungomare." : "Chiedile delle passeggiate sul lungomare di Cefalù e delle fotografie del 1998.";
  const prompt = outingShared ? "Chiedile del canto in salone: cosa avete cantato?" : basePrompt;
  const baseStory = conversationDone ? "Elena ha ripreso il viaggio in Sicilia e ha voluto raccontarti della piccola macchina fotografica rossa che Paolo portava sul lungomare." : "Elena ha scelto Mina per iniziare il pomeriggio. Più tardi ha sfogliato fotografie di viaggio e ricordato le passeggiate serali a Cefalù con Paolo.";
  const headline = outingShared ? (conversationDone ? "Un ricordo ritrovato, poi tutti a cantare." : "Musica, fotografie e poi tutti a cantare.") : conversationDone ? "Una macchina fotografica rossa riapre un ricordo." : "Musica, fotografie e una passeggiata sul mare.";
  // Il sorriso di oggi: un solo momento, e solo tra quelli che Elena ha scelto di condividere.
  const smile = outingShared ? "al canto in salone, e al ritorno ha voluto raccontarlo." : conversationDone ? "la macchina fotografica rossa di Paolo, ritrovata in un ricordo." : "Mina, riconosciuta dopo poche note.";
  // Oggi rimanda a Momenti invece di ripeterne l'elenco.
  const momentsLine = ["Mina", "fotografie di viaggio", conversationDone ? "la macchina fotografica rossa" : "Cefalù", ...(outingShared ? ["il canto in salone"] : [])];
  return <FamilyShell title="Oggi" onContribute={() => contribution.openContribution("memory")}>
    <LargeTitle kicker="Lunedì 21 settembre" title="Oggi con Elena">Ciao Anna: ecco ciò che può aiutarti a sentirla più vicina, senza trasformare la sua giornata in dati da controllare.</LargeTitle>

    <div className="fam-source fam-today"><Heart size={18} /><p><strong>Con ROSS è stata una bella giornata.</strong> Il sorriso di oggi: {smile}</p></div>

    <section className="fam-card fam-story">
      <div className="fam-card-head"><span className="fam-kicker">Il racconto di oggi</span><small>Alle 17:18</small></div>
      <h2>{headline}</h2>
      <p>{baseStory}{outingShared ? " Poi è andata al canto in salone, come le aveva proposto ROSS, e al ritorno gliel'ha raccontato." : ""}</p>
      <SharedBadge />
      <div className="fam-list fam-inset"><Row icon={<Sparkles size={20} />} title="Rivedi i momenti di oggi" subtitle={listIt(momentsLine)} onClick={() => navigate("/famiglia/attivita")} /></div>
      <dl className="fam-stats"><div><dt>momenti condivisi</dt><dd>{activityCount}</dd></div><div><dt>con ROSS</dt><dd>40 min</dd></div><div><dt>ricordi ripresi</dt><dd>2</dd></div></dl>
    </section>

    <section className="fam-card fam-call">
      <div className="fam-card-head"><span className="fam-call-icon"><Phone size={18} /></span><span className="fam-kicker">Un filo per la prossima chiamata</span></div>
      <h2>{prompt}</h2>
      <p>Uno spunto, non una scaletta: sarà Elena a decidere dove portare il racconto.</p>
      <button type="button" className="fam-button light" onClick={() => actions.addFamilyContribution({ kind: "topic", title: "Spunto per la prossima chiamata", detail: prompt, author: "Anna" })}><Check size={18} /> Salva lo spunto</button>
    </section>

    <section className="fam-card fam-week">
      <span className="fam-kicker">Come sta questa settimana</span>
      <h2>{weekSignals.length ? `Più ${listIt(weekSignals.map((item) => item.signal))} del solito` : "Una settimana tranquilla"}</h2>
      <ul>{weekSignals.map((item) => <li key={item.signal}><strong>{item.signal.charAt(0).toUpperCase() + item.signal.slice(1)}</strong><small>{signalDetail(item)}</small></li>)}</ul>
      <p>ROSS ti racconta come sta, senza trasformare la sua settimana in dati da controllare. Partiamo da ciò che va bene: è il metodo di ROSS.</p>
    </section>

    <section className="fam-card fam-resource">
      <span className="fam-kicker">Anche tu sei una risorsa</span>
      <h2>Come puoi esserle vicina</h2>
      <p>Tre spunti a partire da ciò che fa stare bene Elena. ROSS è pensato con la lente della salutogenesi: non solo cosa manca, ma cosa aiuta a stare bene, anche nella relazione tra voi due.</p>
      <ul>{familyResourceTips.map((tip) => <li key={tip.title}><em>{tip.lens}</em><strong>{tip.title}</strong><span>{tip.text}</span></li>)}</ul>
    </section>

    {contribution.sheet}
  </FamilyShell>;
}

export function FamilyStory() {
  const { state } = useDemo(); const navigate = useNavigate(); const contribution = useContributionSheet(); const [filter, setFilter] = useState("Tutti");
  const memories = state.memories.filter((item) => item.residentId === "elena" && visibleToFamily(item) && (filter === "Tutti" || item.category === filter));
  return <FamilyShell title="Ricordi" onContribute={() => contribution.openContribution("photo")}>
    <LargeTitle kicker="Storia e fotografie" title="I ricordi di Elena">Quelli che ha scelto di raccontarti e quelli che hai portato tu: persone, luoghi e piccoli dettagli, ognuno con la sua provenienza.</LargeTitle>
    <Tabs value={filter} onValueChange={setFilter}><TabsList className="fam-chips" aria-label="Filtra i ricordi">{["Tutti", "Luoghi", "Persone", "Musica", "Routine", "Fotografie", "Ricordi"].map((item) => <TabsTrigger key={item} value={item} active={filter === item}>{item}</TabsTrigger>)}</TabsList></Tabs>
    <section className="fam-gallery">{memories.length ? memories.map((item) => <button type="button" key={item.id} className="fam-card fam-memory" onClick={() => navigate(`/famiglia/ricordi/${item.id}`)}>{(item.image || item.id === "mem-palermo" || item.id === "mem-cefalu") && <img src={item.image || asset("cefalu-postcard.svg")} alt={item.image ? `Immagine collegata a ${item.title}` : "Cartolina illustrata del lungomare di Cefalù"} />}<div><span className="fam-kicker">{item.category} · {originLabel(item)}</span><h2>{item.title}</h2><p>{item.description}</p><small>{item.people?.join(" · ") || "Dalla storia di Elena"}</small></div></button>) : <p className="fam-empty">Nessun ricordo in questa categoria, per ora.</p>}</section>
    <button type="button" className="fam-button" onClick={() => contribution.openContribution("photo")}><Camera size={18} /> Aggiungi una foto</button>
    {contribution.sheet}
  </FamilyShell>;
}

export function FamilyMemoryDetail() {
  const { id } = useParams(); const { state } = useDemo(); const navigate = useNavigate(); const contribution = useContributionSheet();
  const found = state.memories.find((item) => item.id === id);
  const memory = found && visibleToFamily(found) ? found : state.memories.find((item) => item.id === "mem-cefalu");
  const related = state.memories.filter((item) => item.residentId === "elena" && visibleToFamily(item) && item.id !== memory.id && (item.tags || []).some((tag) => (memory.tags || []).includes(tag))).slice(0, 3);
  const facts = [["Periodo", memory.period || memory.tags?.find((tag) => /\d{4}/.test(tag)) || "Da precisare"], ["Luogo", memory.place || (memory.tags?.includes("Sicilia") ? "Sicilia" : "Treviso")], ["Persone", memory.people?.join(", ") || "—"], ["Da dove arriva", originLabel(memory)]];
  return <FamilyShell title={memory.title} back={{ to: "/famiglia/storia", label: "Ricordi" }} onContribute={() => contribution.openContribution("memory")}>
    <article className="fam-detail">
      {(memory.image || memory.tags?.includes("Sicilia")) && <img className="fam-hero-img" src={memory.image || asset("cefalu-postcard.svg")} alt={`Immagine illustrata collegata al ricordo ${memory.title}`} />}
      <LargeTitle kicker={`${memory.category} · ${originLabel(memory)}`} title={memory.title} />
      <p className="fam-lead">{memory.description}</p>
      <dl className="fam-card fam-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="fam-source"><Check size={18} /><p>{fromFamily(memory) ? "L'hai condiviso tu: ROSS lo proporrà con delicatezza, e se Elena lo riconosce entra nella sua storia." : "Elena l'ha raccontato a ROSS e ha scelto di condividerlo con te. ROSS lo usa per dare continuità alle vostre conversazioni."}</p></div>
      <button type="button" className="fam-button" onClick={() => contribution.openContribution("photo")}><Plus size={18} /> Aggiungi un dettaglio o una foto</button>
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

export function FamilyActivities() {
  const { state } = useDemo(); const contribution = useContributionSheet(); const [period, setPeriod] = useState("Oggi");
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
  return <FamilyShell title="Momenti" onContribute={() => contribution.openContribution("topic")}>
    <LargeTitle kicker="Racconti, non misurazioni" title="I momenti di Elena">Con ROSS, giorno per giorno: solo i racconti che ha voluto condividere con te.</LargeTitle>
    <Tabs value={period} onValueChange={setPeriod}><TabsList className="fam-segmented" aria-label="Periodo">{["Oggi", "Settimana", "Mese"].map((item) => <TabsTrigger key={item} value={item} active={period === item}>{item}</TabsTrigger>)}</TabsList></Tabs>
    {period === "Oggi" && <MomentGroup kicker="Lunedì 21 settembre" title="Una giornata con musica e fotografie" ids={today} {...rowProps} />}
    {period === "Settimana" && week.map((group) => <MomentGroup key={group.kicker} {...group} {...rowProps} />)}
    {period === "Mese" && <>
      <section className="fam-card"><span className="fam-kicker">Settembre 2026 · i fili del mese</span><h2>Cosa è tornato più spesso</h2><p>Gli interessi che hanno acceso di più le sue conversazioni con ROSS, tra quelle che ha scelto di condividere con te.</p><div className="fam-tags">{threads.map((thread) => <span key={thread}>{thread}</span>)}</div></section>
      {month.map((group) => <MomentGroup key={group.kicker} {...group} {...rowProps} />)}
    </>}
    {contribution.sheet}
  </FamilyShell>;
}

export function FamilyActivityDetail() {
  const { id } = useParams(); const contribution = useContributionSheet(); const { state } = useDemo();
  const item = activityDetails[id] || activityDetails.garden;
  const shared = isShared(item, Boolean(state.rossJourney.completedAt), state.outing?.status === "back" && state.outing.shared);
  return <FamilyShell title={item.title} back={{ to: "/famiglia/attivita", label: "Momenti" }} onContribute={() => contribution.openContribution("topic")}>
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
      <button type="button" className="fam-button" onClick={() => contribution.openContribution("topic")}><Lightbulb size={18} /> Suggerisci un’attività simile</button>
    </article>
    {contribution.sheet}
  </FamilyShell>;
}

export function FamilyShared() {
  const { state } = useDemo(); const contribution = useContributionSheet(); const [selected, setSelected] = useState(null);
  const counts = [[state.familyContributions.length, "contributi salvati"], [state.familyContributions.filter((item) => contributionStatus(item.status) === "Ripreso con Elena").length, "già ripresi con Elena"], [state.familyContributions.filter((item) => contributionStatus(item.status) === "Disponibile a ROSS").length, "in attesa del momento giusto"]];
  return <FamilyShell title="Da te" onContribute={() => contribution.openContribution("memory")}>
    <LargeTitle kicker="Da te, per Elena" title="Cosa hai portato a ROSS">Foto, ricordi, temi e musica arrivano subito a ROSS, che li proporrà a Elena nel momento giusto.</LargeTitle>
    <dl className="fam-card fam-stats fam-stats-card">{counts.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <section className="fam-section">
      <div className="fam-list fam-card">{state.familyContributions.map((item) => { const Icon = contributionTypes[item.kind]?.icon || Heart; const status = contributionStatus(item.status); return <button type="button" key={item.id} className="fam-shared-row" onClick={() => setSelected(item)}>{item.image ? <img src={item.image} alt="" /> : <span className="fam-icon coral"><Icon size={20} /></span>}<span className="fam-row-text"><small className="fam-kicker">{contributionTypes[item.kind]?.short || "Contributo"}</small><strong>{item.title}</strong><small>{item.detail}</small><em className={status === "Ripreso con Elena" ? "done" : ""}>{status}</em></span><ChevronRight className="fam-chevron" size={18} /></button>; })}</div>
    </section>
    <section className="fam-section fam-contribute">
      <header className="fam-section-head"><h2>Cosa vuoi condividere?</h2></header>
      <ContributeTiles onPick={contribution.openContribution} />
    </section>
    {contribution.sheet}
    <SharedDetail item={selected} onClose={() => setSelected(null)} />
  </FamilyShell>;
}

function SharedDetail({ item, onClose }) {
  const container = useContext(PhoneScreen);
  return <Dialog open={Boolean(item)} title={item?.title || "Contributo"} onClose={onClose} container={container} className="family-dialog fam-sheet">{item && <div className="fam-shared-detail">{item.image && <img src={item.image} alt={`Immagine collegata a ${item.title}`} />}<span className="fam-badge">{contributionStatus(item.status)}</span><p>{item.detail}</p><dl className="fam-card fam-facts">{[["Persone", item.people?.join(", ") || "—"], ["Luogo", item.place || "—"], ["Periodo", item.period || "—"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>}</Dialog>;
}
