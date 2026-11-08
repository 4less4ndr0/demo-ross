import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, Folder, FolderOpen, FileText, Send, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "../state/DemoContext";
import { asset } from "../asset.js";
import { Avatar, DataExplanation, EmptyState } from "../components/Common";
import { ResidentSpunti } from "../components/ResidentSpunti";
import { useMoments } from "../state/channelStore";
import { AddDocumentMenu, familyOf, folders, useOf } from "../components/DocumentDialogs";
import { HowIsV2, WithRossV2 } from "../components/PortraitV2";
import { suggestedActivities } from "../data/activities";
import { Button, Dialog, Select, Tabs, TabsList, TabsTrigger } from "../components/ui";

// Il ritratto dell'ospite nella Struttura (il canale con ROSS). Quattro schede: Spunti (aperta di default:
// ci si avvicina con gli spunti), Come sta, Con ROSS, Cosa sa ROSS. Come sta e di cosa ha bisogno, mai di
// cosa ha parlato (docs/contratto-informativo-struttura.md).
const tabs = [["spunti", "Spunti"], ["sintesi", "Come sta"], ["conversazioni", "Con ROSS"], ["allegati", "Cosa sa ROSS"]];
// I vecchi indirizzi del ritratto portano alla scheda più vicina.
const tabAliases = { documenti: "allegati", panoramica: "sintesi", andamento: "sintesi", attivita: "sintesi", interazioni: "conversazioni", avvicinare: "spunti", storia: "spunti", memorie: "spunti", relazioni: "spunti", interessi: "spunti" };
const normalizeTab = (value) => { const key = (value || "spunti").toLowerCase(); const id = tabAliases[key] || key; return tabs.some(([t]) => t === id) ? id : "spunti"; };

export function ResidentProfile() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { state, actions } = useDemo();
  const resident = state.residents.find((r) => r.id === id) || state.residents[0];
  const tab = normalizeTab(params.get("tab"));
  const residentDocuments = state.documents.filter((d) => d.residentId === resident.id);
  const setTab = (next) => setParams({ tab: next });
  const firstName = resident.name.split(" ")[0];

  if (!resident) return <EmptyState title="Ospite non trovato" />;

  return <div className="profile-screen screen-enter">
    <section className="profile-header">
      <div className="profile-person"><Avatar resident={resident} size="xl" /><div><span className="eyebrow">RITRATTO · STANZA {resident.room}</span><h1>{resident.name}</h1><p>{resident.age} anni · {resident.daysWithRoss} giorni con ROSS · ultima conversazione {resident.lastInteraction}</p></div></div>
      <div className="profile-actions">
        <Select value={resident.mode} onValueChange={(mode) => actions.setResidentMode(resident.id, mode)} label="Modalità ROSS" options={["Attiva", "Reattiva", "Silenziosa"].map((v) => ({ value: v, label: `Modalità ${v.toLowerCase()}` }))} />
        <Button onClick={() => { setTab("spunti"); window.setTimeout(() => document.querySelector(".s2-propose textarea")?.focus(), 50); }}><Send size={16} /> Proponi uno spunto</Button>
        <AddDocumentMenu resident={resident} onAdd={actions.addDocument} onAdded={(family) => setParams({ tab: "allegati", cartella: family })} className="ui-button ui-button-outline ui-button-md" />
      </div>
    </section>
    <Tabs value={tab} onValueChange={setTab}><TabsList className="profile-tabs" aria-label={`Ritratto di ${firstName}`}>{tabs.map(([tabId, label]) => <TabsTrigger key={tabId} value={tabId} active={tab === tabId}>{label}{tabId === "allegati" && residentDocuments.length > 0 && <small className="tab-count">{residentDocuments.length}</small>}</TabsTrigger>)}</TabsList></Tabs>
    {tab === "spunti" && <ResidentSpunti resident={resident} />}
    {tab === "sintesi" && <HowIsV2 resident={resident} onPropose={() => setTab("spunti")} onProposeText={(text, kind) => setParams({ tab: "spunti", spunto: text, tipo: kind })} />}
    {tab === "conversazioni" && <WithRossV2 resident={resident} onPropose={() => setTab("spunti")} onOpenSpunti={() => setTab("spunti")} />}
    {tab === "allegati" && <Attachments resident={resident} documents={residentDocuments} onAdd={actions.addDocument} />}
  </div>;
}

const sourceOf = (d) => d.origin === "struttura" ? "Struttura" : d.origin === "famiglia" ? "Famiglia" : d.origin === "ingresso" ? "Ingresso" : "Staff";
const malesP = ["carlo", "mario", "antonio", "bruno"];

// Cosa ROSS sta per dire o proporre: promemoria dell'infermeria e attività del calendario (solo in modalità Attiva).
// Chi controlla può fermare una cosa che non va: ROSS non la dirà finché non viene ripresa. Resta nel browser.
const PAUSED_KEY = "ross-paused-v1";
const readPaused = () => { try { return JSON.parse(localStorage.getItem(PAUSED_KEY)) || []; } catch { return []; } };
function upcomingFor(resident, documents, spunti = []) {
  const items = [];
  // Anche gli spunti della struttura che ROSS deve ancora portare nella conversazione.
  spunti.filter((sp) => sp.residentId === resident.id && sp.status === "attesa").forEach((sp) => items.push({ id: sp.id, when: "Appena possibile", sort: "0", kind: "Il tuo spunto", what: sp.text, source: "Proposto dalla struttura" }));
  documents.filter((d) => d.reminders).forEach((d) => d.reminders.forEach(([time, moment, what, line]) => items.push({ id: `${d.id}-${time}`, when: `Ogni giorno, ${time}`, sort: time, kind: "Promemoria dell'infermeria", what: `Ricordare ${what}, ${moment}`, line, source: d.title })));
  (suggestedActivities[resident.id] || []).forEach((a) => items.push({ id: `att-${a.id}`, when: a.when, sort: `z${a.when}`, kind: "Proposta dal calendario", what: `Proporre «${a.title}» (${a.where})`, line: a.invite, source: "Calendario della residenza", off: resident.mode !== "Attiva" && `Non partirà: ${resident.name.split(" ")[0]} ha ROSS in modalità ${resident.mode.toLowerCase()}.` }));
  return items.sort((a, b) => a.sort.localeCompare(b.sort));
}

function Attachments({ resident, documents, onAdd }) {
  const [open, setOpen] = useState(null);
  // La cartella aperta sta nell'indirizzo (?tab=allegati&cartella=…): ci portano anche la chat e il bottone in cima al ritratto.
  const [params, setParams] = useSearchParams();
  const folder = folders.some((f) => f.id === params.get("cartella")) ? params.get("cartella") : null;
  const setFolder = (id) => setParams(id ? { tab: "allegati", cartella: id } : { tab: "allegati" });
  const [paused, setPaused] = useState(readPaused);
  const name = resident.name.split(" ")[0];
  const male = malesP.includes(resident.id);
  const saved = (family) => { if (folder && folder !== family) setFolder(family); };
  const src = (image) => /^(blob:|data:|https?:)/.test(image) ? image : asset(image);
  const moments = useMoments();
  const waiting = moments.filter((m) => m.esito === "attesa").map((m) => ({ id: m.id, residentId: m.residentId, status: "attesa", text: m.spunto.testo }));
  const upcoming = upcomingFor(resident, documents, waiting);
  const count = (id) => id === "giornata" ? upcoming.length + documents.filter((d) => familyOf(d) === id).length : documents.filter((d) => familyOf(d) === id).length;
  const current = folders.find((f) => f.id === folder);
  const items = current ? documents.filter((d) => familyOf(d) === current.id) : [];
  const togglePause = (id) => {
    const before = paused;
    const next = paused.includes(id) ? paused.filter((p) => p !== id) : [...paused, id];
    setPaused(next);
    try { localStorage.setItem(PAUSED_KEY, JSON.stringify(next)); } catch { /* ignora */ }
    toast(next.includes(id) ? "Fermato: ROSS non lo dirà finché non lo riprendi" : "Ripreso: ROSS lo dirà di nuovo", { action: { label: "Annulla", onClick: () => { setPaused(before); try { localStorage.setItem(PAUSED_KEY, JSON.stringify(before)); } catch { /* ignora */ } } } });
  };
  const addMenu = () => <AddDocumentMenu resident={resident} initial={folder} onAdd={onAdd} onAdded={saved} />;
  const docCard = (doc) => <button type="button" className="document-card surface" key={doc.id} onClick={() => setOpen(doc)}>{doc.image ? <img className="attachment-thumb" src={src(doc.image)} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="document-icon"><FileText size={20} /></span>}<div><small>{doc.kind} · {doc.date}</small><h3>{doc.title}</h3>{doc.summary && <p>{doc.summary}</p>}<div className="knows-meta"><span><b>Scritto da</b>{doc.author}</span><span><b>ROSS</b>{useOf(doc)}</span><span><b>Lo vede</b>{doc.seenBy || "Staff e ROSS"}</span></div></div><ArrowRight size={17} /></button>;

  return <section className="content-section">
    {!current ? <>
      <div className="content-toolbar"><div><h2>Cosa sa ROSS di {name}</h2><p>Quattro cartelle con ciò che struttura e famiglia hanno dato a ROSS per {male ? "accompagnarlo" : "accompagnarla"}. {name} lo ritrova sul tablet in «Cosa ricordo di te». I documenti ufficiali restano nel gestionale.</p></div></div>
      <div className="folder-grid">{folders.map((f) => <button type="button" key={f.id} className={`folder-card surface folder-${f.color}`} onClick={() => setFolder(f.id)}>
        <span className="folder-icon"><Folder size={30} strokeWidth={1.6} /></span>
        <span className="folder-count">{count(f.id)}</span>
        <h3>{f.title(name)}</h3>
        <p>{f.hint(name, male)}</p>
        <small><b>Chi lo scrive</b>{f.who}</small>
      </button>)}</div>
    </> : <>
      <button type="button" className="folder-back" onClick={() => setFolder(null)}><ChevronLeft size={16} /> Tutte le cartelle</button>
      <div className={`content-toolbar folder-head folder-${current.color}`}><div><span className="folder-icon"><FolderOpen size={26} strokeWidth={1.6} /></span><div><h2>{current.title(name)}</h2><p>{current.hint(name, male)}</p></div></div>{current.id !== "giornata" && <div className="attachment-actions">{addMenu()}</div>}</div>
      {current.id === "giornata" && <div className="ross-check">
        <header><h3>Cosa sta per dire ROSS</h3><p>Controlla le parole di ROSS prima che {male ? "le senta lui" : "le senta lei"}. Se qualcosa non va, fermalo: ROSS non lo dirà finché non lo riprendi.</p></header>
        {upcoming.length ? <ul>{upcoming.map((u) => { const stop = paused.includes(`${resident.id}:${u.id}`); return <li key={u.id} className={`ross-check-item surface${stop ? " is-paused" : ""}${u.off ? " is-off" : ""}`}>
          <div className="ross-check-when"><strong>{u.when}</strong><span>{u.kind}</span></div>
          <div className="ross-check-body"><p className="ross-check-what">{u.what}</p>{u.line && <p className="reminder-line"><span>ROSS dirà</span>«{u.line}»</p>}<small>Da: {u.source}</small>{u.off && <small className="ross-check-off">{u.off}</small>}{stop && <small className="ross-check-off">Fermato: ROSS non lo dirà. Se è un promemoria dell'infermeria, avvisala di persona.</small>}</div>
          {!u.off && <button type="button" className={`s2-mark${stop ? " is-done" : ""}`} aria-pressed={stop} onClick={() => togglePause(`${resident.id}:${u.id}`)}>{stop ? <><Play size={15} />Riprendi</> : <><Pause size={15} />Qualcosa non va</>}</button>}
        </li>; })}</ul> : <p className="knows-empty">{current.empty(name)}</p>}
      </div>}
      {current.id === "giornata" && items.length > 0 && <h3 className="folder-subtitle">Documenti</h3>}
      {items.length ? <div className="document-list">{items.map(docCard)}</div> : current.id !== "giornata" && <p className="knows-empty">{current.empty(name)}</p>}
    </>}
    <Dialog open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title || ""} size="sm">
      {open && <div className="document-view"><span className="preview-tag">DOCUMENTO DIMOSTRATIVO</span><p className="document-view-meta">{open.kind} · {open.author} · {open.date}</p>
        {open.image && <img className="document-view-image" src={src(open.image)} alt={open.title} onError={(event) => { event.currentTarget.style.display = "none"; }} />}
        {open.summary && open.kind !== "Testo" && <p>{open.summary}</p>}
        {open.reminders && <ReminderDoc doc={open} name={name} />}
        {open.body && <dl>{open.body.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>}
        <p className="knows-source">Fonte: {sourceOf(open)} · ROSS: {useOf(open)} · Lo vede: {open.seenBy || "Staff e ROSS"}</p>
      </div>}
    </Dialog>
    <DataExplanation>ROSS usa questi documenti per accompagnare {name}: non interpreta referti né valori e non sostituisce il gestionale. Ciò che {name} racconta a ROSS resta tra loro.</DataExplanation>
  </section>;
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
