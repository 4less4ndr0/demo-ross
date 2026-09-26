import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ParticipationChart } from "../components/ParticipationChart";
import { Download, Printer } from "lucide-react";
import { dailyMetrics } from "../data/demoData";
import { buildResidentReport } from "../data/reportNarrative";
import { useDemo } from "../state/DemoContext";
import { Button, Select } from "../components/ui";
import { Avatar, InfoTip, SectionTitle } from "../components/Common";

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--line)", boxShadow: "var(--shadow)", background: "var(--surface)", color: "var(--text)" };

const activityTypeData = [{ name: "Conversazione", value: 36, color: "#57aa91" }, { name: "Memoria", value: 24, color: "#ec795a" }, { name: "Musica", value: 18, color: "#9a84b8" }, { name: "Giochi", value: 14, color: "#e3b455" }, { name: "Socialità", value: 8, color: "#789fb3" }];
const histogramData = [{ bin: "0–5", count: 7 }, { bin: "6–10", count: 24 }, { bin: "11–15", count: 38 }, { bin: "16–20", count: 29 }, { bin: "21–25", count: 14 }, { bin: "26+", count: 5 }];

function FacilityReport({ period }) {
  const data = dailyMetrics.slice(-Number(period));
  return <div className="charts-grid"><ChartCard title="Tempo di interazione" question="Quanti minuti di interazione vengono registrati ogni giorno?"><ResponsiveContainer width="100%" height={240}><AreaChart data={data}><defs><linearGradient id="rossArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef7959" stopOpacity={.38}/><stop offset="100%" stopColor="#ef7959" stopOpacity={.02}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="date" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="minutes" stroke="#dd6848" fill="url(#rossArea)" strokeWidth={2.5} /></AreaChart></ResponsiveContainer></ChartCard><ChartCard title="Partecipazione vs baseline" question="L'andamento si discosta dalla media personale?"><ResponsiveContainer width="100%" height={240}><LineChart data={data}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="date" tickLine={false} axisLine={false} /><YAxis domain={[60, 90]} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltipStyle} /><Line type="monotone" dataKey="participation" stroke="#277f70" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey={() => 72} stroke="#b6aaa1" strokeDasharray="5 5" dot={false} /></LineChart></ResponsiveContainer></ChartCard><ChartCard title="Durata delle interazioni" question="Qual è la durata più frequente?"><ResponsiveContainer width="100%" height={240}><BarChart data={histogramData}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="bin" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#58ad94" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Tipologie di interazione" question="Quali attività compongono l'utilizzo di ROSS?"><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={activityTypeData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88} paddingAngle={3}>{activityTypeData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /><Legend /></PieChart></ResponsiveContainer></ChartCard><ChartCard title="Interazioni per ora e giorno" question="Quando è più naturale proporre un'interazione?" wide><Heatmap /></ChartCard><ChartCard title="Crescita della memoria" question="Quante memorie vengono confermate nel tempo?" wide><ResponsiveContainer width="100%" height={230}><BarChart data={data}><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="date" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="memories" fill="#987faf" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard></div>;
}

function ChartCard({ title, question, children, wide }) { return <section className={`chart-card surface ${wide ? "chart-wide" : ""}`}><header><div><h3>{title}</h3><p>{question}</p></div><InfoTip label="Come leggerlo" text={question} /></header>{children}</section>; }
function Heatmap() { const days = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]; const hours = ["08", "10", "12", "14", "16", "18", "20"]; return <div className="heatmap"><div className="heat-hours"><span />{hours.map((h) => <span key={h}>{h}:00</span>)}</div>{days.map((d, row) => <div className="heat-row" key={d}><strong>{d}</strong>{hours.map((h, col) => { const value = (row * 3 + col * 2 + 4) % 10; return <span key={h} style={{ opacity: .18 + value / 12 }} title={`${d} ${h}:00 · ${value + 2} interazioni`} />; })}</div>)}<div className="heat-legend"><span>Meno</span><i /><i /><i /><i /><span>Più</span></div></div>; }

export function ReportsPage() {
  const { state } = useDemo();
  const [params, setParams] = useSearchParams();
  const facility = params.get("ambito") === "struttura";
  const resident = state.residents.find((r) => r.id === params.get("ospite")) || state.residents[0];
  const setScope = (value) => setParams(value === "struttura" ? { ambito: "struttura" } : { ospite: value });
  const [period, setPeriod] = useState("30");
  const report = facility ? null : buildResidentReport(state, resident, period);

  useEffect(() => {
    if (params.get("stampa") !== "1" || facility) return undefined;
    const timer = window.setTimeout(() => { window.print(); const next = new URLSearchParams(params); next.delete("stampa"); setParams(next, { replace: true }); }, 900);
    return () => window.clearTimeout(timer);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="report-screen screen-enter">
    <SectionTitle eyebrow="REPORT" title={facility ? "Come la struttura usa ROSS" : `Come sta ${resident.name}`} description={facility ? `Engagement aggregato degli ospiti con ROSS negli ultimi ${period} giorni, per direzione e riunioni d'équipe.` : `Report narrativo per l'équipe · ultimi ${period} giorni. Come sta e di cosa ha bisogno, mai il contenuto delle conversazioni.`} action={<div className="action-group"><Button variant="outline" onClick={() => window.print()}><Download size={16} /> Salva PDF</Button><Button onClick={() => window.print()}><Printer size={16} /> Stampa</Button></div>} />
    <div className="filter-bar"><Select value={facility ? "struttura" : resident.id} onValueChange={setScope} label="Ambito del report" groups={[{ label: "Ospiti", options: state.residents.map((r) => ({ value: r.id, label: r.name })) }, { label: "Struttura", options: [{ value: "struttura", label: "Struttura · aggregato" }] }]} /><Select value={period} onValueChange={setPeriod} label="Periodo" options={[{ value: "7", label: "Ultimi 7 giorni" }, { value: "30", label: "Ultimi 30 giorni" }]} /><span className="privacy-label">Dati demo · Residenza Aurora</span></div>
    {facility ? <FacilityReport period={period} /> : <ResidentReport resident={resident} report={report} period={period} />}
  </div>;
}

function ResidentReport({ resident, report, period }) {
  return <article className="report-paper surface">
    <header><div><span className="brand-mark small">R</span><div><strong>R.O.S.S.</strong><small>Residenza Aurora · uso interno équipe</small></div></div><span>Generato il 21 settembre 2026 · ultimi {period} giorni</span></header>
    <section className="report-title"><div><span>COME STA</span><h1>{resident.name}</h1><p>{resident.age} anni · stanza {resident.room} · {resident.daysWithRoss} giorni con ROSS</p></div><Avatar resident={resident} size="xl" /></section>
    <section className="report-kpis">{report.kpis.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>
    <section className="report-narrative"><span>IN SINTESI</span><h2>{report.headline}</h2>{report.paragraphs.map((text) => <p key={text}>{text}</p>)}</section>
    <section className="report-columns">
      <div><h3>Benessere nella settimana</h3><ul>{report.signals.length ? report.signals.map((sig) => <li key={sig.signal}>{sig.signal.charAt(0).toUpperCase() + sig.signal.slice(1)} <strong>{sig.note ? sig.trend : `${sig.count} su ${sig.of} · di solito ${sig.usual}`}</strong></li>) : <li>Nessun segnale particolare rispetto alla sua media</li>}</ul></div>
      <div><h3>Bisogni espressi</h3><ul>{report.needs.length ? report.needs.map((n) => <li key={n.text}>{n.text} <strong>{n.times > 1 ? `${n.times} volte` : "1 volta"}</strong></li>) : <li>Nessun bisogno particolare espresso</li>}</ul></div>
      {report.relating && <div><h3>Come relazionarsi</h3><ul><li>Come rivolgersi <strong>{report.relating.address}</strong></li><li>Momento migliore <strong>{report.relating.bestTime}</strong></li>{report.firstStep && <li>Per iniziare <strong>{report.firstStep}</strong></li>}<li>Durata ideale <strong>{report.relating.duration}</strong></li><li>Funziona <strong>{report.relating.works.join(" · ")}</strong></li><li>{report.relating.avoid}</li></ul></div>}
      <div><h3>Interessi</h3><ul>{report.relating?.interests.map(([label, source]) => <li key={label}>{label} <strong>{source}</strong></li>)}{report.newInterest && <li>{report.newInterest.label} <strong>nuovo · emerso con ROSS</strong></li>}</ul></div>
    </section>
    {report.presenceNotes.length > 0 && <section className="report-next report-presence"><span>PRESENZA E CONTINUITÀ</span>{report.presenceNotes.map((p) => <p key={p.text}>{p.text}</p>)}</section>}
    <section className="report-next"><span>SPUNTO PER LO STAFF</span><p>{report.next}</p></section>
    <section className="report-chart"><h3>Partecipazione {report.building ? "(baseline in costruzione)" : "rispetto alla sua media personale"}</h3><ParticipationChart series={report.series} building={report.building} /></section>
    <footer>Report a uso interno dell'équipe. Descrive come sta la persona e di cosa ha bisogno, mai il contenuto delle sue conversazioni con ROSS. Non contiene citazioni, diagnosi, valutazioni cliniche o informazioni dei documenti sanitari.</footer>
  </article>;
}
