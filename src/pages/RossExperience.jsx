import { useEffect, useMemo, useRef, useState } from "react";
import { AlarmClock, ArrowLeft, ArrowRight, CalendarHeart, DoorOpen, Phone, Check, CircleHelp, Clock3, CloudRain, Headphones, Heart, Images, Lightbulb, MessageCircle, Mic, Music2, Pause, Play, RotateCcw, Sparkles, UtensilsCrossed, Volume2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "../components/ui";
import { useDemo } from "../state/DemoContext";
import { asset } from "../asset.js";
import { outsideInvites } from "../data/demoData";
import { dayText, daysUntil } from "../data/demoClock";
import { lampRequest } from "../data/moments";
import { channelActions, getMoments, momentFilters } from "../state/channelStore";
import { byPriority } from "../data/familyMessages";
import { consumeFamilyNews, consumeReminders } from "../state/familyNews";

// "Parla con ROSS": la conversazione simulata. Chi presenta va avanti con un clic o con le frecce;
// ROSS parla con i sottotitoli che compaiono parola per parola, Elena "parla" e la sua voce diventa testo.
// Nei momenti in cui decide Elena compaiono le frasi che può dire ("Puoi dirmi"): le scelte cambiano davvero il seguito.
// note: spiegazioni per chi guarda la demo, mostrate solo con "Note per chi presenta".
const script = [
  { id: "apertura", speaker: "ross", line: "Ciao Elena, sono ROSS. Ti va di stare un po' insieme?", note: "ROSS si presenta e chiede, senza imporre un argomento. Elena può dire di no.",
    choices: [{ label: "Sì, volentieri", next: "si" }, { label: "Non adesso", next: "non-adesso" }, { label: "Sono caduta", next: "salute" }] },
  { id: "si", speaker: "elena", line: "Sì, volentieri. Oggi ho ascoltato Mina.", note: "È Elena a scegliere da dove partire." },
  { id: "scelta", speaker: "ross", line: "Mi avevi raccontato che Mina ti ricorda i pomeriggi in cucina. Restiamo sulla musica, o guardiamo una fotografia?", note: "ROSS usa solo un ricordo che Elena ha già confermato, e le lascia la scelta.",
    choices: [{ label: "Guardiamo una fotografia", next: "foto-elena" }, { label: "Restiamo sulla musica", next: "musica" }] },
  { id: "musica", speaker: "ross", line: "Allora mettiamo «Se telefonando». Quando finisce, ti va di guardare una foto del mare?", note: "Se Elena sceglie la musica, ROSS la segue e propone la foto dopo.",
    choices: [{ label: "Sì, guardiamola", next: "foto-elena" }, { label: "Basta così per oggi", next: "saluto" }] },
  { id: "foto-elena", speaker: "elena", line: "Guardiamo quella del mare. Era in Sicilia, con Paolo." },
  { id: "foto", speaker: "ross", line: "Te la faccio vedere: è la cartolina di Cefalù che ti ha mandato Anna. Era il viaggio del 1998. Cosa ti piaceva di quelle passeggiate?", image: "cefalu-postcard.svg", note: "Prima di usare lo schermo lo dice. Ritrova luogo, anno e persona dalla sua storia e chiede, non racconta al posto suo." },
  { id: "dettaglio", speaker: "elena", line: "La luce della sera. Paolo portava sempre una piccola macchina fotografica rossa." },
  { id: "bozza", speaker: "ross", line: "Questa della macchina fotografica rossa non la sapevo. Se per te va bene, me la segno.", draft: "La macchina fotografica rossa di Paolo", note: "Il dettaglio nuovo resta in bozza: ROSS lo tiene solo se Elena è d'accordo.",
    choices: [{ label: "Sì, segnatela", next: "ricordo" }, { label: "No, lasciamo stare", next: "non-segnare" }] },
  { id: "non-segnare", speaker: "ross", line: "Va bene, non me la segno. Mi è piaciuto ascoltarti.", forget: true, next: "lampada" },
  { id: "ricordo", speaker: "elena", line: "Sì. Mi fotografava sul lungomare e poi rideva perché chiudevo gli occhi.", draft: "La macchina fotografica rossa di Paolo", saved: true },
  { id: "consenso", speaker: "ross", line: "Che bel ricordo. Ti va se lo racconto anche ad Anna? Credo le farebbe piacere.", draft: "La macchina fotografica rossa di Paolo", saved: true, note: "Il consenso nasce qui, un racconto alla volta. Anna non riceve la conversazione, solo questo ricordo, e solo se Elena dice sì.",
    choices: [{ label: "Sì, raccontaglielo", next: "condiviso", share: true }, { label: "No, tienilo per te", next: "per-te", share: false }] },
  { id: "condiviso", speaker: "ross", line: "Va bene: le racconto solo questo ricordo, non il resto della nostra chiacchierata.", next: "lampada" },
  { id: "per-te", speaker: "ross", line: "Va bene, resta tra noi due.", next: "lampada" },
  // Una richiesta pratica: parte solo se Elena dice sì. ROSS non deduce mai un problema da ciò che sente.
  { id: "lampada", speaker: "elena", line: "Prima di salutarci: la lampada sul comodino non si accende più." },
  { id: "lampada-conferma", speaker: "ross", line: "Mi dispiace, così la sera è scomodo. Vuoi che lo dica al personale?", note: "Una richiesta pratica parte solo con il sì di Elena. Con il no ROSS lascia perdere e non ci torna. Non è un avviso: arriva alla struttura come «Hanno chiesto», senza priorità né tempi.",
    choices: [{ label: "Sì, diglielo", next: "lampada-si", request: "lampada" }, { label: "No, lascia stare", next: "lampada-no" }] },
  { id: "lampada-si", speaker: "ross", line: "Va bene, lo faccio sapere al personale.", note: "Nella Struttura 2.0 la richiesta compare in «Hanno chiesto», con «Confermato da Elena».", next: "saluto" },
  { id: "lampada-no", speaker: "ross", line: "Va bene, lascio stare.", note: "Senza un sì non parte niente.", next: "saluto" },
  { id: "saluto", speaker: "ross", line: "Le altre fotografie le guardiamo un'altra volta. Alle 17:30 in salone si canta, e c'è anche Mina: ci vai? Poi mi racconti com'è andata.", note: "ROSS chiude verso fuori: è un ponte verso le persone vere, non la meta.",
    choices: [{ label: "Sì, ci vado", end: "out" }, { label: "Magari un'altra volta", end: "home" }] },
  // Salute e urgenze non diventano mai una richiesta: ROSS rimanda subito al campanello e al personale.
  { id: "salute", speaker: "elena", line: "Sono caduta prima, e adesso mi fa male la gamba." },
  { id: "salute-risposta", speaker: "ross", line: "Per questo è meglio chiamare subito il personale: puoi usare il campanello qui accanto. Io non sono un sistema di emergenza.", note: "ROSS non crea nessuna richiesta e non avvisa nessuno al posto di Elena: salute e urgenze passano dal campanello e dal personale, mai da ROSS. ROSS non è un sistema di emergenza.",
    choices: [{ label: "Va bene, suono il campanello", end: "help" }] },
  // Chiusura del cerchio: se la struttura ha segnato «Fatto», ROSS apre così la conversazione successiva.
  { id: "cerchio", speaker: "ross", line: "Ciao Elena. Hanno sistemato la lampada sul comodino: adesso la luce va bene?", note: "La struttura ha segnato la richiesta come «Fatto» nella Struttura 2.0: ROSS lo dice a Elena alla prima occasione, una volta sola.",
    choices: [{ label: "Sì, adesso va bene", next: "cerchio-ok" }, { label: "Non ancora", next: "cerchio-no" }] },
  { id: "cerchio-ok", speaker: "ross", line: "Bene, mi fa piacere. Ti va di stare un po' insieme?",
    choices: [{ label: "Sì, volentieri", next: "si" }, { label: "Non adesso", next: "non-adesso" }] },
  { id: "cerchio-no", speaker: "ross", line: "Mi dispiace. Vuoi che lo dica di nuovo al personale?", note: "Anche qui serve il sì di Elena.",
    choices: [{ label: "Sì, diglielo", next: "cerchio-ridetto", request: "lampada" }, { label: "No, lascia stare", next: "cerchio-ok" }] },
  { id: "cerchio-ridetto", speaker: "ross", line: "Va bene, lo faccio sapere di nuovo al personale. Intanto, ti va di stare un po' insieme?",
    choices: [{ label: "Sì, volentieri", next: "si" }, { label: "Non adesso", next: "non-adesso" }] },
  { id: "non-adesso", speaker: "ross", line: "Va bene, possiamo farlo un'altra volta. Quando ti va, chiamami tu.", note: "Il no si accetta così, senza insistere.", choices: [{ label: "Grazie, ROSS", end: "later" }] },
];
const scriptIndex = Object.fromEntries(script.map((turn, index) => [turn.id, index]));
const nextOf = (turn) => turn.next || script[scriptIndex[turn.id] + 1]?.id;

// Modalità: le stesse della struttura, dette con le parole di Elena.
const modes = [["Attiva", "Proponimi tu"], ["Reattiva", "Quando ti chiamo"], ["Silenziosa", "Stai in silenzio"]];

// Spunti del giorno: meteo e ricorrenze diventano occasioni di conversazione (dati simulati nella demo).
const today = { date: dayText(0, { capital: true }), time: "16:40", weather: "Pioggia leggera", temp: "17°" };
const dayPrompts = [
  { id: "residenza", icon: UtensilsCrossed, kicker: "Oggi in residenza", title: "Stasera minestrone e torta di mele", text: "Oggi pomeriggio c'è Giulia, l'educatrice. E venerdì in salotto si leggono commedie a più voci: te ne parlo se ti va.", cta: "Dimmi di più", talk: true },
  { id: "meteo", icon: CloudRain, kicker: "Oggi piove", title: "Un pomeriggio da fotografie", text: "I gerani sul balcone si annaffiano da soli. Ti va di guardare le foto di Cefalù e raccontarmi la luce della sera?", cta: "Raccontami", talk: true },
  { id: "ricorrenza", icon: CalendarHeart, kicker: "Una ricorrenza", title: "Il 23 settembre nasceva Gino Paoli", text: "Ha scritto «Il cielo in una stanza», la canzone che Mina ha portato al successo nel 1960. La ascoltiamo insieme?", cta: "Ascoltiamola", track: "Il cielo in una stanza · Mina" },
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
// Quando arriva un promemoria, per metterli in fila: i giorni si contano da oggi (src/data/demoClock.js).
const daysAhead = (when = "") => {
  if (when === "per stasera") return 0;
  if (when === "per domani") return 1;
  if (!when) return 9;
  const n = daysUntil(when.replace(/^per\s+/, ""));
  return n === null ? 8 : n || 7;
};
const whoOf = (item) => (item.from === "infermeria" ? "Dall'infermeria" : item.mine ? "Me l'hai chiesto tu" : "Da Anna");
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
    view = { icon: AlarmClock, tag: `${item.mine ? "Un promemoria che mi avevi chiesto" : item.from === "infermeria" ? "Un promemoria dell'infermeria" : "Un promemoria di Anna"}${item.when ? ` · ${item.when}` : ""}`, line: `Elena, ${item.rossLine}`, foot: item.mine ? "Te lo ricordo come me l'hai chiesto. Non controllo se l'hai fatto." : item.from === "infermeria" ? "ROSS te lo ricorda con le parole dell'infermeria. Non controlla se l'hai fatto e non lo dice a nessuno." : "ROSS te lo ricorda con le parole di Anna. Non controlla se l'hai fatto e non lo dice a nessuno.",
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
  // il promemoria scritto dall'infermeria (documento «La sua giornata» nella vista Struttura).
  const nurseReminders = [{ key: "inf-sera-elena", kind: "reminder", from: "infermeria", when: "per stasera", at: "alle 19:30", text: "La pastiglia della sera, nella bustina con la luna", rossLine: "sono le 19:30: è l'ora di prendere la pastiglia della sera, nella bustina con la luna. L'infermeria mi ha chiesto di ricordartelo." }];
  const ownReminders = (state.ownReminders || []).map((item) => ({ ...item, kind: "reminder", mine: true, rossLine: `mi avevi chiesto di ricordarti: «${item.text}».` }));
  // Tutti i promemoria in fila nel tempo: il primo è il prossimo, gli altri vanno nella card accanto.
  const reminders = [...nurseReminders, ...state.familyContributions.flatMap(partsOf).filter((part) => part.kind === "reminder"), ...ownReminders].filter((item) => !["done", "stopped"].includes((state.reminders || {})[item.key])).sort((a, b) => daysAhead(a.when) - daysAhead(b.when));
  const [nextReminder, ...laterReminders] = reminders;
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
          <p className="ross-section-note">Te li ricordo all'ora giusta, con le parole di chi li ha lasciati: Anna, l'infermeria o tu. Non controllo se li hai fatti.</p>
          <div className="ross-prompt-grid">
            <article className="ross-prompt-card ross-reminder-card">
              <header><span className="ross-prompt-icon"><AlarmClock /></span><div><small>Il prossimo · {whoOf(nextReminder)}{nextReminder.when ? ` · ${nextReminder.when}` : ""}{nextReminder.at ? ` ${nextReminder.at}` : ""}{(state.reminders || {})[nextReminder.key] === "later" ? " · domattina" : ""}</small><h3>«{nextReminder.text.replace(/[.!…]+$/, "")}»</h3></div></header>
              <div className="ross-invite-actions"><button type="button" onClick={() => setStage({ kind: "reminder", item: nextReminder })}>Ascoltalo ora</button><button type="button" className="ross-invite-later" onClick={() => { actions.setReminder(nextReminder.key, "stopped"); notify("Va bene, non te lo ricordo più"); }}>Non ricordarmelo più</button></div>
            </article>
            <article className="ross-prompt-card ross-reminder-list">
              <header><div><small>Poi</small><h3>Le altre cose da ricordare</h3></div></header>
              {laterReminders.length ? <ul>{laterReminders.map((item) => <li key={item.key}><button type="button" onClick={() => setStage({ kind: "reminder", item })}><span className="ross-reminder-dot"><AlarmClock /></span><span><strong>{item.text.replace(/[.!…]+$/, "")}</strong><small>{whoOf(item)}{item.when ? ` · ${item.when}` : ""}</small></span><ArrowRight /></button></li>)}</ul> : <p>Nient'altro, per ora. Se vuoi, dimmi «ricordami che…».</p>}
            </article>
          </div>
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
  const { state, actions, notify } = useDemo();
  const navigate = useNavigate();
  // Se la struttura ha segnato «Fatto» una richiesta di Elena, la conversazione si apre chiudendo il cerchio.
  const [closing] = useState(() => getMoments().find(momentFilters.daChiudere("elena")) || null);
  const asked = useRef(false); // una richiesta per conversazione, anche tornando indietro
  const [history, setHistory] = useState(closing ? ["cerchio"] : ["apertura"]);
  const [shown, setShown] = useState(0); // parole già comparse nella frase in corso
  const [auto, setAuto] = useState(false);
  const [notes, setNotes] = useState(false);
  const [shared, setShared] = useState(true);
  const [ended, setEnded] = useState(!closing && state.rossJourney.stage === "complete" ? "done" : null);
  const base = script[scriptIndex[history[history.length - 1]]];
  const turn = base.id === "cerchio" && closing ? { ...base, line: `Ciao Elena. ${closing.chiusura}` } : base;
  const words = turn.line.split(" ");
  // La frase di chiusura si dice una volta sola.
  useEffect(() => { if (closing) channelActions.closeWithResident(closing.id); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const revealed = shown >= words.length;
  const previous = history.slice(-3, -1).map((id) => script[scriptIndex[id]]);
  const mood = turn.speaker === "elena" ? (revealed ? "processing" : "listening") : "response";

  // Le parole compaiono come sottotitoli mentre ROSS (o Elena) parla.
  useEffect(() => { setShown(0); }, [turn.id]);
  useEffect(() => {
    if (revealed) return undefined;
    const timer = window.setTimeout(() => setShown((value) => value + 1), turn.speaker === "ross" ? 110 : 150);
    return () => window.clearTimeout(timer);
  }, [shown, revealed, turn.speaker]);
  useEffect(() => { if (!ended) actions.setRossStage(`step-${turn.id}`); }, [turn.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = (end, isShared = shared) => {
    if (end === "later") { notify("Va bene: ROSS resta qui, quando vuoi"); navigate("/ross"); return; }
    if (end === "help") { notify("Il campanello chiama il personale: arriva di persona", "neutral", { description: "ROSS non ha creato nessuna richiesta: non è un sistema di emergenza." }); navigate("/ross"); return; }
    // Il ricordo nuovo esiste solo se Elena ha detto «Sì, segnatela»; arriva ad Anna solo se ha detto sì anche al racconto.
    if (history.includes("ricordo")) actions.completeRossConversation(isShared);
    if (end === "out") actions.goOut("canto");
    setEnded(end);
  };
  const go = (id) => setHistory((list) => [...list, id]);
  const choose = (choice) => {
    // Con il sì di Elena la richiesta arriva alla Struttura 2.0, in «Hanno chiesto».
    if (choice.request === "lampada" && !asked.current) { asked.current = true; channelActions.request(lampRequest); }
    if (choice.share !== undefined) setShared(choice.share);
    if (choice.end) return finish(choice.end, choice.share ?? shared);
    go(choice.next);
  };
  const forward = () => {
    if (!revealed) { setShown(words.length); return; }
    if (turn.choices) return; // qui decide Elena
    const next = nextOf(turn); if (next) go(next);
  };
  const back = () => { if (history.length > 1) setHistory((list) => list.slice(0, -1)); };
  const restart = () => { actions.restartRossJourney(); setHistory(["apertura"]); setShared(true); setEnded(null); };

  // Riproduzione automatica: avanza da sola e si ferma quando tocca a Elena scegliere.
  useEffect(() => {
    if (!auto || !revealed || turn.choices || ended) return undefined;
    const timer = window.setTimeout(forward, turn.speaker === "ross" ? 1700 : 1200);
    return () => window.clearTimeout(timer);
  }); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
      if (event.key === "ArrowRight") { event.preventDefault(); forward(); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); back(); }
      else if (event.key === " ") { event.preventDefault(); setAuto((value) => !value); }
      else if (event.key === "n" || event.key === "N") setNotes((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (ended) {
    const kept = ended === "done" ? Boolean(state.rossJourney.completedAt) : history.includes("ricordo");
    const sharedNow = ended === "done" ? state.rossJourney.shared !== false : shared;
    return <div className="ross-app ross-chat-end screen-enter" data-ross-state="rest">
      <header className="ross-header"><button onClick={() => navigate("/ross")}><ArrowLeft /> Torna a ROSS</button><div className="ross-wordmark"><span>R</span><strong>ROSS</strong></div><span /></header>
      <main>
        <img src={asset("ross-eyes.png")} alt="Gli occhi luminosi di ROSS" className="ross-eyes complete" />
        <h1>{ended === "out" ? "Buon canto, Elena." : "Grazie, Elena."}</h1>
        <p>{ended === "out" ? "Resto in silenzio finché non torni. Poi mi racconti com'è andata." : "Quello che ci siamo detti resta qui. Quando vuoi, ci sono."}</p>
        <section className="ross-chat-summary" aria-label="Cosa resta di questa conversazione">
          <span>Cosa resta di questa conversazione</span>
          <ol>
            <li><strong>La conversazione</strong> resta su questo dispositivo. Non la riceve nessuno.</li>
            <li><strong>Il ricordo nuovo</strong>{kept ? " (la macchina fotografica rossa di Paolo) ROSS lo tiene, perché Elena ha detto sì. Lo può correggere o fargli dimenticare quando vuole." : ": Elena ha preferito non segnarlo, e ROSS non lo tiene."}</li>
            <li><strong>Anna</strong> {kept && sharedNow ? "riceve solo questo ricordo, come racconto, perché Elena ha scelto di condividerlo." : "non riceve nulla: Elena l'ha tenuto per sé."}</li>
          </ol>
        </section>
        <div className="ross-complete-actions"><button className="ross-primary-action" onClick={() => navigate("/ross")}><ArrowLeft /> Torna a ROSS</button><button onClick={restart}><RotateCcw /> Ripeti la conversazione</button></div>
      </main>
    </div>;
  }

  const status = turn.speaker === "elena" ? (revealed ? "Ho capito" : "Ti ascolto…") : revealed ? (turn.choices ? "Aspetto la tua risposta" : "ROSS ha parlato") : "ROSS parla";
  return (
    <div className="ross-app ross-chat screen-enter" data-ross-state={mood}>
      <header className="ross-header ross-chat-header">
        <button type="button" onClick={() => navigate("/ross")}><X /> Esci</button>
        <span className={`ross-chat-status is-${turn.speaker}${revealed ? "" : " is-live"}`}><i />{status}</span>
        <span className="ross-chat-private">Sono ROSS, un compagno digitale basato sull'intelligenza artificiale. Quello che ci diciamo resta qui.</span>
      </header>

      <main className="ross-chat-main">
        <img src={asset("ross-eyes.png")} alt="Gli occhi di ROSS" className={`ross-eyes ross-chat-eyes is-${mood}`} />
        {!(turn.image && revealed) && <div className="ross-chat-history" aria-hidden="true">{previous.map((item) => <p key={item.id} className={`is-${item.speaker}`}><strong>{item.speaker === "ross" ? "ROSS" : "Elena"}</strong>{item.line}</p>)}</div>}
        <section className={`ross-chat-now is-${turn.speaker}`} aria-live="polite">
          <span className="ross-chat-who">{turn.speaker === "ross" ? "ROSS" : "Elena"}</span>
          {turn.speaker === "elena" && !revealed && <span className="ross-chat-wave" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} style={{ animationDelay: `${index * 0.08}s` }} />)}</span>}
          <p className="ross-chat-line">{words.map((word, index) => <span key={index} className={index < shown ? "on" : ""}>{word} </span>)}</p>
        </section>
        {turn.image && revealed && <img className="ross-chat-photo" src={asset(turn.image)} alt="La cartolina di Cefalù che Anna ha mandato a Elena" />}
        {turn.draft && revealed && <span className={`ross-chat-draft${turn.saved ? " is-saved" : ""}`}><Heart /> {turn.saved ? "Segnato tra i tuoi ricordi" : "Nuovo per me · in attesa del tuo sì"}: {turn.draft}</span>}
        {turn.choices && revealed && <div className="ross-chat-choices"><p>Puoi dirmi:</p><div className="ross-say">{turn.choices.map((choice) => <button key={choice.label} type="button" onClick={() => choose(choice)}><Mic aria-hidden="true" />«{choice.label}»</button>)}</div></div>}
      </main>

      <footer className="ross-chat-presenter" aria-label="Comandi per chi presenta">
        <span className="ross-chat-label">Per chi presenta</span>
        <button type="button" onClick={back} disabled={history.length < 2} aria-label="Indietro"><ArrowLeft /></button>
        <button type="button" onClick={() => setAuto((value) => !value)} aria-pressed={auto}>{auto ? <Pause /> : <Play />} {auto ? "Pausa" : "Riproduci"}</button>
        <button type="button" onClick={forward} disabled={revealed && Boolean(turn.choices)}>{turn.speaker === "ross" && revealed && !turn.choices ? "Elena risponde" : revealed ? "Avanti" : "Salta la frase"} <ArrowRight /></button>
        <button type="button" className={notes ? "is-on" : ""} onClick={() => setNotes((value) => !value)} aria-pressed={notes}>Note</button>
        <small>← → per andare · spazio per riprodurre · N per le note</small>
        {notes && <p className="ross-chat-note">{turn.note || (turn.speaker === "elena" ? "Elena parla con parole sue: ROSS ascolta e la sua voce diventa testo." : "")}</p>}
      </footer>
    </div>
  );
}
