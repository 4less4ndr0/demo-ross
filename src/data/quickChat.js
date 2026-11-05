// Struttura 2.0 · «ROSS, al volo»: le risposte della piccola chat in basso a destra.
// Non è uno strumento per interrogare ROSS sugli ospiti: è una scorciatoia su ciò che ROSS ha già restituito
// nella 2.0 (gli stessi momenti di src/data/moments.js, letti con momentFilters), più un modo rapido di mandare
// qualcosa a ROSS (sempre con conferma) e un'assistenza su come funziona ROSS.
// Stesso approccio di chatScript.js (intenti a parole chiave normalizzate), ma con soli questi intenti:
// niente priorità, segnali, presenza o report della vecchia chat.
// Voce: ROSS in terza persona, al tu verso chi lavora in struttura. Risposte di massimo 3 righe o 3 voci,
// con un link alla schermata giusta. Le risposte sono preparate: non c'è un modello AI.
import { channelResident, channelResidents, floorLabel, floors, spuntoTypeLabel } from "./channel";
import { whenText } from "./demoClock";
import { announcementPhrase, esiti, requestStates } from "./moments";
import { momentFilters } from "../state/channelStore";

const BASE = "/struttura-2";
const normalize = (text = "") => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " ");
const has = (q, ...words) => words.some((w) => q.includes(w));
const firstSentence = (text = "") => (text.match(/^.*?[.!?](\s|$)/) || [text])[0].trim();
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
// Una voce sta su una riga: oltre gli 80 caratteri si taglia con i puntini.
const short = (text = "", max = 80) => (text.length > max ? `${text.slice(0, max - 1).replace(/[\s,;:.]+\S*$/, "")}…` : text);

// Il nome di un ospite nel testo (il nome di battesimo basta).
export function residentIn(text) {
  const words = normalize(text).split(/[^a-z]+/);
  return channelResidents.find((r) => normalize(r.name).split(" ").some((part) => part.length > 2 && words.includes(part)));
}

export const suggestions = [
  "Le ultime 3 cose emerse",
  "Ci sono richieste aperte?",
  "Cosa è emerso con Bruno questa settimana?",
  "Quali spunti sono piaciuti di recente?",
  "Proponi a Bruno il torneo di sabato",
  "Cosa vede la struttura?",
];
const fallbackPills = ["Le ultime 3 cose emerse", "Ci sono richieste aperte?", "Cos'è uno spunto?"];
export const greeting = { text: "Ciao! Sono ROSS, al volo. Ti ricordo in un attimo ciò che ti ho già raccontato, e porto agli ospiti i tuoi spunti. Non parlo di ciò che gli ospiti mi raccontano.", suggestions };

const link = (label, to) => ({ label, to });
const portrait = (r, tab = "conversazioni") => link(`Apri il ritratto di ${r.first}`, `${BASE}/ospiti/${r.id}?tab=${tab}`);
const about = link("Cosa è reale e cosa è simulato", "#about");

// Una riga per un momento: chi o quando, e cosa, in parole semplici.
const lineOf = (m) => short(lineText(m));
const lineText = (m) => {
  if (m.origine === "spunto") return `Dal tuo spunto «${m.spunto.testo}»: ${esiti[m.esito]?.toLowerCase()}`;
  if (m.origine === "richiesta") return `Ha chiesto: ${m.richiesta.charAt(0).toLowerCase()}${m.richiesta.slice(1)} (${requestStates[m.stato].toLowerCase()})`;
  return m.titolo || firstSentence(m.racconto);
};

// Il tipo di uno spunto dalle parole del testo.
const guessType = (q) => has(q, "ricord") ? "ricordo" : has(q, "festa", "coro", "concerto", "incontro", "evento", "spettacolo", "messa") ? "evento" : has(q, "conosc", "present", "nipote", "figli", "amic") ? "persona" : "attivita";

// Gli intenti, in ordine: prima ciò che ROSS non fa (e perché), poi le azioni, i riassunti e le spiegazioni.
const intents = [
  // ——— Cosa non fa ———
  { id: "contenuto", match: (q) => !has(q, "perche") && has(q, "di cosa ha parlato", "di cosa parla", "cosa ha detto", "cosa ha raccontato", "cosa gli ha detto", "cosa le ha detto", "trascri", "conversazione di", "cosa si sono detti"),
    answer: (q, ctx) => { const r = residentIn(ctx.question); return { text: r ? `Quello che ${r.first} racconta resta tra ${r.f ? "lei" : "lui"} e ROSS. Posso dirti come ha accolto gli ultimi spunti.` : "Quello che un ospite racconta resta tra l'ospite e ROSS. Posso dirti come ha accolto gli ultimi spunti.", link: r ? portrait(r, "spunti") : link("Apri il canale", BASE), suggestions: ["Quali spunti sono piaciuti di recente?"] }; } },
  { id: "classifica", match: (q) => has(q, "chi sta peggio", "chi sta meglio", "classific", "chi usa meno", "chi usa di piu", "chi parla di piu", "chi parla meno", "il piu solo", "confront", "chi e piu", "chi e meno"),
    answer: () => ({ text: "ROSS non mette in fila le persone: ognuno si confronta solo con sé stesso. Posso dirti le ultime cose emerse.", suggestions: ["Le ultime 3 cose emerse"] }) },
  { id: "urgenze-spiega", match: (q) => has(q, "cosa fa ross con le urgenz", "ross con le urgenz", "ross e le urgenz", "se c e un urgenz", "emergenze?"),
    answer: () => ({ text: "ROSS non è un sistema di emergenza: se un ospite parla di salute o di un'urgenza, lo rimanda subito al campanello e al personale, e non crea nessuna richiesta.", link: about }) },
  { id: "salute", match: (q) => has(q, "dolore", "fa male", "sta male", "caduta", "caduto", "urgenz", "emergenz", "febbre", "medicin", "farmac", "pressione", "glicemia", "terapi", "sintom", "malat"),
    answer: () => ({ text: "Per la salute e le urgenze serve il personale, subito: ROSS non è un sistema di emergenza.", link: about }) },
  { id: "gestione", match: (q) => has(q, "turn", "compit", "report", "quanti", "quante", "numer", "percentual", "statistic", "kpi", "panoramic", "assegna", "grafic", "riepilog"),
    answer: () => ({ text: "Non è il mio lavoro: io ti racconto cosa emerge e porto i tuoi spunti agli ospiti.", link: link("Apri il canale", BASE) }) },

  // ——— Agire al volo, sempre con conferma ———
  { id: "proponi", match: (q) => /^(proponi|proponigli|proponile|suggerisci|proporre)\b/.test(q.trim()),
    answer: (q, ctx) => {
      const r = residentIn(ctx.question);
      if (!r) return { text: "Dimmi a chi: per esempio «Proponi a Bruno il torneo di sabato». Lo spunto lo preparo io, e lo mando solo se mi dici di sì." };
      const at = ctx.question.toLowerCase().indexOf(r.first.toLowerCase());
      const rest = at >= 0 ? ctx.question.slice(at + r.first.length).trim() : "";
      const testo = capitalize((rest || "").replace(/[?.!]+$/, "")) || "";
      if (!testo) return { text: `Cosa vuoi proporre a ${r.first}? Scrivilo dopo il nome: per esempio «Proponi a ${r.first} la radio in compagnia».` };
      return { text: "Ecco lo spunto che ho preparato:", draft: { kind: "spunto", residentId: r.id, testo: `${testo}.`, tipo: guessType(normalize(testo)) } };
    } },
  { id: "comunica", match: (q) => /^(di|dì|dici|avvisa|fai sapere|comunica|ricorda a tutti)\b/.test(q.trim()) && has(q, " a tutti", "piano", "avvisa", "fai sapere", "comunica", ...channelResidents.map((r) => normalize(r.first))),
    answer: (q, ctx) => {
      const r = residentIn(ctx.question);
      const floor = has(q, "primo piano") ? "1" : has(q, "secondo piano") ? "2" : null;
      const perChi = floor && floors.includes(floor) ? { tipo: "piano", piano: floor } : r && !has(q, " a tutti") ? { tipo: "ospite", residentId: r.id } : { tipo: "tutti" };
      const after = ctx.question.match(/\bche\b\s+(.*)$/i)?.[1] || ctx.question.replace(/^\S+\s+(a\s+tutti|al\s+primo\s+piano|al\s+secondo\s+piano|a\s+\S+)\s*/i, "");
      const testo = capitalize(after.replace(/[?.!]+$/, "").trim());
      if (!testo) return { text: "Cosa vuoi far sapere? Per esempio «Di' a tutti che domani manca l'acqua calda»." };
      return { text: "Ecco la comunicazione che ho preparato:", draft: { kind: "comunicazione", testo, perChi, quandoDirlo: "oggi" } };
    } },

  // ——— Riassumere ciò che ROSS ha già restituito ———
  { id: "spunti-piaciuti", match: (q) => has(q, "spunt") && has(q, "piaciut", "accolt", "funzionat", "andati bene", "andato bene"),
    answer: (q, ctx) => {
      const liked = ctx.moments.filter((m) => m.origine === "spunto" && m.esito === "accolto").slice(0, 3);
      return liked.length
        ? { text: "Gli ultimi spunti accolti volentieri:", items: liked.map((m) => short(`${channelResident(m.residentId).first}: «${m.spunto.testo}» · ${whenText(m.quando)}`, 90)), link: link("Apri il canale", BASE) }
        : { text: "Di recente nessuno spunto è stato accolto volentieri: prova a proporne uno.", link: link("Apri il canale", BASE) };
    } },
  { id: "richieste", match: (q) => has(q, "richiest", "hanno chiesto", "cose pratiche"),
    answer: (q, ctx) => {
      const open = [...ctx.moments.filter(momentFilters.daVedere), ...ctx.moments.filter(momentFilters.ciPensiamo)];
      return open.length
        ? { text: open.length > 3 ? "Sì, ecco le prime. Le altre sono nella scheda:" : "Sì:", items: open.slice(0, 3).map((m) => `${channelResident(m.residentId).first}: ${m.richiesta.charAt(0).toLowerCase()}${m.richiesta.slice(1)} (${requestStates[m.stato].toLowerCase()})`), link: link("Apri le richieste", `${BASE}/richieste`) }
        : { text: "No, nessuna richiesta aperta dagli ospiti.", link: link("Apri le richieste", `${BASE}/richieste`) };
    } },
  { id: "persona", match: (q, ctx) => Boolean(residentIn(ctx.question)) && has(q, "emers", "settiman", "come va", "novita", "come sta", "cosa c e", "ultime"),
    answer: (q, ctx) => {
      const r = residentIn(ctx.question);
      const recent = ctx.moments.filter(momentFilters.storia(r.id)).filter((m) => (Date.now() - new Date(m.quando)) / 86400000 < 7).slice(0, 3);
      return recent.length
        ? { text: `Con ${r.first}, questa settimana:`, items: recent.map((m) => `${whenText(m.quando)} · ${lineOf(m)}`), link: portrait(r) }
        : { text: `Questa settimana con ${r.first} non è emerso niente di nuovo.`, link: portrait(r) };
    } },
  { id: "ultime", match: (q) => has(q, "ultim", "emers", "novita", "cosa c e di nuovo", "cosa e successo"),
    answer: (q, ctx) => {
      const last = ctx.moments.filter(momentFilters.canale).slice(0, 3);
      return last.length
        ? { text: "Le ultime cose emerse:", items: last.map((m) => `${channelResident(m.residentId).first} · ${lineOf(m)}`), link: link("Apri il canale", BASE) }
        : { text: "Per ora niente di nuovo da fare: quando emerge qualcosa, te lo racconto nel canale.", link: link("Apri il canale", BASE) };
    } },

  // ——— Spiegare ROSS ———
  { id: "cosa-vede", match: (q) => has(q, "cosa vede la struttura", "cosa vediamo", "cosa sa la struttura", "cosa posso vedere", "cosa vedo"),
    answer: () => ({ text: "La struttura sa come sta un ospite e di cosa ha bisogno, mai di cosa ha parlato: come ha accolto i tuoi spunti, i suoi interessi per categoria, le richieste pratiche che ha confermato.", link: about }) },
  { id: "perche", match: (q) => has(q, "perche") && has(q, "parlano", "sapere", "conversazion", "vedere", "racconta"),
    answer: () => ({ text: "È la regola d'oro: ciò che un ospite racconta resta tra lui e ROSS. ROSS traduce, non trasmette: ti dice come sta e cosa può aiutarlo, così puoi fare qualcosa senza tradire la sua fiducia.", link: about }) },
  { id: "spunto", match: (q) => has(q, "cos e uno spunto", "cosa e uno spunto", "che cos e uno spunto", "cosa sono gli spunti", "come funziona uno spunto", "spunto?"),
    answer: () => ({ text: "Uno spunto è una proposta che mandi a ROSS per un ospite: un'attività, un ricordo, un evento, una persona. ROSS lo porta nella conversazione solo se l'ospite ci sta, poi ti racconta com'è andata.", link: link("Apri il canale", BASE) }) },
  { id: "no", match: (q) => has(q, "dice di no", "dice no", "non vuole", "rifiuta", "se dice no"),
    answer: () => ({ text: "Va bene così: ROSS non insiste e non ci torna. A te arriva solo «Non era il momento» o «Non è piaciuto», senza dettagli. Decide sempre l'ospite.", link: link("Apri il canale", BASE) }) },
];

// La risposta a una domanda: { text, items?, link?, draft?, suggestions? }.
export function quickAnswer(question, moments) {
  const q = normalize(question);
  const ctx = { question, moments };
  const intent = intents.find((i) => i.match(q, ctx));
  if (intent) return { intent: intent.id, ...intent.answer(q, ctx) };
  return { intent: "sconosciuto", text: "Questo non lo so fare. Puoi chiedermi…", suggestions: fallbackPills };
}

// Le parole con cui la bozza si mostra prima di mandarla.
export const draftSummary = (d) => d.kind === "spunto"
  ? { who: channelResident(d.residentId), what: d.testo, kind: spuntoTypeLabel(d.tipo) }
  : { who: null, target: d.perChi.tipo === "tutti" ? "Tutti gli ospiti" : d.perChi.tipo === "piano" ? floorLabel(d.perChi.piano) : channelResident(d.perChi.residentId)?.first, what: d.testo, phrase: announcementPhrase(d.testo, d.quandoDirlo) };
