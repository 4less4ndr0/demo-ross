import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import { DemoProvider } from "./state/DemoContext";
import { Layout } from "./components/Layout";
import { PerspectiveSwitcher } from "./components/PerspectiveSwitcher";
import { useDemo } from "./state/DemoContext";

const load = (module, name) => lazy(() => module().then((exports) => ({ default: exports[name] })));
const Dashboard = load(() => import("./pages/Dashboard"), "Dashboard");
const Residents = load(() => import("./pages/Residents"), "Residents");
const ResidentProfile = load(() => import("./pages/ResidentProfile"), "ResidentProfile");
const Activities = load(() => import("./pages/Activities"), "Activities");
const LiveInteraction = load(() => import("./pages/LiveInteraction"), "LiveInteraction");
const InteractionsPage = load(() => import("./pages/OperationalPages"), "InteractionsPage");
const HandoverPage = load(() => import("./pages/OperationalPages"), "HandoverPage");
const InsightsPage = load(() => import("./pages/OperationalPages"), "InsightsPage");
const AnalyticsPage = load(() => import("./pages/OperationalPages"), "AnalyticsPage");
const ReportsPage = load(() => import("./pages/OperationalPages"), "ReportsPage");
const SettingsPage = load(() => import("./pages/Settings"), "SettingsPage");
const StructurePage = load(() => import("./pages/Settings"), "StructurePage");
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
  return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/+$/, "")}><DemoProvider><ScrollToTop /><Suspense fallback={<div className="route-loading"><span /><p>ROSS sta preparando il contesto…</p></div>}><Routes><Route element={<Layout />}><Route path="/" element={<Dashboard />} /><Route path="/ospiti" element={<Residents />} /><Route path="/ospiti/:id" element={<ResidentProfile />} /><Route path="/attivita" element={<Activities />} /><Route path="/interazioni" element={<InteractionsPage />} /><Route path="/consegne" element={<HandoverPage />} /><Route path="/insight" element={<InsightsPage />} /><Route path="/analytics" element={<AnalyticsPage />} /><Route path="/report" element={<ReportsPage />} /><Route path="/struttura" element={<StructurePage />} /><Route path="/impostazioni" element={<SettingsPage />} /></Route><Route path="/interazione/:id" element={<LiveInteraction />} /><Route path="/famiglia" element={<FamilyExperience />} /><Route path="/famiglia/storia" element={<FamilyStory />} /><Route path="/famiglia/ricordi/:id" element={<FamilyMemoryDetail />} /><Route path="/famiglia/attivita" element={<FamilyActivities />} /><Route path="/famiglia/attivita/:id" element={<FamilyActivityDetail />} /><Route path="/famiglia/condivisi" element={<FamilyShared />} /><Route path="/ross" element={<RossHome />} /><Route path="/ross/conversazione" element={<RossConversation />} /><Route path="*" element={<Dashboard />} /></Routes><GlobalChrome /></Suspense></DemoProvider></BrowserRouter>;
}
