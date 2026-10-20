import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarHeart, DoorOpen, Phone, Check, CircleHelp, Clock3, CloudRain, Headphones, Heart, Images, Lightbulb, Mic, Music2, Pause, Play, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "../components/ui";
import { useDemo } from "../state/DemoContext";
import { asset } from "../asset.js";
import { outsideInvites } from "../data/demoData";

const conversation = [
  { speaker: "ross", state: "response", line: "Ciao Elena. Ti va di stare un po’ insieme?", support: "ROSS inizia senza imporre un argomento." },
  { speaker: "elena", state: "listening", line: "Sì, volentieri. Oggi ho ascoltato Mina.", support: "Elena sceglie il punto di partenza." },
  { speaker: "ross", state: "processing", line: "Mi hai raccontato che Mina ti ricorda i pomeriggi in cucina. Vuoi restare sulla musica o guardiamo una fotografia?", support: "Usa solo una memoria già confermata e offre una scelta." },
  { speaker: "elena", state: "listening", line: "Guardiamo quella del mare. Era in Sicilia, con Paolo.", support: "Il racconto porta spontaneamente a un ricordo personale." },
  { speaker: "ross", state: "response", line: "Ricordo il viaggio del 1998: Palermo e Cefalù. Cosa ti piaceva di quelle passeggiate?", support: "Recupera luogo, anno e persona dalla storia confermata." },
  { speaker: "elena", state: "listening", line: "La luce della sera. Paolo portava sempre una piccola macchina fotografica rossa.", support: "Emerge un dettaglio nuovo." },
  { speaker: "ross", state: "processing", line: "Questa della macchina fotografica rossa è una cosa nuova per me. Ti va se lo racconto anche ad Anna? Credo le farebbe piacere.", support: "ROSS distingue il nuovo dettaglio da ciò che sa già e chiede a Elena se condividerlo." },
  { speaker: "elena", state: "listening", line: "Sì, raccontaglielo. Mi fotografava sul lungomare e poi rideva perché chiudevo gli occhi.", support: "Elena sceglie di condividere il ricordo con la figlia." },
  { speaker: "ross", state: "activity", line: "Le altre fotografie di Cefalù le guardiamo un'altra volta. Alle 17:30 in salone si canta, c'è anche Mina: ci vai? Poi mi racconti com'è andata.", support: "Chiude con un invito fuori da qui: ROSS è un ponte verso la vita della residenza, non la meta." },
];

// Modalità: le stesse della struttura, dette con le parole di Elena.
const modes = [["Attiva", "Proponimi tu"], ["Reattiva", "Quando ti chiamo"], ["Silenziosa", "Stai in silenzio"]];

// Spunti del giorno: meteo e ricorrenze diventano occasioni di conversazione (dati simulati nella demo).
const today = { date: "Lunedì 21 settembre", time: "16:40", weather: "Pioggia leggera", temp: "17°" };
const dayPrompts = [
  { id: "meteo", icon: CloudRain, kicker: "Oggi piove", title: "Un pomeriggio da fotografie", text: "I gerani sul balcone si annaffiano da soli. Ti va di guardare le foto di Cefalù e raccontarmi la luce della sera?", cta: "Raccontami", talk: true },
  { id: "ricorrenza", icon: CalendarHeart, kicker: "Mercoledì è una ricorrenza", title: "Il 23 settembre nasceva Gino Paoli", text: "Ha scritto «Il cielo in una stanza», la canzone che Mina ha portato al successo nel 1960. La ascoltiamo insieme?", cta: "Ascoltiamola", track: "Il cielo in una stanza · Mina" },
];

// I contributi di Anna arrivano qui come spunti: la famiglia sceglie cosa portare a Elena, ROSS lo propone.
const familyPrompt = {
  photo: { icon: Images, lead: "Anna ti ha mandato una foto", ask: "La guardiamo insieme?", cta: "Guardiamola" },
  memory: { icon: Heart, lead: "Anna ti ha raccontato un ricordo", ask: "Me lo racconti anche tu?", cta: "Raccontami" },
  topic: { icon: Lightbulb, lead: "Anna ti propone un argomento", ask: "Ti va di parlarne?", cta: "Parliamone" },
  music: { icon: Music2, lead: "Anna ti ha suggerito una canzone", ask: "La ascoltiamo insieme?", cta: "Ascoltiamola" },
};
const alreadyShared = (item) => item.status === "Ripreso con Elena" || item.status === "Confermato";

export function RossHome() {
  const { state, actions, notify } = useDemo();
  const navigate = useNavigate();
  const [panel, setPanel] = useState(null);
  const [rossState, setRossState] = useState("rest");
  const [forgetAsked, setForgetAsked] = useState(false);
  const [returning, setReturning] = useState(null);
  const outing = state.outing;
  const outingInvite = outing && outsideInvites.find((item) => item.id === outing.activityId);
  const elena = state.residents.find((resident) => resident.id === "elena");
  const completed = Boolean(state.rossJourney.completedAt);
  const sharedPhoto = state.familyContributions.find((item) => item.kind === "photo" && item.image);
  const sharedMusic = state.familyContributions.find((item) => item.kind === "music");
  const scheduled = state.scheduledActivities.find((item) => item.residentId === "elena");
  const fromAnna = [...state.familyContributions].sort((a, b) => Number(alreadyShared(a)) - Number(alreadyShared(b))).slice(0, 3);

  useEffect(() => {
    const timer = window.setTimeout(() => setRossState("response"), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const chooseMode = (mode) => {
    actions.setResidentMode("elena", mode);
    setRossState(mode === "Silenziosa" ? "rest" : "response");
  };
  const play = (track) => { notify(`In riproduzione: ${track.split(" · ")[0]}`); setRossState("activity"); };
  const usePrompt = (item) => (item.kind === "music" ? play(item.title) : navigate("/ross/conversazione"));

  return (
    <div className="ross-app screen-enter" data-ross-state={rossState}>
      <header className="ross-header">
        <div className="ross-wordmark"><span>R</span><strong>ROSS</strong></div>
        <div className="ross-today"><span><CloudRain /> {today.temp} · {today.weather}</span><i /><span><Clock3 /> {today.time}</span><button type="button" className="ross-volume" aria-label="Volume"><Volume2 /></button></div>
      </header>

      <main className="ross-home-main">
        <section className="ross-hero">
          <div className="ross-hero-copy">
            <span className="ross-hero-date">{today.date}</span>
            <h1>Buon pomeriggio, Elena.</h1>
            <p>{completed ? "Che bella chiacchierata, prima. Se vuoi, continuiamo quando ti va." : "Ho pensato a qualche spunto per oggi. Scegli tu, oppure parliamo di quello che vuoi."}</p>
            <button type="button" className="ross-talk" onClick={() => navigate("/ross/conversazione")}><span><Mic /></span><strong>{completed ? "Parliamo ancora" : "Parla con ROSS"}</strong><small>Tocca per iniziare</small></button>
            <small className="ross-ai-note">Sono ROSS, un programma che ti fa compagnia: non sono una persona. Quello che ci diciamo resta qui.</small>
          </div>
        </section>

        {outing?.status === "out" ? <section className="ross-away" aria-live="polite">
          <span className="ross-away-icon"><DoorOpen /></span>
          <div><small>Elena è fuori · ROSS resta in silenzio</small><h2>Ci vediamo dopo {outingInvite?.label}.</h2><p>Quando torni, mi racconti com'è andata?</p></div>
          <button type="button" onClick={() => setReturning("feeling")}>Sono tornata</button>
        </section> : <section className="ross-section ross-outside" aria-label="Oggi, fuori da qui">
          <h2 className="ross-section-title">Oggi, fuori da qui</h2>
          <p className="ross-section-note">Oggi piove: le proposte sono al coperto.</p>
          <div className="ross-prompt-grid">{outsideInvites.map((item) => { const Icon = item.kind === "call" ? Phone : DoorOpen; const done = item.kind === "activity" && outing?.activityId === item.id && outing.status === "back"; return <article key={item.id} className={`ross-prompt-card ross-invite${done ? " is-done" : ""}`}>
            <header><span className="ross-prompt-icon"><Icon /></span><div><small>{item.time} · {item.place}</small><h3>{item.title}</h3></div></header>
            <p>{done ? "Ci sei andata: grazie di avermi raccontato com'è andata." : item.text}</p>
            {!done && <div className="ross-invite-actions"><button type="button" onClick={() => (item.kind === "call" ? notify("Te lo ricorderò dopo cena, prima che Anna chiami") : actions.goOut(item.id))}>{item.cta}</button>{item.kind === "activity" && <button type="button" className="ross-invite-later" onClick={() => notify("Va bene: magari un'altra volta")}>Magari un'altra volta</button>}</div>}
          </article>; })}</div>
        </section>}

        <section className="ross-section" aria-label="Spunti per oggi">
          <h2 className="ross-section-title">Spunti per oggi</h2>
          <div className="ross-prompt-grid">{dayPrompts.map((item) => { const Icon = item.icon; return <article key={item.id} className="ross-prompt-card">
            <header><span className="ross-prompt-icon"><Icon /></span><div><small>{item.kicker}</small><h3>{item.title}</h3></div></header>
            <p>{item.text}</p>
            <button type="button" onClick={() => (item.track ? play(item.track) : navigate("/ross/conversazione"))}>{item.cta}</button>
          </article>; })}</div>
        </section>

        {fromAnna.length > 0 && <section className="ross-section" aria-label="Da Anna, per te">
          <h2 className="ross-section-title">Da Anna, per te</h2>
          <div className="ross-family-grid">{fromAnna.map((item) => { const kind = familyPrompt[item.kind] || familyPrompt.memory; const Icon = kind.icon; return <article key={item.id} className="ross-family-card">
            {item.image ? <img src={item.image} alt={item.title} /> : <span className="ross-family-icon"><Icon /></span>}
            <div><small>{kind.lead}</small><h3>{item.title}</h3><p>{alreadyShared(item) ? "Ne abbiamo già parlato: possiamo riprenderlo quando vuoi." : kind.ask}</p></div>
            <button type="button" onClick={() => usePrompt(item)}>{kind.cta} <ArrowRight /></button>
          </article>; })}</div>
        </section>}

        <section className="ross-touch-grid" aria-label="Cosa vuoi fare">
          <button onClick={() => setPanel("memories")}><Images /><span><strong>Ricordi e foto</strong><small>Guardiamo insieme</small></span><ArrowRight /></button>
          <button onClick={() => setPanel("activities")}><Sparkles /><span><strong>Attività</strong><small>Qualcosa di leggero</small></span><ArrowRight /></button>
          <button onClick={() => setPanel("music")}><Headphones /><span><strong>Musica</strong><small>Le tue canzoni</small></span><ArrowRight /></button>
          <button onClick={() => setPanel("help")}><CircleHelp /><span><strong>Aiuto</strong><small>Chiedi a ROSS</small></span><ArrowRight /></button>
        </section>

        <section className="ross-modes">
          <span>COME VUOI CHE ROSS STIA CON TE?</span>
          <div>{modes.map(([mode, label]) => <button key={mode} className={elena.mode === mode ? "active" : ""} onClick={() => chooseMode(mode)} title={`Modalità ${mode.toLowerCase()}`}><i />{label}</button>)}</div>
        </section>
      </main>

      <Dialog open={Boolean(returning)} title={returning === "share" ? "Lo racconto ad Anna?" : `Com'è andata?`} onClose={() => setReturning(null)}>
        {returning === "feeling" ? <div className="ross-return">
          <p>Raccontami pure: ti ascolto. In questa demo scegli una risposta.</p>
          <div className="modal-actions">{["Bene, abbiamo cantato tanto", "Così così", "Preferisco non dirlo"].map((answer) => <button key={answer} className="ghost-button" onClick={() => setReturning("share")}>{answer}</button>)}</div>
        </div> : <div className="ross-return">
          <p>Ti va se racconto ad Anna che oggi sei andata {outingInvite?.label}? Decidi tu.</p>
          <div className="modal-actions"><button className="ghost-button" onClick={() => { actions.comeBack(false); setReturning(null); }}>No, lo tengo per me</button><button className="primary-button" onClick={() => { actions.comeBack(true); setReturning(null); }}>Sì, raccontaglielo</button></div>
        </div>}
      </Dialog>

      <Dialog open={Boolean(panel)} title={panel === "memories" ? "Ricordi e fotografie" : panel === "activities" ? "Cosa facciamo?" : panel === "music" ? "Musica per te" : "Come posso aiutarti?"} onClose={() => { setPanel(null); setForgetAsked(false); }} size="lg">
        {panel === "memories" && <div className="ross-modal-choices"><button onClick={() => navigate("/ross/conversazione")}>{sharedPhoto?.image ? <img className="ross-choice-image" src={sharedPhoto.image} alt={`Foto condivisa dalla famiglia: ${sharedPhoto.title}`} /> : <span className="choice-art photo"><Images /></span>}<strong>{sharedPhoto?.title || "Il viaggio in Sicilia"}</strong><small>{sharedPhoto ? "Condivisa da Anna · pronta da guardare insieme" : "Palermo, Cefalù e le fotografie del 1998"}</small></button><button onClick={() => notify("Ricordo pronto per la prossima conversazione")}><img className="ross-choice-image" src={asset("garden-photo.svg")} alt="Gerani rossi sul balcone" /><strong>I gerani sul balcone</strong><small>Una piccola abitudine del mattino</small></button></div>}
        {panel === "activities" && <div className="ross-modal-choices"><button onClick={() => { notify("Attività avviata: Indovina la canzone"); setPanel(null); setRossState("activity"); }}><span className="choice-art music"><Music2 /></span><strong>Indovina la canzone</strong><small>Dieci minuti, senza fretta</small></button><button onClick={() => { notify("Attività avviata: Fotografie di viaggio"); setPanel(null); setRossState("activity"); }}><span className="choice-art photo"><Images /></span><strong>{scheduled?.title || "Fotografie di viaggio"}</strong><small>{scheduled ? `Preparata per domani alle ${scheduled.time}` : "Scegliamo una foto e ne parliamo"}</small></button></div>}
        {panel === "music" && <div className="ross-playlist">{[sharedMusic?.title, "Se telefonando · Mina", "Il cielo in una stanza · Gino Paoli", "Azzurro · Adriano Celentano"].filter(Boolean).map((track, index) => <button key={track} onClick={() => { notify(`In riproduzione: ${track.split(" · ")[0]}`); setRossState("activity"); setPanel(null); }}><span>{index + 1}</span><strong>{track}</strong><Play fill="currentColor" /></button>)}</div>}
        {panel === "help" && <div className="ross-help"><CircleHelp /><h3>Dimmi cosa ti serve, con le tue parole.</h3><p>Non serve una frase precisa: “chiama qualcuno”, “non mi sento bene”, “abbassa la voce” o “voglio riposare” vanno tutte bene.</p><p className="ross-help-limit">ROSS non è un sistema di emergenza: per un aiuto urgente usa il campanello o chiama il personale. Questa demo non effettua chiamate.</p>
          {forgetAsked
            ? <div className="ross-help-confirm"><p>Vuoi che dimentichi quello che mi hai raccontato? Te lo chiedo perché poi non potrò ricordarlo.</p><div className="modal-actions"><button className="ghost-button" onClick={() => setForgetAsked(false)}>No, lascia così</button><button className="primary-button" onClick={() => { notify("Nella demo non viene cancellato nulla: è qui per mostrare come funzionerebbe"); setForgetAsked(false); setPanel(null); }}>Sì, dimentica</button></div></div>
            : <div className="modal-actions ross-help-actions"><button className="ghost-button" onClick={() => setForgetAsked(true)}>Dimentica quello che ti ho detto</button><button className="primary-button" onClick={() => { chooseMode("Silenziosa"); setPanel(null); }}>Voglio riposare</button></div>}
        </div>}
      </Dialog>
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
        <p>Mi ricorderò di quello che mi hai raccontato, e resta qui tra noi. Ad Anna racconterò solo il nuovo ricordo, come mi hai chiesto.</p>
        <article><span>NUOVO RICORDO · CONDIVISO CON ANNA</span><h2>La macchina fotografica rossa di Paolo</h2><p>Collegata a Cefalù, al viaggio del 1998 e alle fotografie.</p><div><span>La conversazione resta qui</span><ArrowRight /><span>Elena sceglie cosa condividere</span><ArrowRight /><span>Arriva ad Anna solo il ricordo</span></div></article>
        <div className="ross-complete-actions"><button className="ross-primary-action" onClick={() => { actions.goOut("canto"); navigate("/ross"); }}><DoorOpen /> Ci vado, al canto</button><button className="ross-secondary-action" onClick={() => navigate("/ross")}><ArrowLeft /> Torna alla home</button><button onClick={restart}><RotateCcw /> Ripeti la demo</button></div>
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
