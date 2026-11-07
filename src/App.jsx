import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DemoProvider } from "./state/DemoContext";
import { PerspectiveSwitcher } from "./components/PerspectiveSwitcher";
import { Toaster } from "./components/ui";
import { GuidedTour } from "./components/GuidedTour";

const load = (module, name) => lazy(() => module().then((exports) => ({ default: exports[name] })));
const Residents = load(() => import("./pages/Residents"), "Residents");
const ResidentProfile = load(() => import("./pages/ResidentProfile"), "ResidentProfile");
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
const StructureRequests = load(() => import("./pages/StructureRequests"), "StructureRequests");

// Toast di Sonner e visita guidata in tutte le viste (Struttura, Famiglia, ROSS).
function GlobalChrome() {
  return <><PerspectiveSwitcher /><Toaster /><GuidedTour /></>;
}

// La Struttura è il canale con ROSS (ex «Struttura 2.0», decisione del 07/11/2026): i vecchi indirizzi
// /struttura-2/… portano alla stessa pagina senza il prefisso, con lo stesso ?… e #….
function FromStructure2() {
  const { pathname, search, hash } = useLocation();
  return <Navigate to={`${pathname.replace(/^\/struttura-2/, "") || "/"}${search}${hash}`} replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Le pagine della vecchia Struttura (chat, report, panoramica, impostazioni, sessione live) non esistono più:
// i loro indirizzi portano al canale o agli ospiti.
const retired = [["/report", "/"], ["/panoramica", "/"], ["/impostazioni", "/"], ["/consegne", "/"], ["/analytics", "/"], ["/struttura", "/"], ["/insight", "/"], ["/interazioni", "/ospiti"], ["/attivita", "/ospiti"], ["/interazione/:id", "/ospiti"]];

export function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/+$/, "")}><DemoProvider><ScrollToTop /><Suspense fallback={<div className="route-loading"><span /><p>ROSS sta preparando il contesto…</p></div>}><Routes>
    <Route path="/" element={<StructureChannelLayout />}><Route index element={<StructureChannel />} /><Route path="ospiti" element={<StructureChannelPage><Residents /></StructureChannelPage>} /><Route path="ospiti/:id" element={<StructureChannelPage><ResidentProfile /></StructureChannelPage>} /><Route path="richieste" element={<StructureRequests />} /></Route>
    <Route path="/struttura-2/*" element={<FromStructure2 />} />
    {retired.map(([from, to]) => <Route key={from} path={from} element={<Navigate to={to} replace />} />)}
    <Route path="/famiglia" element={<FamilyExperience />} /><Route path="/famiglia/da-lei" element={<FamilyFromHer />} /><Route path="/famiglia/da-te" element={<FamilyFromYou />} /><Route path="/famiglia/insieme" element={<FamilyTogether />} /><Route path="/famiglia/storia" element={<Navigate to={{ pathname: "/famiglia/da-lei", hash: "#ricordi" }} replace />} /><Route path="/famiglia/ricordi/:id" element={<FamilyMemoryDetail />} /><Route path="/famiglia/attivita" element={<Navigate to="/famiglia/da-lei" replace />} /><Route path="/famiglia/attivita/:id" element={<FamilyActivityDetail />} /><Route path="/famiglia/condivisi" element={<Navigate to="/famiglia/da-te" replace />} />
    <Route path="/ross" element={<RossHome />} /><Route path="/ross/conversazione" element={<RossConversation />} /><Route path="/mappa" element={<DemoMap />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes><GlobalChrome /></Suspense></DemoProvider></BrowserRouter>;
}
