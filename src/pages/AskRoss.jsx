import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUp, BarChart3, BookOpen, FileText, Heart, MessageCircle, Mic, MoreHorizontal, Paperclip, Printer, RotateCcw, Sparkles, StickyNote, X } from "lucide-react";
import { answerQuestion, findResident, roles, suggestions } from "../data/chatScript";
import { useDemo } from "../state/DemoContext";
import { Avatar } from "../components/Common";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui";

const queryShortcuts = { turno: "Riassumimi il turno", fisioterapia: "Cosa dice la fisioterapia?", emerso: "Cosa è emerso oggi con Elena?" };
const sourceIcons = { "Biografia d'ingresso": BookOpen, Documento: FileText, "Nota operatore": StickyNote, Famiglia: Heart, "Dati ROSS": BarChart3 };

function guessKind(fileName) {
  const name = fileName.toLowerCase();
  if (/fisio|riabilit|motori/.test(name)) return "Fisioterapia";
  if (/sangue|analisi|esami|lab/.test(name)) return "Esami del sangue";
  if (/diari|consegn|nota/.test(name)) return "Diario di reparto";
  return "Documento";
}

export function AskRoss() {
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const threadRef = useRef(null);
  const handledQuery = useRef(null);
  const scopeId = params.get("ospite");
  const scoped = state.residents.find((r) => r.id === scopeId) || null;
  const role = roles.find((r) => r.id === state.role) || roles[1];

  const baseSuggestions = useMemo(() => {
    const list = scoped ? [`Come sta ${scoped.name.split(" ")[0]}?`, `Come posso coinvolgere ${scoped.name.split(" ")[0]}?`, ...suggestions[role.id].filter((s) => !/elena|carlo|ada|lucia|chi /i.test(s)).slice(0, 2)] : suggestions[role.id];
    return state.rossJourney.completedAt && !scoped ? ["Cosa è emerso oggi con Elena?", ...list.slice(0, 3)] : list;
  }, [role.id, scoped, state.rossJourney.completedAt]);

  const askRef = useRef(null);
  const ask = (question) => {
    const text = question.trim();
    if (!text) return;
    const id = Date.now();
    setMessages((prev) => [...prev, { id, from: "user", text }, { id: id + 1, from: "ross", pending: true }]);
    setInput("");
    window.setTimeout(() => {
      setMessages((prev) => prev.map((m) => m.id === id + 1 ? { ...m, pending: false, answer: answerQuestion(state, role.id, text, scopeId) } : m));
    }, 650);
  };

  askRef.current = ask;

  useEffect(() => {
    const q = params.get("q");
    if (!q || handledQuery.current === q) return;
    handledQuery.current = q;
    ask(queryShortcuts[q] || q);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    if (location.state?.focus) focus();
    const onAsk = (event) => askRef.current?.(event.detail);
    window.addEventListener("ross:focus-chat", focus);
    window.addEventListener("ross:ask", onAsk);
    return () => { window.removeEventListener("ross:focus-chat", focus); window.removeEventListener("ross:ask", onAsk); };
  }, [location.state]);

  useEffect(() => { threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const setScope = (residentId) => {
    const next = new URLSearchParams(params);
    if (residentId) next.set("ospite", residentId); else next.delete("ospite");
    setParams(next);
  };

  const listen = () => {
    setListening(true);
    window.setTimeout(() => { setListening(false); ask(scoped ? `Come sta ${scoped.name.split(" ")[0]}?` : "Come posso coinvolgere Elena?"); }, 1500);
  };

  const upload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const resident = scoped || findResident(state, file.name.replace(/[_-]/g, " ")) || state.residents[0];
    const kind = guessKind(file.name);
    const title = file.name.replace(/\.[^.]+$/, "");
    actions.addDocument({ residentId: resident.id, kind, title, summary: "Caricato ora. ROSS lo userà come fonte nelle risposte, citandolo." });
    const id = Date.now();
    setMessages((prev) => [...prev, { id, from: "user", attachment: file.name }, { id: id + 1, from: "ross", answer: {
      text: `Ho aggiunto «${title}» alla cartella di ${resident.name.split(" ")[0]} come ${kind.toLowerCase()}. Da ora posso usarlo per rispondere e lo citerò sempre come fonte. Non interpreto valori clinici: quelli restano al medico.`,
      residents: [resident.id],
      sources: [{ kind: "Documento", label: `${kind} · oggi` }],
      action: { label: "Apri i documenti", to: `/ospiti/${resident.id}?tab=documenti` },
    } }]);
  };


  return (
    <div className="ask-screen">
      <section className="ask-chat surface">
        <header className="ask-header">
          <div className="ask-title"><span className="brand-mark small">R</span><div><strong>Chiedi a ROSS</strong><small>Come stanno gli ospiti e di cosa hanno bisogno</small></div></div>
          <span className="ask-role-chip" title="Il ruolo si cambia dal profilo in basso a sinistra">come {role.label}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Altre azioni"><MoreHorizontal size={17} /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem icon={RotateCcw} disabled={!messages.length} onSelect={() => setMessages([])}>Nuova conversazione</DropdownMenuItem>
              <DropdownMenuItem icon={Paperclip} onSelect={() => fileRef.current?.click()}>Allega un documento</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={Printer} onSelect={() => navigate(`/report?ospite=${scoped?.id || "elena"}`)}>Report di {(scoped || state.residents[0]).name.split(" ")[0]}</DropdownMenuItem>
              <DropdownMenuItem icon={BarChart3} onSelect={() => navigate("/report?ambito=struttura")}>Report di struttura</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="ask-thread" ref={threadRef}>
          {!messages.length ? (
            <div className="ask-empty">
              <h1>{scoped ? `Cosa vuoi sapere su ${scoped.name.split(" ")[0]}?` : "Cosa vuoi sapere oggi?"}</h1>
              <p>{role.hint}. ROSS ti dice come stanno gli ospiti e di cosa hanno bisogno, mai di cosa hanno parlato.</p>
              <div className="ask-suggestions">{baseSuggestions.map((s) => <button key={s} onClick={() => ask(s)}><Sparkles size={15} />{s}</button>)}</div>
            </div>
          ) : messages.map((m) => m.from === "user"
            ? <div key={m.id} className="ask-msg ask-msg-user"><span className="ask-bubble">{m.attachment ? <span className="ask-attachment"><Paperclip size={14} />{m.attachment}</span> : m.text}</span></div>
            : <div key={m.id} className="ask-msg ask-msg-ross"><span className="ask-avatar">R</span>{m.pending ? <div className="ask-typing"><i /><i /><i /><small>Cerco nelle conversazioni e nei documenti…</small></div> : <Answer answer={m.answer} state={state} navigate={navigate} />}</div>)}
        </div>

        <footer className="ask-composer">
          {messages.length > 0 && <div className="ask-chips">{baseSuggestions.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}</div>}
          {scoped && <div className="ask-scope"><Avatar resident={scoped} size="sm" />Stai chiedendo su <strong>{scoped.name}</strong><button onClick={() => setScope(null)} aria-label="Rimuovi filtro ospite"><X size={14} /></button></div>}
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className={listening ? "listening" : ""}>
            <button type="button" className="ask-tool" onClick={() => fileRef.current?.click()} title="Allega un documento" aria-label="Allega un documento"><Paperclip size={18} /></button>
            <input ref={fileRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt" onChange={upload} />
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={listening ? "In ascolto…" : scoped ? `Chiedi qualcosa su ${scoped.name.split(" ")[0]}…` : "Chiedi di un ospite, del turno, di un documento…"} aria-label="Domanda per ROSS" />
            <button type="button" className={`ask-tool ${listening ? "active" : ""}`} onClick={listen} title="Detta la domanda" aria-label="Detta la domanda"><Mic size={18} /></button>
            <button className="ask-send" disabled={!input.trim()} aria-label="Invia"><ArrowUp size={18} /></button>
          </form>
          <small className="ask-disclaimer">ROSS non riporta mai il contenuto delle conversazioni. Non fa valutazioni cliniche.</small>
        </footer>
      </section>
    </div>
  );
}

function Answer({ answer, state, navigate }) {
  const people = (answer.residents || []).map((id) => state.residents.find((r) => r.id === id)).filter(Boolean);
  return (
    <div className="ask-answer">
      <p>{answer.text}</p>
      {answer.bullets?.length > 0 && <ul>{answer.bullets.map((b, i) => <li key={i}>{b.tag && <span className="ask-tag">{b.tag}</span>}<span>{b.text}</span></li>)}</ul>}
      {answer.after && <p className="ask-after">{answer.after}</p>}
      {people.length > 0 && <div className="ask-people">{people.map((r) => <button key={r.id} onClick={() => navigate(`/ospiti/${r.id}`)}><Avatar resident={r} size="sm" />{r.name.split(" ")[0]}</button>)}</div>}
      {answer.sources?.length > 0 && <div className="ask-sources"><span>Fonti</span>{answer.sources.map((s, i) => { const Icon = sourceIcons[s.kind] || FileText; return <span key={i} className="ask-source"><Icon size={13} /><strong>{s.kind}</strong>{s.label}</span>; })}</div>}
      {answer.action && <Button variant="outline" size="sm" onClick={() => navigate(answer.action.to)}>{answer.action.label} <ArrowRight size={15} /></Button>}
    </div>
  );
}
