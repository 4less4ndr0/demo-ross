// Stato condiviso della Struttura 2.0 (canale e ritratto): spunti inviati e insight di ROSS.
// Vive a livello di modulo, così la risposta simulata di ROSS arriva anche se si cambia pagina.
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { channelResident, initialInsights, simulatedInsight } from "../data/channel";

const STORAGE_KEY = "ross-struttura2-v1";
const REPLY_DELAY = 6000; // demo: ROSS «risponde» dopo pochi secondi

const load = () => {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved?.insights) return saved; } catch { /* storage non disponibile */ }
  return { insights: initialInsights, spunti: [] };
};

let data = load();
const listeners = new Set();
const timers = new Map();

const set = (next) => {
  data = next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignora */ }
  listeners.forEach((listener) => listener());
};

// ROSS restituisce un insight per ogni spunto in attesa (nella demo dopo pochi secondi).
const schedule = (spunto) => {
  if (timers.has(spunto.id)) return;
  timers.set(spunto.id, window.setTimeout(() => {
    timers.delete(spunto.id);
    if (!data.spunti.some((s) => s.id === spunto.id && s.status === "attesa")) return;
    const insight = simulatedInsight(spunto);
    set({
      insights: data.insights.some((i) => i.id === insight.id) ? data.insights : [insight, ...data.insights],
      spunti: data.spunti.map((s) => (s.id === spunto.id ? { ...s, status: "ripreso" } : s)),
    });
    toast(`ROSS ti racconta com'è andata con ${channelResident(spunto.residentId).first}`, {
      description: "È in cima a «Cosa è emerso» e nel suo ritratto, alla scheda Spunti.",
      action: { label: "Leggi", onClick: () => document.getElementById(insight.id)?.scrollIntoView({ behavior: "smooth", block: "center" }) },
    });
  }, REPLY_DELAY));
};
if (typeof window !== "undefined") data.spunti.filter((s) => s.status === "attesa").forEach(schedule);

export const channelActions = {
  send(spunto) {
    set({ ...data, spunti: [spunto, ...data.spunti] });
    schedule(spunto);
  },
  // Visto e Fatto si accendono e si spengono; restituisce la funzione per annullare.
  mark(id, next) {
    const before = data;
    const insight = data.insights.find((i) => i.id === id);
    const state = insight.state === next ? (next === "fatto" ? "visto" : "nuovo") : next;
    set({ ...data, insights: data.insights.map((i) => (i.id === id ? { ...i, state } : i)) });
    const first = channelResident(insight.residentId).first;
    const label = { nuovo: "Segnato come nuovo", visto: `Visto: ${first}`, fatto: `Fatto: ${first}` }[state];
    toast(label, { action: { label: "Annulla", onClick: () => set(before) } });
  },
};

const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const useChannel = () => useSyncExternalStore(subscribe, () => data);
