import { residents } from "./demoData";

// Struttura 2.0: il canale tra struttura, ROSS e ospite.
// La struttura manda a ROSS uno spunto; ROSS lo porta nella conversazione (solo se l'ospite ci sta);
// quando emerge qualcosa di utile, ROSS restituisce di sua iniziativa un insight narrativo.
// Niente trascrizioni, punteggi o dati sanitari: ROSS traduce, non trasmette.

// Gli ospiti della Residenza Aurora (stessi dati e foto della Struttura). `f` serve solo per l'accordo grammaticale.
const female = new Set(["elena", "ada", "lucia", "teresa"]);
export const channelResidents = residents
  .map((r) => ({ ...r, first: r.name.split(" ")[0], f: female.has(r.id) }))
  .sort((a, b) => a.name.localeCompare(b.name, "it"));
export const channelResident = (id) => channelResidents.find((r) => r.id === id);

export const spuntoTypes = [
  { id: "attivita", label: "Attività" },
  { id: "ricordo", label: "Ricordo" },
  { id: "evento", label: "Evento" },
  { id: "persona", label: "Persona" },
];
export const spuntoTypeLabel = (id) => spuntoTypes.find((t) => t.id === id)?.label;

// Come ROSS porterà lo spunto, a seconda della modalità scelta dall'ospite.
export const timingFor = (resident) => ({
  Attiva: `Lo proporrà a ${resident.first} nella prossima conversazione, se ${resident.f ? "lei" : "lui"} ne ha voglia.`,
  Reattiva: `${resident.first} parla con ROSS quando vuole ${resident.f ? "lei" : "lui"}: lo spunto aspetterà quel momento.`,
  Silenziosa: `${resident.first} ha chiesto a ROSS di stare in silenzio: lo spunto aspetterà che sia ${resident.f ? "lei" : "lui"} a chiamarlo.`,
}[resident.mode]);

// Come è stato accolto uno spunto: è tutto ciò che la struttura deve sapere della conversazione.
// La regola d'oro resta: ROSS dice come è andata e cosa può aiutare, mai cosa ha raccontato l'ospite.
export const receptions = {
  volentieri: "Accolto volentieri",
  pensa: "Ci sta pensando",
  "non-ora": "Non era il momento",
  no: "Non è piaciuto",
};

// Spunti più vecchi, già ripresi da ROSS: compaiono solo nel ritratto dell'ospite (scheda Spunti).
export const spuntoHistory = [
  { id: "h-elena-mina", residentId: "elena", when: "2 settimane fa", type: "ricordo", text: "Le canzoni di Mina che ascoltava la domenica.", reception: "volentieri", story: "L'ha accolto con un sorriso e ha chiesto di riascoltare una canzone." },
  { id: "h-elena-ginnastica", residentId: "elena", when: "3 settimane fa", type: "attivita", text: "Ginnastica dolce del martedì mattina.", reception: "no", story: "Non la incuriosisce: preferisce le attività in cui si usano le mani." },
  { id: "h-elena-teresa", residentId: "elena", when: "3 settimane fa", type: "persona", text: "Teresa, che canta nel coro della residenza.", reception: "pensa", story: "Le piacerebbe conoscerla, ma preferisce che qualcuno gliela presenti di persona." },
  { id: "h-ada-lettura", residentId: "ada", when: "1 settimana fa", type: "attivita", text: "Il gruppo di lettura del mercoledì.", reception: "volentieri", story: "L'idea le piace: ha chiesto se può portare un libro suo." },
  { id: "h-ada-tombola", residentId: "ada", when: "1 settimana fa", type: "evento", text: "La tombola di sabato pomeriggio in salone.", reception: "no", story: "Per ora no: preferisce i momenti tranquilli, in pochi." },
  { id: "h-antonio-radio", residentId: "antonio", when: "2 settimane fa", type: "evento", text: "La partita alla radio, domenica in salotto.", reception: "volentieri", story: "Gli è piaciuto molto: ha chiesto a che ora comincia." },
  { id: "h-antonio-pittura", residentId: "antonio", when: "3 settimane fa", type: "attivita", text: "Il laboratorio di pittura del venerdì.", reception: "no", story: "Ha detto che non fa per lui, senza giri di parole." },
  { id: "h-bruno-ferrovia", residentId: "bruno", when: "2 settimane fa", type: "ricordo", text: "Gli anni in ferrovia, dalla biografia d'ingresso.", reception: "volentieri", story: "Ne ha parlato volentieri, contento che qualcuno se ne ricordasse." },
  { id: "h-bruno-carte", residentId: "bruno", when: "1 settimana fa", type: "attivita", text: "Il gruppo di carte del giovedì alle 15.", reception: "pensa", story: "L'idea gli piace, ma alle 15 riposa: chiede se si può fare più tardi." },
];

// Cosa ha capito ROSS dagli spunti di ciascuno: come li accoglie, mai cosa ha raccontato.
export const spuntoReading = {
  elena: "Con Elena funzionano le cose da fare con le mani e i ricordi legati alla musica. Le persone nuove preferisce conoscerle di persona, non solo sentirle nominare.",
  ada: "Ada è arrivata da poco: le piacciono le proposte tranquille e in piccoli gruppi. Le feste affollate, per ora, no.",
  antonio: "Antonio dice sì volentieri, ma da solo fatica a presentarsi: le proposte funzionano meglio se qualcuno lo accompagna.",
  bruno: "Bruno risponde bene a ciò che riguarda i treni e le carte, soprattutto nel tardo pomeriggio, dopo il riposo.",
};

// Insight di esempio: i più recenti in alto. `spunto` è facoltativo (gli insight nascono anche da ciò che
// l'ospite racconta spontaneamente). `state`: "nuovo" | "visto" | "fatto".
export const initialInsights = [
  {
    id: "ins-ada-sarta",
    residentId: "ada",
    when: "Oggi, 11:20",
    spunto: null,
    story: "Con Ada il cucito è un argomento che le accende la voce: ne parla volentieri, e a lungo.",
    suggestion: "Potrebbe sentirsi a casa al laboratorio di cucito del giovedì. Invitala di persona, magari chiedendole un consiglio.",
    state: "nuovo",
  },
  {
    id: "ins-elena-coro",
    residentId: "elena",
    when: "Oggi, 10:05",
    spunto: { type: "evento", text: "Venerdì alle 16 il coro dei bambini della scuola Rodari canta in salone." },
    reception: "volentieri",
    story: "All'inizio Elena era incerta, poi l'idea le è piaciuta: ci vuole andare.",
    suggestion: "Tenetele un posto in fondo, vicino alla porta: preferisce poter uscire quando vuole.",
    state: "nuovo",
  },
  {
    id: "ins-antonio-scacchi",
    residentId: "antonio",
    when: "Ieri, 17:40",
    spunto: { type: "attivita", text: "Sabato mattina torneo di scacchi in salotto." },
    reception: "pensa",
    story: "Antonio ha ascoltato con interesse e ha chiesto chi ci sarà. Gli piacerebbe, ma da solo non se la sente di presentarsi.",
    suggestion: "Se qualcuno lo accompagna per i primi minuti, probabilmente resta. Bruno gioca a carte con lui: potrebbero andarci insieme.",
    state: "visto",
  },
  {
    id: "ins-bruno-treni",
    residentId: "bruno",
    when: "Ieri, 16:10",
    spunto: null,
    story: "Con Bruno i treni sono l'argomento che apre la conversazione: ha voglia di raccontare, più di quanto mostri durante il giorno.",
    suggestion: "Chiedigli dei treni mentre gli porti il caffè del pomeriggio: è un argomento che lo apre.",
    state: "nuovo",
  },
  {
    id: "ins-ada-nipote",
    residentId: "ada",
    when: "Ieri, 11:00",
    spunto: { type: "persona", text: "Sabato viene a trovarla la nipote Chiara." },
    reception: "non-ora",
    story: "Ho nominato Chiara, ma oggi Ada non aveva voglia di parlarne. Non ho insistito: ci tornerò solo se sarà lei a riprendere il discorso.",
    suggestion: "Nessuna fretta. Sabato, quando arriva Chiara, basta chiedere ad Ada dove preferisce riceverla.",
    state: "visto",
    consent: false,
  },
  {
    id: "ins-elena-piante",
    residentId: "elena",
    when: "Venerdì, 15:30",
    spunto: { type: "ricordo", text: "Il suo orto a Treviso, con i pomodori e il basilico." },
    reception: "volentieri",
    story: "Elena ha ripreso con piacere questo ricordo e mi ha chiesto se in residenza c'è qualche pianta di cui potersi prendere cura.",
    suggestion: "Affidatele i vasi del terrazzo al secondo piano: le darebbe un piccolo compito tutto suo.",
    state: "fatto",
  },
];

// Nella demo la risposta di ROSS a un nuovo spunto è scritta in anticipo, per tipo di spunto.
// Nella realtà arriverebbe solo se e quando l'ospite ne parla.
export function simulatedInsight(spunto) {
  const r = channelResident(spunto.residentId);
  const le = r.f ? "le" : "gli";
  const contenta = r.f ? "contenta" : "contento";
  const templates = {
    attivita: [
      `${r.first} ha ascoltato la proposta con curiosità e mi ha chiesto qualche dettaglio. Ci sta pensando.`,
      "Riproponigliela di persona il giorno stesso: un invito a voce conta più di un avviso in bacheca.",
    ],
    ricordo: [
      `${r.first} ha ripreso volentieri il ricordo e ci si è ${r.f ? "soffermata" : "soffermato"} a lungo. Le parole venivano facili.`,
      `Chiedi${le} di raccontartelo, la prossima volta che passi: sarà ${contenta} che qualcuno se ne ricordi.`,
    ],
    evento: [
      `${r.first} è ${contenta} di saperlo in anticipo e mi ha detto che ci vuole essere.`,
      `Ricordaglielo la mattina stessa e chiedi${le} dove preferisce sedersi.`,
    ],
    persona: [
      `Quando ho nominato questa persona ${r.first} ha sorriso e ha avuto voglia di parlarne.`,
      `Se ti capita, chiedi${le} di questa persona: è un argomento che ${r.f ? "la" : "lo"} fa stare bene.`,
    ],
  };
  const [story, suggestion] = templates[spunto.type] || [
    `${r.first} ha accolto lo spunto con piacere e ne abbiamo parlato un po'.`,
    `Riprendilo con ${r.f ? "lei" : "lui"} quando ne hai occasione: è un buon punto da cui partire.`,
  ];
  return {
    id: `ins-${spunto.id}`,
    reception: spunto.type === "attivita" ? "pensa" : "volentieri",
    residentId: r.id,
    when: "Adesso",
    spunto: { type: spunto.type, text: spunto.text },
    story,
    suggestion,
    state: "nuovo",
    simulated: true,
  };
}
