import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DemoProvider } from "./state/DemoContext";
import { Layout } from "./components/Layout";
import { PerspectiveSwitcher } from "./components/PerspectiveSwitcher";
import { Toaster } from "./components/ui";
import { GuidedTour } from "./components/GuidedTour";

const load = (module, name) => lazy(() => module().then((exports) => ({ default: exports[name] })));
const AskRoss = load(() => import("./pages/AskRoss"), "AskRoss");
const Residents = load(() => import("./pages/Residents"), "Residents");
const ResidentProfile = load(() => import("./pages/ResidentProfile"), "ResidentProfile");
const LiveInteraction = load(() => import("./pages/LiveInteraction"), "LiveInteraction");
const ReportsPage = load(() => import("./pages/OperationalPages"), "ReportsPage");
const OverviewPage = load(() => import("./pages/OperationalPages"), "OverviewPage");
const SettingsPage = load(() => import("./pages/Settings"), "SettingsPage");
const FamilyExperience = load(() => import("./pages/FamilyExperience"), "FamilyExperience");
const FamilyFromHer = load(() => import("./pages/FamilyExperience"), "FamilyFromHer");
const FamilyMemoryDetail = load(() => import("./pages/FamilyExperience"), "FamilyMemoryDetail");
const FamilyFromYou = load(() => import("./pages/FamilyExperience"), "FamilyFromYou");
const FamilyActivityDetail = load(() => import("./pages/FamilyExperience"), "FamilyActivityDetail");
const FamilyTogether = load(() => import("./pages/FamilyExperience"), "FamilyTogether");
const RossHome = load(() => import("./pages/RossExperience"), "RossHome");
const RossConversation = load(() => import("./pages/RossExperience"), "RossConversation");
const DemoMap = load(() => import("./pages/DemoMap"), "DemoMap");
const StructureChannel = load(() => import("./pages/StructureChannel"), "StructureChannel");
const StructureChannelLayout = load(() => import("./pages/StructureChannel"), "StructureChannelLayout");
const StructureChannelPage = load(() => import("./pages/StructureChannel"), "StructureChannelPage");

// Toast di Sonner e visita guidata in tutte le viste (Struttura, Famiglia, ROSS).
function GlobalChrome() {
  return <><PerspectiveSwitcher /><Toaster /><GuidedTour /></>;
}

// Il Riepilogo d'équipe si è spostato in Panoramica: i vecchi link a /report?ambito=struttura ci portano lì.
function ReportRoute() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  if (params.get("ambito") === "struttura") return <Navigate to={`/panoramica${params.get("stampa") ? "?stampa=1" : ""}`} replace />;
  return <ReportsPage />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/+$/, "")}><DemoProvider><ScrollToTop /><Suspense fallback={<div className="route-loading"><span /><p>ROSS sta preparando il contesto…</p></div>}><Routes><Route element={<Layout />}><Route path="/" element={<AskRoss />} /><Route path="/ospiti" element={<Residents />} /><Route path="/ospiti/:id" element={<ResidentProfile />} /><Route path="/report" element={<ReportRoute />} /><Route path="/panoramica" element={<OverviewPage />} /><Route path="/impostazioni" element={<SettingsPage />} /></Route><Route path="/consegne" element={<Navigate to="/?q=turno" replace />} /><Route path="/analytics" element={<Navigate to="/panoramica" replace />} /><Route path="/struttura" element={<Navigate to="/impostazioni" replace />} /><Route path="/insight" element={<Navigate to="/" replace />} /><Route path="/interazioni" element={<Navigate to="/ospiti" replace />} /><Route path="/attivita" element={<Navigate to="/ospiti" replace />} /><Route path="/interazione/:id" element={<LiveInteraction />} /><Route path="/famiglia" element={<FamilyExperience />} /><Route path="/famiglia/da-lei" element={<FamilyFromHer />} /><Route path="/famiglia/da-te" element={<FamilyFromYou />} /><Route path="/famiglia/insieme" element={<FamilyTogether />} /><Route path="/famiglia/storia" element={<Navigate to={{ pathname: "/famiglia/da-lei", hash: "#ricordi" }} replace />} /><Route path="/famiglia/ricordi/:id" element={<FamilyMemoryDetail />} /><Route path="/famiglia/attivita" element={<Navigate to="/famiglia/da-lei" replace />} /><Route path="/famiglia/attivita/:id" element={<FamilyActivityDetail />} /><Route path="/famiglia/condivisi" element={<Navigate to="/famiglia/da-te" replace />} /><Route path="/ross" element={<RossHome />} /><Route path="/ross/conversazione" element={<RossConversation />} /><Route path="/mappa" element={<DemoMap />} /><Route path="/struttura-2" element={<StructureChannelLayout />}><Route index element={<StructureChannel />} /><Route path="ospiti" element={<StructureChannelPage><Residents /></StructureChannelPage>} /><Route path="ospiti/:id" element={<StructureChannelPage><ResidentProfile /></StructureChannelPage>} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes><GlobalChrome /></Suspense></DemoProvider></BrowserRouter>;
}
