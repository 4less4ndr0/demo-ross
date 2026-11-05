// Stato condiviso della Struttura 2.0: la sola fonte dei momenti emersi con ROSS (src/data/moments.js).
// Canale, ritratto → Spunti e ritratto → Con ROSS leggono gli stessi momenti con il loro filtro (`momentFilters`):
// Visto/Fatto cambia in un posto e si aggiorna ovunque. Vive a livello di modulo, così la risposta simulata
// di ROSS arriva anche se si cambia pagina.
//
// Nel browser si salvano solo le modifiche: lo stato dei momenti di partenza e i momenti nati da nuovi spunti.
// I momenti di partenza si ricalcolano ogni volta da oggi, così la demo resta sempre «intorno a oggi».
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { channelResident, simulatedReply } from "../data/channel";
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

export const channelActions = {
  // Uno spunto (dal canale, dal ritratto o dalla rete delle passioni) crea un momento «spunto» in attesa.
  send({ residentId, testo, tipo = null }) {
    const now = new Date().toISOString();
    const moment = { id: `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, residentId, quando: now, inviato: now, origine: "spunto", spunto: { testo, tipo }, esito: "attesa", racconto: "", cosaPuoiFare: null, stato: "nuovo" };
    set({ ...saved, created: [moment, ...saved.created] });
    schedule(moment);
    return moment;
  },
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
  canale: (m) => Boolean(m.cosaPuoiFare) && m.stato !== "fatto" && m.esito !== "attesa" && daysAgo(m.quando) < 7,
  // Ritratto → Spunti: solo i momenti nati da uno spunto, di quella persona.
  spunti: (residentId) => (m) => m.residentId === residentId && m.origine === "spunto",
  // Ritratto → Con ROSS: la sua storia, tutto tranne gli spunti ancora in attesa.
  storia: (residentId) => (m) => m.residentId === residentId && m.esito !== "attesa",
};

const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const useMoments = () => useSyncExternalStore(subscribe, () => snapshot);
