import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Eye, MessageCircleHeart, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "../components/Common";
import { Button, Textarea } from "../components/ui";
import { channelResident, channelResidents, initialInsights, simulatedInsight, spuntoTypeLabel, spuntoTypes, timingFor } from "../data/channel";

// Struttura 2.0: la struttura non interroga ROSS, gli propone uno spunto e riceve qualcosa in cambio.
// Due funzioni sole: «Proponi uno spunto» e «Cosa è emerso». Niente dashboard, punteggi o trascrizioni.
const STORAGE_KEY = "ross-struttura2-v1";
const MAX = 160;
const REPLY_DELAY = 6000; // demo: ROSS «risponde» dopo pochi secondi

const load = () => {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved?.insights) return saved; } catch { /* storage non disponibile */ }
  return { insights: initialInsights, spunti: [] };
};

export function StructureChannel() {
  const [data, setData] = useState(load);
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignora */ } }, [data]);

  // ROSS restituisce un insight per ogni spunto in attesa (nella demo dopo pochi secondi).
  useEffect(() => {
    const timers = data.spunti.filter((s) => s.status === "attesa").map((spunto) => window.setTimeout(() => {
      const insight = simulatedInsight(spunto);
      setData((current) => ({
        insights: current.insights.some((i) => i.id === insight.id) ? current.insights : [insight, ...current.insights],
        spunti: current.spunti.map((s) => (s.id === spunto.id ? { ...s, status: "ripreso" } : s)),
      }));
      toast(`ROSS ti racconta qualcosa su ${channelResident(spunto.residentId).first}`, {
        description: "È in cima a «Cosa è emerso».",
        action: { label: "Leggi", onClick: () => document.getElementById(insight.id)?.scrollIntoView({ behavior: "smooth", block: "center" }) },
      });
    }, REPLY_DELAY));
    return () => timers.forEach(window.clearTimeout);
  }, [data.spunti]);

  const send = (spunto) => setData((current) => ({ ...current, spunti: [spunto, ...current.spunti] }));

  const mark = (id, next) => {
    const before = dataRef.current;
    const insight = before.insights.find((i) => i.id === id);
    const state = insight.state === next ? (next === "fatto" ? "visto" : "nuovo") : next;
    setData({ ...before, insights: before.insights.map((i) => (i.id === id ? { ...i, state } : i)) });
    const first = channelResident(insight.residentId).first;
    const label = { nuovo: "Segnato come nuovo", visto: `Visto: ${first}`, fatto: `Fatto: ${first}` }[state];
    toast(label, { action: { label: "Annulla", onClick: () => setData(before) } });
  };

  const fresh = data.insights.filter((i) => i.state === "nuovo").length;

  return (
    <div className="s2-app">
      <header className="s2-top">
        <div className="s2-brand"><span className="brand-mark">R</span><div><strong>R.O.S.S.</strong><small>Residenza Aurora</small></div></div>
      </header>

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

        <div className="s2-columns">
          <ProposeCard onSend={send} spunti={data.spunti} />
          <section className="s2-feed" aria-labelledby="s2-feed-title">
            <div className="s2-feed-head">
              <div><span className="s2-eyebrow">Da ROSS, per te</span><h2 id="s2-feed-title">Cosa è emerso</h2></div>
              {fresh > 0 && <span className="s2-count">{fresh} {fresh === 1 ? "nuovo" : "nuovi"}</span>}
            </div>
            <ul className="s2-insights">{data.insights.map((insight) => <InsightCard key={insight.id} insight={insight} onMark={mark} />)}</ul>
          </section>
        </div>

        <p className="s2-footnote"><MessageCircleHeart size={16} />ROSS traduce, non trasmette: nessuna trascrizione delle conversazioni, solo ciò che può aiutare l'ospite, con il suo permesso.</p>
      </main>
    </div>
  );
}

function ProposeCard({ onSend, spunti }) {
  const [residentId, setResidentId] = useState(null);
  const [text, setText] = useState("");
  const [type, setType] = useState(null);
  const [sent, setSent] = useState(null);
  const field = useRef(null);
  const resident = residentId && channelResident(residentId);
  const ready = resident && text.trim().length > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!ready) return;
    const spunto = { id: `sp-${Date.now()}`, residentId, text: text.trim(), type, status: "attesa", sentAt: Date.now() };
    onSend(spunto);
    setSent(spunto);
    setText(""); setType(null);
  };

  const pending = useMemo(() => spunti.filter((s) => s.status === "attesa"), [spunti]);

  return (
    <section className="s2-card s2-propose" aria-labelledby="s2-propose-title">
      <span className="s2-eyebrow">Dalla struttura, per ROSS</span>
      <h2 id="s2-propose-title">Proponi uno spunto</h2>
      <p className="s2-lead">Un'attività in programma, un ricordo da riprendere, un evento, una persona da nominare. ROSS lo porterà nella conversazione in modo naturale: l'ospite è libero di non seguirlo.</p>

      <form onSubmit={submit}>
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
          <div><strong>Inviato a ROSS.</strong> {timingFor(channelResident(sent.residentId))} Se emerge qualcosa di utile, te lo racconterà qui accanto.</div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="s2-pending">
          <span className="s2-label">In attesa del momento giusto</span>
          <ul>{pending.map((s) => <li key={s.id}><Avatar resident={channelResident(s.residentId)} size="sm" /><span>{s.text}</span></li>)}</ul>
        </div>
      )}
    </section>
  );
}

function InsightCard({ insight, onMark }) {
  const r = channelResident(insight.residentId);
  return (
    <li id={insight.id} className={`s2-card s2-insight is-${insight.state}${insight.simulated && insight.state === "nuovo" ? " is-arrived" : ""}`}>
      <header>
        <Avatar resident={r} size="lg" />
        <div><strong>{r.name}</strong><small>{insight.when} · stanza {r.room}</small></div>
        {insight.state === "nuovo" && <span className="s2-new">Nuovo</span>}
      </header>
      {insight.spunto
        ? <p className="s2-origin"><span>Dal tuo spunto{insight.spunto.type ? ` · ${spuntoTypeLabel(insight.spunto.type)}` : ""}</span>«{insight.spunto.text}»</p>
        : <p className="s2-origin is-spontaneous"><span><Sparkles size={13} />L'ha raccontato {r.f ? "lei" : "lui"}, spontaneamente</span></p>}
      <p className="s2-story">{insight.story}</p>
      <p className="s2-suggestion"><span>Cosa puoi fare</span>{insight.suggestion}</p>
      <footer>
        {insight.consent !== false && <small className="s2-consent">{r.first} è {r.f ? "contenta" : "contento"} che tu lo sappia</small>}
        <div className="s2-actions">
          <button type="button" className="s2-mark" aria-pressed={insight.state !== "nuovo"} onClick={() => onMark(insight.id, "visto")}><Eye size={15} />Visto</button>
          <button type="button" className="s2-mark is-done" aria-pressed={insight.state === "fatto"} onClick={() => onMark(insight.id, "fatto")}><Check size={15} />Fatto</button>
        </div>
      </footer>
    </li>
  );
}
