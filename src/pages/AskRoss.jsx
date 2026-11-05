import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUp, BellOff, BarChart3, BookOpen, FileText, Heart, MessageCircle, Mic, MoreHorizontal, Paperclip, Printer, RotateCcw, Sparkles, StickyNote, X } from "lucide-react";
import { answerQuestion, findResident, roleFor, suggestions } from "../data/chatScript";
import { attachmentFrom, useDemo } from "../state/DemoContext";
import { Avatar } from "../components/Common";
import { FileDocumentDialog, folderChoices, textDocument } from "../components/DocumentDialogs";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui";

const queryShortcuts = { turno: "Chi ha bisogno di più attenzione oggi?", fisioterapia: "Cosa dice la fisioterapia?", emerso: "Cosa è emerso oggi con Elena?" };
const sourceIcons = { "Biografia d'ingresso": BookOpen, Documento: FileText, "Nota operatore": StickyNote, Famiglia: Heart, "Dati ROSS": BarChart3 };



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
  const role = roleFor(state.role);

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
      const answer = answerQuestion(state, role.id, text, scopeId);
      setMessages((prev) => prev.map((m) => m.id === id + 1 ? { ...m, pending: false, answer } : m));
      // "Proponi ad Antonio…": in modalità Attiva la richiesta parte davvero (con "Annulla" nel toast).
      if (answer.effect?.type === "invite") actions.askRossToInvite(answer.effect);
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

  // Allegato dalla chat: scelto il file, si sceglie per chi è, il titolo e in quale cartella di «Cosa sa ROSS».
  const [pending, setPending] = useState(null);
  const [pendingFor, setPendingFor] = useState(null);
  const people = useMemo(() => [...state.residents].sort((a, b) => a.name.localeCompare(b.name, "it")), [state.residents]);
  const upload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPendingFor((scoped || findResident(state, file.name.replace(/[_-]/g, " ")) || state.residents[0]).id);
    setPending(file);
  };
  const attach = (file, wanted, family) => {
    const resident = state.residents.find((r) => r.id === pendingFor);
    const first = resident.name.split(" ")[0];
    const folder = folderChoices(first).find((f) => f.id === family)?.label;
    const reply = (doc) => {
      actions.addDocument({ ...doc, family });
      const id = Date.now();
      setMessages((prev) => [...prev, { id, from: "user", attachment: file.name }, { id: id + 1, from: "ross", answer: {
        text: `Ho messo «${doc.title}» in «Cosa sa ROSS» di ${first}, nella cartella «${folder}». Se serve lo cito come fonte; non interpreto referti né valori: restano a chi se ne occupa.`,
        residents: [resident.id],
        sources: [{ kind: "Documento", label: `${doc.kind} · oggi` }],
        action: { label: `Apri «${folder}»`, to: `/ospiti/${resident.id}?tab=allegati&cartella=${family}` },
      } }]);
    };
    // Un .txt si legge: il testo diventa il contenuto del documento.
    if (/\.txt$/i.test(file.name) || file.type === "text/plain") file.text().then((text) => reply(textDocument(resident.id, wanted, text)));
    else { const { kind, title, image } = attachmentFrom(file); reply({ residentId: resident.id, origin: "staff", kind, title: wanted.trim() || title, image, summary: "Allegato dalla chat." }); }
    setPending(null);
  };


  return (
    <div className="ask-screen">
      <FileDocumentDialog file={pending} onClose={() => setPending(null)} name={(people.find((r) => r.id === pendingFor)?.name || "").split(" ")[0]} choices={folderChoices((people.find((r) => r.id === pendingFor)?.name || "").split(" ")[0])} initial="persona" residents={people} residentId={pendingFor} onResidentChange={setPendingFor} onSave={attach} />
      <section className="ask-chat surface">
        <header className="ask-header">
          <div className="ask-title"><span className="brand-mark small">R</span><div><strong>Chiedi a ROSS</strong><small>Come stanno gli ospiti e di cosa hanno bisogno</small></div></div>
          <span className="ask-role-chip" title="Il ruolo si cambia dalla card in basso a sinistra">come {role.label}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Altre azioni"><MoreHorizontal size={17} /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem icon={RotateCcw} disabled={!messages.length} onSelect={() => setMessages([])}>Nuova conversazione</DropdownMenuItem>
              <DropdownMenuItem icon={Paperclip} onSelect={() => fileRef.current?.click()}>Allega una foto o un file</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={Printer} onSelect={() => navigate(`/report?ospite=${scoped?.id || "elena"}`)}>Report di {(scoped || state.residents[0]).name.split(" ")[0]}</DropdownMenuItem>
              <DropdownMenuItem icon={BarChart3} onSelect={() => navigate("/panoramica")}>Panoramica della struttura</DropdownMenuItem>
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
            : <div key={m.id} className="ask-msg ask-msg-ross"><span className="ask-avatar">R</span>{m.pending ? <div className="ask-typing"><i /><i /><i /><small>Raccolgo quello che ROSS ha notato…</small></div> : <Answer answer={m.answer} state={state} navigate={navigate} />}</div>)}
        </div>

        <footer className="ask-composer">
          {messages.length > 0 && <div className="ask-chips">{baseSuggestions.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}</div>}
          {scoped && <div className="ask-scope"><Avatar resident={scoped} size="sm" />Stai chiedendo su <strong>{scoped.name}</strong><button onClick={() => setScope(null)} aria-label="Rimuovi filtro ospite"><X size={14} /></button></div>}
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className={listening ? "listening" : ""}>
            <button type="button" className="ask-tool" onClick={() => fileRef.current?.click()} title="Allega una foto o un file" aria-label="Allega una foto o un file"><Paperclip size={18} /></button>
            <input ref={fileRef} type="file" hidden accept="image/*,.pdf,.doc,.docx,.txt" onChange={upload} />
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={listening ? "In ascolto…" : scoped ? `Chiedi qualcosa su ${scoped.name.split(" ")[0]}…` : "Chiedi di un ospite, di un bisogno, di un’attività…"} aria-label="Domanda per ROSS" />
            <button type="button" className={`ask-tool ${listening ? "active" : ""}`} onClick={listen} title="Detta la domanda" aria-label="Detta la domanda"><Mic size={18} /></button>
            <button className="ask-send" disabled={!input.trim()} aria-label="Invia"><ArrowUp size={18} /></button>
          </form>
          <small className="ask-disclaimer">ROSS non riporta mai il contenuto delle conversazioni e non giudica la salute di nessuno.</small>
        </footer>
      </section>
    </div>
  );
}

function Answer({ answer, state, navigate }) {
  const people = (answer.residents || []).map((id) => state.residents.find((r) => r.id === id)).filter(Boolean);
  return (
    <div className={`ask-answer ${answer.warning ? "ask-answer-warning" : ""}`}>
      {answer.warning ? <p className="ask-warning"><BellOff size={16} /><span>{answer.text}</span></p> : <p>{answer.text}</p>}
      {answer.bullets?.length > 0 && <ul>{answer.bullets.map((b, i) => <li key={i}>{b.tag && <span className="ask-tag">{b.tag}</span>}<span>{b.text}</span></li>)}</ul>}
      {answer.after && <p className="ask-after">{answer.after}</p>}
      {people.length > 0 && <div className="ask-people">{people.map((r) => <button key={r.id} onClick={() => navigate(`/ospiti/${r.id}`)}><Avatar resident={r} size="sm" />{r.name.split(" ")[0]}</button>)}</div>}
      {answer.sources?.length > 0 && <div className="ask-sources"><span>Fonti</span>{answer.sources.map((s, i) => { const Icon = sourceIcons[s.kind] || FileText; return <span key={i} className="ask-source"><Icon size={13} /><strong>{s.kind}</strong>{s.label}</span>; })}</div>}
      {answer.action && <Button variant="outline" size="sm" onClick={() => navigate(answer.action.to)}>{answer.action.label} <ArrowRight size={15} /></Button>}
    </div>
  );
}
