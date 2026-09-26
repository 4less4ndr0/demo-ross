export const DEMO_TODAY = "2026-09-21";

export const residents = [
  { id: "elena", name: "Elena Bianchi", initials: "EB", age: 79, room: "204", daysWithRoss: 118, mode: "Attiva", status: "Attività", current: "Laboratorio creativo", lastInteraction: "16:20", participation: 8.1, delta: 0.7, color: "coral", interests: ["Musica italiana", "Sicilia", "Fotografia", "Giardinaggio"], routine: ["08:00 Colazione", "10:00 Attività", "12:30 Pranzo", "14:00 Riposo", "16:00 Conversazione", "19:00 Cena"], summary: "Elena ama raccontare attraverso fotografie e musica. Le conversazioni diventano più ricche quando partono da persone e luoghi della sua storia." },
  { id: "carlo", name: "Carlo Ferri", initials: "CF", age: 83, room: "118", daysWithRoss: 92, mode: "Reattiva", status: "Disponibile", current: "Sala lettura", lastInteraction: "15:44", participation: 6.4, delta: -0.5, color: "mint", interests: ["Calcio", "Giornali", "Orto"] },
  { id: "lucia", name: "Lucia Conti", initials: "LC", age: 76, room: "211", daysWithRoss: 76, mode: "Attiva", status: "Conversazione", current: "Parole e categorie", lastInteraction: "16:02", participation: 7.5, delta: 0.3, color: "lilac", interests: ["Cucina", "Parole", "Teatro"] },
  { id: "mario", name: "Mario Rossi", initials: "MR", age: 81, room: "106", daysWithRoss: 64, mode: "Silenziosa", status: "Riposo", current: "Non disturbare fino alle 17:00", lastInteraction: "12:28", participation: 5.9, delta: -0.2, color: "sand", interests: ["Montagna", "Legno", "Passeggiate"] },
  { id: "teresa", name: "Teresa Gallo", initials: "TG", age: 88, room: "223", daysWithRoss: 143, mode: "Attiva", status: "Attività", current: "Musica in salotto", lastInteraction: "15:31", participation: 8.4, delta: 0.9, color: "mint", interests: ["Coro", "Fiori", "Maglia"] },
  { id: "antonio", name: "Antonio Greco", initials: "AG", age: 74, room: "109", daysWithRoss: 39, mode: "Reattiva", status: "Disponibile", current: "Giardino", lastInteraction: "ieri alle 17:40", participation: 6.8, delta: 0.1, color: "coral", interests: ["Radio", "Automobili", "Scacchi"] },
  { id: "ada", name: "Ada Moretti", initials: "AM", age: 85, room: "215", daysWithRoss: 11, mode: "Reattiva", status: "Disponibile", current: "Salotto", lastInteraction: "11:18", participation: null, delta: null, color: "lilac", interests: ["Poesia", "Cucito"] },
  { id: "bruno", name: "Bruno De Angelis", initials: "BD", age: 80, room: "121", daysWithRoss: 101, mode: "Silenziosa", status: "Riposo", current: "Quiete pomeridiana", lastInteraction: "12:02", participation: 6.1, delta: -0.1, color: "sand", interests: ["Treni", "Storia", "Carte"] },
];

export const memories = [
  { id: "mem-palermo", residentId: "elena", title: "Viaggio a Palermo", category: "Luoghi", description: "Nel 1998 Elena visitò Palermo con il marito. Ricorda il mercato, il mare e molte fotografie.", source: "Residente", status: "Confermata", confidence: 96, lastUsed: "Oggi, 15:58", tags: ["Sicilia", "1998", "viaggio"], people: ["Paolo", "Sofia"] },
  { id: "mem-sofia", residentId: "elena", title: "Sofia, la nipote", category: "Persone", description: "Sofia studia fotografia e telefona spesso la domenica. Elena conserva alcune sue fotografie.", source: "Famiglia", status: "Confermata", confidence: 100, lastUsed: "Ieri", tags: ["famiglia", "fotografia"], people: ["Sofia"] },
  { id: "mem-mina", residentId: "elena", title: "Le canzoni di Mina", category: "Musica", description: "Le canzoni di Mina accompagnavano i pomeriggi in cucina e favoriscono conversazioni lunghe.", source: "Conversazioni", status: "Confermata", confidence: 91, lastUsed: "Oggi, 11:40", tags: ["musica", "cucina"], people: ["Paolo"] },
  { id: "mem-vongole", residentId: "elena", title: "Spaghetti alle vongole", category: "Cibo", description: "Durante i viaggi al mare Paolo ordinava quasi sempre spaghetti alle vongole.", source: "Conversazione · 18 settembre", status: "Da verificare", confidence: 72, lastUsed: "Mai", tags: ["Sicilia", "Paolo", "mare"], people: ["Paolo"] },
  { id: "mem-garden", residentId: "elena", title: "Gerani sul balcone", category: "Routine", description: "Al mattino Elena controllava sempre i gerani prima di colazione.", source: "Residente", status: "Confermata", confidence: 94, lastUsed: "4 giorni fa", tags: ["fiori", "mattino"], people: [] },
  { id: "mem-school", residentId: "elena", title: "Scuola elementare", category: "Lavoro", description: "Ha insegnato per più di trent'anni e ricorda con piacere le recite di fine anno.", source: "Famiglia", status: "Confermata", confidence: 100, lastUsed: "8 giorni fa", tags: ["insegnante", "bambini"], people: ["Anna"] },
  { id: "mem-cefalu", residentId: "elena", title: "La spiaggia di Cefalù", category: "Ricordi", description: "Un ricordo ricorrente delle estati in Sicilia, associato a fotografie e passeggiate serali.", source: "Conversazioni", status: "Suggerita", confidence: 68, lastUsed: "Mai", tags: ["Sicilia", "mare"], people: ["Paolo"] },
];

export const biography = [
  { year: "1947", title: "Nasce a Padova", description: "Cresce con due sorelle in una casa vicina al centro.", place: "Padova", people: ["Famiglia"], source: "Famiglia" },
  { year: "1966", title: "Inizia a insegnare", description: "Il primo incarico in una scuola elementare di quartiere.", place: "Padova", people: ["Anna"], source: "Residente" },
  { year: "1970", title: "Matrimonio con Paolo", description: "Una festa semplice, ricordata soprattutto per la musica.", place: "Abano Terme", people: ["Paolo"], source: "Famiglia" },
  { year: "1973", title: "Nasce la figlia Anna", description: "Le prime estati in famiglia, al mare.", place: "Padova", people: ["Anna", "Paolo"], source: "Famiglia" },
  { year: "1984", title: "Trasferimento", description: "La famiglia si sposta in una casa con un grande balcone.", place: "Treviso", people: ["Anna", "Paolo"], source: "Residente" },
  { year: "1998", title: "Viaggio in Sicilia", description: "Viaggio con Paolo tra Palermo e Cefalù.", place: "Sicilia", people: ["Paolo"], source: "Confermata da famiglia" },
  { year: "2004", title: "Va in pensione", description: "Mantiene i rapporti con alcune colleghe e continua a curare il giardino.", place: "Treviso", people: ["Colleghe"], source: "Operatore" },
  { year: "2008", title: "Nasce Sofia", description: "La nipote con cui condivide oggi l'interesse per la fotografia.", place: "Treviso", people: ["Sofia", "Anna"], source: "Famiglia" },
];

export const activities = [
  { id: "free-talk", title: "Conversazione libera", category: "Conversazione", duration: 12, difficulty: "Leggera", mode: "Individuale", reason: "Buon momento della giornata per un dialogo spontaneo", last: "Oggi", participation: 82, icon: "MessageCircle" },
  { id: "photos", title: "Fotografie di viaggio", category: "Memoria", duration: 15, difficulty: "Leggera", mode: "Individuale", reason: "Collega Sicilia, Sofia e fotografia", last: "3 giorni fa", participation: 91, icon: "Images" },
  { id: "song", title: "Indovina la canzone", category: "Musica", duration: 10, difficulty: "Media", mode: "Individuale", reason: "Le attività musicali hanno favorito interazioni più lunghe", last: "Oggi", participation: 94, icon: "Music2" },
  { id: "associations", title: "Associazioni", category: "Giochi", duration: 8, difficulty: "Leggera", mode: "Individuale", reason: "Attività breve e variabile", last: "6 giorni fa", participation: 76, icon: "Sparkles" },
  { id: "categories", title: "Categorie", category: "Giochi", duration: 7, difficulty: "Media", mode: "Gruppo", reason: "Lucia ha chiesto di ripeterla", last: "Ieri", participation: 88, icon: "ListTree" },
  { id: "memory-game", title: "Memory visivo", category: "Giochi", duration: 6, difficulty: "Leggera", mode: "Individuale", reason: "Partite brevi, senza finalità diagnostica", last: "9 giorni fa", participation: 71, icon: "Grid3X3" },
  { id: "shared-stories", title: "Storie in comune", category: "Socialità", duration: 20, difficulty: "Media", mode: "Gruppo", reason: "Tre ospiti condividono il tema del giardino", last: "4 giorni fa", participation: 84, icon: "Users" },
  { id: "guided-memory", title: "Ricordi guidati", category: "Memoria", duration: 14, difficulty: "Media", mode: "Individuale", reason: "Continua dal racconto sul viaggio del 1998", last: "7 giorni fa", participation: 86, icon: "BookOpen" },
];

const topics = ["Musica", "Famiglia", "Viaggi", "Fotografie", "Giardino", "Lavoro", "Cucina", "Attività di gruppo"];
const types = ["Conversazione", "Memoria", "Musica", "Gioco", "Socialità"];
export const interactions = Array.from({ length: 120 }, (_, index) => {
  const dayOffset = Math.floor(index / 4);
  const date = new Date("2026-09-21T10:00:00");
  date.setDate(date.getDate() - dayOffset);
  const resident = residents[(index * 3 + dayOffset) % residents.length];
  const duration = 7 + ((index * 5 + dayOffset) % 15);
  return {
    id: `int-${index + 1}`,
    residentId: resident.id,
    resident: resident.name,
    date: date.toISOString().slice(0, 10),
    time: `${String(9 + (index % 9)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`,
    duration,
    type: types[(index + dayOffset) % types.length],
    topic: topics[(index * 2 + dayOffset) % topics.length],
    mode: index % 4 === 0 ? "Reattiva" : "Attiva",
    participation: 55 + ((index * 11) % 42),
    memoriesUsed: 1 + (index % 4),
    emerged: index % 5 === 0 ? 1 : 0,
  };
});

export const dailyMetrics = Array.from({ length: 30 }, (_, index) => {
  const date = new Date("2026-09-21T10:00:00");
  date.setDate(date.getDate() - (29 - index));
  const wave = [0, 9, -4, 13, 5, -7, 11][index % 7];
  return {
    date: date.toISOString().slice(5, 10),
    minutes: 214 + wave + ((index * 7) % 31),
    participation: 69 + ((index * 3) % 11) + wave / 5,
    social: 5.8 + ((index * 4) % 12) / 10,
    memories: 1 + (index % 4),
    initiative: 42 + ((index * 9) % 29),
  };
});

export const insights = [
  { id: "i1", category: "Benessere", title: "Teresa ha espresso serenità più spesso del solito", body: "Serenità espressa in 6 conversazioni su 7 questa settimana, rispetto a una media di 4.", period: "Ultimi 7 giorni", evidence: ["6 su 7", "media 4"], residentId: "teresa", action: "Apri il profilo", tone: "mint" },
  { id: "i2", category: "Benessere", title: "Carlo ha avviato meno conversazioni", body: "Negli ultimi 4 giorni Carlo ha avviato 3 conversazioni in meno rispetto alla propria media di 14 giorni.", period: "Ultimi 4 giorni", evidence: ["2 iniziative", "media personale 5"], residentId: "carlo", action: "Osserva andamento", tone: "sand" },
  { id: "i3", category: "Benessere", title: "Lucia ha espresso stanchezza più del solito", body: "Stanchezza espressa in 3 conversazioni su 6 questa settimana (di solito 1). Da osservare di persona.", period: "Ultimi 7 giorni", evidence: ["3 su 6", "media 1"], residentId: "lucia", action: "Apri il profilo", tone: "coral" },
  { id: "i4", category: "Presenza", title: "La fascia 10:00–11:30 è la più utilizzata", body: "Le interazioni del mattino sono mediamente 6 minuti più lunghe, senza differenze rilevanti nella partecipazione.", period: "Ultimi 30 giorni", evidence: ["38 interazioni", "+6 min durata"], action: "Vedi dettaglio", tone: "lilac" },
];

export const dayTimeline = [
  { time: "08:00", title: "Colazione", type: "routine", width: 12 },
  { time: "09:30", title: "Attività creative", type: "activity", width: 18 },
  { time: "11:30", title: "Conversazioni", type: "interaction", width: 11 },
  { time: "12:30", title: "Pranzo", type: "routine", width: 13 },
  { time: "14:00", title: "Quiete", type: "quiet", width: 20 },
  { time: "16:00", title: "Musica", type: "activity", width: 14 },
  { time: "18:00", title: "Passeggiata", type: "interaction", width: 12 },
];

export const graphData = {
  nodes: [
    { id: "Elena", group: "residente", size: 12, detail: "Profilo centrale" },
    { id: "Sofia", group: "persona", size: 9, detail: "Nipote · biografia d'ingresso (famiglia)" },
    { id: "Paolo", group: "persona", size: 8, detail: "Marito · biografia d'ingresso (famiglia)" },
    { id: "Anna", group: "persona", size: 7, detail: "Figlia · referente familiare" },
    { id: "Palermo", group: "luogo", size: 8, detail: "Luogo · biografia d'ingresso" },
    { id: "Cefalù", group: "luogo", size: 7, detail: "Luogo · biografia d'ingresso" },
    { id: "Fotografia", group: "interesse", size: 8, detail: "Interesse · emerso con ROSS" },
    { id: "Mina", group: "musica", size: 7, detail: "Musica · biografia d'ingresso" },
    { id: "Viaggio 1998", group: "evento", size: 8, detail: "Evento · biografia d'ingresso (famiglia)" },
    { id: "Giardinaggio", group: "interesse", size: 6, detail: "Interesse · biografia d'ingresso" },
  ],
  links: [
    ["Elena", "Sofia"], ["Elena", "Paolo"], ["Elena", "Anna"], ["Elena", "Fotografia"], ["Elena", "Mina"], ["Elena", "Giardinaggio"], ["Elena", "Viaggio 1998"], ["Viaggio 1998", "Palermo"], ["Viaggio 1998", "Cefalù"], ["Sofia", "Fotografia"], ["Paolo", "Palermo"], ["Paolo", "Mina"],
  ].map(([source, target]) => ({ source, target })),
};

export const modeSchedule = [
  { start: "07:00", end: "09:00", mode: "Reattiva" },
  { start: "09:00", end: "12:00", mode: "Attiva" },
  { start: "12:00", end: "15:00", mode: "Silenziosa" },
  { start: "15:00", end: "19:00", mode: "Attiva" },
  { start: "19:00", end: "21:00", mode: "Reattiva" },
  { start: "21:00", end: "07:00", mode: "Silenziosa" },
];

export const handoverEntries = [
  { residentId: "elena", source: "ROSS", text: "Partecipazione superiore alla propria media recente; ha espresso serenità.", time: "16:24" },
  { residentId: "carlo", source: "ROSS", text: "Meno interazioni spontanee rispetto agli ultimi giorni. Nessun altro cambiamento rilevato nelle interazioni ROSS.", time: "15:50" },
  { residentId: "lucia", source: "Operatore", text: "Ha chiesto di ripetere domani l'attività sulle categorie.", time: "16:08" },
  { residentId: "teresa", source: "ROSS", text: "L'attività musicale di gruppo è durata 18 minuti, 5 in più della sua media personale.", time: "15:36" },
  { residentId: "antonio", source: "ROSS", text: "Oggi non ha ancora parlato con ROSS; di solito entro le 11 sì. Ha espresso il desiderio di sentire un familiare in 2 conversazioni questa settimana.", time: "15:10" },
];

export const themeOptions = [
  { id: "ross", name: "ROSS", description: "Caldo, umano, editoriale" },
  { id: "neutral", name: "Neutral", description: "Essenziale e professionale" },
  { id: "care", name: "Care", description: "Chiaro, calmo, rassicurante" },
];

export const documents = [
  { id: "doc-fisio-elena", residentId: "elena", kind: "Fisioterapia", title: "Relazione fisioterapica", date: "15 set 2026", author: "Marta Villa · fisioterapista", pages: 2, summary: "Deambulazione con deambulatore, stabile. Obiettivo: due brevi passeggiate al giorno, preferibilmente al mattino." },
  { id: "doc-esami-elena", residentId: "elena", kind: "Esami del sangue", title: "Esami ematochimici di routine", date: "10 set 2026", author: "Laboratorio convenzionato", pages: 3, summary: "Documento caricato e ricercabile. ROSS non interpreta i valori: la lettura resta al medico." },
  { id: "doc-fisio-carlo", residentId: "carlo", kind: "Fisioterapia", title: "Aggiornamento piano motorio", date: "12 set 2026", author: "Marta Villa · fisioterapista", pages: 1, summary: "Esercizi seduti tre volte a settimana. Preferisce svolgerli nella sala lettura." },
];
