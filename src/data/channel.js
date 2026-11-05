// Struttura 2.0: il canale tra struttura, ROSS e ospite.
// La struttura manda a ROSS uno spunto; ROSS lo porta nella conversazione (solo se l'ospite ci sta);
// quando emerge qualcosa di utile, ROSS restituisce di sua iniziativa un insight narrativo.
// Niente trascrizioni, punteggi o dati sanitari: ROSS traduce, non trasmette.

// Quattro ospiti della Residenza Aurora (foto in public/ospiti). `f` serve solo per l'accordo grammaticale.
export const channelResidents = [
  { id: "elena", name: "Elena Bianchi", first: "Elena", initials: "EB", color: "coral", room: "204", mode: "Attiva", f: true },
  { id: "ada", name: "Ada Moretti", first: "Ada", initials: "AM", color: "lilac", room: "215", mode: "Reattiva", f: true },
  { id: "antonio", name: "Antonio Greco", first: "Antonio", initials: "AG", color: "coral", room: "109", mode: "Attiva", f: false },
  { id: "bruno", name: "Bruno De Angelis", first: "Bruno", initials: "BD", color: "sand", room: "121", mode: "Silenziosa", f: false },
];
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

// Insight di esempio: i più recenti in alto. `spunto` è facoltativo (gli insight nascono anche da ciò che
// l'ospite racconta spontaneamente). `state`: "nuovo" | "visto" | "fatto".
export const initialInsights = [
  {
    id: "ins-ada-sarta",
    residentId: "ada",
    when: "Oggi, 11:20",
    spunto: null,
    story: "Ada mi ha raccontato volentieri degli anni in cui faceva la sarta: quando parla di stoffe e cartamodelli le si accende la voce.",
    suggestion: "Potrebbe sentirsi a casa al laboratorio di cucito del giovedì. Invitala di persona, magari chiedendole un consiglio.",
    state: "nuovo",
  },
  {
    id: "ins-elena-coro",
    residentId: "elena",
    when: "Oggi, 10:05",
    spunto: { type: "evento", text: "Venerdì alle 16 il coro dei bambini della scuola Rodari canta in salone." },
    story: "All'inizio Elena era incerta, poi ha detto che i bambini che cantano le ricordano i nipoti piccoli. Ci vuole andare.",
    suggestion: "Tenetele un posto in fondo, vicino alla porta: preferisce poter uscire quando vuole.",
    state: "nuovo",
  },
  {
    id: "ins-antonio-scacchi",
    residentId: "antonio",
    when: "Ieri, 17:40",
    spunto: { type: "attivita", text: "Sabato mattina torneo di scacchi in salotto." },
    story: "Antonio ha ascoltato con interesse e ha chiesto chi ci sarà. Gli piacerebbe, ma da solo non se la sente di presentarsi.",
    suggestion: "Se qualcuno lo accompagna per i primi minuti, probabilmente resta. Bruno gioca a carte con lui: potrebbero andarci insieme.",
    state: "visto",
  },
  {
    id: "ins-bruno-treni",
    residentId: "bruno",
    when: "Ieri, 16:10",
    spunto: null,
    story: "Bruno ha voluto raccontarmi dei suoi anni da capotreno. Ha tanta voglia di raccontare, più di quanto mostri durante il giorno.",
    suggestion: "Chiedigli dei treni mentre gli porti il caffè del pomeriggio: è un argomento che lo apre.",
    state: "nuovo",
  },
  {
    id: "ins-ada-nipote",
    residentId: "ada",
    when: "Ieri, 11:00",
    spunto: { type: "persona", text: "Sabato viene a trovarla la nipote Chiara." },
    story: "Ho nominato Chiara, ma oggi Ada non aveva voglia di parlarne. Non ho insistito: ci tornerò solo se sarà lei a riprendere il discorso.",
    suggestion: "Nessuna fretta. Sabato, quando arriva Chiara, basta chiedere ad Ada dove preferisce riceverla.",
    state: "visto",
    consent: false,
  },
  {
    id: "ins-elena-piante",
    residentId: "elena",
    when: "Lunedì, 15:30",
    spunto: { type: "ricordo", text: "Il suo orto a Treviso, con i pomodori e il basilico." },
    story: "Elena ha ripreso con piacere il ricordo dell'orto e mi ha chiesto se in residenza c'è qualche pianta di cui potersi prendere cura.",
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
    residentId: r.id,
    when: "Adesso",
    spunto: { type: spunto.type, text: spunto.text },
    story,
    suggestion,
    state: "nuovo",
    simulated: true,
  };
}
