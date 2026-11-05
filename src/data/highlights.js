// Struttura 2.0 · «Con ROSS» come feed dei momenti più interessanti, giorno per giorno.
// Ciò che conta è la qualità: iniziative, uscite raccontate, scelte, interessi emersi, momenti da osservare.
// Sempre per categoria e con le parole di un collega: mai di cosa ha parlato, mai trascrizioni, mai conteggi.
// `day`: giorni fa rispetto a oggi nella demo (0 = oggi). `kind`: vedi `highlightKinds`.
import { DEMO_TODAY } from "./demoData";

export const highlightKinds = {
  iniziativa: { label: "Di sua iniziativa", tone: "good" },
  uscita: { label: "Fuori dalla stanza", tone: "good" },
  famiglia: { label: "Con la famiglia", tone: "good" },
  interesse: { label: "Interesse emerso", tone: "good" },
  invito: { label: "Un invito", tone: "neutral" },
  scelta: { label: "Una sua scelta", tone: "neutral" },
  delicato: { label: "Da osservare di persona", tone: "watch" },
  spunto: { label: "Dal tuo spunto", tone: "neutral" },
  spontaneo: { label: "L'ha raccontato spontaneamente", tone: "good" },
};

export const rossHighlights = {
  elena: [
    { day: 0, time: "16:20", kind: "famiglia", title: "Ha scelto di raccontare la sua mattina alla figlia", text: "È lei a decidere cosa arriva alla famiglia: oggi ha detto di sì." },
    { day: 0, time: "12:10", kind: "uscita", title: "È andata al laboratorio dei gerani", text: "Ha detto «ci vado» all'invito e al rientro ha raccontato che è stata una bella mattina." },
    { day: 2, time: "09:15", kind: "iniziativa", title: "Ha chiesto lei di ascoltare musica", text: "Ha cercato ROSS al mattino, senza aspettare una proposta." },
    { day: 4, time: "17:05", kind: "interesse", title: "È emerso un interesse: le fotografie di viaggio", text: "La struttura ne vede la categoria, non l'episodio. Può diventare uno spunto per il laboratorio creativo." },
  ],
  ada: [
    { day: 1, time: "08:05", kind: "iniziativa", title: "Ha salutato ROSS per prima", text: "Una piccola cosa, ma è la prima volta da quando è arrivata." },
    { day: 3, time: "10:30", kind: "delicato", title: "Ha chiesto di stare in silenzio", text: "Una mattina più stanca: ROSS ha rispettato il silenzio. Da guardare di persona, senza fretta." },
    { day: 6, time: "09:40", kind: "scelta", title: "Ha scelto «Quando ti chiamo»", text: "Preferisce essere lei a cercare ROSS, almeno nelle prime settimane." },
  ],
  antonio: [
    { day: 0, time: "11:00", kind: "delicato", title: "Oggi non ha ancora cercato ROSS", text: "Di solito lo fa in mattinata. Basta passare a salutarlo." },
    { day: 2, time: "16:30", kind: "invito", title: "All'invito alla radio ha risposto «magari un'altra volta»", text: "È la risposta che dà spesso agli inviti di ROSS: un invito di persona funziona meglio." },
    { day: 5, time: "16:10", kind: "iniziativa", title: "Si è acceso spiegando come funzionano le cose", text: "Quando può spiegare, parla volentieri e a lungo: è una leva per dargli un compito." },
  ],
  bruno: [
    { day: 2, time: "17:10", kind: "iniziativa", title: "Ha chiamato ROSS dopo il riposo", text: "È in silenzio quasi sempre, ma nel tardo pomeriggio ha voglia di raccontare." },
    { day: 4, time: "15:20", kind: "delicato", title: "Ha detto di avere freddo nel pomeriggio", text: "Verificare la temperatura della stanza dopo pranzo." },
  ],
  carlo: [
    { day: 0, time: "09:05", kind: "iniziativa", title: "Ha chiesto il programma della giornata", text: "Come ogni mattina: per lui ROSS è uno strumento pratico, ed è il suo modo." },
    { day: 1, time: "18:30", kind: "scelta", title: "Si è fatto ricordare la partita", text: "Un promemoria chiesto da lui, per non perdersela." },
    { day: 3, time: "10:15", kind: "interesse", title: "È emerso un interesse: l'orto", text: "La struttura ne vede la categoria. Potrebbe dare una mano nell'orto della residenza." },
  ],
  lucia: [
    { day: 0, time: "15:10", kind: "iniziativa", title: "Ha chiesto di nuovo il gioco delle parole", text: "Le piace, e lo chiede lei: un buon modo per cominciare." },
    { day: 1, time: "14:40", kind: "delicato", title: "A un certo punto ha fatto fatica a seguire il filo", text: "ROSS ha rallentato e semplificato. Da guardare di persona nei prossimi giorni." },
    { day: 2, time: "13:50", kind: "invito", title: "Ha chiesto di uscire in giardino", text: "Da sola non ci va: le serve qualcuno che la accompagni, nel primo pomeriggio." },
  ],
  mario: [
    { day: 0, time: "17:20", kind: "iniziativa", title: "Ha cercato ROSS, come sempre dopo le 17", text: "Poche parole, senza fretta: è il suo modo, e va bene così." },
    { day: 2, time: "08:30", kind: "delicato", title: "Ha riferito un fastidio al ginocchio, al mattino", text: "Chiedergli come va e farlo presente a chi se ne occupa." },
  ],
  teresa: [
    { day: 0, time: "15:31", kind: "iniziativa", title: "Ha proposto una canzone per il gruppo", text: "Usa ROSS per trovare cose da fare con gli altri." },
    { day: 3, time: "17:45", kind: "uscita", title: "È andata al canto e ha portato con sé un'altra ospite", text: "Una risorsa per tutta la residenza: si può chiederle di accogliere chi è appena arrivato." },
  ],
};

// Giorni fa da un'etichetta del canale: «Oggi, 11:20», «Ieri», «Venerdì, 15:30», «2 settimane fa».
const weekdays = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const todayDate = new Date(`${DEMO_TODAY}T12:00:00`);
export function dayAndTime(when = "") {
  const [head, time] = when.split(",").map((t) => t.trim());
  const h = head.toLowerCase();
  if (h === "oggi" || h === "adesso") return { day: 0, time: time || (h === "adesso" ? "adesso" : "") };
  if (h === "ieri") return { day: 1, time: time || "" };
  const weeks = h.match(/^(\d+)\s+settiman/);
  if (weeks) return { day: 7 * Number(weeks[1]), time: "" };
  const w = weekdays.indexOf(h);
  if (w >= 0) { const back = (todayDate.getDay() - w + 7) % 7 || 7; return { day: back, time: time || "" }; }
  return { day: 30, time: "" };
}

const dayFormat = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" });
export function dayLabel(day) {
  const date = new Date(todayDate); date.setDate(date.getDate() - day);
  const full = dayFormat.format(date);
  if (day === 0) return ["Oggi", full];
  if (day === 1) return ["Ieri", full];
  if (day < 7) return [full.charAt(0).toUpperCase() + full.slice(1), ""];
  return [day < 14 ? "La settimana scorsa" : `${Math.round(day / 7)} settimane fa`, full];
}
