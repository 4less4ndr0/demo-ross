import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import { DemoProvider } from "./state/DemoContext";
import { Layout } from "./components/Layout";
import { PerspectiveSwitcher } from "./components/PerspectiveSwitcher";
import { useDemo } from "./state/DemoContext";

const load = (module, name) => lazy(() => module().then((exports) => ({ default: exports[name] })));
const AskRoss = load(() => import("./pages/AskRoss"), "AskRoss");
const Residents = load(() => import("./pages/Residents"), "Residents");
const ResidentProfile = load(() => import("./pages/ResidentProfile"), "ResidentProfile");
const LiveInteraction = load(() => import("./pages/LiveInteraction"), "LiveInteraction");
const ReportsPage = load(() => import("./pages/OperationalPages"), "ReportsPage");
const SettingsPage = load(() => import("./pages/Settings"), "SettingsPage");
const FamilyExperience = load(() => import("./pages/FamilyExperience"), "FamilyExperience");
const FamilyStory = load(() => import("./pages/FamilyExperience"), "FamilyStory");
const FamilyMemoryDetail = load(() => import("./pages/FamilyExperience"), "FamilyMemoryDetail");
const FamilyActivities = load(() => import("./pages/FamilyExperience"), "FamilyActivities");
const FamilyActivityDetail = load(() => import("./pages/FamilyExperience"), "FamilyActivityDetail");
const FamilyShared = load(() => import("./pages/FamilyExperience"), "FamilyShared");
const RossHome = load(() => import("./pages/RossExperience"), "RossHome");
const RossConversation = load(() => import("./pages/RossExperience"), "RossConversation");

function GlobalChrome() {
  const { toast } = useDemo();
  return <><PerspectiveSwitcher />{toast && <div className={`toast toast-${toast.tone}`}><ClipboardCheck size={18} />{toast.message}</div>}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/+$/, "")}><DemoProvider><ScrollToTop /><Suspense fallback={<div className="route-loading"><span /><p>ROSS sta preparando il contesto…</p></div>}><Routes><Route element={<Layout />}><Route path="/" element={<AskRoss />} /><Route path="/ospiti" element={<Residents />} /><Route path="/ospiti/:id" element={<ResidentProfile />} /><Route path="/report" element={<ReportsPage />} /><Route path="/impostazioni" element={<SettingsPage />} /></Route><Route path="/consegne" element={<Navigate to="/?q=turno" replace />} /><Route path="/analytics" element={<Navigate to="/report?ambito=struttura" replace />} /><Route path="/struttura" element={<Navigate to="/impostazioni" replace />} /><Route path="/insight" element={<Navigate to="/" replace />} /><Route path="/interazioni" element={<Navigate to="/ospiti" replace />} /><Route path="/attivita" element={<Navigate to="/ospiti" replace />} /><Route path="/interazione/:id" element={<LiveInteraction />} /><Route path="/famiglia" element={<FamilyExperience />} /><Route path="/famiglia/storia" element={<FamilyStory />} /><Route path="/famiglia/ricordi/:id" element={<FamilyMemoryDetail />} /><Route path="/famiglia/attivita" element={<FamilyActivities />} /><Route path="/famiglia/attivita/:id" element={<FamilyActivityDetail />} /><Route path="/famiglia/condivisi" element={<FamilyShared />} /><Route path="/ross" element={<RossHome />} /><Route path="/ross/conversazione" element={<RossConversation />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes><GlobalChrome /></Suspense></DemoProvider></BrowserRouter>;
}
