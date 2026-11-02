// Ciò che Anna manda a ROSS è libero: testo scritto o dettato, con o senza allegato.
// ROSS lo rielabora e lo riordina per Elena: capisce che cos'è (promemoria, foto, domanda, ricordo,
// canzone, pensiero) e lo trasforma in una frase semplice da dire a voce.
// Nella demo la rielaborazione è fatta con regole semplici sul testo: è simulata, non c'è un modello AI.

const clean = (text = "") => text.replace(/\s+/g, " ").trim();
const quote = (text) => `«${clean(text).replace(/[.!…]+$/, "")}»`;

const isMedicine = (text) => /medicin|pastigli|pillol|gocce|compress|farmac/i.test(text);

export function kindOf({ text = "", image, attachmentName }) {
  const t = clean(text).toLowerCase();
  if (/ricord(a|ati|arti|ati di)\b.*\b(prendere|chiam|telefon|appuntament|domani|stasera|alle|medicin|pastigli|pillol|gocce)|non dimenticar|promemoria/.test(t) || isMedicine(t)) return "reminder";
  if (image) return "photo";
  if (/canzon|ascolt|musica|cantante|disco|radio/.test(t)) return "music";
  if (t.endsWith("?")) return "topic";
  if (/ti ricordi|quando eri|quella volta|da piccol|anni fa|estate|una volta/.test(t)) return "memory";
  if (attachmentName && !t) return "message";
  return "message";
}

// La frase che ROSS dirà a Elena, con le parole di Anna tra virgolette: ROSS non le cambia il senso.
export function rossLineFor({ kind, text = "", image, attachmentName }, author = "Anna") {
  const words = clean(text);
  switch (kind) {
    case "reminder":
      return `${author} ti ha lasciato un promemoria: ${quote(words)}.${isMedicine(words) ? " Se hai bisogno, chiedi pure al personale." : ""}`;
    case "photo":
      return `${author} ti ha mandato una foto.${words ? ` Ti scrive: ${quote(words)}.` : ""} La guardiamo insieme?`;
    case "music":
      return `${author} ti ha suggerito della musica: ${quote(words)}. La ascoltiamo insieme?`;
    case "topic":
      return `${author} ha una domanda per te: ${quote(words)}. Se vuoi, rispondimi: glielo racconto io.`;
    case "memory":
      return `${author} ti ha raccontato un ricordo: ${quote(words)}. Te lo ricordi anche tu?`;
    default:
      if (!words && attachmentName) return `${author} ti ha mandato un allegato: ${attachmentName}. Lo guardiamo insieme?`;
      return `${author} ti ha mandato un pensiero: ${quote(words)}.`;
  }
}

// Un titolo breve per l'elenco "Da te": le prime parole del messaggio.
export function titleFor({ text = "", attachmentName, kind }) {
  const words = clean(text).replace(/[.!?…,]+$/, "").split(" ");
  if (words[0]) return words.length > 7 ? `${words.slice(0, 7).join(" ")}…` : words.join(" ");
  return attachmentName || (kind === "photo" ? "Una foto per Elena" : "Un allegato per Elena");
}

export const kindLabels = {
  reminder: "Promemoria",
  photo: "Foto",
  message: "Pensiero",
  topic: "Domanda",
  memory: "Ricordo",
  music: "Musica",
};

// Il "riordino": un messaggio può contenere più cose. ROSS separa i promemoria dal resto,
// così Elena li sente uno alla volta e nell'ordine giusto.
export function elaborate({ text = "", image, attachmentName }, author = "Anna") {
  const sentences = clean(text).match(/[^.!?]+[.!?]*/g)?.map(clean).filter(Boolean) || [];
  const reminders = sentences.filter((sentence) => kindOf({ text: sentence }) === "reminder");
  const rest = sentences.filter((sentence) => !reminders.includes(sentence)).join(" ");
  const parts = [];
  if (rest || image || attachmentName) {
    const kind = kindOf({ text: rest, image, attachmentName });
    const main = kind === "reminder" ? "message" : kind;
    parts.push({ kind: main, text: rest, rossLine: rossLineFor({ kind: main, text: rest, image, attachmentName }, author) });
  }
  reminders.forEach((sentence) => parts.push({ kind: "reminder", text: sentence, rossLine: rossLineFor({ kind: "reminder", text: sentence }, author) }));
  return parts;
}

// Ordine in cui ROSS racconta a Elena ciò che è arrivato: prima ciò che si guarda (le foto) e le parole di Anna,
// poi domande, ricordi e musica; i promemoria per ultimi, così sono l'ultima cosa che resta in mente.
const priority = ["photo", "message", "topic", "memory", "music", "reminder"];
export const byPriority = (a, b) => (priority.indexOf(a.kind) - priority.indexOf(b.kind)) || String(b.createdAt || "").localeCompare(String(a.createdAt || ""));

// Frase d'esempio per la dettatura quando il browser non sa trascrivere la voce.
export const sampleDictation = "Mamma, domenica vengo a trovarti con Sofia e ti porto le foto del mare. Ricordati la pastiglia della sera!";
