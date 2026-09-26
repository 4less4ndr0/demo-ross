import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, FileText, MessageCircle, MoreHorizontal, Paperclip, Printer, Sparkles } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { Avatar, DataExplanation, EmptyState, ModeBadge } from "../components/Common";
import { ParticipationChart } from "../components/ParticipationChart";
import { DEMO_TODAY } from "../data/demoData";
import { approachGuide, hooksFor, journeyInterest, needsFor, presenceFor, relating, signalsFor } from "../data/careInsights";
import { buildResidentReport } from "../data/reportNarrative";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Select } from "../components/ui";

// Ritratto dell'ospite secondo docs/contratto-informativo-struttura.md: come sta, come avvicinarsi,
// quando e quanto parla con ROSS. Niente biografia, ricordi, persone o luoghi raccontati.
const tabs = [["sintesi", "Come sta"], ["avvicinare", "Come avvicinarsi"], ["conversazioni", "Conversazioni ROSS"], ["documenti", "Documenti"]];
const tabAliases = { panoramica: "sintesi", andamento: "sintesi", attivita: "sintesi", interazioni: "conversazioni", storia: "avvicinare", memorie: "avvicinare", relazioni: "avvicinare", interessi: "avvicinare" };
const normalizeTab = (value) => { const key = (value || "sintesi").toLowerCase(); const id = tabAliases[key] || key; return tabs.some(([t]) => t === id) ? id : "sintesi"; };

const typeLabels = { Conversazione: "Conversazione libera", Memoria: "Reminiscenza" };
const participationLabel = (value) => value >= 80 ? "Alta" : value >= 65 ? "Media" : "Bassa";
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
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
  const resident = state.residents.find((r) => r.id === id) || state.residents[0];
  const tab = normalizeTab(params.get("tab"));
  const residentDocuments = state.documents.filter((d) => d.residentId === resident.id);
  const setTab = (next) => setParams({ tab: next });
  const firstName = resident.name.split(" ")[0];

  if (!resident) return <EmptyState title="Ospite non trovato" />;

  return <div className="profile-screen screen-enter">
    <section className="profile-header">
      <div className="profile-person"><Avatar resident={resident} size="xl" /><div><span className="eyebrow">RITRATTO · STANZA {resident.room}</span><h1>{resident.name}</h1><p>{resident.age} anni · {resident.daysWithRoss} giorni con ROSS · ultima conversazione {resident.lastInteraction}</p></div></div>
      <div className="profile-actions"><Select value={resident.mode} onValueChange={(mode) => actions.setResidentMode(resident.id, mode)} label="Modalità ROSS" options={["Attiva", "Reattiva", "Silenziosa"].map((v) => ({ value: v, label: `Modalità ${v.toLowerCase()}` }))} /><Button variant="outline" onClick={() => navigate(`/?ospite=${resident.id}`)}><Sparkles size={16} /> Chiedi su {firstName}</Button><Button onClick={() => navigate(`/interazione/${resident.id}`)}><MessageCircle size={16} /> Avvia conversazione</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Altre azioni"><MoreHorizontal size={17} /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem icon={Printer} onSelect={() => navigate(`/report?ospite=${resident.id}&stampa=1`)}>Stampa report</DropdownMenuItem><DropdownMenuItem icon={FileText} onSelect={() => navigate(`/report?ospite=${resident.id}`)}>Apri report</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem icon={Paperclip} onSelect={() => navigate(`/?ospite=${resident.id}`)}>Allega documento in chat</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    </section>
    <div className="profile-tabs">{tabs.map(([tabId, label]) => <button key={tabId} className={tab === tabId ? "active" : ""} onClick={() => setTab(tabId)}>{label}{tabId === "documenti" && residentDocuments.length > 0 && <small className="tab-count">{residentDocuments.length}</small>}</button>)}</div>
    {tab === "sintesi" && <Overview state={state} resident={resident} onApproach={() => setTab("avvicinare")} onConversations={() => setTab("conversazioni")} />}
    {tab === "avvicinare" && <Approach state={state} resident={resident} navigate={navigate} />}
    {tab === "conversazioni" && <Conversations state={state} resident={resident} />}
    {tab === "documenti" && <Documents resident={resident} documents={residentDocuments} navigate={navigate} />}
  </div>;
}

function Overview({ state, resident, onApproach, onConversations }) {
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
  return <div className="profile-overview">
    <div className="overview-main">
      <article className="narrative-card surface"><span className="eyebrow">ULTIMI 7 GIORNI</span><h2>{summary.headline}</h2><p>{summary.paragraphs.join(" ")}</p><div className="narrative-stats">{summary.kpis.slice(0, 3).map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></article>
      {r && <section className="continuity-card surface"><div><span className="eyebrow">COME AVVICINARSI A {name.toUpperCase()}</span><h3>{capitalize(r.bestTime)} · {r.duration}</h3><p>{newInterest ? journeyInterest.how : `Funziona: ${r.works.join(", ").toLowerCase()}. ${r.avoid}.`}</p>{top?.opener && <p className="continuity-hook"><strong>Per iniziare · {top.label.toLowerCase()}:</strong> {top.opener}</p>}</div><Button variant="outline" onClick={onApproach}>Tutte le indicazioni <ArrowRight size={16} /></Button></section>}
      <section className="surface participation-card"><header><div><h3>Partecipazione rispetto alla sua media</h3><p>{chart.building ? "ROSS la sta ancora conoscendo: per una media personale servono circa 14 giorni di chiacchierate." : "La linea tratteggiata è la media personale di " + name + ". Mai confronti con altri ospiti."}</p></div><Select value={period} onValueChange={setPeriod} label="Periodo" options={[{ value: "7", label: "Ultimi 7 giorni" }, { value: "30", label: "Ultimi 30 giorni" }]} /></header><ParticipationChart series={chart.series} building={chart.building} height={200} /></section>
      <DataExplanation>Descrive solo ciò che accade nelle conversazioni con ROSS. Non è un giudizio sulla salute: ROSS segnala, lo staff osserva e decide.</DataExplanation>
    </div>
    <aside className="overview-side">
      <section className="surface compact-section"><h3>Benessere nel tempo</h3>
        {toWatch.map((s) => <div className="memory-mini" key={s.signal}><span className="memory-status pending" /><div><strong>{capitalize(s.signal)} · {s.trend}</strong><small>{s.note || `In ${s.count} conversazioni su ${s.of} · di solito ${s.usual}`}. Da osservare di persona.</small></div></div>)}
        {positive.map((s) => <div className="memory-mini" key={s.signal}><span className="memory-status confirmed" /><div><strong>{capitalize(s.signal)} · {s.trend}</strong><small>In {s.count} conversazioni su {s.of} · di solito {s.usual}</small></div></div>)}
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
  const r = relating[resident.id];
  const guide = approachGuide[resident.id];
  const name = resident.name.split(" ")[0];
  const hooks = hooksFor(resident.id, { withJourney: Boolean(state.rossJourney.completedAt) });
  const building = resident.participation == null;
  return <section className="content-section approach-section">
    <div className="content-toolbar"><div><h2>Come avvicinarsi a {name}</h2><p>Indicazioni pratiche per lo staff, dalla biografia d'ingresso e da come {name} risponde a ROSS. I ricordi e i racconti restano tra ROSS e {name}.</p></div><Button onClick={() => navigate(`/interazione/${resident.id}`)}><MessageCircle size={16} /> Avvia conversazione con ROSS</Button></div>
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
    {guide && <div className="approach-grid approach-grid-2">
      <article className="surface approach-card"><span className="eyebrow">COME PARLA ROSS CON {name.toUpperCase()}</span><div className="style-grid">{styleLabels.map(([key, label]) => <div key={key}><span>{label}</span><strong>{guide.style[key]}</strong></div>)}</div><small>È lo stile a cui ROSS si è adattato: lo staff può rispecchiarlo.</small></article>
      <article className="surface approach-card"><span className="eyebrow">MOMENTI DELLA GIORNATA</span><div className="rhythm-strip">{Object.entries(guide.rhythm).map(([moment, level]) => <div key={moment} className={`rhythm-${level}`}><span>{moment}</span><i><b style={{ height: `${level * 33}%` }} /></i><strong>{rhythmLabels[level]}</strong></div>)}</div><small>Disponibilità a conversare, ricavata da quando {name} parla con ROSS.</small></article>
    </div>}
    <DataExplanation>Dettagli solo dalla biografia d'ingresso, compilata da famiglia o struttura. Ciò che {name} racconta a ROSS resta tra loro: qui arrivano solo categorie e indicazioni.</DataExplanation>
  </section>;
}

function Conversations({ state, resident }) {
  const weeks = [0, 1, 2, 3].map((n) => weekOf(state, resident.id, n)).filter((w) => w.items.length);
  const name = resident.name.split(" ")[0];
  return <section className="content-section"><div className="content-toolbar"><div><h2>Conversazioni con ROSS</h2><p>Quando, quanto e com'è andata. Il contenuto resta tra ROSS e {name}.</p></div></div>
    {!weeks.length ? <EmptyState title="Nessuna conversazione recente" /> : weeks.map((w, index) => {
      const avg = Math.round(w.items.reduce((sum, i) => sum + i.participation, 0) / w.items.length);
      return <div className="conversation-week" key={w.from}>
        <header><h3>{index === 0 ? "Ultimi 7 giorni" : `${shortFormat.format(new Date(`${w.from}T12:00:00`))} – ${shortFormat.format(new Date(`${w.to}T12:00:00`))}`}</h3><span>{w.items.length} conversazioni · {w.minutes} min · livello di partecipazione {({ Alta: "alto", Media: "medio", Bassa: "basso" })[participationLabel(avg)]}</span></header>
        <div className="table-wrap surface"><table><thead><tr><th>Quando</th><th>Tipo</th><th>Durata</th><th>Partecipazione</th><th>Modalità</th></tr></thead><tbody>{w.items.map((i) => <tr key={i.id}><td>{formatDay(i.date)}<small>{i.time}</small></td><td>{typeLabels[i.type] || i.type}</td><td>{i.duration} min</td><td>{participationLabel(i.participation)}</td><td><ModeBadge mode={i.mode} /></td></tr>)}</tbody></table></div>
      </div>;
    })}
    <DataExplanation>Nessuna trascrizione, nessun argomento: dal dispositivo escono solo dati aggregati.</DataExplanation>
  </section>;
}

function Documents({ resident, documents, navigate }) {
  const toChat = () => navigate(`/?ospite=${resident.id}`);
  return <section className="content-section"><div className="content-toolbar"><div><h2>Documenti</h2><p>Referti e relazioni allegati in chat, che ROSS può citare come fonte. I documenti ufficiali restano nel gestionale della struttura.</p></div><button className="ghost-button" onClick={toChat}><Paperclip size={16} /> Allega dalla chat</button></div>
    {!documents.length ? <EmptyState title="Nessun documento" description="Allega referti e relazioni dalla chat: ROSS li userà come fonte." icon={FileText} /> : <div className="document-list">{documents.map((doc) => <article className="document-card surface" key={doc.id}><span className="document-icon"><FileText size={20} /></span><div><small>{doc.kind} · {doc.date}</small><h3>{doc.title}</h3><p>{doc.summary}</p><span className="document-meta">{doc.author} · {doc.pages} {doc.pages === 1 ? "pagina" : "pagine"}</span></div><button className="ghost-button" onClick={() => navigate(`/?ospite=${resident.id}&q=${encodeURIComponent(`Cosa dice ${doc.kind.toLowerCase()} di ${resident.name.split(" ")[0]}?`)}`)}><Sparkles size={15} /> Chiedi a ROSS</button></article>)}</div>}
    <DataExplanation>ROSS legge i documenti per rispondere alle domande dello staff e li cita come fonte. Non interpreta i valori degli esami e non sostituisce il gestionale.</DataExplanation>
  </section>;
}
