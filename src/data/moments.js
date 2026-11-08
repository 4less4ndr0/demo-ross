// Struttura · la sola fonte dei «momenti» emersi con ROSS (decisione del 05/11/2026).
// Canale («Cosa è emerso»), ritratto → Spunti e ritratto → Con ROSS leggono questi stessi momenti,
// ognuno con il suo filtro (vedi src/state/channelStore.js). Visto/Fatto cambia in un posto e vale ovunque.
//
// Ogni momento:
//   id, residentId, quando (data reale, ISO: calcolata da oggi con at(giorniFa, "hh:mm"));
//   origine: "spunto" | "spontaneo" | "invito" | "scelta" | "da_osservare" | "richiesta" | "comunicazione";
//   spunto { testo, tipo } ed esito ("accolto" | "pensa" | "no" | "non_ora" | "attesa"), solo se nasce da uno spunto;
//   titolo (facoltativo, la frase che apre il momento), racconto (1–2 frasi), cosaPuoiFare (facoltativo);
//   stato: "nuovo" | "visto" | "fatto"; etichetta e tono facoltativi (altrimenti dipendono dall'origine);
//   consenso: false se non va scritto «… è contento che tu lo sappia».
//
// Le **richieste pratiche** (origine "richiesta") sono piccole cose della quotidianità che l'ospite chiede a ROSS
// di far sapere al personale e che conferma con un sì: la stanza e gli oggetti (luce, bagno, TV, finestre), il comfort
// (freddo, caldo, rumore), i piccoli desideri pratici («vorrei il giornale»). Non sono avvisi: ROSS non deduce mai
// un problema da ciò che sente, e salute e urgenze non diventano mai una richiesta (ROSS rimanda al campanello).
// Campi: richiesta (una riga con parole semplici), categoria ("stanza" | "comfort" | "desiderio"), chiusura (la frase
// con cui ROSS chiude il cerchio con l'ospite), stato ("in_attesa" | "ci_pensiamo" | "fatto"), chiusoConOspite.
// Se lo stesso ospite chiede di nuovo la stessa cosa, non nasce una card nuova: quella esistente ricorda
// quando l'ha chiesto di nuovo (richiestoDiNuovo). Con «Fatto» si salva fattoIl, per «Fatte oggi».
// Le lamentele su cose e servizi («la minestra arriva fredda») si accettano come piccolo desiderio;
// quelle su persone (staff o ospiti) per ora non si inoltrano.
// Niente priorità, assegnazioni, tempi di risposta o numeri: non è un sistema di ticket.
//
// Le **comunicazioni** (origine "comunicazione") vanno nella direzione opposta: un'informazione pratica che la
// struttura vuole far sapere agli ospiti («domani manca l'acqua calda»). ROSS la dice a ciascuno nel suo momento,
// con parole semplici. Campi: testo, frase (come la dice ROSS), perChi { tipo: "tutti" | "piano" | "ospite",
// piano, residentId }, quandoDirlo ("oggi" | "domani"), stato ("in_corso" | "detto"). Non sono spunti e non entrano
// nella storia della persona.
//
// La voce è sempre quella di un collega, in terza persona («ROSS ha nominato…»), e segue la regola d'oro:
// come è stato accolto uno spunto e cosa aiuta, mai cosa ha raccontato l'ospite (docs/contratto-informativo-struttura.md).
import { at } from "./demoClock";

export const esiti = {
  accolto: "Accolto volentieri",
  pensa: "Ci sta pensando",
  no: "Non è piaciuto",
  non_ora: "Non era il momento",
  attesa: "In attesa del momento giusto",
};

const originLabel = {
  spunto: "Dal tuo spunto",
  spontaneo: "L'ha raccontato spontaneamente",
  invito: "Un invito",
  scelta: "Una sua scelta",
  da_osservare: "Da guardare di persona",
  richiesta: "Ha chiesto",
};
export const labelOf = (m) => m.etichetta || originLabel[m.origine];
export const requestStates = { in_attesa: "Da vedere", ci_pensiamo: "Ci pensiamo noi", fatto: "Fatto" };
export const requestCategoryLabels = { stanza: "Stanza e oggetti", comfort: "Comfort", desiderio: "Piccoli desideri" };
export const announcementStates = { in_corso: "In corso", detto: "Detto a tutti" };
// Come ROSS dice all'ospite una comunicazione scritta dalla struttura: le parole della struttura, più il quando.
export const announcementPhrase = (testo, quandoDirlo) => `${testo.trim().replace(/[.!]?$/, ".")}${quandoDirlo === "domani" ? " Te lo ricordo domattina." : ""}`;
export const requestCategories = ["stanza", "comfort", "desiderio"];
// La richiesta della lampada che Elena fa sul tablet, nella conversazione con ROSS.
export const lampRequest = { residentId: "elena", categoria: "stanza", richiesta: "La lampada sul comodino non si accende", chiusura: "Hanno sistemato la lampada sul comodino: adesso la luce va bene?" };
// Il tono colora il momento nelle linee del tempo: verde va bene, corallo da guardare di persona, neutro il resto.
export const toneOf = (m) => m.tono || (m.origine === "da_osservare" ? "watch" : m.origine === "spunto" ? (m.esito === "accolto" ? "good" : "neutral") : m.origine === "spontaneo" ? "good" : "neutral");

const iso = (days, time) => at(days, time).toISOString();
const m = (days, time, fields) => ({ quando: iso(days, time), spunto: null, esito: null, cosaPuoiFare: null, stato: "visto", ...fields });

// I momenti di partenza della demo. Le date sono scostamenti da oggi: la demo è sempre «intorno a oggi».
export const seedMoments = () => [
  // Elena: il ponte che funziona.
  m(0, "16:20", { id: "elena-famiglia", residentId: "elena", origine: "scelta", etichetta: "Con la famiglia", tono: "good", titolo: "Ha scelto di raccontare la sua mattina alla figlia", racconto: "È lei a decidere cosa arriva alla famiglia: oggi ha detto di sì." }),
  m(0, "12:10", { id: "elena-gerani", residentId: "elena", origine: "invito", etichetta: "Fuori dalla stanza", tono: "good", titolo: "È andata al laboratorio dei gerani", racconto: "Ha accettato l'invito di ROSS e al rientro ha raccontato che è stata una bella mattina." }),
  m(0, "10:05", { id: "ins-elena-coro", residentId: "elena", origine: "spunto", spunto: { testo: "Venerdì alle 16 il coro dei bambini della scuola Rodari canta in salone.", tipo: "evento" }, esito: "accolto", racconto: "All'inizio Elena era incerta, poi l'idea le è piaciuta: ci vuole andare.", cosaPuoiFare: "Tienile un posto in fondo, vicino alla porta: preferisce poter uscire quando vuole.", stato: "nuovo" }),
  m(2, "09:15", { id: "elena-musica", residentId: "elena", origine: "spontaneo", etichetta: "Di sua iniziativa", titolo: "Ha chiesto lei di ascoltare musica", racconto: "Ha cercato ROSS al mattino, senza aspettare una proposta." }),
  m(3, "15:30", { id: "ins-elena-piante", residentId: "elena", origine: "spunto", spunto: { testo: "Il suo orto a Treviso, con i pomodori e il basilico.", tipo: "ricordo" }, esito: "accolto", racconto: "Elena ha ripreso con piacere questo ricordo e ha chiesto a ROSS se in residenza c'è qualche pianta di cui potersi prendere cura.", cosaPuoiFare: "Affidale i vasi del terrazzo al secondo piano: le darebbe un piccolo compito tutto suo.", stato: "fatto" }),
  m(4, "17:05", { id: "elena-foto", residentId: "elena", origine: "spontaneo", etichetta: "Interesse emerso", titolo: "È emerso un interesse per le fotografie di viaggio", racconto: "La struttura ne vede la categoria, non l'episodio.", cosaPuoiFare: "Al prossimo laboratorio creativo potrebbe portare le sue foto: invitala di persona.", stato: "nuovo" }),
  m(14, "10:30", { id: "h-elena-mina", residentId: "elena", origine: "spunto", spunto: { testo: "Le canzoni di Mina che ascoltava la domenica.", tipo: "ricordo" }, esito: "accolto", racconto: "L'ha accolto con un sorriso e ha chiesto di riascoltare una canzone." }),
  m(20, "16:00", { id: "h-elena-teresa", residentId: "elena", origine: "spunto", spunto: { testo: "Teresa, che canta nel coro della residenza.", tipo: "persona" }, esito: "pensa", racconto: "Le piacerebbe conoscerla, ma preferisce che qualcuno gliela presenti di persona." }),
  m(21, "09:30", { id: "h-elena-ginnastica", residentId: "elena", origine: "spunto", spunto: { testo: "Ginnastica dolce del martedì mattina.", tipo: "attivita" }, esito: "no", racconto: "Non la incuriosisce: preferisce le attività in cui si usano le mani." }),

  // Ada: la nuova arrivata.
  m(0, "11:20", { id: "ins-ada-sarta", residentId: "ada", origine: "spontaneo", racconto: "Con Ada il cucito è un argomento che le accende la voce: ne parla volentieri, e a lungo.", cosaPuoiFare: "Potrebbe sentirsi a casa al laboratorio di cucito del giovedì. Invitala di persona, magari chiedendole un consiglio.", stato: "nuovo" }),
  m(1, "11:00", { id: "ins-ada-nipote", residentId: "ada", origine: "spunto", spunto: { testo: "Sabato viene a trovarla la nipote Chiara.", tipo: "persona" }, esito: "non_ora", racconto: "ROSS ha nominato Chiara, ma oggi Ada non aveva voglia di parlarne. Non ha insistito: ci tornerà solo se sarà lei a riprendere il discorso.", cosaPuoiFare: "Nessuna fretta. Quando arriva Chiara, basta chiedere ad Ada dove preferisce riceverla.", consenso: false }),
  m(1, "08:05", { id: "ada-saluto", residentId: "ada", origine: "spontaneo", etichetta: "Di sua iniziativa", titolo: "Ha salutato ROSS per prima", racconto: "Una piccola cosa, ma è la prima volta da quando è arrivata." }),
  m(3, "10:30", { id: "ada-silenzio", residentId: "ada", origine: "da_osservare", titolo: "Ha chiesto a ROSS di stare in silenzio", racconto: "Una mattina più stanca: ROSS ha rispettato il silenzio.", cosaPuoiFare: "Passa a trovarla di persona, senza fretta." }),
  m(6, "09:40", { id: "ada-modalita", residentId: "ada", origine: "scelta", titolo: "Ha scelto «Quando ti chiamo»", racconto: "Preferisce essere lei a cercare ROSS, almeno nelle prime settimane." }),
  m(7, "10:15", { id: "h-ada-lettura", residentId: "ada", origine: "spunto", spunto: { testo: "Il gruppo di lettura del mercoledì.", tipo: "attivita" }, esito: "accolto", racconto: "L'idea le piace: ha chiesto se può portare un libro suo." }),
  m(8, "15:00", { id: "h-ada-tombola", residentId: "ada", origine: "spunto", spunto: { testo: "La tombola di sabato pomeriggio in salone.", tipo: "evento" }, esito: "no", racconto: "Per ora no: preferisce i momenti tranquilli, in pochi." }),

  // Antonio: lo adora, forse troppo.
  m(0, "11:00", { id: "antonio-assente", residentId: "antonio", origine: "da_osservare", titolo: "Oggi non ha ancora cercato ROSS", racconto: "Di solito lo fa in mattinata.", cosaPuoiFare: "Basta passare a salutarlo.", stato: "nuovo" }),
  m(1, "17:40", { id: "ins-antonio-scacchi", residentId: "antonio", origine: "spunto", spunto: { testo: "Sabato mattina torneo di scacchi in salotto.", tipo: "attivita" }, esito: "pensa", racconto: "Antonio ha ascoltato con interesse e ha chiesto a ROSS chi ci sarà. Gli piacerebbe, ma da solo non se la sente di presentarsi.", cosaPuoiFare: "Se qualcuno lo accompagna per i primi minuti, probabilmente resta. Bruno gioca a carte con lui: potrebbero andarci insieme." }),
  m(2, "16:30", { id: "antonio-radio", residentId: "antonio", origine: "invito", titolo: "Ha rimandato a un'altra volta l'invito alla radio", racconto: "Succede spesso con gli inviti di ROSS.", cosaPuoiFare: "Un invito di persona funziona meglio: passa a prenderlo tu." }),
  m(5, "16:10", { id: "antonio-spiegare", residentId: "antonio", origine: "spontaneo", etichetta: "Di sua iniziativa", titolo: "Si accende quando può spiegare come funzionano le cose", racconto: "In quei momenti parla volentieri e a lungo." }),
  m(14, "16:30", { id: "h-antonio-radio", residentId: "antonio", origine: "spunto", spunto: { testo: "La partita alla radio, domenica in salotto.", tipo: "evento" }, esito: "accolto", racconto: "Gli è piaciuto molto: ha chiesto a che ora comincia." }),
  m(21, "11:00", { id: "h-antonio-pittura", residentId: "antonio", origine: "spunto", spunto: { testo: "Il laboratorio di pittura del venerdì.", tipo: "attivita" }, esito: "no", racconto: "Ha detto che non fa per lui, senza giri di parole." }),

  // Bruno: senza famiglia vicina.
  m(1, "16:10", { id: "ins-bruno-treni", residentId: "bruno", origine: "spontaneo", racconto: "Con Bruno l'interesse per i treni apre la conversazione: ha voglia di raccontare, più di quanto mostri durante il giorno.", cosaPuoiFare: "Chiedigli dei treni mentre gli porti il caffè del pomeriggio: è un argomento che lo apre.", stato: "nuovo" }),
  m(2, "17:10", { id: "bruno-chiamata", residentId: "bruno", origine: "spontaneo", etichetta: "Di sua iniziativa", titolo: "Ha chiamato ROSS dopo il riposo", racconto: "È in silenzio quasi sempre, ma nel tardo pomeriggio ha voglia di raccontare." }),
  m(7, "17:00", { id: "h-bruno-carte", residentId: "bruno", origine: "spunto", spunto: { testo: "Il gruppo di carte del giovedì alle 15.", tipo: "attivita" }, esito: "pensa", racconto: "L'idea gli piace, ma alle 15 riposa: chiede se si può fare più tardi." }),
  m(14, "17:15", { id: "h-bruno-ferrovia", residentId: "bruno", origine: "spunto", spunto: { testo: "Gli anni in ferrovia, dalla biografia d'ingresso.", tipo: "ricordo" }, esito: "accolto", racconto: "L'ha accolto volentieri, contento che qualcuno se ne ricordasse." }),

  // Carlo: lo usa come uno strumento.
  m(0, "09:05", { id: "carlo-programma", residentId: "carlo", origine: "spontaneo", etichetta: "Di sua iniziativa", titolo: "Ha chiesto il programma della giornata", racconto: "Come ogni mattina: per lui ROSS è uno strumento pratico, ed è il suo modo." }),
  m(1, "18:30", { id: "carlo-partita", residentId: "carlo", origine: "scelta", titolo: "Si è fatto ricordare la partita", racconto: "Un promemoria chiesto da lui." }),
  m(3, "10:15", { id: "carlo-orto", residentId: "carlo", origine: "spontaneo", etichetta: "Interesse emerso", titolo: "È emerso un interesse per l'orto", racconto: "La struttura ne vede la categoria, non l'episodio.", cosaPuoiFare: "Potrebbe dare una mano nell'orto della residenza: chiediglielo al mattino.", stato: "nuovo" }),

  // Lucia: quella che sta cambiando.
  m(0, "15:10", { id: "lucia-parole", residentId: "lucia", origine: "spontaneo", etichetta: "Di sua iniziativa", titolo: "Ha chiesto di nuovo il gioco delle parole", racconto: "Le piace, e lo chiede lei: un buon modo per cominciare." }),
  m(1, "14:40", { id: "lucia-filo", residentId: "lucia", origine: "da_osservare", titolo: "A un certo punto ha fatto fatica a seguire il filo", racconto: "ROSS ha rallentato e semplificato.", cosaPuoiFare: "Guarda di persona come sta nei prossimi giorni.", stato: "nuovo" }),
  m(2, "13:50", { id: "lucia-giardino", residentId: "lucia", origine: "spontaneo", etichetta: "Ha chiesto", tono: "neutral", titolo: "Ha chiesto di uscire in giardino", racconto: "Da sola non ci va.", cosaPuoiFare: "Accompagnala per un quarto d'ora nel primo pomeriggio, quando c'è il sole." }),

  // Mario: il riservato.
  m(0, "17:20", { id: "mario-17", residentId: "mario", origine: "spontaneo", etichetta: "Di sua iniziativa", titolo: "Ha cercato ROSS, come sempre dopo le 17", racconto: "Poche parole, senza fretta: è il suo modo, e va bene così." }),

  // Richieste pratiche di esempio, confermate dall'ospite, con stati diversi. Quella della lampada di Elena nasce sul tablet.
  m(1, "15:40", { id: "req-bruno-freddo", residentId: "bruno", origine: "richiesta", confermato: true, categoria: "comfort", richiesta: "In camera fa freddo nel pomeriggio", chiusura: "Hanno guardato il riscaldamento della tua camera: adesso il pomeriggio va meglio?", stato: "in_attesa", richiestoDiNuovo: iso(0, "15:10") }),
  m(0, "12:40", { id: "req-teresa-minestra", residentId: "teresa", origine: "richiesta", confermato: true, categoria: "desiderio", richiesta: "La minestra della cena arriva fredda", chiusura: "In cucina hanno saputo della minestra: stasera com'era?", stato: "in_attesa" }),
  m(1, "09:10", { id: "req-lucia-giornale", residentId: "lucia", origine: "richiesta", confermato: true, categoria: "desiderio", richiesta: "Vorrebbe il giornale al mattino", chiusura: "Da domani il giornale ti arriva al mattino: ti va bene così?", stato: "ci_pensiamo" }),
  m(2, "18:20", { id: "req-carlo-telecomando", residentId: "carlo", origine: "richiesta", confermato: true, categoria: "stanza", richiesta: "Il telecomando della TV non funziona", chiusura: "Hanno cambiato le pile del telecomando: adesso la TV si accende?", stato: "fatto", fattoIl: iso(0, "10:30"), chiusoConOspite: true }),

  // Comunicazioni dalla struttura agli ospiti, di esempio.
  m(0, "09:00", { id: "com-acqua", origine: "comunicazione", testo: "Domani mattina manca l'acqua calda fino alle 10", frase: "Domani mattina, fino alle 10, l'acqua calda non c'è. Te lo ricordo domattina.", perChi: { tipo: "tutti" }, quandoDirlo: "oggi", stato: "in_corso" }),
  m(2, "11:00", { id: "com-parrucchiere", origine: "comunicazione", testo: "Giovedì alle 15 arriva il parrucchiere al primo piano", frase: "Giovedì alle 15 arriva il parrucchiere al primo piano.", perChi: { tipo: "piano", piano: "1" }, quandoDirlo: "oggi", stato: "detto" }),

  // Teresa: la veterana che trascina gli altri.
  m(0, "15:31", { id: "teresa-canzone", residentId: "teresa", origine: "spontaneo", etichetta: "Di sua iniziativa", titolo: "Ha proposto una canzone per il gruppo", racconto: "Usa ROSS per trovare cose da fare con gli altri." }),
  m(3, "17:45", { id: "teresa-canto", residentId: "teresa", origine: "invito", etichetta: "Fuori dalla stanza", tono: "good", titolo: "È andata al canto e ha portato con sé un'altra ospite", racconto: "Una risorsa per tutta la residenza." }),
];
