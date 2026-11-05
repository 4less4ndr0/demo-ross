import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ArrowRight, Check, Eye, MessageCircleHeart, Send, Sparkles, Users } from "lucide-react";
import { Avatar, StructureView } from "../components/Common";
import { Button, Textarea } from "../components/ui";
import { channelResident, channelResidents, receptions, spuntoTypeLabel, spuntoTypes, timingFor } from "../data/channel";
import { channelActions, useChannel } from "../state/channelStore";
import { useDemo } from "../state/DemoContext";
import { PassionNetwork } from "../components/PassionNetwork";

// Struttura 2.0: la struttura non interroga ROSS, gli propone uno spunto e riceve qualcosa in cambio.
// Due schede: «Il canale» (Proponi uno spunto · Cosa è emerso) e «Ospiti» (lista e ritratto della Struttura,
// con in più la scheda Spunti). Niente dashboard, punteggi o trascrizioni.
const BASE = "/struttura-2";
const MAX = 160;
const view = { base: BASE, v2: true };

export function StructureChannelLayout() {
  return (
    <StructureView.Provider value={view}>
      <div className="app-shell s2-app">
        <header className="s2-top">
          <div className="s2-brand"><span className="brand-mark">R</span><div><strong>R.O.S.S.</strong><small>Residenza Aurora</small></div></div>
          <nav className="top-tabs" aria-label="Sezioni">
            <NavLink to={BASE} end><Send size={16} /><span>Il canale</span></NavLink>
            <NavLink to={`${BASE}/ospiti`}><Users size={16} /><span>Ospiti</span></NavLink>
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
  const data = useChannel();
  const fresh = data.insights.filter((i) => i.state === "nuovo").length;

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

      <PassionNetwork />

      <div className="s2-columns">
        <ProposeCard spunti={data.spunti} />
        <section className="s2-feed" aria-labelledby="s2-feed-title">
          <div className="s2-feed-head">
            <div><span className="s2-eyebrow">Da ROSS, per te</span><h2 id="s2-feed-title">Cosa è emerso</h2></div>
            {fresh > 0 && <span className="s2-count">{fresh} {fresh === 1 ? "nuovo" : "nuovi"}</span>}
          </div>
          <ul className="s2-insights">{data.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}</ul>
        </section>
      </div>

      <p className="s2-footnote"><MessageCircleHeart size={16} />ROSS traduce, non trasmette: racconta come è stato accolto lo spunto e cosa può aiutare, mai cosa ha detto l'ospite.</p>
    </main>
  );
}

// «Proponi uno spunto». Con `fixedId` (nel ritratto) l'ospite è già scelto.
export function ProposeCard({ spunti, fixedId, prefill }) {
  const { state } = useDemo();
  const [residentId, setResidentId] = useState(fixedId || null);
  const [text, setText] = useState("");
  const [type, setType] = useState(null);
  const [sent, setSent] = useState(null);
  const field = useRef(null);
  // Dalla mappa dei legami (Come sta) arriva uno spunto già scritto, da rileggere prima di inviarlo.
  useEffect(() => { if (prefill?.text) { setText(prefill.text.slice(0, MAX)); setType(prefill.type || null); setSent(null); window.setTimeout(() => field.current?.focus(), 60); } }, [prefill?.text, prefill?.type]);
  // La modalità può cambiare dal ritratto: si legge sempre quella attuale.
  const live = (id) => id && { ...channelResident(id), mode: state.residents.find((r) => r.id === id)?.mode || channelResident(id).mode };
  const resident = live(residentId);
  const ready = resident && text.trim().length > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!ready) return;
    const spunto = { id: `sp-${Date.now()}`, residentId, text: text.trim(), type, status: "attesa", sentAt: Date.now() };
    channelActions.send(spunto);
    setSent(spunto);
    setText(""); setType(null);
  };

  const pending = spunti.filter((s) => s.status === "attesa");
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
          <ul>{pending.map((s) => <li key={s.id}><Avatar resident={channelResident(s.residentId)} size="sm" /><span>{s.text}</span></li>)}</ul>
        </div>
      )}
    </section>
  );
}

export function Reception({ value }) {
  return value ? <em className={`s2-reception is-${value}`}>{receptions[value]}</em> : null;
}

function InsightCard({ insight }) {
  const r = channelResident(insight.residentId);
  return (
    <li id={insight.id} className={`s2-card s2-insight is-${insight.state}${insight.simulated && insight.state === "nuovo" ? " is-arrived" : ""}`}>
      <header>
        <Avatar resident={r} size="lg" />
        <div><NavLink to={`${BASE}/ospiti/${r.id}?tab=spunti`} className="s2-name">{r.name}</NavLink><small>{insight.when} · stanza {r.room}</small></div>
        {insight.state === "nuovo" && <span className="s2-new">Nuovo</span>}
      </header>
      {insight.spunto
        ? <p className="s2-origin"><span>Dal tuo spunto{insight.spunto.type ? ` · ${spuntoTypeLabel(insight.spunto.type)}` : ""}<Reception value={insight.reception} /></span>«{insight.spunto.text}»</p>
        : <p className="s2-origin is-spontaneous"><span><Sparkles size={13} />L'ha raccontato {r.f ? "lei" : "lui"}, spontaneamente</span></p>}
      <p className="s2-story">{insight.story}</p>
      <p className="s2-suggestion"><span>Cosa puoi fare</span>{insight.suggestion}</p>
      <InsightFooter insight={insight} resident={r} />
    </li>
  );
}

export function InsightFooter({ insight, resident: r }) {
  return (
    <footer className="s2-insight-footer">
      {insight.consent !== false && <small className="s2-consent">{r.first} è {r.f ? "contenta" : "contento"} che tu lo sappia</small>}
      <div className="s2-actions">
        <button type="button" className="s2-mark" aria-pressed={insight.state !== "nuovo"} onClick={() => channelActions.mark(insight.id, "visto")}><Eye size={15} />Visto</button>
        <button type="button" className="s2-mark is-done" aria-pressed={insight.state === "fatto"} onClick={() => channelActions.mark(insight.id, "fatto")}><Check size={15} />Fatto</button>
      </div>
    </footer>
  );
}
