import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookHeart, Check, CircleHelp, Headphones, Images, MessageCircle, Mic, Music2, Pause, Play, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../components/Common";
import { useDemo } from "../state/DemoContext";
import { asset } from "../asset.js";

const conversation = [
  { speaker: "ross", state: "response", line: "Ciao Elena. Ti va di stare un po’ insieme?", support: "ROSS inizia senza imporre un argomento." },
  { speaker: "elena", state: "listening", line: "Sì, volentieri. Oggi ho ascoltato Mina.", support: "Elena sceglie il punto di partenza." },
  { speaker: "ross", state: "processing", line: "Mi hai raccontato che Mina ti ricorda i pomeriggi in cucina. Vuoi restare sulla musica o guardiamo una fotografia?", support: "Usa solo una memoria già confermata e offre una scelta." },
  { speaker: "elena", state: "listening", line: "Guardiamo quella del mare. Era in Sicilia, con Paolo.", support: "Il racconto porta spontaneamente a un ricordo personale." },
  { speaker: "ross", state: "response", line: "Ricordo il viaggio del 1998: Palermo e Cefalù. Cosa ti piaceva di quelle passeggiate?", support: "Recupera luogo, anno e persona dalla storia confermata." },
  { speaker: "elena", state: "listening", line: "La luce della sera. Paolo portava sempre una piccola macchina fotografica rossa.", support: "Emerge un dettaglio nuovo, ancora da verificare." },
  { speaker: "ross", state: "processing", line: "Questa della macchina fotografica rossa è una cosa nuova per me. La tengo come ricordo da verificare, va bene?", support: "ROSS distingue il nuovo dettaglio da ciò che sa già." },
  { speaker: "elena", state: "listening", line: "Sì. Mi fotografava sul lungomare e poi rideva perché chiudevo gli occhi.", support: "Elena conferma che il dettaglio può essere conservato." },
  { speaker: "ross", state: "activity", line: "La prossima volta possiamo guardare altre fotografie di Cefalù, oppure ascoltare ancora Mina. Per oggi possiamo fermarci qui.", support: "Chiude con una proposta coerente e senza insistere." },
];

const stateCopy = {
  rest: ["Sono qui", "Prenditi il tuo tempo"],
  listening: ["Ti ascolto", "Puoi parlare con calma"],
  processing: ["Sto collegando il ricordo", "Un momento…"],
  response: ["Parliamo insieme", "Una cosa alla volta"],
  activity: ["Possiamo fare qualcosa", "Scegli tu"],
};

export function RossHome() {
  const { state, actions, notify } = useDemo();
  const navigate = useNavigate();
  const [panel, setPanel] = useState(null);
  const [rossState, setRossState] = useState("rest");
  const elena = state.residents.find((resident) => resident.id === "elena");
  const modes = ["Attiva", "Reattiva", "Silenziosa", "Riposo"];
  const completed = Boolean(state.rossJourney.completedAt);
  const copy = stateCopy[rossState];
  const sharedPhoto = state.familyContributions.find((item) => item.kind === "photo" && item.image);
  const sharedMusic = state.familyContributions.find((item) => item.kind === "music");
  const scheduled = state.scheduledActivities.find((item) => item.residentId === "elena");

  useEffect(() => {
    const timer = window.setTimeout(() => setRossState("response"), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const chooseMode = (mode) => {
    actions.setResidentMode("elena", mode);
    setRossState(mode === "Riposo" || mode === "Silenziosa" ? "rest" : "response");
  };

  return (
    <div className="ross-app screen-enter" data-ross-state={rossState}>
      <header className="ross-header">
        <div className="ross-wordmark"><span>R</span><strong>ROSS</strong></div>
        <button type="button" className="ross-volume" aria-label="Volume"><Volume2 /></button>
      </header>

      <main className="ross-home-main">
        <section className="ross-presence">
          <div className="ross-halo" />
          <img src={asset("ross-eyes.png")} alt="Gli occhi luminosi di ROSS" className="ross-eyes" />
          <span className="ross-state-label"><i /> {rossState === "rest" ? "In riposo" : rossState === "listening" ? "Ti ascolto" : rossState === "processing" ? "Sto pensando" : rossState === "activity" ? "Attività" : "Con te"}</span>
          <h1>{copy[0]}, Elena.</h1>
          <p>{copy[1]}</p>
          <button type="button" className="ross-talk" onClick={() => navigate("/ross/conversazione")}><span><Mic /></span><strong>{completed ? "Parliamo ancora" : "Parla con ROSS"}</strong><small>Tocca per iniziare</small></button>
        </section>

        <section className="ross-touch-grid" aria-label="Cosa vuoi fare">
          <button onClick={() => setPanel("memories")}><Images /><span><strong>Ricordi e foto</strong><small>Guardiamo insieme</small></span><ArrowRight /></button>
          <button onClick={() => setPanel("activities")}><Sparkles /><span><strong>Attività</strong><small>Qualcosa di leggero</small></span><ArrowRight /></button>
          <button onClick={() => setPanel("music")}><Headphones /><span><strong>Musica</strong><small>Le tue canzoni</small></span><ArrowRight /></button>
          <button onClick={() => setPanel("help")}><CircleHelp /><span><strong>Aiuto</strong><small>Chiedi a ROSS</small></span><ArrowRight /></button>
        </section>

        <section className="ross-modes">
          <span>COME VUOI CHE ROSS STIA CON TE?</span>
          <div>{modes.map((mode) => <button key={mode} className={elena.mode === mode ? "active" : ""} onClick={() => chooseMode(mode)}><i />{mode}</button>)}</div>
        </section>
      </main>

      <Modal open={Boolean(panel)} title={panel === "memories" ? "Ricordi e fotografie" : panel === "activities" ? "Cosa facciamo?" : panel === "music" ? "Musica per te" : "Come posso aiutarti?"} onClose={() => setPanel(null)} size="lg">
        {panel === "memories" && <div className="ross-modal-choices"><button onClick={() => navigate("/ross/conversazione")}>{sharedPhoto?.image ? <img className="ross-choice-image" src={sharedPhoto.image} alt={`Foto condivisa dalla famiglia: ${sharedPhoto.title}`} /> : <span className="choice-art photo"><Images /></span>}<strong>{sharedPhoto?.title || "Il viaggio in Sicilia"}</strong><small>{sharedPhoto ? "Condivisa da Anna · pronta da guardare insieme" : "Palermo, Cefalù e le fotografie del 1998"}</small></button><button onClick={() => notify("Ricordo pronto per la prossima conversazione")}><img className="ross-choice-image" src={asset("garden-photo.svg")} alt="Gerani rossi sul balcone" /><strong>I gerani sul balcone</strong><small>Una piccola abitudine del mattino</small></button></div>}
        {panel === "activities" && <div className="ross-modal-choices"><button onClick={() => { notify("Attività avviata: Indovina la canzone"); setPanel(null); setRossState("activity"); }}><span className="choice-art music"><Music2 /></span><strong>Indovina la canzone</strong><small>Dieci minuti, senza fretta</small></button><button onClick={() => { notify("Attività avviata: Fotografie di viaggio"); setPanel(null); setRossState("activity"); }}><span className="choice-art photo"><Images /></span><strong>{scheduled?.title || "Fotografie di viaggio"}</strong><small>{scheduled ? `Preparata per domani alle ${scheduled.time}` : "Scegliamo una foto e ne parliamo"}</small></button></div>}
        {panel === "music" && <div className="ross-playlist">{[sharedMusic?.title, "Se telefonando · Mina", "Il cielo in una stanza · Gino Paoli", "Azzurro · Adriano Celentano"].filter(Boolean).map((track, index) => <button key={track} onClick={() => { notify(`In riproduzione: ${track.split(" · ")[0]}`); setRossState("activity"); setPanel(null); }}><span>{index + 1}</span><strong>{track}</strong><Play fill="currentColor" /></button>)}</div>}
        {panel === "help" && <div className="ross-help"><CircleHelp /><h3>Dimmi cosa ti serve.</h3><p>Puoi dire “chiama un operatore”, “abbassa il volume” oppure “voglio riposare”. Questa demo non effettua chiamate reali.</p><button className="primary-button" onClick={() => { chooseMode("Riposo"); setPanel(null); }}>Voglio riposare</button></div>}
      </Modal>
    </div>
  );
}

export function RossConversation() {
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const [step, setStep] = useState(state.rossJourney.stage === "complete" ? conversation.length : 0);
  const [paused, setPaused] = useState(false);
  const complete = step >= conversation.length;
  const current = conversation[Math.min(step, conversation.length - 1)];
  const visible = useMemo(() => conversation.slice(0, Math.min(step + 1, conversation.length)), [step]);

  useEffect(() => {
    if (!complete) actions.setRossStage(`step-${step + 1}`);
  }, [step]);

  const next = () => {
    if (step === conversation.length - 1) {
      actions.completeRossConversation();
      setStep(conversation.length);
      return;
    }
    setStep((value) => value + 1);
  };

  const restart = () => {
    actions.restartRossJourney();
    setStep(0);
  };

  if (complete) {
    return <div className="ross-app ross-conversation-complete screen-enter" data-ross-state="rest">
      <header className="ross-header"><button onClick={() => navigate("/ross")}><ArrowLeft /> Home</button><div className="ross-wordmark"><span>R</span><strong>ROSS</strong></div><span /></header>
      <main>
        <img src={asset("ross-eyes.png")} alt="Gli occhi luminosi di ROSS" className="ross-eyes complete" />
        <span className="completion-check"><Check /></span>
        <h1>Grazie, Elena.</h1>
        <p>Ho salvato la nostra conversazione. Il nuovo dettaglio resterà da verificare prima di entrare nella tua storia.</p>
        <article><span>NUOVO RICORDO DA VERIFICARE</span><h2>La macchina fotografica rossa di Paolo</h2><p>Collegata a Cefalù, al viaggio del 1998 e alle fotografie.</p><div><span>Conversazione salvata</span><ArrowRight /><span>Verifica struttura</span><ArrowRight /><span>Profilo e famiglia</span></div></article>
        <div className="ross-complete-actions"><button className="ross-primary-action" onClick={() => navigate("/ross")}><ArrowLeft /> Torna alla home</button><button onClick={restart}><RotateCcw /> Ripeti la demo</button></div>
      </main>
    </div>;
  }

  return (
    <div className="ross-app ross-conversation screen-enter" data-ross-state={current.state}>
      <header className="ross-header"><button onClick={() => navigate("/ross")}><X /> Esci</button><div><span className="conversation-progress"><i style={{ width: `${((step + 1) / conversation.length) * 100}%` }} /></span><small>Conversazione · {step + 1} di {conversation.length}</small></div><button onClick={() => setPaused((value) => !value)}>{paused ? <Play /> : <Pause />} {paused ? "Riprendi" : "Pausa"}</button></header>
      <main>
        <section className="ross-conversation-face">
          <img src={asset("ross-eyes.png")} alt="Gli occhi luminosi di ROSS" className="ross-eyes" />
          <span><i />{current.state === "listening" ? "Ti ascolto" : current.state === "processing" ? "Sto collegando il ricordo" : current.state === "activity" ? "Una proposta per dopo" : "ROSS parla"}</span>
        </section>
        <section className="ross-dialogue" aria-live="polite">
          <span className={`speaker speaker-${current.speaker}`}>{current.speaker === "ross" ? "ROSS" : "ELENA"}</span>
          <h1>“{current.line}”</h1>
          <p>{current.support}</p>
          <button type="button" className="ross-primary-action" onClick={next} disabled={paused}>{step === conversation.length - 1 ? "Concludi con calma" : current.speaker === "ross" ? "Elena risponde" : "ROSS continua"}<ArrowRight /></button>
        </section>
        <aside className="ross-conversation-context">
          <span>CONTESTO DELLA CONVERSAZIONE</span>
          <div className="context-pills"><span>Viaggio 1998</span><span>Paolo</span><span>Cefalù</span>{step >= 5 && <span className="new">+ nuovo dettaglio</span>}</div>
          <div className="mini-transcript">{visible.slice(-3).map((item, index) => <p key={`${item.line}-${index}`}><strong>{item.speaker === "ross" ? "ROSS" : "Elena"}</strong>{item.line}</p>)}</div>
        </aside>
      </main>
    </div>
  );
}
