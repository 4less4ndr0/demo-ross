// Stato condiviso della Struttura 2.0: la sola fonte dei momenti emersi con ROSS (src/data/moments.js).
// Canale, ritratto → Spunti e ritratto → Con ROSS leggono gli stessi momenti con il loro filtro (`momentFilters`):
// Visto/Fatto cambia in un posto e si aggiorna ovunque. Vive a livello di modulo, così la risposta simulata
// di ROSS arriva anche se si cambia pagina.
//
// Nel browser si salvano solo le modifiche: lo stato dei momenti di partenza e i momenti nati da nuovi spunti.
// I momenti di partenza si ricalcolano ogni volta da oggi, così la demo resta sempre «intorno a oggi».
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { channelResident, floorOf, simulatedReply } from "../data/channel";
import { announcementPhrase } from "../data/moments";
import { daysAgo } from "../data/demoClock";
import { seedMoments } from "../data/moments";

const STORAGE_KEY = "ross-struttura2-v2";
const REPLY_DELAY = 6000; // demo: ROSS «risponde» dopo pochi secondi

const load = () => {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved?.created) return saved; } catch { /* storage non disponibile */ }
  return { overrides: {}, created: [] };
};

let saved = load();
let snapshot = [];
const listeners = new Set();
const timers = new Map();

const build = () => [...seedMoments().map((m) => ({ ...m, ...saved.overrides[m.id] })), ...saved.created]
  .sort((a, b) => new Date(b.quando) - new Date(a.quando));
snapshot = build();

const set = (next) => {
  saved = next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* ignora */ }
  snapshot = build();
  listeners.forEach((listener) => listener());
};
const update = (id, patch) => saved.created.some((m) => m.id === id)
  ? { ...saved, created: saved.created.map((m) => (m.id === id ? { ...m, ...patch } : m)) }
  : { ...saved, overrides: { ...saved.overrides, [id]: { ...saved.overrides[id], ...patch } } };

// ROSS risponde a ogni spunto in attesa (nella demo dopo pochi secondi): lo stesso momento passa
// da «in attesa» al suo esito, con il racconto e cosa si può fare, e torna in cima come nuovo.
const schedule = (moment) => {
  if (timers.has(moment.id)) return;
  timers.set(moment.id, window.setTimeout(() => {
    timers.delete(moment.id);
    const current = saved.created.find((m) => m.id === moment.id);
    if (!current || current.esito !== "attesa") return;
    set(update(moment.id, { ...simulatedReply(current), quando: new Date().toISOString(), stato: "nuovo", simulato: true }));
    toast(`ROSS racconta com'è andata con ${channelResident(moment.residentId).first}`, {
      description: "È in cima a «Cosa è emerso» e nel suo ritratto.",
      action: { label: "Leggi", onClick: () => document.getElementById(`m-${moment.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }) },
    });
  }, REPLY_DELAY));
};
if (typeof window !== "undefined") saved.created.filter((m) => m.esito === "attesa").forEach(schedule);
// Se tablet e Struttura 2.0 sono aperti in due finestre, una modifica in una si vede anche nell'altra.
if (typeof window !== "undefined") window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY) return;
  saved = load(); snapshot = build(); listeners.forEach((listener) => listener());
});

export const channelActions = {
  // Uno spunto (dal canale, dal ritratto o dalla rete delle passioni) crea un momento «spunto» in attesa.
  send({ residentId, testo, tipo = null }) {
    const now = new Date().toISOString();
    const moment = { id: `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, residentId, quando: now, inviato: now, origine: "spunto", spunto: { testo, tipo }, esito: "attesa", racconto: "", cosaPuoiFare: null, stato: "nuovo" };
    set({ ...saved, created: [moment, ...saved.created] });
    schedule(moment);
    return moment;
  },
  // Richiesta pratica dal tablet: parte solo dopo il sì dell'ospite («Sì, diglielo»), mai da una deduzione di ROSS.
  // Non crea un avviso: arriva in «Hanno chiesto» nel canale della Struttura 2.0.
  request({ residentId, richiesta, categoria, chiusura }) {
    const now = new Date().toISOString();
    // Chiesta di nuovo, e non ancora fatta: nessuna card nuova, quella esistente lo ricorda.
    const same = snapshot.find((m) => m.origine === "richiesta" && m.residentId === residentId && m.richiesta === richiesta && m.stato !== "fatto");
    if (same) { set(update(same.id, { richiestoDiNuovo: now })); return same; }
    const moment = { id: `req-${residentId}-${Date.now()}`, residentId, quando: now, origine: "richiesta", categoria, richiesta, chiusura, confermato: true, stato: "in_attesa", chiusoConOspite: false };
    set({ ...saved, created: [moment, ...saved.created] });
    return moment;
  },
  // «Ci pensiamo noi» e «Fatto» sulle richieste, con «Annulla». Con «Fatto» ROSS chiude il cerchio con l'ospite
  // alla conversazione successiva; dal canale la richiesta sparisce.
  requestStep(id, next) {
    const before = saved;
    const moment = snapshot.find((m) => m.id === id);
    if (!moment) return;
    const stato = moment.stato === next ? "in_attesa" : next;
    set(update(id, { stato, chiusoConOspite: false, fattoIl: stato === "fatto" ? new Date().toISOString() : null }));
    const first = channelResident(moment.residentId).first;
    toast(stato === "fatto" ? `Fatto: ROSS lo dirà a ${first} alla prossima conversazione` : stato === "ci_pensiamo" ? `Ci pensiamo noi: ${first} lo saprà quando è fatto` : "Di nuovo in attesa", { action: { label: "Annulla", onClick: () => set(before) } });
  },
  // Una comunicazione pratica agli ospiti (non è uno spunto): ROSS la dice a ciascuno nel suo momento.
  announce({ testo, perChi, quandoDirlo }) {
    const moment = { id: `com-${Date.now()}`, quando: new Date().toISOString(), origine: "comunicazione", testo: testo.trim(), frase: announcementPhrase(testo, quandoDirlo), perChi, quandoDirlo, stato: "in_corso", dettaA: [] };
    set({ ...saved, created: [moment, ...saved.created] });
    toast("Inviata a ROSS", { description: "La dirà a ciascuno nel suo momento, con parole semplici.", action: { label: "Annulla", onClick: () => set({ ...saved, created: saved.created.filter((m) => m.id !== moment.id) }) } });
    return moment;
  },
  // Il tablet l'ha detta a un ospite: se era solo per lui, è «Detto a tutti».
  toldTo(id, residentId) {
    const m = snapshot.find((x) => x.id === id);
    if (!m || (m.dettaA || []).includes(residentId)) return;
    set(update(id, { dettaA: [...(m.dettaA || []), residentId], ...(m.perChi?.tipo === "ospite" ? { stato: "detto" } : {}) }));
  },
  // Il tablet ha chiuso il cerchio con l'ospite: la frase non si ripete.
  closeWithResident(id) { set(update(id, { chiusoConOspite: true })); },
  // Visto e Fatto si accendono e si spengono, con «Annulla».
  mark(id, next) {
    const before = saved;
    const moment = snapshot.find((m) => m.id === id);
    if (!moment) return;
    const stato = moment.stato === next ? (next === "fatto" ? "visto" : "nuovo") : next;
    set(update(id, { stato }));
    const first = channelResident(moment.residentId).first;
    toast({ nuovo: "Segnato come nuovo", visto: `Visto: ${first}`, fatto: `Fatto: ${first}` }[stato], { action: { label: "Annulla", onClick: () => set(before) } });
  },
};

// I filtri delle tre viste sulla stessa fonte.
export const momentFilters = {
  // Canale, «Cosa è emerso»: cosa fare adesso, per tutti gli ospiti. Solo ciò che ha un «Cosa puoi fare»,
  // non ancora Fatto, degli ultimi 7 giorni; i più recenti in alto.
  canale: (m) => m.origine !== "richiesta" && Boolean(m.cosaPuoiFare) && m.stato !== "fatto" && m.esito !== "attesa" && daysAgo(m.quando) < 7,
  // Scheda «Richieste», dagli ospiti: le richieste pratiche confermate, per stato. «Fatte oggi»: solo oggi e ieri.
  richieste: (m) => m.origine === "richiesta" && m.stato !== "fatto",
  daVedere: (m) => m.origine === "richiesta" && m.stato === "in_attesa",
  ciPensiamo: (m) => m.origine === "richiesta" && m.stato === "ci_pensiamo",
  fatteOggi: (m) => m.origine === "richiesta" && m.stato === "fatto" && daysAgo(m.fattoIl || m.quando) <= 1,
  // Scheda «Richieste», agli ospiti: le comunicazioni pratiche inviate.
  comunicazioni: (m) => m.origine === "comunicazione",
  // Tablet: le comunicazioni per quell'ospite (per tutti, per il suo piano o solo per lui).
  comunicazioniPer: (resident) => (m) => m.origine === "comunicazione" && (m.perChi?.tipo === "tutti" || (m.perChi?.tipo === "piano" && m.perChi.piano === floorOf(resident)) || (m.perChi?.tipo === "ospite" && m.perChi.residentId === resident.id)),
  // Ritratto → Come sta, «Ha chiesto»: solo le richieste pratiche confermate da quella persona, delle categorie ammesse.
  haChiesto: (residentId) => (m) => m.residentId === residentId && m.origine === "richiesta" && m.confermato !== false && ["stanza", "comfort", "desiderio"].includes(m.categoria),
  // Tablet: una richiesta fatta di cui l'ospite non sa ancora niente (ROSS apre la conversazione chiudendo il cerchio).
  daChiudere: (residentId) => (m) => m.residentId === residentId && m.origine === "richiesta" && m.stato === "fatto" && !m.chiusoConOspite,
  // Ritratto → Spunti: solo i momenti nati da uno spunto, di quella persona.
  spunti: (residentId) => (m) => m.residentId === residentId && m.origine === "spunto",
  // Ritratto → Con ROSS: la sua storia, tutto tranne gli spunti ancora in attesa.
  // Le comunicazioni agli ospiti non entrano nella storia della persona.
  storia: (residentId) => (m) => m.residentId === residentId && m.origine !== "comunicazione" && m.esito !== "attesa",
};

const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const useMoments = () => useSyncExternalStore(subscribe, () => snapshot);
export const getMoments = () => snapshot;
