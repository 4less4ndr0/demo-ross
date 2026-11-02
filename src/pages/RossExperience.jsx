import { useEffect, useMemo, useState } from "react";
import { AlarmClock, ArrowLeft, ArrowRight, CalendarHeart, DoorOpen, Phone, Check, CircleHelp, Clock3, CloudRain, Headphones, Heart, Images, Lightbulb, MessageCircle, Mic, Music2, Pause, Play, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "../components/ui";
import { useDemo } from "../state/DemoContext";
import { asset } from "../asset.js";
import { outsideInvites } from "../data/demoData";
import { byPriority } from "../data/familyMessages";
import { consumeFamilyNews, consumeReminders } from "../state/familyNews";

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
  reminder: { icon: AlarmClock, lead: "Un promemoria di Anna", ask: "Te lo ricordo io al momento giusto.", cta: "Ascolta" },
  message: { icon: MessageCircle, lead: "Un pensiero di Anna", ask: "Vuoi sentirlo?", cta: "Ascolta" },
};
// Quando arriva qualcosa di nuovo, ROSS lo annuncia e lo racconta a voce, una cosa alla volta e in ordine.
const newsKicker = { reminder: "Un promemoria di Anna", photo: "Una foto di Anna", message: "Un pensiero di Anna", topic: "Una domanda di Anna", memory: "Un ricordo di Anna", music: "Musica da Anna" };
const alreadyShared = (item) => item.status === "Ripreso con Elena" || item.status === "Confermato";
const count = (n) => (n === 1 ? "una cosa" : n === 2 ? "due cose" : n === 3 ? "tre cose" : `${n} cose`);

// Giochi per stare insieme: niente punteggi, niente valutazioni, nessuna risposta "sbagliata" (intrattenimento, non test).
const games = {
  canzone: {
    title: "Indovina la canzone",
    intro: "Facciamo un gioco? Ti dico l'inizio di una canzone e tu mi dici chi la cantava.",
    questions: [
      { prompt: "«Parole, parole, parole…» Chi la cantava?", options: ["Mina", "Ornella Vanoni", "Patty Pravo"], answer: "Mina", note: "La cantava con Alberto Lupo, nel 1972." },
      { prompt: "«Volare, oh oh…» Di chi è?", options: ["Domenico Modugno", "Gino Paoli", "Adriano Celentano"], answer: "Domenico Modugno", note: "«Nel blu dipinto di blu», Sanremo 1958." },
      { prompt: "«Azzurro, il pomeriggio è troppo azzurro…»", options: ["Adriano Celentano", "Lucio Battisti", "Gianni Morandi"], answer: "Adriano Celentano", note: "È del 1968, e l'ha scritta Paolo Conte." },
    ],
  },
  parole: {
    title: "Il gioco delle parole",
    intro: "Un gioco leggero: io dico una parola, tu me ne dici un'altra che ti viene in mente. Non ci sono risposte giuste.",
    questions: [
      { prompt: "Mare. A cosa ti fa pensare?", options: ["Cefalù", "Gabbiani", "Sale"], open: true, reply: (word) => `${word}: bello. Io dico conchiglie.` },
      { prompt: "Domenica. Cosa ti viene in mente?", options: ["Il pranzo", "La messa", "Le passeggiate"], open: true, reply: (word) => `${word}. A me fa pensare al profumo del ragù.` },
      { prompt: "Giardino. E adesso?", options: ["I gerani", "Il sole", "Le rose"], open: true, reply: (word) => `${word}. Mi hai fatto venire voglia di primavera.` },
    ],
  },
};
const newsTag = { photo: "Una foto di Anna", message: "Un pensiero di Anna", topic: "Una domanda di Anna", memory: "Un ricordo di Anna", music: "Musica da Anna" };

// La scheda "una cosa alla volta": si apre dalla home a tutto schermo. ROSS dice una cosa, lo schermo fa da
// didascalia e sotto ci sono le frasi che Elena può dire ("Puoi dirmi"); si possono anche toccare.
// flow: { kind: "news", queue } · { kind: "reminder", item } · { kind: "game", id } · { kind: "memory" }
function RossStage({ flow, onClose, onAnswer }) {
  const { state, actions, notify } = useDemo();
  const [step, setStep] = useState({ i: 0, reveal: false, answer: null, phase: "start" });
  useEffect(() => { const onKey = (event) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  const chip = (label, onSay) => ({ label, onSay });
  let view;
  if (flow.kind === "news") {
    const item = flow.queue[step.i];
    const finish = () => { actions.markFamilyHeard([...new Set(flow.queue.map((part) => part.contributionId))]); onClose(); };
    const next = () => (step.i + 1 < flow.queue.length ? setStep({ ...step, i: step.i + 1, reveal: false }) : finish());
    const progress = `${step.i + 1} di ${flow.queue.length} · da Anna`;
    view = item.kind === "photo" && item.image && !step.reveal
      ? { icon: Images, tag: newsTag.photo, line: "Anna ti ha mandato una foto. Te la faccio vedere?", progress, chips: [chip("Sì, fammela vedere", () => setStep({ ...step, reveal: true })), chip("Dopo", next)] }
      : { icon: Heart, tag: newsTag[item.kind] || "Da Anna", image: item.kind === "photo" ? item.image : null, line: item.rossLine, progress,
          chips: [chip(item.kind === "photo" ? "Che bella" : "Va bene", next), ...(["topic", "memory", "photo"].includes(item.kind) ? [chip("Rispondile", () => { finish(); onAnswer(); })] : []), chip("Basta così", finish)] };
  } else if (flow.kind === "reminder") {
    const { item } = flow;
    view = { icon: AlarmClock, tag: `Un promemoria di Anna${item.when ? ` · ${item.when}` : ""}`, line: `Elena, ${item.rossLine}`, foot: "ROSS te lo ricorda con le parole di Anna. Non controlla se l'hai fatto e non lo dice a nessuno.",
      chips: [chip("Va bene", () => { actions.setReminder(item.key, "done"); onClose(); }), chip("Ricordamelo domattina", () => { actions.setReminder(item.key, "later"); notify("Va bene: te lo ricordo domattina"); onClose(); }), chip("Non ricordarmelo più", () => { actions.setReminder(item.key, "stopped"); notify("Va bene, non te lo ricordo più"); onClose(); })] };
  } else if (flow.kind === "game") {
    const game = games[flow.id];
    if (step.phase === "start") {
      view = { icon: Sparkles, tag: `Un gioco · ${game.title}`, line: game.intro, chips: [chip("Sì, giochiamo", () => setStep({ ...step, phase: "play" })), chip("Un'altra volta", onClose)] };
    } else {
      const question = game.questions[step.i]; const last = step.i + 1 >= game.questions.length;
      const progress = `${game.title} · ${step.i + 1} di ${game.questions.length}`;
      view = step.answer === null
        ? { icon: Sparkles, tag: game.title, line: question.prompt, progress, chips: [...question.options.map((option) => chip(option, () => setStep({ ...step, answer: option }))), chip("Basta così", onClose)] }
        : { icon: Sparkles, tag: game.title, progress,
            line: question.open ? question.reply(step.answer) : step.answer === question.answer ? `Proprio così: ${question.answer}. ${question.note}` : `Era ${question.answer}. ${question.note} Ti piaceva?`,
            chips: last ? [chip("Che bel gioco", () => { notify("Quando vuoi, ne facciamo un altro"); onClose(); })] : [chip("Un'altra", () => setStep({ ...step, i: step.i + 1, answer: null })), chip("Basta così", onClose)] };
    }
  } else {
    // "Cosa ricordo di te": il ricordo nuovo della conversazione di oggi, oppure uno già noto. Decide Elena.
    const candidate = state.rossJourney.candidateId && !state.rossJourney.confirmedAt ? state.memories.find((m) => m.id === state.rossJourney.candidateId) : null;
    const item = candidate || state.memories.find((m) => m.id === "mem-mina");
    if (!item) view = { icon: Heart, tag: "Cosa ricordo di te", line: "Per ora non ho niente di nuovo da chiederti. Raccontami pure, quando vuoi.", chips: [chip("Va bene", onClose)] };
    else if (step.phase === "forget") view = { icon: Heart, tag: "Dimenticare", line: "Vuoi che lo dimentichi? Te lo chiedo perché poi non potrò più ricordarlo.", chips: [chip("Sì, dimenticalo", () => { actions.archiveMemory(item.id); notify("Fatto: l'ho dimenticato"); onClose(); }), chip("No, tienilo", () => setStep({ ...step, phase: "start" }))] };
    else view = { icon: Heart, tag: candidate ? "Una cosa nuova che mi hai raccontato oggi" : "Cosa ricordo di te",
      line: candidate ? "Mi hai detto che Paolo portava sempre una piccola macchina fotografica rossa sul lungomare. Ho capito bene?" : "Mi hai raccontato che le canzoni di Mina ti accompagnavano nei pomeriggi in cucina. È ancora così?",
      foot: "Quello che ricordo di te lo decidi tu: puoi confermarlo, correggerlo o farmelo dimenticare.",
      chips: [chip(candidate ? "Sì, è giusto" : "Sì, è così", () => { if (candidate) actions.confirmMemory(item); else notify("Grazie: me lo tengo stretto"); onClose(); }),
        ...(candidate ? [chip("Era blu, non rossa", () => { actions.updateMemory(item.id, { title: "La macchina fotografica blu di Paolo", description: item.description.replace("rossa", "blu") }); actions.confirmMemory(item); onClose(); })] : []),
        chip("Dimenticalo", () => setStep({ ...step, phase: "forget" }))] };
  }
  const Icon = view.icon || Heart;
  return <div className="ross-stage-overlay" role="dialog" aria-modal="true" aria-label={view.tag}>
    <header className="ross-stage-bar"><button type="button" onClick={onClose}><ArrowLeft /> Torna a ROSS</button><span className="ross-listening"><i /> Ti ascolto</span></header>
    <main className="ross-stage" key={view.line}>
      {view.image ? <img className="ross-stage-photo" src={view.image} alt="La foto che Anna ti ha mandato" /> : <span className="ross-orb" aria-hidden="true" />}
      <span className="ross-stage-tag"><Icon /> {view.tag}</span>
      <p className="ross-stage-line">{view.line}</p>
      <p className="ross-stage-hint">Puoi dirmi:</p>
      <div className="ross-say">{view.chips.map((item) => <button key={item.label} type="button" onClick={item.onSay}><Mic aria-hidden="true" />«{item.label}»</button>)}</div>
      {(view.progress || view.foot) && <small className="ross-stage-foot">{view.progress || view.foot}</small>}
    </main>
  </div>;
}

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
  const fromAnna = [...state.familyContributions].sort((a, b) => (Number(alreadyShared(a)) - Number(alreadyShared(b))) || byPriority(a, b)).slice(0, 3);
  // Le novità da Anna, già rielaborate da ROSS: un messaggio può diventare più cose, raccontate in ordine (prima i promemoria).
  const partsOf = (item) => (item.parts?.length ? item.parts : [{ kind: item.kind, text: item.detail, rossLine: `Anna ti ha mandato: «${item.title}».` }]).map((part, index) => ({ ...part, key: `${item.id}-${index}`, contributionId: item.id, image: item.image, createdAt: item.createdAt }));
  // I promemoria non si raccontano subito con le novità: ROSS li dice la sera, all'ora giusta.
  const newsItems = useMemo(() => state.familyContributions.filter((item) => item.unheard).flatMap(partsOf).filter((part) => part.kind !== "reminder").sort(byPriority), [state.familyContributions]); // eslint-disable-line react-hooks/exhaustive-deps
  const reminders = state.familyContributions.flatMap(partsOf).filter((part) => part.kind === "reminder" && !["done", "stopped"].includes((state.reminders || {})[part.key]));
  const [stage, setStage] = useState(null);
  const [newsLater, setNewsLater] = useState(false);
  // La visita guidata chiede di mostrare l'avviso: torna visibile, e se Elena aveva già ascoltato tutto il messaggio di oggi torna "da ascoltare".
  useEffect(() => {
    const show = () => { if (consumeFamilyNews()) { setNewsLater(false); actions.replayFamilyNews(); } };
    const showReminders = () => { if (consumeReminders()) actions.replayReminders(); };
    show(); showReminders();
    window.addEventListener("ross:news", show); window.addEventListener("ross:reminders", showReminders);
    return () => { window.removeEventListener("ross:news", show); window.removeEventListener("ross:reminders", showReminders); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Nella demo ROSS non parla ad alta voce: il racconto è a schermo, una cosa alla volta (scheda RossStage).
  const openNews = (items = newsItems) => setStage({ kind: "news", queue: items });

  useEffect(() => {
    const timer = window.setTimeout(() => setRossState("response"), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const chooseMode = (mode) => {
    actions.setResidentMode("elena", mode);
    setRossState(mode === "Silenziosa" ? "rest" : "response");
  };
  const play = (track) => { notify(`In riproduzione: ${track.split(" · ")[0]}`); setRossState("activity"); };
  const usePrompt = (item) => {
    if (item.kind === "music") return play(item.title);
    const parts = partsOf(item); const told = parts.filter((part) => part.kind !== "reminder");
    if (item.parts?.length) return told.length ? openNews(told) : setStage({ kind: "reminder", item: parts[0] });
    return navigate("/ross/conversazione");
  };

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
            <small className="ross-ai-note">Sono ROSS, un compagno digitale basato sull'intelligenza artificiale: non sono una persona. Quello che ci diciamo resta qui.</small>
          </div>
        </section>

        {newsItems.length > 0 && !newsLater && outing?.status !== "out" && <section className="ross-news" aria-live="polite">
          <span className="ross-news-icon"><Heart /></span>
          <div><small>Da Anna, adesso</small><h2>Anna ti ha mandato {count(newsItems.length)}. Vuoi che {newsItems.length === 1 ? "te la racconti" : "te le racconti"}?</h2><p>Puoi anche dirmelo a voce: «Sì, raccontamele».{reminders.length > 0 ? " C'è anche un promemoria: te lo dico stasera." : ""}</p></div>
          <div className="ross-invite-actions"><button type="button" onClick={() => openNews()}>Sì, raccontamele</button><button type="button" className="ross-invite-later" onClick={() => setNewsLater(true)}>Più tardi</button></div>
        </section>}

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

        {reminders.length > 0 && <section className="ross-section ross-reminders" aria-label="Promemoria">
          <h2 className="ross-section-title">Promemoria</h2>
          <p className="ross-section-note">Te li ricordo stasera alle 21, con le parole di chi li ha lasciati. Non controllo se li hai fatti.</p>
          <div className="ross-prompt-grid">{reminders.map((item) => <article key={item.key} className="ross-prompt-card ross-reminder-card">
            <header><span className="ross-prompt-icon"><AlarmClock /></span><div><small>Da Anna{item.when ? ` · ${item.when}` : ""}{(state.reminders || {})[item.key] === "later" ? " · domattina" : ""}</small><h3>«{item.text.replace(/[.!…]+$/, "")}»</h3></div></header>
            <div className="ross-invite-actions"><button type="button" onClick={() => setStage({ kind: "reminder", item })}>Ascoltalo ora</button><button type="button" className="ross-invite-later" onClick={() => { actions.setReminder(item.key, "stopped"); notify("Va bene, non te lo ricordo più"); }}>Non ricordarmelo più</button></div>
          </article>)}</div>
        </section>}

        <section className="ross-section ross-spunti" aria-label="Spunti per oggi">
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
            <div><small>{kind.lead}</small><h3>{item.title}</h3><p>{alreadyShared(item) ? "Ne abbiamo già parlato: possiamo riprenderlo quando vuoi." : item.parts?.length ? item.parts.map((part) => part.rossLine).join(" ") : kind.ask}</p></div>
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

      {stage && <RossStage flow={stage} onClose={() => setStage(null)} onAnswer={() => { setStage(null); navigate("/ross/conversazione"); }} />}

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
        {panel === "memories" && <div className="ross-modal-choices"><button onClick={() => { setPanel(null); setStage({ kind: "memory" }); }}><span className="choice-art photo"><Heart /></span><strong>Cosa ricordo di te</strong><small>Ascolta, conferma o correggi quello che ROSS ricorda</small></button><button onClick={() => navigate("/ross/conversazione")}>{sharedPhoto?.image ? <img className="ross-choice-image" src={sharedPhoto.image} alt={`Foto condivisa dalla famiglia: ${sharedPhoto.title}`} /> : <span className="choice-art photo"><Images /></span>}<strong>{sharedPhoto?.title || "Il viaggio in Sicilia"}</strong><small>{sharedPhoto ? "Condivisa da Anna · pronta da guardare insieme" : "Palermo, Cefalù e le fotografie del 1998"}</small></button><button onClick={() => notify("Ricordo pronto per la prossima conversazione")}><img className="ross-choice-image" src={asset("garden-photo.svg")} alt="Gerani rossi sul balcone" /><strong>I gerani sul balcone</strong><small>Una piccola abitudine del mattino</small></button></div>}
        {panel === "activities" && <div className="ross-modal-choices"><button onClick={() => { setPanel(null); setStage({ kind: "game", id: "canzone" }); }}><span className="choice-art music"><Music2 /></span><strong>Indovina la canzone</strong><small>Un gioco, senza fretta e senza punteggi</small></button><button onClick={() => { setPanel(null); setStage({ kind: "game", id: "parole" }); }}><span className="choice-art photo"><Sparkles /></span><strong>Il gioco delle parole</strong><small>Non ci sono risposte giuste</small></button><button onClick={() => { notify("Attività avviata: Fotografie di viaggio"); setPanel(null); setRossState("activity"); }}><span className="choice-art photo"><Images /></span><strong>{scheduled?.title || "Fotografie di viaggio"}</strong><small>{scheduled ? `Preparata per domani alle ${scheduled.time}` : "Scegliamo una foto e ne parliamo"}</small></button></div>}
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
