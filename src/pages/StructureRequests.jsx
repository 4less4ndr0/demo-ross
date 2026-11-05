import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Check, CircleCheck, Coffee, House, Megaphone, Repeat, Send, Thermometer, Users } from "lucide-react";
import { Avatar } from "../components/Common";
import { Button, Textarea } from "../components/ui";
import { channelResident, channelResidents, floorLabel, floorOf, floors } from "../data/channel";
import { daysAgo, whenText } from "../data/demoClock";
import { announcementPhrase, announcementStates, requestCategoryLabels } from "../data/moments";
import { channelActions, momentFilters, useMoments } from "../state/channelStore";

// Struttura 2.0 · scheda «Richieste» (/struttura-2/richieste): le cose pratiche, in due direzioni.
// Dagli ospiti: le richieste che hanno chiesto a ROSS di farti sapere e hanno confermato.
// Agli ospiti: le informazioni pratiche che vuoi far sapere a loro, che ROSS dice a ciascuno nel suo momento.
// Non è un sistema di ticket: niente priorità, assegnazioni, tempi di risposta, numeri o storico.
// Il canale resta dedicato alle relazioni (gli spunti).
const BASE = "/struttura-2";
const MAX = 160;
const categoryIcon = { stanza: House, comfort: Thermometer, desiderio: Coffee };

export function StructureRequests() {
  const moments = useMoments();
  const groups = [
    { id: "vedere", title: "Da vedere", items: moments.filter(momentFilters.daVedere), empty: "Niente di nuovo dagli ospiti." },
    { id: "pensiamo", title: "Ci pensiamo noi", items: moments.filter(momentFilters.ciPensiamo), empty: "Niente in corso." },
    { id: "fatte", title: "Fatte oggi", items: moments.filter(momentFilters.fatteOggi), empty: "Ancora niente, oggi." },
  ];
  const sent = moments.filter(momentFilters.comunicazioni);

  return (
    <main className="s2-main">
      <section className="s2-hero s2-hero-compact">
        <span className="s2-eyebrow">Richieste</span>
        <h1>Le cose pratiche, in due direzioni</h1>
        <p>Ciò che gli ospiti chiedono a ROSS di farti sapere, e ciò che vuoi far sapere a loro. Niente salute né urgenze: per quelle c'è il campanello.</p>
      </section>

      <section className="s2-rq-section" aria-labelledby="rq-from">
        <div className="s2-feed-head"><div><span className="s2-eyebrow">Dagli ospiti</span><h2 id="rq-from">Hanno chiesto a ROSS di fartelo sapere</h2><p className="s2-feed-lead">Piccole cose della stanza, del comfort o della giornata, che l'ospite ha chiesto e confermato. ROSS non deduce mai un problema da ciò che sente.</p></div></div>
        <div className="s2-rq-groups">
          {groups.map((g) => (
            <section key={g.id} className={`s2-rq-group is-${g.id}`} aria-label={g.title}>
              <h3>{g.title}</h3>
              {g.items.length ? <ul>{g.items.map((m) => <RequestCard key={m.id} moment={m} />)}</ul> : <p className="knows-empty">{g.empty}</p>}
            </section>
          ))}
        </div>
      </section>

      <section className="s2-rq-section" aria-labelledby="rq-to">
        <div className="s2-feed-head"><div><span className="s2-eyebrow">Agli ospiti</span><h2 id="rq-to">Fai sapere una cosa pratica</h2></div></div>
        <div className="s2-columns s2-rq-columns">
          <AnnounceCard />
          <section className="s2-rq-sent" aria-label="Comunicazioni inviate">
            <h3>Inviate a ROSS</h3>
            {sent.length ? <ul>{sent.map((m) => <AnnouncementRow key={m.id} moment={m} />)}</ul> : <p className="knows-empty">Nessuna comunicazione, per ora.</p>}
          </section>
        </div>
      </section>
    </main>
  );
}

// Una richiesta: chi, dove, quando, la richiesta in una riga, la categoria, «Confermato da …».
function RequestCard({ moment: m }) {
  const r = channelResident(m.residentId);
  const Icon = categoryIcon[m.categoria] || House;
  const again = m.richiestoDiNuovo && m.stato !== "fatto" && daysAgo(m.richiestoDiNuovo) <= 1 ? (daysAgo(m.richiestoDiNuovo) === 0 ? "L'ha chiesto di nuovo oggi" : "L'ha chiesto di nuovo ieri") : null;
  return (
    <li id={`m-${m.id}`} className={`s2-card s2-rq-card is-${m.stato}`}>
      <header>
        <Avatar resident={r} size="md" />
        <div><NavLink to={`${BASE}/ospiti/${r.id}?tab=conversazioni`} className="s2-name">{r.name}</NavLink><small>stanza {r.room} · {whenText(m.quando)}</small></div>
      </header>
      <p className="s2-rq-text"><span className="s2-rq-cat" title={requestCategoryLabels[m.categoria]}><Icon size={15} /></span>{m.richiesta}</p>
      <div className="s2-request-tags">
        <em className="s2-confirmed"><Check size={12} />Confermato da {r.first}</em>
        {again && <em className="s2-again"><Repeat size={12} />{again}</em>}
      </div>
      {m.stato === "fatto"
        ? <p className={`s2-rq-told${m.chiusoConOspite ? " is-told" : ""}`}>{m.chiusoConOspite ? <><CircleCheck size={14} /> ROSS gliel'ha detto</> : "ROSS glielo dirà alla prossima conversazione"}</p>
        : <div className="s2-actions">
            <button type="button" className="s2-mark" aria-pressed={m.stato === "ci_pensiamo"} onClick={() => channelActions.requestStep(m.id, "ci_pensiamo")}>Ci pensiamo noi</button>
            <button type="button" className="s2-mark is-done" onClick={() => channelActions.requestStep(m.id, "fatto")}><Check size={15} />Fatto</button>
          </div>}
    </li>
  );
}

// «Agli ospiti»: il testo, a chi, quando dirlo. Non è uno spunto: è un'informazione.
function AnnounceCard() {
  const [text, setText] = useState("");
  const [who, setWho] = useState("tutti");
  const [floor, setFloor] = useState(floors[0]);
  const [residentId, setResidentId] = useState(null);
  const [when, setWhen] = useState("oggi");
  const perChi = who === "tutti" ? { tipo: "tutti" } : who === "piano" ? { tipo: "piano", piano: floor } : { tipo: "ospite", residentId };
  const ready = text.trim() && (who !== "ospite" || residentId);
  const submit = (event) => { event.preventDefault(); if (!ready) return; channelActions.announce({ testo: text, perChi, quandoDirlo: when }); setText(""); };
  return (
    <section className="s2-card s2-propose s2-announce" aria-label="Fai sapere una cosa pratica agli ospiti">
      <form onSubmit={submit}>
        <label className="s2-field">
          <span className="s2-label">Cosa vuoi far sapere</span>
          <Textarea rows={3} maxLength={MAX} value={text} onChange={(e) => setText(e.target.value)} placeholder="Per esempio: domani mattina manca l'acqua calda fino alle 10" />
          <small className="s2-counter">{text.length}/{MAX}</small>
        </label>
        <fieldset className="s2-field">
          <legend>A chi</legend>
          <div className="s2-types">
            {[["tutti", "Tutti"], ["piano", "Un piano"], ["ospite", "Un ospite"]].map(([id, label]) => <button type="button" key={id} className="s2-chip" aria-pressed={who === id} onClick={() => setWho(id)}>{label}</button>)}
          </div>
          {who === "piano" && <div className="s2-types">{floors.map((f) => <button type="button" key={f} className="s2-chip" aria-pressed={floor === f} onClick={() => setFloor(f)}>{floorLabel(f)}</button>)}</div>}
          {who === "ospite" && <div className="s2-people">{channelResidents.map((r) => <button type="button" key={r.id} className="s2-person" aria-pressed={residentId === r.id} onClick={() => setResidentId(r.id)}><Avatar resident={r} size="lg" /><span>{r.first}</span></button>)}</div>}
        </fieldset>
        <fieldset className="s2-field">
          <legend>Quando dirlo</legend>
          <div className="s2-types">{[["oggi", "Oggi"], ["domani", "Domani mattina"]].map(([id, label]) => <button type="button" key={id} className="s2-chip" aria-pressed={when === id} onClick={() => setWhen(id)}>{label}</button>)}</div>
        </fieldset>
        {text.trim() && <p className="s2-rq-preview"><span>ROSS lo dirà così</span>«{announcementPhrase(text, when)}»</p>}
        <Button type="submit" className="s2-send" disabled={!ready}><Megaphone size={16} />Fallo sapere tramite ROSS</Button>
      </form>
      <p className="s2-rq-note">Non è uno spunto: è un'informazione. ROSS la dice a ciascuno nel suo momento, con parole semplici, e risponde alle domande. Per le cose importanti, ditelo anche di persona.</p>
    </section>
  );
}

// Una comunicazione inviata: il testo, a chi, quando, e a che punto è (a parole, mai con un conteggio).
function AnnouncementRow({ moment: m }) {
  const target = m.perChi?.tipo === "tutti" ? "Tutti gli ospiti" : m.perChi?.tipo === "piano" ? floorLabel(m.perChi.piano) : channelResident(m.perChi?.residentId)?.first;
  const peopleOf = m.perChi?.tipo === "ospite" ? [channelResident(m.perChi.residentId)] : m.perChi?.tipo === "piano" ? channelResidents.filter((r) => floorOf(r) === m.perChi.piano) : [];
  return (
    <li className={`s2-card s2-rq-sent-row is-${m.stato}`}>
      <p className="s2-rq-sent-text">{m.testo}</p>
      <div className="s2-rq-sent-meta">
        <span><Users size={13} />{target}</span>
        {peopleOf.length > 0 && <span className="s2-rq-faces">{peopleOf.slice(0, 4).map((r) => <Avatar key={r.id} resident={r} size="sm" />)}</span>}
        <small>{whenText(m.quando)} · {m.quandoDirlo === "domani" ? "da dire domani mattina" : "da dire oggi"}</small>
        <em className={`s2-rq-state is-${m.stato}`}>{m.stato === "detto" ? <CircleCheck size={12} /> : <Send size={12} />}{m.stato === "detto" && m.perChi?.tipo === "ospite" ? `Detto a ${target}` : announcementStates[m.stato]}</em>
      </div>
    </li>
  );
}
