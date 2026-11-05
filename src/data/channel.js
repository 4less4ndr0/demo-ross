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

// Cosa ha capito ROSS dagli spunti di ciascuno: come li accoglie, mai cosa ha raccontato.
export const spuntoReading = {
  elena: "Con Elena funzionano le cose da fare con le mani e i ricordi legati alla musica. Le persone nuove preferisce conoscerle di persona, non solo sentirle nominare.",
  ada: "Ada è arrivata da poco: le piacciono le proposte tranquille e in piccoli gruppi. Le feste affollate, per ora, no.",
  antonio: "Antonio dice sì volentieri, ma da solo fatica a presentarsi: le proposte funzionano meglio se qualcuno lo accompagna.",
  bruno: "Bruno risponde bene a ciò che riguarda i treni e le carte, soprattutto nel tardo pomeriggio, dopo il riposo.",
};

// Nella demo la risposta di ROSS a un nuovo spunto è scritta in anticipo, per tipo di spunto, in terza persona.
// Nella realtà arriverebbe solo se e quando l'ospite ne parla. Restituisce esito, racconto e cosa fare.
export function simulatedReply(moment) {
  const r = channelResident(moment.residentId);
  const le = r.f ? "le" : "gli";
  const contenta = r.f ? "contenta" : "contento";
  const tipo = moment.spunto?.tipo;
  const replies = {
    attivita: ["pensa", `${r.first} ha ascoltato la proposta con curiosità e ha chiesto a ROSS qualche dettaglio. Ci sta pensando.`, "Riproponigliela di persona il giorno stesso: un invito a voce conta più di un avviso in bacheca."],
    ricordo: ["accolto", `${r.first} ha ripreso volentieri il ricordo e ci si è ${r.f ? "soffermata" : "soffermato"} a lungo.`, `Chiedi${le} di raccontartelo, la prossima volta che passi: sarà ${contenta} che qualcuno se ne ricordi.`],
    evento: ["accolto", `${r.first} è ${contenta} di saperlo in anticipo e ha detto a ROSS che ci vuole essere.`, `Ricordaglielo la mattina stessa e chiedi${le} dove preferisce sedersi.`],
    persona: ["accolto", `Quando ROSS ha nominato questa persona, ${r.first} ha avuto voglia di parlarne.`, `Se ti capita, chiedi${le} di questa persona: è un argomento che ${r.f ? "la" : "lo"} fa stare bene.`],
  };
  const [esito, racconto, cosaPuoiFare] = replies[tipo] || ["accolto", `${r.first} ha accolto lo spunto con piacere.`, `Riprendilo con ${r.f ? "lei" : "lui"} quando ne hai occasione: è un buon punto da cui partire.`];
  return { esito, racconto, cosaPuoiFare };
}
