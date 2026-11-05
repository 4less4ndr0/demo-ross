import { useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, BellOff, Check, Clock, FolderOpen, Info, MapPin, FileText, MessageCircle, MoreHorizontal, Paperclip, Printer, Send, Sparkles, TextCursorInput, Upload } from "lucide-react";
import { attachmentFrom, useDemo } from "../state/DemoContext";
import { asset } from "../asset.js";
import { Avatar, DataExplanation, EmptyState, ModeBadge, useStructureView } from "../components/Common";
import { ResidentSpunti } from "../components/ResidentSpunti";
import { ParticipationChart } from "../components/ParticipationChart";
import { DEMO_TODAY } from "../data/demoData";
import { approachGuide, hooksFor, journeyInterest, needsFor, presenceFor, relating, rossTips, signalDetail, signalsFor, usageStyle } from "../data/careInsights";
import { buildResidentReport } from "../data/reportNarrative";
import { scheduledActivities, suggestedActivities } from "../data/activities";
import { Button, Dialog, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Input, Select, Tabs, TabsList, TabsTrigger, Textarea } from "../components/ui";

// Ritratto dell'ospite secondo docs/contratto-informativo-struttura.md: come sta, come avvicinarsi,
// quando e quanto parla con ROSS. Niente biografia, ricordi, persone o luoghi raccontati.
const tabs = [["sintesi", "Come sta"], ["avvicinare", "Come avvicinarsi"], ["conversazioni", "Con ROSS"], ["allegati", "Cosa sa ROSS"]];
const tabAliases = { documenti: "allegati", panoramica: "sintesi", andamento: "sintesi", attivita: "sintesi", interazioni: "conversazioni", storia: "avvicinare", memorie: "avvicinare", relazioni: "avvicinare", interessi: "avvicinare" };
// Struttura 2.0: in più la scheda Spunti (cosa la struttura ha proposto a ROSS e come è stato accolto), aperta di default;
// niente «Come avvicinarsi»: sono gli spunti il modo per avvicinarsi (decisione del 05/11/2026).
const tabsV2 = [["spunti", "Spunti"], ...tabs.filter(([t]) => t !== "avvicinare")]; // nella 2.0 ci si avvicina con gli spunti
const normalizeTab = (value, list = tabs) => { const fallback = list[0][0]; const key = (value || fallback).toLowerCase(); const id = tabAliases[key] || key; return list.some(([t]) => t === id) ? id : fallback; };

const typeLabels = { Conversazione: "Conversazione libera", Memoria: "Reminiscenza" };
const participationLabel = (value) => value >= 80 ? "Alta" : value >= 65 ? "Media" : "Bassa";
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const male = (resident) => ["carlo", "mario", "antonio", "bruno"].includes(resident.id);
// Le tre modalità dette con le parole dell'ospite, e cosa significano per gli inviti della struttura.
const modeMeaning = {
  Attiva: ["«Proponimi tu»", "ROSS può proporre attività e inviti, anche quelli che gli chiede la struttura."],
  Reattiva: ["«Quando ti chiamo»", "ROSS risponde quando lo chiamano, ma non propone nulla di sua iniziativa: gli inviti della struttura non partono."],
  Silenziosa: ["«Stai in silenzio»", "ROSS non avvia nulla e rispetta il riposo: nessun invito parte."],
};
const dayFormat = new Intl.DateTimeFormat("it-IT", { weekday: "short", day: "numeric", month: "short" });
const shortFormat = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" });
const shiftDays = (iso, days) => { const date = new Date(`${iso}T12:00:00`); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };
const formatDay = (iso) => capitalize(dayFormat.format(new Date(`${iso}T12:00:00`)).replace(".", ""));

function weekOf(state, residentId, weeksAgo = 0) {
  const to = shiftDays(DEMO_TODAY, -7 * weeksAgo);
  const from = shiftDays(to, -6);
  const items = state.interactions.filter((i) => i.residentId === residentId && i.date >= from && i.date <= to).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  return { from, to, items, minutes: items.reduce((sum, i) => sum + i.duration, 0) };
}

export function ResidentProfile() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const { v2 } = useStructureView();
  const tabList = v2 ? tabsV2 : tabs;
  const resident = state.residents.find((r) => r.id === id) || state.residents[0];
  const tab = normalizeTab(params.get("tab"), tabList);
  const residentDocuments = state.documents.filter((d) => d.residentId === resident.id);
  const setTab = (next) => setParams({ tab: next });
  const firstName = resident.name.split(" ")[0];

  if (!resident) return <EmptyState title="Ospite non trovato" />;

  return <div className="profile-screen screen-enter">
    <section className="profile-header">
      <div className="profile-person"><Avatar resident={resident} size="xl" /><div><span className="eyebrow">RITRATTO · STANZA {resident.room}</span><h1>{resident.name}</h1><p>{resident.age} anni · {resident.daysWithRoss} giorni con ROSS · ultima conversazione {resident.lastInteraction}</p></div></div>
      <div className="profile-actions"><Select value={resident.mode} onValueChange={(mode) => actions.setResidentMode(resident.id, mode)} label="Modalità ROSS" options={["Attiva", "Reattiva", "Silenziosa"].map((v) => ({ value: v, label: `Modalità ${v.toLowerCase()}` }))} />{v2 ? <><Button onClick={() => { setTab("spunti"); window.setTimeout(() => document.querySelector(".s2-propose textarea")?.focus(), 50); }}><Send size={16} /> Proponi uno spunto</Button><Button variant="outline" onClick={() => setTab("allegati")}><Paperclip size={16} /> Aggiungi un documento</Button></> : <><Button variant="outline" onClick={() => navigate(`/?ospite=${resident.id}`)}><Sparkles size={16} /> Chiedi su {firstName}</Button><Button onClick={() => navigate(`/interazione/${resident.id}`)}><MessageCircle size={16} /> Avvia conversazione</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Altre azioni"><MoreHorizontal size={17} /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem icon={Printer} onSelect={() => navigate(`/report?ospite=${resident.id}&stampa=1`)}>Stampa report</DropdownMenuItem><DropdownMenuItem icon={FileText} onSelect={() => navigate(`/report?ospite=${resident.id}`)}>Apri report</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem icon={Paperclip} onSelect={() => setTab("allegati")}>Allega una foto o un file</DropdownMenuItem></DropdownMenuContent></DropdownMenu></>}</div>
    </section>
    <Tabs value={tab} onValueChange={setTab}><TabsList className="profile-tabs" aria-label={`Ritratto di ${firstName}`}>{tabList.map(([tabId, label]) => <TabsTrigger key={tabId} value={tabId} active={tab === tabId}>{label}{tabId === "allegati" && residentDocuments.length > 0 && <small className="tab-count">{residentDocuments.length}</small>}</TabsTrigger>)}</TabsList></Tabs>
    {tab === "spunti" && <ResidentSpunti resident={resident} />}
    {tab === "sintesi" && <Overview state={state} resident={resident} onPropose={v2 ? () => setTab("spunti") : undefined} onApproach={v2 ? undefined : () => setTab("avvicinare")} onConversations={() => setTab("conversazioni")} />}
    {tab === "avvicinare" && <Approach state={state} resident={resident} navigate={navigate} />}
    {tab === "conversazioni" && <Conversations state={state} resident={resident} onApproach={() => setTab("avvicinare")} onPropose={v2 ? () => setTab("spunti") : undefined} />}
    {tab === "allegati" && <Attachments resident={resident} documents={residentDocuments} onAdd={actions.addDocument} />}
  </div>;
}

function Overview({ state, resident, onApproach, onConversations, onPropose }) {
  const [period, setPeriod] = useState("30");
  const name = resident.name.split(" ")[0];
  const summary = buildResidentReport(state, resident, "7");
  const chart = buildResidentReport(state, resident, period);
  const own = signalsFor(resident.id);
  const toWatch = own.filter((s) => !s.positive);
  const positive = own.filter((s) => s.positive);
  const ownNeeds = needsFor(resident.id);
  const presence = presenceFor(resident.id);
  const r = relating[resident.id];
  const newInterest = state.rossJourney.completedAt && resident.id === journeyInterest.residentId;
  const top = hooksFor(resident.id)[0];
  // Lente salutogenica: prima le risorse che ci sono già (interessi, cosa funziona, cosa va bene), poi il resto.
  const resources = [
    ["Cosa dà significato", hooksFor(resident.id, { withJourney: Boolean(state.rossJourney.completedAt) }).slice(0, 2).map((h) => `${h.label}${h.lever ? ` (${h.lever.toLowerCase()})` : ""}`).join(" · ")],
    ["Cosa aiuta a farcela", r ? `${r.works.join(", ")} · ${r.bestTime}` : ""],
    ["Cosa va bene", positive.length ? positive.map((s) => s.signal).join(", ") : "Da scoprire con il tempo"],
  ].filter(([, text]) => text);
  return <div className="profile-overview">
    <div className="overview-main">
      <section className="resident-resources surface"><span className="eyebrow">LE RISORSE DI {name.toUpperCase()}</span><h3>Cosa aiuta {name} a stare bene</h3><div className="resources-grid">{resources.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}</div><p className="resources-note">Lente salutogenica: si parte da ciò che c'è già e funziona, poi da ciò che è da osservare.</p></section>
      <article className="narrative-card surface"><span className="eyebrow">ULTIMI 7 GIORNI</span><h2>{summary.headline}</h2><p>{summary.paragraphs.join(" ")}</p><div className="narrative-stats">{summary.kpis.slice(0, 3).map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></article>
      <RossTips resident={resident} onPropose={onPropose || onApproach} />
      {r && onApproach && <section className="continuity-card surface"><div><span className="eyebrow">COME AVVICINARSI A {name.toUpperCase()}</span><h3>{capitalize(r.bestTime)} · {r.duration}</h3><p>{newInterest ? journeyInterest.how : `Funziona: ${r.works.join(", ").toLowerCase()}. ${r.avoid}.`}</p>{top?.opener && <p className="continuity-hook"><strong>Per iniziare · {top.label.toLowerCase()}:</strong> {top.opener}</p>}</div><Button variant="outline" onClick={onApproach}>Tutte le indicazioni <ArrowRight size={16} /></Button></section>}
      <section className="surface participation-card"><header><div><h3>Partecipazione rispetto alla sua media</h3><p>{chart.building ? "ROSS la sta ancora conoscendo: per una media personale servono circa 14 giorni di chiacchierate." : "La linea tratteggiata è la media personale di " + name + ". Mai confronti con altri ospiti."}</p></div><Select value={period} onValueChange={setPeriod} label="Periodo" options={[{ value: "7", label: "Ultimi 7 giorni" }, { value: "30", label: "Ultimi 30 giorni" }]} /></header><ParticipationChart series={chart.series} building={chart.building} height={200} /></section>
      <DataExplanation>Descrive solo ciò che accade nelle conversazioni con ROSS. Non è un giudizio sulla salute: ROSS segnala, lo staff osserva e decide.</DataExplanation>
    </div>
    <aside className="overview-side">
      <section className="surface compact-section"><h3>Benessere nel tempo</h3>
        {positive.map((s) => <div className="memory-mini" key={s.signal}><span className="memory-status confirmed" /><div><strong>{capitalize(s.signal)} · {s.trend}</strong><small>{signalDetail(s)}</small></div></div>)}
        {toWatch.map((s) => <div className="memory-mini" key={s.signal}><span className="memory-status pending" /><div><strong>{capitalize(s.signal)} · {s.trend}</strong><small>{signalDetail(s)}. Da osservare di persona.</small></div></div>)}
        {!own.length && <p className="compact-empty">{resident.participation == null ? "ROSS la sta ancora conoscendo: nessun confronto con la sua media per ora." : "Nessun segnale particolare rispetto alla sua media."}</p>}
      </section>
      <section className="surface compact-section"><h3>Bisogni espressi</h3>{ownNeeds.length ? ownNeeds.map((n) => <div className="memory-mini" key={n.text}><span className="memory-status pending" /><div><strong>{n.text}</strong><small>{n.times > 1 ? `${n.times} volte questa settimana` : "Questa settimana"}</small></div></div>) : <p className="compact-empty">Nessun bisogno particolare espresso questa settimana.</p>}</section>
      <section className="surface compact-section"><h3>Presenza</h3>
        <div className="presence-facts"><div><strong>{/^\d/.test(resident.lastInteraction) ? `oggi ${resident.lastInteraction}` : resident.lastInteraction}</strong><span>ultima conversazione</span></div><div><strong>{resident.mode}</strong><span>modalità ROSS</span></div></div>
        {presence.map((p) => <div className="memory-mini" key={p.text}><span className="memory-status pending" /><div><strong>{p.kind === "assenza" ? "Assenza insolita" : "Momenti di difficoltà"}</strong><small>{p.text}</small></div></div>)}
        <button className="text-link" onClick={onConversations}>Vedi le conversazioni <ArrowRight size={14} /></button>
      </section>
    </aside>
  </div>;
}

const rhythmLabels = { 1: "Bassa", 2: "Media", 3: "Alta" };
const styleLabels = [["pace", "Ritmo"], ["sentences", "Frasi"], ["questions", "Domande"], ["pauses", "Pause"]];

function Approach({ state, resident, navigate }) {
  const { v2 } = useStructureView();
  const r = relating[resident.id];
  const guide = approachGuide[resident.id];
  const name = resident.name.split(" ")[0];
  const hooks = hooksFor(resident.id, { withJourney: Boolean(state.rossJourney.completedAt) });
  const building = resident.participation == null;
  return <section className="content-section approach-section">
    <div className="content-toolbar"><div><h2>Come avvicinarsi a {name}</h2><p>Indicazioni pratiche per lo staff, dalla biografia d'ingresso e da come {name} risponde a ROSS. I ricordi e i racconti restano tra ROSS e {name}.</p></div>{!v2 && <Button onClick={() => navigate(`/interazione/${resident.id}`)}><MessageCircle size={16} /> Avvia conversazione con ROSS</Button>}</div>
    {guide && <article className="first-steps surface"><span className="eyebrow">PRIMO APPROCCIO IN 3 PASSI</span><ol>{guide.firstSteps.map((step) => <li key={step}>{step}</li>)}</ol></article>}
    {r ? <div className="relating-strip surface"><div><span>Come rivolgersi</span><strong>{r.address}</strong></div><div><span>Momento migliore</span><strong>{r.bestTime}</strong></div><div><span>Durata ideale</span><strong>{r.duration}</strong></div><div><span>Attenzione</span><strong>{r.avoid}</strong></div></div> : <EmptyState title="Indicazioni in costruzione" description="ROSS le propone dopo le prime settimane di conversazioni." />}
    <div className="approach-heading"><h3>Interessi e spunti</h3><p>Dall'interesse che coinvolge di più {name}. Il dettaglio concreto compare solo se arriva dalla biografia d'ingresso.</p></div>
    <div className="hook-grid">{hooks.map((h) => <article key={h.label} className={`hook-card surface ${h.isNew ? "hook-new" : ""}`}>
      <header><h4>{h.label}</h4><span className={`hook-source ${h.source === "Emerso con ROSS" ? "hook-ross" : ""}`}>{h.source}{h.isNew ? " · nuovo" : ""}</span></header>
      {h.lever && <p className="hook-lever"><span>Cosa lo coinvolge</span>{h.lever}</p>}
      {h.detail && <p className="hook-detail"><span>Dalla biografia d'ingresso</span>{h.detail}</p>}
      {h.opener && <p><span>Per iniziare</span>{h.opener}</p>}
      {h.activity && <p><span>Da proporre</span>{h.activity}</p>}
      <div className="hook-engagement"><span>Con ROSS</span>{h.engagement ? <><div className="engagement-bar"><i style={{ width: `${Math.min(100, 50 + h.engagement.duration * 0.8)}%` }} /><b style={{ left: "50%" }} /></div><small>Conversazioni {h.engagement.duration >= 0 ? "+" : ""}{h.engagement.duration}% più lunghe della sua media · partecipazione alta {h.engagement.high[0]} volte su {h.engagement.high[1]}</small></> : <small>{building ? "Dati in raccolta: ROSS la sta ancora conoscendo." : "Ancora pochi dati su questo interesse."}</small>}</div>
    </article>)}</div>
    <ActivitySuggestions state={state} resident={resident} name={name} />
    {guide && <div className="approach-grid approach-grid-2">
      <article className="surface approach-card"><span className="eyebrow">COME PARLA ROSS CON {name.toUpperCase()}</span><div className="style-grid">{styleLabels.map(([key, label]) => <div key={key}><span>{label}</span><strong>{guide.style[key]}</strong></div>)}</div><small>È lo stile a cui ROSS si è adattato: lo staff può rispecchiarlo.</small></article>
      <article className="surface approach-card"><span className="eyebrow">MOMENTI DELLA GIORNATA</span><div className="rhythm-strip">{Object.entries(guide.rhythm).map(([moment, level]) => <div key={moment} className={`rhythm-${level}`}><span>{moment}</span><i><b style={{ height: `${level * 33}%` }} /></i><strong>{rhythmLabels[level]}</strong></div>)}</div><small>Disponibilità a conversare, ricavata da quando {name} parla con ROSS.</small></article>
    </div>}
    <DataExplanation>Dettagli solo dalla biografia d'ingresso, compilata da famiglia o struttura. Ciò che {name} racconta a ROSS resta tra loro: qui arrivano solo categorie e indicazioni.</DataExplanation>
  </section>;
}

function Conversations({ state, resident, onApproach, onPropose }) {
  const weeks = [0, 1, 2, 3].map((n) => weekOf(state, resident.id, n)).filter((w) => w.items.length);
  const name = resident.name.split(" ")[0];
  const usage = usageStyle[resident.id];
  const [said, meaning] = modeMeaning[resident.mode] || modeMeaning.Reattiva;
  const invites = (state.rossInvites || []).filter((i) => i.residentId === resident.id);
  return <section className="content-section"><div className="content-toolbar"><div><h2>{name} e ROSS</h2><p>Come usa ROSS, in che modalità e quando ci parla. Il contenuto resta tra ROSS e {name}.</p></div></div>
    <div className="with-ross-grid">
      {usage && <article className="surface usage-card"><span className="eyebrow">COME USA ROSS</span><h3>{usage.title}</h3><p>{usage.text}</p>
        <div className="usage-mix" aria-label="Conversazioni per tipo">{usage.mix.map(([label, value]) => <div key={label}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><small>{value}%</small></div>)}</div>
        <small className="usage-note">Per tipo di conversazione negli ultimi 30 giorni, mai il contenuto.{usage.tool ? ` Per ${name} ROSS è uno strumento più che un compagno: va bene così.` : ""}</small></article>}
      <article className="surface usage-card mode-card"><span className="eyebrow">MODALITÀ</span><h3>{resident.mode} · {said}</h3><p>{meaning}</p>
        {onPropose ? <><button className="text-link" onClick={onPropose}>Proponi uno spunto <ArrowRight size={14} /></button></> : <>
        <div className="mode-invites"><strong>Inviti chiesti a ROSS</strong>{invites.length ? invites.map((i) => <div key={i.id} className="mode-invite"><Check size={15} /><span>{i.title}<small>{i.when} · ROSS lo proporrà nel suo momento migliore, decide {name}</small></span></div>) : <small>{resident.mode === "Attiva" ? `Nessuno per ora. Puoi chiederlo da "Come avvicinarsi" o dalla chat.` : `Con questa modalità ROSS non propone attività a ${name}: si propongono di persona.`}</small>}</div>
        <button className="text-link" onClick={onApproach}>Attività che potrebbero {male(resident) ? "interessargli" : "interessarle"} <ArrowRight size={14} /></button></>}</article>
    </div>
    <div className="approach-heading with-ross-when"><h3>Quando parla con ROSS</h3><p>Quando, quanto e com'è andata, settimana per settimana.</p></div>
    {!weeks.length ? <EmptyState title="Nessuna conversazione recente" /> : weeks.map((w, index) => {
      const avg = Math.round(w.items.reduce((sum, i) => sum + i.participation, 0) / w.items.length);
      return <div className="conversation-week" key={w.from}>
        <header><h3>{index === 0 ? "Ultimi 7 giorni" : `${shortFormat.format(new Date(`${w.from}T12:00:00`))} – ${shortFormat.format(new Date(`${w.to}T12:00:00`))}`}</h3><span>{w.items.length} conversazioni · {w.minutes} min · livello di partecipazione {({ Alta: "alto", Media: "medio", Bassa: "basso" })[participationLabel(avg)]}</span></header>
        <div className="table-wrap surface"><table><thead><tr><th>Quando</th><th>Tipo</th><th>Durata</th><th>Partecipazione</th><th>Modalità</th></tr></thead><tbody>{w.items.map((i) => <tr key={i.id}><td>{formatDay(i.date)}<small>{i.time}</small></td><td>{typeLabels[i.type] || i.type}</td><td>{i.duration} min</td><td>{participationLabel(i.participation)}</td><td><ModeBadge mode={i.mode} /></td></tr>)}</tbody></table></div>
      </div>;
    })}
    <DataExplanation>Nessuna trascrizione, nessun argomento: dal dispositivo escono solo dati aggregati. Il successo di ROSS non sono i minuti con lui, ma il tempo passato fuori.</DataExplanation>
  </section>;
}

// Spunti di ROSS per invogliare alla vita della residenza: cosa fare, e perché ROSS lo suggerisce.
function RossTips({ resident, onPropose }) {
  const tips = rossTips[resident.id];
  if (!tips) return null;
  return <section className="ross-tips surface"><span className="eyebrow">SPUNTI DI ROSS</span><h3>{tips.title}</h3><p className="ross-tips-intro">{tips.intro}</p>
    <ol className="ross-tips-list">{tips.tips.map((t) => <li key={t.title}><strong>{t.title}</strong><span>{t.text}</span><small><b>Perché:</b> {t.why.charAt(0).toLowerCase()}{t.why.slice(1)}</small></li>)}</ol>
    <footer><p><Sparkles size={15} /> {tips.ross}</p><Button variant="outline" onClick={onPropose}><Send size={15} /> Chiedi a ROSS di proporre un'attività</Button></footer>
  </section>;
}

// «Cosa sa ROSS»: i documenti raggruppati per ciò che ROSS ne fa, non per tipo.
// Ogni card dice chi l'ha scritto, cosa ne fa ROSS e chi lo vede. Una sezione vuota è un invito, non un buco.
const families = [
  ["conoscere", "Per conoscerla", "Per conoscerlo", "ROSS ne parla con la persona in modo personale.", (n) => `Chiedete alla famiglia di aiutare ROSS a conoscere ${n}: persone care, date importanti, cosa le piace.`],
  ["giornata", "La sua giornata", "La sua giornata", "ROSS ricorda e propone, una cosa alla volta e senza insistere.", (n) => `Nessun promemoria o appuntamento per ${n}. Menù, attività e avvisi della residenza valgono per tutti.`],
  ["benessere", "Per stare bene", "Per stare bene", "Indicazioni di fisioterapisti ed educatori: ROSS invita, la persona sceglie.", () => "Nessuna indicazione per ora. Un fisioterapista o un'educatrice può aggiungerne una."],
];
const familyOf = (d) => d.family || (d.origin === "struttura" ? "giornata" : d.kind === "Indicazione" ? "benessere" : "conoscere");
const defaultUse = { conoscere: "Ne parla con la persona in modo personale", giornata: "Glielo ricorda al momento giusto", benessere: "La invita, senza insistere" };
const sourceOf = (d) => d.origin === "struttura" ? "Struttura" : d.origin === "famiglia" ? "Famiglia" : d.origin === "ingresso" ? "Ingresso" : "Staff";
const malesP = ["carlo", "mario", "antonio", "bruno"];

function Attachments({ resident, documents, onAdd }) {
  const fileRef = useRef(null);
  const [open, setOpen] = useState(null);
  const [writing, setWriting] = useState(false);
  const name = resident.name.split(" ")[0];
  const male = malesP.includes(resident.id);
  const add = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    // Un .txt si legge subito: il testo diventa il contenuto del documento.
    if (/\.txt$/i.test(file.name) || file.type === "text/plain") file.text().then((text) => onAdd(textDocument(resident.id, file.name.replace(/\.[^.]+$/, ""), text)));
    else onAdd({ residentId: resident.id, origin: "staff", ...attachmentFrom(file) });
  };
  const src = (image) => /^(blob:|data:|https?:)/.test(image) ? image : asset(image);
  const groups = families.map(([id, f, m, hint, empty]) => ({ id, label: male ? m : f, hint, empty: empty(name, male), items: documents.filter((d) => familyOf(d) === id) }));
  return <section className="content-section"><div className="content-toolbar"><div><h2>Cosa sa ROSS di {name}</h2><p>Ciò che la struttura e la famiglia hanno dato a ROSS per {male ? "accompagnarlo" : "accompagnarla"}. Ogni cosa ha la sua fonte, e {name} la ritrova sul tablet in «Cosa ricordo di te». I documenti ufficiali restano nel gestionale.</p></div><div className="attachment-actions"><DropdownMenu><DropdownMenuTrigger asChild><button className="ghost-button"><Paperclip size={16} /> Aggiungi un documento</button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem icon={Upload} onSelect={() => fileRef.current?.click()}>Carica dal dispositivo</DropdownMenuItem><DropdownMenuItem icon={TextCursorInput} onSelect={() => setWriting(true)}>Aggiungi contenuto testuale</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    <input ref={fileRef} type="file" hidden accept="image/*,.pdf,.doc,.docx,.txt" onChange={add} /></div>
    <TextDocumentDialog open={writing} onClose={() => setWriting(false)} name={name} onSave={(title, text) => { onAdd(textDocument(resident.id, title, text)); setWriting(false); }} />
    <div className="knows-flow"><span><b>Chi lo scrive</b>struttura o famiglia</span><ArrowRight size={16} /><span><b>Cosa ne fa ROSS</b>ne parla, ricorda, propone</span><ArrowRight size={16} /><span><b>Dove {name} lo ritrova</b>«Cosa ricordo di te», sul tablet</span></div>
    {groups.map((g) => <div className="attachment-group" key={g.id}>
      <header><FolderOpen size={18} /><h3>{g.label}</h3><span>{g.items.length}</span><p>{g.hint}</p></header>
      {g.items.length ? <div className="document-list">{g.items.map((doc) => <button type="button" className="document-card surface" key={doc.id} onClick={() => setOpen(doc)}>{doc.image ? <img className="attachment-thumb" src={src(doc.image)} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="document-icon"><FileText size={20} /></span>}<div><small>{doc.kind} · {doc.date}</small><h3>{doc.title}</h3>{doc.summary && <p>{doc.summary}</p>}<div className="knows-meta"><span><b>Scritto da</b>{doc.author}</span><span><b>ROSS</b>{doc.use || defaultUse[familyOf(doc)]}</span><span><b>Lo vede</b>{doc.seenBy || "Staff e ROSS"}</span></div></div><ArrowRight size={17} /></button>)}</div>
        : <p className="knows-empty">{g.empty}</p>}
    </div>)}
    <Dialog open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title || ""} size="sm">
      {open && <div className="document-view"><span className="preview-tag">DOCUMENTO DIMOSTRATIVO</span><p className="document-view-meta">{open.kind} · {open.author} · {open.date}</p>
        {open.image && <img className="document-view-image" src={src(open.image)} alt={open.title} onError={(event) => { event.currentTarget.style.display = "none"; }} />}
        {open.summary && open.kind !== "Testo" && <p>{open.summary}</p>}
        {open.reminders && <ReminderDoc doc={open} name={name} />}
        {open.body && <dl>{open.body.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>}
        <p className="knows-source">Fonte: {sourceOf(open)} · ROSS: {open.use || defaultUse[familyOf(open)]} · Lo vede: {open.seenBy || "Staff e ROSS"}</p>
      </div>}
    </Dialog>
    <DataExplanation>ROSS usa questi documenti per accompagnare {name}: non interpreta referti né valori e non sostituisce il gestionale. Ciò che {name} racconta a ROSS resta tra loro.</DataExplanation>
  </section>;
}

// «Aggiungi contenuto testuale»: si incolla un testo e diventa un documento .txt di «Cosa sa ROSS».
const textDocument = (residentId, title, text) => {
  const clean = text.trim();
  const name = (title.trim() || clean.split("\n")[0].slice(0, 60) || "Testo").replace(/\.txt$/i, "");
  return { residentId, origin: "staff", kind: "Testo", title: `${name}.txt`, summary: clean.length > 160 ? `${clean.slice(0, 157)}…` : clean, body: [["Testo", clean]] };
};

function TextDocumentDialog({ open, onClose, onSave, name }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const close = () => { setTitle(""); setText(""); onClose(); };
  const save = (event) => { event.preventDefault(); if (!text.trim()) return; onSave(title, text); setTitle(""); setText(""); };
  return <Dialog open={open} onClose={close} title="Aggiungi contenuto testuale" size="md">
    <form className="text-doc-form" onSubmit={save}>
      <p>Incolla o scrivi un testo: diventa un documento .txt che ROSS usa per accompagnare {name}.</p>
      <label><span>Titolo <small>(se vuoi)</small></span><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Per esempio: Note dell'educatrice" /></label>
      <label><span>Testo</span><Textarea rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder="Incolla qui il testo…" autoFocus /></label>
      {text.trim() && <small className="text-doc-preview"><FileText size={14} />{(title.trim() || text.trim().split("\n")[0].slice(0, 60)).replace(/\.txt$/i, "")}.txt · {text.trim().length} caratteri</small>}
      <div className="text-doc-actions"><Button type="button" variant="outline" onClick={close}>Annulla</Button><Button type="submit" disabled={!text.trim()}>Aggiungi il documento</Button></div>
    </form>
  </Dialog>;
}

// Attività dal calendario demo, collegate solo agli interessi condivisi. Nessun collegamento reale.
// La struttura può chiedere a ROSS di proporre un'attività all'ospite: succede solo in modalità Attiva.
// Altrimenti un avviso spiega perché l'invito non parte e suggerisce di proporla di persona.
function ActivitySuggestions({ state, resident, name }) {
  const { actions } = useDemo();
  const items = suggestedActivities[resident.id] || [];
  const [detail, setDetail] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [all, setAll] = useState(false);
  const her = male(resident) ? "interessargli" : "interessarle";
  const him = male(resident) ? "gli" : "le";
  const active = resident.mode === "Attiva";
  const asked = (a) => (state.rossInvites || []).some((i) => i.residentId === resident.id && i.activityId === a.id);
  const send = (a) => { actions.askRossToInvite({ residentId: resident.id, activityId: a.id, title: a.title, when: a.when }); setProposal(null); };
  return <div className="activity-section" id="attivita">
    <div className="approach-heading"><h3>Attività che potrebbero {her}</h3><p>Dal calendario della struttura, collegate agli interessi che {name} ha condiviso. Potete chiedere a ROSS di proporgliele: decide {name}.</p></div>
    {!active && items.length > 0 && <div className="mode-warning"><BellOff size={17} /><p><strong>ROSS è in modalità {resident.mode.toLowerCase()} con {name}: non può proporre{him === "gli" ? "gli" : "le"} attività.</strong> {modeMeaning[resident.mode]?.[1]} Potete proporle di persona.</p></div>}
    {items.length ? <div className="activity-grid">{items.map((a) => <article key={a.id} className="activity-card surface">
      <header className="activity-card-head"><h4>{a.title}</h4>{asked(a) && <span className="invite-badge"><Check size={13} /> Chiesto a ROSS</span>}</header>
      <div className="activity-meta"><span><Clock size={13} />{a.when}</span><span><MapPin size={13} />{a.where}</span></div>
      <p>{a.description}</p>
      <p className="activity-reason"><span>PERCHÉ È SUGGERITA</span>{a.reason}</p>
      <div className="activity-actions"><Button variant={active && !asked(a) ? "default" : "outline"} onClick={() => { setAnswer(null); setProposal(a); }}><Send size={15} /> {asked(a) ? "Vedi la proposta" : "Chiedi a ROSS di proporla"}</Button><Button variant="ghost" onClick={() => setDetail(a)}><Info size={15} /> Dettagli</Button></div>
    </article>)}</div> : <div className="activity-empty surface"><p>Nessun suggerimento disponibile per ora. Puoi comunque consultare le attività in programma.</p><button className="text-link" onClick={() => setAll(true)}>Vedi tutte le attività <ArrowRight size={14} /></button></div>}
    {items.length > 0 && <div className="activity-footer"><small>Le attività sono suggerimenti, non impegni. {name} può scegliere liberamente se partecipare.</small><button className="text-link" onClick={() => setAll(true)}>Vedi tutte le attività <ArrowRight size={14} /></button></div>}
    <Dialog open={all} onClose={() => setAll(false)} title="Attività in programma" size="sm">
      <div className="activity-detail"><span className="preview-tag">DATI DIMOSTRATIVI</span><ul className="activity-list">{scheduledActivities.map((a) => <li key={a.title}><strong>{a.title}</strong><span>{a.when} · {a.where}</span></li>)}</ul><p className="sim-note">Calendario di esempio: la demo non è collegata al calendario della struttura.</p></div>
    </Dialog>
    <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.title || ""} size="sm">
      {detail && <div className="activity-detail"><span className="preview-tag">DATI DIMOSTRATIVI</span><p style={{ margin: "12px 0 0" }}>{detail.description}</p><dl>
        <dt>Quando</dt><dd>{detail.when}</dd><dt>Dove</dt><dd>{detail.where}</dd><dt>Prenotazione</dt><dd>{detail.booking}</dd><dt>Accompagnamento</dt><dd>{detail.escort}</dd><dt>Referente</dt><dd>{detail.contact}</dd>
      </dl><p className="sim-note">Calendario di esempio: la demo non è collegata al calendario della struttura. Proporre l'attività non è una prenotazione.</p></div>}
    </Dialog>
    <Dialog open={Boolean(proposal)} onClose={() => setProposal(null)} title={active ? "ROSS la proporrà così" : "ROSS non può proporla"} size="sm">
      {proposal && (active ? <div>
        <div className="sim-chat">
          <p className="sim-bubble sim-ross"><small>ROSS</small>«{proposal.invite}»</p>
          {!answer && <div className="sim-choices"><button onClick={() => setAnswer("si")}>Sì, dimmi di più</button><button onClick={() => setAnswer("no")}>No grazie, oggi preferisco stare qui</button></div>}
          {answer === "si" && <><p className="sim-bubble sim-elena"><small>{name.toUpperCase()}</small>«Sì, dimmi di più.»</p><p className="sim-bubble sim-ross"><small>ROSS</small>«{proposal.more}»</p></>}
          {answer === "no" && <><p className="sim-bubble sim-elena"><small>{name.toUpperCase()}</small>«No grazie, oggi preferisco stare qui.»</p><p className="sim-bubble sim-ross"><small>ROSS</small>«Va bene, nessun problema.»</p></>}
        </div>
        <p className="sim-note">Le risposte qui sopra sono solo un esempio. ROSS la proporrà a {name} nel suo momento migliore. Un «sì» non è una prenotazione; se vuole essere accompagnato, ROSS ve lo dice con il suo permesso. Un «no» non viene segnalato a nessuno.</p>
        <div className="modal-actions">{asked(proposal) ? <span className="invite-badge"><Check size={13} /> Già chiesto a ROSS</span> : <><Button variant="ghost" onClick={() => setProposal(null)}>Non ora</Button><Button onClick={() => send(proposal)}><Send size={15} /> Chiedi a ROSS di proporla</Button></>}</div>
      </div> : <div>
        <div className="mode-warning"><BellOff size={17} /><p><strong>Con {name} ROSS è in modalità {resident.mode.toLowerCase()} ({modeMeaning[resident.mode]?.[0]}).</strong> {modeMeaning[resident.mode]?.[1]} L'invito a «{proposal.title}» non {him} arriverebbe.</p></div>
        <p className="sim-note">Potete proporgliela di persona: {proposal.when.toLowerCase()}, {proposal.where.toLowerCase()}{relating[resident.id] ? `; il suo momento migliore è ${relating[resident.id].bestTime}` : ""}. Se {name} è d'accordo si può passare alla modalità attiva: la modalità si sceglie con {male(resident) ? "lui" : "lei"}, non per {male(resident) ? "lui" : "lei"}.</p>
        <div className="modal-actions"><Button variant="ghost" onClick={() => actions.setResidentMode(resident.id, "Attiva")}>{name} è d'accordo: passa ad Attiva</Button><Button onClick={() => setProposal(null)}>La propongo di persona</Button></div>
      </div>)}
    </Dialog>
  </div>;
}

// il documento dei promemoria per le medicine, inserito dalla struttura.
// ROSS ripete le parole scritte all'ora indicata: non sa cosa sono le medicine, non registra se sono state prese, non avvisa nessuno.
function ReminderDoc({ doc, name }) {
  return <div className="reminder-doc">
    <h4>Cosa ricorderà ROSS</h4>
    <ol className="reminder-list">{doc.reminders.map(([time, moment, what, line]) => <li key={time}>
      <div className="reminder-time"><strong>{time}</strong><span>{moment}</span></div>
      <div><p className="reminder-what">{what.charAt(0).toUpperCase() + what.slice(1)}</p><p className="reminder-line"><span>ROSS dirà</span>«{line}»</p></div>
    </li>)}</ol>
    <div className="reminder-answers"><span>{name} può rispondere</span><div><em>«Va bene»</em><em>«Ricordamelo tra poco»</em><em>«Non ricordarmelo più»</em></div></div>
    <div className="reminder-limits"><span>COSA ROSS NON FA</span><ul>
      <li>Non sa che medicine sono: ripete solo le parole scritte dall'infermeria.</li>
      <li>Non controlla e non registra se {name} le ha prese.</li>
      <li>Non avvisa nessuno se {name} dice di no o non risponde.</li>
      <li>La somministrazione e le eventuali modifiche restano all'infermeria.</li>
    </ul></div>
    <p className="reminder-consent">{doc.consent}</p>
    {doc.silent && <p className="reminder-consent">{name} ha ROSS in modalità silenziosa: ha chiesto di ricevere comunque questi promemoria.</p>}
  </div>;
}
