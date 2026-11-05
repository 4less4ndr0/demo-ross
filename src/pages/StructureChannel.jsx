import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ArrowRight, BookOpen, Check, ClipboardList, Eye, MessageCircleHeart, Send, Sparkles, Users } from "lucide-react";
import { Avatar, StructureView } from "../components/Common";
import { Button, Textarea } from "../components/ui";
import { channelResident, channelResidents, spuntoTypeLabel, spuntoTypes, timingFor } from "../data/channel";
import { whenText } from "../data/demoClock";
import { esiti, labelOf, toneOf } from "../data/moments";
import { channelActions, momentFilters, useMoments } from "../state/channelStore";
import { useDemo } from "../state/DemoContext";
import { PassionNetwork } from "../components/PassionNetwork";

// Struttura 2.0: la struttura non interroga ROSS, gli propone uno spunto e riceve qualcosa in cambio.
// Due schede: «Il canale» (Proponi uno spunto · Cosa è emerso) e «Ospiti» (lista e ritratto della Struttura,
// con in più la scheda Spunti). Niente dashboard, punteggi o trascrizioni.
const BASE = "/struttura-2";
const MAX = 160;
const view = { base: BASE, v2: true };

export function StructureChannelLayout() {
  // La scheda «Richieste» mostra un pallino (senza numero) quando ci sono richieste da vedere.
  const toSee = useMoments().some(momentFilters.daVedere);
  return (
    <StructureView.Provider value={view}>
      <div className="app-shell s2-app">
        <header className="s2-top">
          <div className="s2-brand"><span className="brand-mark">R</span><div><strong>R.O.S.S.</strong><small>Residenza Aurora</small></div></div>
          <nav className="top-tabs" aria-label="Sezioni">
            <NavLink to={BASE} end><Send size={16} /><span>Il canale</span></NavLink>
            <NavLink to={`${BASE}/ospiti`}><Users size={16} /><span>Ospiti</span></NavLink>
            <NavLink to={`${BASE}/richieste`} className={({ isActive }) => `${isActive ? "active " : ""}${toSee ? "has-dot" : ""}`} aria-label={toSee ? "Richieste: ci sono richieste da vedere" : "Richieste"}><ClipboardList size={16} /><span>Richieste</span>{toSee && <i className="s2-tab-dot" aria-hidden="true" />}</NavLink>
          </nav>
          <span className="s2-top-spacer" aria-hidden="true" />
        </header>
        <Outlet />
      </div>
    </StructureView.Provider>
  );
}

// Ospiti e ritratto sono quelli della Struttura: qui stanno dentro la pagina della Struttura 2.0.
export function StructureChannelPage({ children }) {
  return <main className="page s2-page">{children}</main>;
}

export function StructureChannel() {
  const moments = useMoments();
  // «Cosa è emerso»: per tutti gli ospiti, cosa fare adesso (vedi momentFilters.canale).
  const feed = moments.filter(momentFilters.canale);
  const toSee = moments.filter(momentFilters.daVedere).length;
  const fresh = feed.filter((m) => m.stato === "nuovo").length;

  return (
    <main className="s2-main">
      <section className="s2-hero">
        <span className="s2-eyebrow">Il canale con ROSS</span>
        <h1>Tu porti uno spunto.<br />ROSS ti restituisce un'occasione.</h1>
        <p>ROSS non è un archivio da consultare. Porta le tue proposte nella conversazione con gli ospiti, solo se ci stanno, e ti racconta cosa è emerso per aiutarli a stare meglio.</p>
        <ol className="s2-flow" aria-label="Come funziona">
          <li><span>1</span><div><b>Tu</b>proponi uno spunto per un ospite</div></li>
          <li aria-hidden="true" className="s2-flow-arrow"><ArrowRight size={18} /></li>
          <li><span>2</span><div><b>ROSS</b>ne parla con l'ospite, se ci sta</div></li>
          <li aria-hidden="true" className="s2-flow-arrow"><ArrowRight size={18} /></li>
          <li><span>3</span><div><b>Tu</b>ricevi cosa è emerso e cosa puoi fare</div></li>
        </ol>
      </section>

      {/* Le cose pratiche stanno nella scheda «Richieste»: qui solo un rimando discreto, se c'è qualcosa da vedere. */}
      {toSee > 0 && <NavLink to={`${BASE}/richieste`} className="s2-rq-link"><ClipboardList size={15} />{toSee === 1 ? "1 richiesta nuova dagli ospiti" : `${toSee} richieste nuove dagli ospiti`} <ArrowRight size={14} /> Richieste</NavLink>}

      <PassionNetwork />

      <div className="s2-columns">
        <ProposeCard />
        <section className="s2-feed" aria-labelledby="s2-feed-title">
          <div className="s2-feed-head">
            <div><span className="s2-eyebrow">Da ROSS, per te</span><h2 id="s2-feed-title">Cosa è emerso</h2><p className="s2-feed-lead">Cosa puoi fare adesso, per tutti gli ospiti: gli ultimi 7 giorni, finché non lo segni come fatto. La storia di ciascuno è nel suo ritratto.</p></div>
            {fresh > 0 && <span className="s2-count">{fresh} {fresh === 1 ? "nuovo" : "nuovi"}</span>}
          </div>
          {feed.length ? <ul className="s2-insights">{feed.map((m) => <MomentCard key={m.id} moment={m} />)}</ul> : <p className="knows-empty">Per ora niente da fare: quando emerge qualcosa di utile, ROSS te lo racconta qui.</p>}
        </section>
      </div>

      <p className="s2-footnote"><MessageCircleHeart size={16} />ROSS traduce, non trasmette: racconta come è stato accolto lo spunto e cosa può aiutare, mai cosa ha detto l'ospite.</p>
    </main>
  );
}

// «Proponi uno spunto». Con `fixedId` (nel ritratto) l'ospite è già scelto.
export function ProposeCard({ fixedId, prefill }) {
  const { state } = useDemo();
  const moments = useMoments();
  const [residentId, setResidentId] = useState(fixedId || null);
  const [text, setText] = useState("");
  const [type, setType] = useState(null);
  const [sent, setSent] = useState(null);
  const field = useRef(null);
  // Dalle passioni del ritratto arriva uno spunto già scritto, da rileggere prima di inviarlo.
  useEffect(() => { if (prefill?.text) { setText(prefill.text.slice(0, MAX)); setType(prefill.type || null); setSent(null); window.setTimeout(() => field.current?.focus(), 60); } }, [prefill?.text, prefill?.type]);
  // La modalità può cambiare dal ritratto: si legge sempre quella attuale.
  const live = (id) => id && { ...channelResident(id), mode: state.residents.find((r) => r.id === id)?.mode || channelResident(id).mode };
  const resident = live(residentId);
  const ready = resident && text.trim().length > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!ready) return;
    setSent(channelActions.send({ residentId, testo: text.trim(), tipo: type }));
    setText(""); setType(null);
  };

  const pending = moments.filter((m) => m.esito === "attesa");
  const who = fixedId ? `${resident.first} è liber${resident.f ? "a" : "o"}` : "l'ospite è libero";

  return (
    <section className="s2-card s2-propose" aria-labelledby="s2-propose-title">
      <span className="s2-eyebrow">Dalla struttura, per ROSS</span>
      <h2 id="s2-propose-title">{fixedId ? `Proponi uno spunto per ${resident.first}` : "Proponi uno spunto"}</h2>
      <p className="s2-lead">Un'attività in programma, un ricordo da riprendere, un evento, una persona da nominare. ROSS lo porterà nella conversazione in modo naturale: {who} di non seguirlo.</p>

      <form onSubmit={submit}>
        {!fixedId && (
          <fieldset className="s2-field">
            <legend>Per chi</legend>
            <div className="s2-people">
              {channelResidents.map((r) => (
                <button type="button" key={r.id} className="s2-person" aria-pressed={residentId === r.id} onClick={() => { setResidentId(r.id); setSent(null); window.setTimeout(() => field.current?.focus(), 0); }}>
                  <Avatar resident={r} size="lg" />
                  <span>{r.first}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <label className="s2-field">
          <span className="s2-label">Lo spunto</span>
          <Textarea ref={field} rows={3} maxLength={MAX} value={text} onChange={(e) => { setText(e.target.value); setSent(null); }} placeholder={resident ? `Per esempio: giovedì c'è il laboratorio di cucito, ${resident.first} potrebbe venire?` : "Prima scegli l'ospite"} disabled={!resident} />
          <small className="s2-counter">{text.length}/{MAX}</small>
        </label>

        <fieldset className="s2-field">
          <legend>Che cos'è <small>(se vuoi)</small></legend>
          <div className="s2-types">
            {spuntoTypes.map((t) => <button type="button" key={t.id} className="s2-chip" aria-pressed={type === t.id} onClick={() => setType(type === t.id ? null : t.id)}>{t.label}</button>)}
          </div>
        </fieldset>

        {resident && !sent && <p className="s2-timing">{timingFor(resident)}</p>}
        <Button type="submit" className="s2-send" disabled={!ready}><Send size={16} />Invia a ROSS</Button>
      </form>

      {sent && (
        <div className="s2-sent" role="status">
          <Check size={18} />
          <div><strong>Inviato a ROSS.</strong> {timingFor(live(sent.residentId))} Se emerge qualcosa di utile, te lo racconterà {fixedId ? "qui" : "qui accanto"}.</div>
        </div>
      )}

      {!fixedId && pending.length > 0 && (
        <div className="s2-pending">
          <span className="s2-label">In attesa del momento giusto</span>
          <ul>{pending.map((m) => <li key={m.id}><Avatar resident={channelResident(m.residentId)} size="sm" /><span>{m.spunto.testo}</span></li>)}</ul>
        </div>
      )}
    </section>
  );
}

// L'esito di uno spunto, come pillola.
const esitoClass = { accolto: "volentieri", pensa: "pensa", no: "no", non_ora: "non-ora", attesa: "attesa" };
export function Esito({ value }) {
  return value ? <em className={`s2-reception is-${esitoClass[value]}`}>{esiti[value]}</em> : null;
}

// Il momento come card completa del canale: chi, quando, da dove nasce, cosa è emerso, cosa puoi fare.
function MomentCard({ moment: m }) {
  const r = channelResident(m.residentId);
  const tone = toneOf(m);
  return (
    <li id={`m-${m.id}`} className={`s2-card s2-insight is-${m.stato}${m.simulato && m.stato === "nuovo" ? " is-arrived" : ""}`}>
      <header>
        <Avatar resident={r} size="lg" />
        <div><NavLink to={`${BASE}/ospiti/${r.id}?tab=conversazioni`} className="s2-name">{r.name}</NavLink><small>{whenText(m.quando)} · stanza {r.room}</small></div>
        {m.stato === "nuovo" && <span className="s2-new">Nuovo</span>}
      </header>
      {m.origine === "spunto"
        ? <p className="s2-origin"><span>Dal tuo spunto{m.spunto.tipo ? ` · ${spuntoTypeLabel(m.spunto.tipo)}` : ""}<Esito value={m.esito} /></span>«{m.spunto.testo}»</p>
        : <p className={`s2-origin is-${tone === "watch" ? "watch" : "spontaneous"}`}><span>{tone === "watch" ? <Eye size={13} /> : <Sparkles size={13} />}{labelOf(m)}</span></p>}
      <p className="s2-story">{m.titolo ? <><b>{m.titolo}.</b> {m.racconto}</> : m.racconto}</p>
      <p className="s2-suggestion"><span>Cosa puoi fare</span>{m.cosaPuoiFare}</p>
      <MomentActions moment={m} />
      <NavLink to={`${BASE}/ospiti/${r.id}?tab=conversazioni`} className="s2-story-link"><BookOpen size={14} /> Vedi la storia di {r.first}</NavLink>
    </li>
  );
}

// Consenso e Visto/Fatto: lo stesso stato in tutte le viste.
export function MomentActions({ moment: m, compact }) {
  const r = channelResident(m.residentId);
  const consent = m.consenso !== false && ["spunto", "spontaneo", "scelta"].includes(m.origine);
  return (
    <footer className={`s2-insight-footer${compact ? " is-compact" : ""}`}>
      {consent && !compact && <small className="s2-consent">{r.first} è {r.f ? "contenta" : "contento"} che tu lo sappia</small>}
      <div className="s2-actions">
        <button type="button" className="s2-mark" aria-pressed={m.stato !== "nuovo"} onClick={() => channelActions.mark(m.id, "visto")}><Eye size={15} />Visto</button>
        <button type="button" className="s2-mark is-done" aria-pressed={m.stato === "fatto"} onClick={() => channelActions.mark(m.id, "fatto")}><Check size={15} />Fatto</button>
      </div>
    </footer>
  );
}
