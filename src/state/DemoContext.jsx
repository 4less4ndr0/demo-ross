import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { biography as initialBiography, interactions as initialInteractions, memories as initialMemories, modeSchedule as initialSchedule, residents as initialResidents } from "../data/demoData";
import { asset } from "../asset.js";

const DemoContext = createContext(null);
const STORAGE_KEY = "ross-rsa-demo-v2";

const initialRossJourney = {
  stage: "ready",
  completedAt: null,
  candidateId: null,
  confirmedAt: null,
};

const initialFamilyContributions = [
  {
    id: "family-cefalu-postcard",
    createdAt: "2026-09-14T18:30:00.000Z",
    kind: "photo",
    title: "Cartolina di Cefalù",
    detail: "Una foto che Anna conserva dal viaggio del 1998. Sul retro Paolo aveva scritto: “La luce più bella è quella della sera”.",
    author: "Anna",
    people: ["Paolo"],
    place: "Cefalù",
    period: "1998",
    image: asset("cefalu-postcard.svg"),
    status: "Confermato",
  },
  {
    id: "family-call-mina",
    createdAt: "2026-09-08T10:15:00.000Z",
    kind: "topic",
    title: "La canzone preferita di Mina",
    detail: "Anna suggerisce di chiederle quale canzone ascoltava mentre preparava il pranzo della domenica.",
    author: "Anna",
    people: ["Anna"],
    place: "Casa di Treviso",
    period: "Anni 80",
    status: "Disponibile a ROSS",
  },
];

const initialScheduledActivities = [
  { id: "scheduled-photo-group", activityId: "photos", title: "Fotografie di viaggio", residentId: "elena", date: "2026-09-22", time: "10:30", owner: "Giulia Serra", status: "Programmata", visibleToFamily: true },
];

function defaultState() {
  return {
    theme: "ross",
    presentation: new URLSearchParams(window.location.search).get("presentation") === "true",
    residents: initialResidents,
    memories: initialMemories,
    interactions: initialInteractions,
    biography: initialBiography,
    schedule: initialSchedule,
    notes: [],
    takenInsights: [],
    familyContributions: initialFamilyContributions,
    scheduledActivities: initialScheduledActivities,
    rossJourney: initialRossJourney,
  };
}

function getInitialState() {
  const defaults = defaultState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaults,
        ...parsed,
        presentation: new URLSearchParams(window.location.search).get("presentation") === "true" || Boolean(parsed.presentation),
        familyContributions: parsed.familyContributions || initialFamilyContributions,
        scheduledActivities: parsed.scheduledActivities || initialScheduledActivities,
        rossJourney: { ...initialRossJourney, ...(parsed.rossJourney || {}) },
      };
    }
  } catch { /* localStorage can be unavailable in private contexts */ }
  return defaults;
}

export function DemoProvider({ children }) {
  const [state, setState] = useState(getInitialState);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.dataset.presentation = state.presentation ? "true" : "false";
  }, [state]);

  const notify = (message, tone = "success") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3200);
  };

  const actions = useMemo(() => ({
    setTheme: (theme) => setState((prev) => ({ ...prev, theme })),
    togglePresentation: () => setState((prev) => ({ ...prev, presentation: !prev.presentation })),
    setResidentMode: (residentId, mode) => {
      setState((prev) => ({ ...prev, residents: prev.residents.map((r) => r.id === residentId ? { ...r, mode, status: mode === "Silenziosa" || mode === "Riposo" ? "Riposo" : "Disponibile" } : r) }));
      notify(`Modalità ${mode.toLowerCase()} attivata`);
    },
    updateSchedule: (index, patch) => setState((prev) => ({ ...prev, schedule: prev.schedule.map((item, i) => i === index ? { ...item, ...patch } : item) })),
    confirmMemory: (memory) => {
      setState((prev) => {
        const exists = prev.memories.some((m) => m.id === memory.id);
        const memories = exists ? prev.memories.map((m) => m.id === memory.id ? { ...m, status: "Confermata", confidence: 100 } : m) : [{ ...memory, status: "Confermata", confidence: 100 }, ...prev.memories];
        const isRossCandidate = memory.id === "ross-cefalu-camera";
        const biographyEvent = { year: "1998", title: "La macchina fotografica di Paolo", description: "Durante il viaggio in Sicilia Paolo portava una piccola macchina fotografica rossa e fotografava Elena sul lungomare di Cefalù.", place: "Cefalù", people: ["Paolo"], source: "Confermata da Elena" };
        const familyEvent = memory.familyContributionId ? {
          year: memory.period || "Periodo da precisare",
          title: memory.title,
          description: memory.description,
          place: memory.place || "—",
          people: memory.people || [],
          source: "Contributo famiglia · verificato dalla struttura",
        } : null;
        let biography = isRossCandidate && !prev.biography.some((event) => event.title === biographyEvent.title)
          ? [...prev.biography, biographyEvent]
          : prev.biography;
        if (familyEvent && !biography.some((event) => event.title === familyEvent.title)) biography = [...biography, familyEvent];
        biography = biography.sort((a, b) => a.year.localeCompare(b.year));
        const familyContributions = memory.familyContributionId
          ? prev.familyContributions.map((item) => item.id === memory.familyContributionId ? { ...item, status: "Confermato" } : item)
          : prev.familyContributions;
        return {
          ...prev,
          memories,
          biography,
          familyContributions,
          rossJourney: isRossCandidate ? { ...prev.rossJourney, confirmedAt: new Date().toISOString() } : prev.rossJourney,
        };
      });
      notify("Memoria confermata e collegata al profilo");
    },
    archiveMemory: (id) => {
      setState((prev) => ({ ...prev, memories: prev.memories.filter((m) => m.id !== id) }));
      notify("Memoria archiviata", "neutral");
    },
    addMemory: (memory) => {
      setState((prev) => ({ ...prev, memories: [{ id: `manual-${Date.now()}`, residentId: "elena", category: "Ricordi", status: "Da verificare", confidence: 60, lastUsed: "Mai", tags: [], people: [], ...memory }, ...prev.memories] }));
      notify("Nuova memoria aggiunta alla verifica");
    },
    updateMemory: (id, patch) => {
      setState((prev) => ({ ...prev, memories: prev.memories.map((memory) => memory.id === id ? { ...memory, ...patch } : memory) }));
      notify("Memoria aggiornata");
    },
    addBiographyEvent: (event) => {
      setState((prev) => ({ ...prev, biography: [...prev.biography, event].sort((a, b) => a.year.localeCompare(b.year)) }));
      notify("Evento aggiunto alla storia");
    },
    completeInteraction: (interaction) => {
      setState((prev) => ({ ...prev, interactions: [{ id: `local-${Date.now()}`, date: "2026-09-21", ...interaction }, ...prev.interactions] }));
      notify("Interazione aggiunta allo storico");
    },
    setRossStage: (stage) => setState((prev) => ({ ...prev, rossJourney: { ...prev.rossJourney, stage } })),
    restartRossJourney: () => setState((prev) => ({ ...prev, rossJourney: { ...prev.rossJourney, stage: "ready" } })),
    completeRossConversation: () => {
      const memory = {
        id: "ross-cefalu-camera",
        residentId: "elena",
        title: "La macchina fotografica rossa di Paolo",
        category: "Ricordi",
        description: "Durante il viaggio del 1998 Paolo portava una piccola macchina fotografica rossa e fotografava Elena sul lungomare di Cefalù.",
        source: "Conversazione con ROSS · oggi",
        status: "Da verificare",
        confidence: 78,
        lastUsed: "Oggi, 17:18",
        tags: ["Cefalù", "Paolo", "fotografia", "1998"],
        people: ["Paolo"],
      };
      setState((prev) => {
        const memories = prev.memories.some((item) => item.id === memory.id) ? prev.memories : [memory, ...prev.memories];
        const interaction = {
          id: "ross-story-2026-09-21",
          residentId: "elena",
          resident: "Elena Bianchi",
          date: "2026-09-21",
          time: "17:18",
          duration: 14,
          type: "Conversazione",
          topic: "Cefalù e fotografie",
          mode: "Attiva",
          participation: 89,
          memoriesUsed: 3,
          emerged: 1,
        };
        const interactions = prev.interactions.some((item) => item.id === interaction.id) ? prev.interactions : [interaction, ...prev.interactions];
        return {
          ...prev,
          memories,
          interactions,
          rossJourney: { stage: "complete", completedAt: new Date().toISOString(), candidateId: memory.id, confirmedAt: prev.rossJourney.confirmedAt },
        };
      });
      notify("Conversazione salvata: è emerso un nuovo ricordo");
    },
    addFamilyContribution: (contribution) => {
      const id = `family-${Date.now()}`;
      const contributionRecord = { id, createdAt: new Date().toISOString(), status: contribution.kind === "note" ? "Inviato alla struttura" : contribution.kind === "topic" || contribution.kind === "music" ? "Disponibile a ROSS" : "Da verificare", ...contribution };
      setState((prev) => {
        const createsMemory = contribution.kind === "memory" || contribution.kind === "photo";
        const memory = createsMemory ? {
          id: `memory-${id}`,
          familyContributionId: id,
          residentId: "elena",
          title: contribution.title,
          category: contribution.kind === "photo" ? "Fotografie" : "Ricordi",
          description: contribution.detail,
          source: `Famiglia · ${contribution.author || "Anna"} · oggi`,
          status: "Da verificare",
          confidence: 70,
          lastUsed: "Mai",
          tags: [contribution.place, contribution.period].filter(Boolean),
          people: contribution.people || [],
          place: contribution.place || "",
          period: contribution.period || "",
          image: contribution.image || null,
        } : null;
        return {
          ...prev,
          familyContributions: [contributionRecord, ...prev.familyContributions],
          memories: memory ? [memory, ...prev.memories] : prev.memories,
          notes: contribution.kind === "note" ? [{ id, residentId: "elena", source: "Famiglia", text: contribution.detail, time: "17:26" }, ...prev.notes] : prev.notes,
        };
      });
      notify(contribution.kind === "memory" || contribution.kind === "photo" ? "Contributo inviato alla verifica della struttura" : "Contributo disponibile a ROSS");
    },
    scheduleActivity: (activity) => {
      setState((prev) => ({ ...prev, scheduledActivities: [{ id: `scheduled-${Date.now()}`, status: "Programmata", owner: "Giulia Serra", ...activity }, ...prev.scheduledActivities] }));
      notify("Attività programmata e collegata alla giornata");
    },
    addNote: (note) => {
      setState((prev) => ({ ...prev, notes: [{ id: Date.now(), ...note }, ...prev.notes] }));
      notify("Nota operatore aggiunta");
    },
    takeInsight: (id) => {
      setState((prev) => ({ ...prev, takenInsights: [...new Set([...prev.takenInsights, id])] }));
      notify("Elemento preso in carico");
    },
    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      setState({ ...defaultState(), presentation: false });
      notify("Demo ripristinata");
    },
  }), []);

  return <DemoContext.Provider value={{ state, actions, toast, notify }}>{children}</DemoContext.Provider>;
}

export const useDemo = () => useContext(DemoContext);
