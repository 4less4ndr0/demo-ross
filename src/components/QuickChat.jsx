import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUp, Check, MessageCircleQuestion, Pencil, X } from "lucide-react";
import { Avatar } from "./Common";
import { Button, Input, Sheet } from "./ui";
import { spuntoTypes } from "../data/channel";
import { draftSummary, greeting, quickAnswer } from "../data/quickChat";
import { channelActions, useMoments } from "../state/channelStore";

// Struttura 2.0 · «ROSS, al volo»: una bolla in basso a destra, sopra la pillola «Vista demo», e una piccola chat
// per domande veloci su ciò che ROSS ha già raccontato. Non interroga ROSS sugli ospiti: riassume, agisce con
// conferma (spunti e comunicazioni), spiega come funziona ROSS. Le risposte sono in src/data/quickChat.js.
// La conversazione vive solo nella sessione del browser (sessionStorage).
const KEY = "ross-quick-v1";
const loadMessages = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch { return []; } };
const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches;

export function QuickChat() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(isPhone);
  const [messages, setMessages] = useState(loadMessages);
  const [text, setText] = useState("");
  const moments = useMoments();
  const navigate = useNavigate();
  const bubble = useRef(null);
  const field = useRef(null);
  const end = useRef(null);

  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(messages)); } catch { /* ignora */ } }, [messages]);
  useEffect(() => { const mq = window.matchMedia("(max-width: 700px)"); const on = () => setPhone(mq.matches); mq.addEventListener("change", on); return () => mq.removeEventListener("change", on); }, []);
  // Con la bolla presente, i toast salgono sopra di lei (classe sul body, vedi styles.css).
  useEffect(() => { document.body.classList.add("has-quickchat"); return () => document.body.classList.remove("has-quickchat"); }, []);
  useEffect(() => { if (open) window.setTimeout(() => field.current?.focus(), 30); }, [open]);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [messages, open]);

  const close = () => { setOpen(false); window.setTimeout(() => bubble.current?.focus(), 30); };
  // Esc chiude il pannello su desktop (su telefono lo fa già il Sheet).
  useEffect(() => {
    if (!open || phone) return undefined;
    const onKey = (event) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phone]); // eslint-disable-line react-hooks/exhaustive-deps

  const ask = (question) => {
    const q = question.trim();
    if (!q) return;
    const id = Date.now();
    setMessages((list) => [...list, { id, from: "me", text: q }, { id: id + 1, from: "ross", ...quickAnswer(q, moments) }]);
    setText("");
  };
  const reply = (patch) => setMessages((list) => [...list, { id: Date.now(), from: "ross", ...patch }]);
  const setDraft = (id, patch) => setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const follow = (to) => {
    if (to === "#about") window.dispatchEvent(new Event("ross:about"));
    else navigate(to);
    if (phone) close(); // su telefono il pannello si chiude, su desktop resta aperto
  };

  const send = (message) => {
    const d = message.draft;
    if (d.kind === "spunto") {
      channelActions.send({ residentId: d.residentId, testo: d.testo, tipo: d.tipo });
      const s = draftSummary(d);
      setDraft(message.id, { draftState: "sent" });
      reply({ text: `Mandato. ROSS lo porterà a ${s.who.first} quando ne avrà occasione, e ti racconterà com'è andata.`, link: { label: `Apri il ritratto di ${s.who.first}`, to: `/struttura-2/ospiti/${d.residentId}?tab=spunti` } });
    } else {
      channelActions.announce({ testo: d.testo, perChi: d.perChi, quandoDirlo: d.quandoDirlo });
      setDraft(message.id, { draftState: "sent" });
      reply({ text: "Mandata. ROSS la dirà a ciascuno nel suo momento, con parole semplici.", link: { label: "Apri le richieste", to: "/struttura-2/richieste" } });
    }
  };

  const panel = <div className="s2-quick-body">
    <ol className="s2-quick-log" aria-live="polite">
      <RossMessage message={greeting} onPick={ask} onLink={follow} />
      {messages.map((m) => m.from === "me"
        ? <li key={m.id} className="s2-quick-me"><span>{m.text}</span></li>
        : <RossMessage key={m.id} message={m} onPick={ask} onLink={follow} onSend={() => send(m)} onCancel={() => { setDraft(m.id, { draftState: "cancelled" }); reply({ text: "Va bene, non lo mando." }); }} onEdit={(patch) => setDraft(m.id, { draft: { ...m.draft, ...patch } })} />)}
      <li ref={end} aria-hidden="true" />
    </ol>
    <form className="s2-quick-form" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
      <Input ref={field} value={text} onChange={(e) => setText(e.target.value)} placeholder="Chiedi o proponi al volo…" aria-label="Scrivi a ROSS" />
      <Button type="submit" size="icon" aria-label="Invia" disabled={!text.trim()}><ArrowUp size={17} /></Button>
    </form>
  </div>;

  return <>
    <button ref={bubble} type="button" className={`s2-quick-bubble${open ? " is-open" : ""}`} aria-label={open ? "Chiudi ROSS, al volo" : "Apri ROSS, al volo: domande veloci"} aria-expanded={open} aria-controls="s2-quick-panel" onClick={() => (open ? close() : setOpen(true))}>
      {open ? <X size={22} /> : <MessageCircleQuestion size={24} />}
    </button>
    {phone
      ? <Sheet open={open} onOpenChange={(next) => (next ? setOpen(true) : close())} side="right" title="ROSS, al volo" description="Domande veloci su ciò che ROSS ti ha già raccontato" className="s2-quick-sheet">{panel}</Sheet>
      : open && <section id="s2-quick-panel" className="s2-quick-panel" role="dialog" aria-modal="false" aria-labelledby="s2-quick-title" aria-describedby="s2-quick-sub">
          <header><div><h2 id="s2-quick-title">ROSS, al volo</h2><p id="s2-quick-sub">Domande veloci su ciò che ROSS ti ha già raccontato</p></div><button type="button" className="s2-quick-close" onClick={close} aria-label="Chiudi"><X size={18} /></button></header>
          {panel}
        </section>}
  </>;
}

// Un messaggio di ROSS: testo, fino a 3 voci, il link alla schermata giusta, pillole o una bozza da confermare.
function RossMessage({ message: m, onPick, onLink, onSend, onCancel, onEdit }) {
  return <li className="s2-quick-ross">
    <p>{m.text}</p>
    {m.items?.length > 0 && <ul>{m.items.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>}
    {m.draft && <DraftCard message={m} onSend={onSend} onCancel={onCancel} onEdit={onEdit} />}
    {m.link && <button type="button" className="s2-quick-link" onClick={() => onLink(m.link.to)}>{m.link.label} <ArrowRight size={13} /></button>}
    {m.suggestions?.length > 0 && <div className="s2-quick-pills">{m.suggestions.map((s) => <button type="button" key={s} onClick={() => onPick(s)}>{s}</button>)}</div>}
  </li>;
}

// La bozza: si manda solo con «Mando». «Modifica» permette di correggere il testo (e il tipo, per gli spunti).
function DraftCard({ message: m, onSend, onCancel, onEdit }) {
  const [editing, setEditing] = useState(false);
  const d = m.draft;
  const s = draftSummary(d);
  const done = m.draftState === "sent" || m.draftState === "cancelled";
  return <div className={`s2-quick-draft${done ? " is-done" : ""}`}>
    <span className="s2-quick-draft-kind">{d.kind === "spunto" ? "Spunto per ROSS" : "Comunicazione agli ospiti"}</span>
    <div className="s2-quick-draft-who">{s.who ? <><Avatar resident={s.who} size="sm" /><strong>{s.who.first}</strong></> : <strong>{s.target}</strong>}{d.kind === "spunto" && <small>{s.kind}</small>}{d.kind === "comunicazione" && <small>da dire oggi</small>}</div>
    {editing && !done
      ? <>
          <Input value={d.testo} maxLength={160} onChange={(e) => onEdit({ testo: e.target.value })} aria-label="Testo" />
          {d.kind === "spunto" && <div className="s2-quick-pills">{spuntoTypes.map((t) => <button type="button" key={t.id} aria-pressed={d.tipo === t.id} onClick={() => onEdit({ tipo: t.id })}>{t.label}</button>)}</div>}
        </>
      : <p className="s2-quick-draft-text">«{d.testo}»</p>}
    {d.kind === "comunicazione" && <small className="s2-quick-draft-phrase">ROSS lo dirà così: «{s.phrase}»</small>}
    {done
      ? <small className="s2-quick-draft-state">{m.draftState === "sent" ? <><Check size={13} /> Mandato</> : "Non mandato"}</small>
      : <div className="s2-quick-draft-actions"><span>{d.kind === "spunto" ? "Lo mando?" : "La mando?"}</span><Button size="sm" onClick={onSend} disabled={!d.testo.trim()}><Check size={14} /> Mando</Button><Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}><Pencil size={13} /> {editing ? "Fatto" : "Modifica"}</Button><Button size="sm" variant="ghost" onClick={onCancel}>Annulla</Button></div>}
  </div>;
}
