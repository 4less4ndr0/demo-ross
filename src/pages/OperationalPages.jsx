import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Download, Printer } from "lucide-react";
import { ParticipationChart } from "../components/ParticipationChart";
import { byAttention } from "../data/careInsights";
import { buildResidentReport, buildTeamReport } from "../data/reportNarrative";
import { useDemo } from "../state/DemoContext";
import { Button, Select } from "../components/ui";
import { Avatar, SectionTitle } from "../components/Common";
import { PageGuide, reportsGuide } from "../components/PageGuide";

// Report per l'équipe (docs/contratto-informativo-struttura.md): Riepilogo d'équipe sui cinque punti cardinali
// oppure "Come sta" del singolo ospite. Mai il contenuto delle conversazioni, confronti solo con la media della persona.
const tooltipStyle = { borderRadius: 12, border: "1px solid var(--line)", boxShadow: "var(--shadow)", background: "var(--surface)", color: "var(--text)" };
const months = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const formatTick = (value) => { const [month, day] = value.split("-"); return `${Number(day)} ${months[Number(month) - 1]}`; };
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const voiceTag = { positivo: "Apprezzato", negativo: "Da migliorare", neutro: "Richiesta" };

export function ReportsPage() {
  const { state } = useDemo();
  const [params, setParams] = useSearchParams();
  const residentId = params.get("ospite");
  const single = Boolean(residentId) || params.get("tipo") === "ospite";
  const resident = state.residents.find((r) => r.id === residentId) || byAttention(state.residents)[0];
  const [period, setPeriod] = useState("30");
  const showTeam = () => setParams({});
  const showResident = (id) => setParams({ ospite: id });

  useEffect(() => {
    if (params.get("stampa") !== "1") return undefined;
    const timer = window.setTimeout(() => { window.print(); const next = new URLSearchParams(params); next.delete("stampa"); setParams(next, { replace: true }); }, 900);
    return () => window.clearTimeout(timer);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="report-screen screen-enter">
    <SectionTitle eyebrow="REPORT" title={single ? `Come sta ${resident.name}` : "Riepilogo d'équipe"} description={single ? `Report narrativo per l'équipe · ultimi ${period} giorni. Come sta e di cosa ha bisogno, mai il contenuto delle conversazioni.` : `La situazione della struttura negli ultimi ${period} giorni: benessere, voce degli ospiti, bisogni e presenza. Per le riunioni d'équipe e la direzione.`} action={<div className="action-group"><Button variant="outline" onClick={() => window.print()}><Download size={16} /> Salva PDF</Button><Button onClick={() => window.print()}><Printer size={16} /> Stampa</Button></div>} />
    <PageGuide {...reportsGuide} />
    <div className="filter-bar report-filters">
      <div className="report-switch" role="tablist" aria-label="Tipo di report"><button role="tab" aria-selected={!single} className={!single ? "active" : ""} onClick={showTeam}>Riepilogo d'équipe</button><button role="tab" aria-selected={single} className={single ? "active" : ""} onClick={() => showResident(resident.id)}>Singolo ospite</button></div>
      {single && <Select value={resident.id} onValueChange={showResident} label="Ospite" options={byAttention(state.residents).map((r) => ({ value: r.id, label: r.name }))} />}
      <Select value={period} onValueChange={setPeriod} label="Periodo" options={[{ value: "7", label: "Ultimi 7 giorni" }, { value: "30", label: "Ultimi 30 giorni" }]} />
      <span className="privacy-label">Dati demo · Residenza Aurora</span>
    </div>
    {single ? <ResidentReport resident={resident} report={buildResidentReport(state, resident, period)} period={period} /> : <TeamReport report={buildTeamReport(state, period)} period={period} onResident={showResident} />}
  </div>;
}

function PaperHeader({ period }) {
  return <header><div><span className="brand-mark small">R</span><div><strong>R.O.S.S.</strong><small>Residenza Aurora · uso interno équipe</small></div></div><span>Generato il 21 settembre 2026 · ultimi {period} giorni</span></header>;
}

function TeamReport({ report, period, onResident }) {
  const total = report.distribution.reduce((sum, d) => sum + d.count, 0);
  const maxHeat = Math.max(1, ...report.heatmap.flatMap((row) => row.cells.map((c) => c.count)));
  return <article className="report-paper surface team-report">
    <PaperHeader period={period} />
    <section className="report-title"><div><span>RIEPILOGO D'ÉQUIPE</span><h1>Come sta la struttura</h1><p>Residenza Aurora · {total} ospiti con ROSS</p></div></section>
    <section className="report-kpis">{report.kpis.map(([value, label]) => <div key={label}><strong className={String(value).length > 10 ? "kpi-text" : ""}>{value}</strong><span>{label}</span></div>)}</section>
    <section className="report-narrative"><span>IN SINTESI</span><p className="team-summary">{report.summary}</p></section>

    <section className="team-block"><h3>Benessere nel tempo</h3><p className="team-question">Quanti ospiti stanno partecipando più o meno del solito, ciascuno rispetto alla propria media?</p>
      <div className="stack-bar" role="img" aria-label="Ospiti rispetto alla propria media">{report.distribution.filter((d) => d.count).map((d) => <i key={d.tone} className={`stack-${d.tone}`} style={{ flex: d.count }} title={`${d.label}: ${d.count}`} />)}</div>
      <div className="stack-legend">{report.distribution.map((d) => <span key={d.tone}><i className={`stack-${d.tone}`} />{d.label} <strong>{d.count}</strong></span>)}</div>
      <div className="signal-types">{report.signalTypes.map((x) => <span key={x.signal} className={x.positive ? "is-positive" : ""}>{capitalize(x.signal)} <strong>{x.count} {x.count === 1 ? "ospite" : "ospiti"}</strong></span>)}</div>
      <small className="team-note">Segnali espressi negli ultimi 7 giorni, confrontati con la media di ciascuno. Nessuna valutazione clinica.</small>
    </section>

    <section className="team-block"><h3>Voce della struttura</h3><p className="team-question">Cosa esprimono gli ospiti sulla vita in struttura? Solo in forma anonima, con almeno 3 ospiti per tema.</p>
      <ul className="voice-list">{report.voice.map((v) => <li key={v.topic}><span className={`voice-tag voice-${v.tone}`}>{voiceTag[v.tone]}</span><div><strong>{v.topic}</strong><small>{v.count} ospiti hanno espresso {v.text} · {v.period}</small></div><em>{v.action}</em></li>)}</ul>
    </section>

    <section className="team-block"><h3>Situazione per ospite</h3><p className="team-question">Prima chi ha bisogno di più attenzione. Il dettaglio è nel report di ciascuno.</p>
      <div className="team-table">{report.rows.map((row) => <div key={row.resident.id} className="team-row">
        <div className="team-person"><Avatar resident={row.resident} size="sm" /><div><strong>{row.resident.name}</strong><small className={`trend-text trend-${row.trend.tone}`}>{row.trend.tone === "building" ? "Baseline in costruzione" : `Partecipazione ${row.trend.label}`}</small></div></div>
        <p className="team-headline">{row.headline}</p>
        <div className="team-flags">{row.watch.map((w) => <span key={w} className="attention-chip attention-watch">{capitalize(w)}</span>)}{row.need && <span className="attention-chip attention-need">{row.need}</span>}{!row.watch.length && !row.need && row.positive.map((p) => <span key={p} className="attention-chip attention-ok">{capitalize(p)}</span>)}</div>
        <p className="team-next"><span>Spunto</span>{row.next}</p>
        <button className="text-link no-print" onClick={() => onResident(row.resident.id)}>Report <ArrowRight size={14} /></button>
      </div>)}</div>
    </section>

    <section className="team-block team-presence"><h3>Presenza e uso di ROSS</h3><p className="team-question">Quanto e quando gli ospiti parlano con ROSS.</p>
      <div className="team-presence-grid">
        <div><h4>Minuti al giorno</h4><ResponsiveContainer width="100%" height={180}><AreaChart data={report.days}><defs><linearGradient id="teamArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#287e70" stopOpacity={.32} /><stop offset="100%" stopColor="#287e70" stopOpacity={.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} tickFormatter={formatTick} /><YAxis tickLine={false} axisLine={false} width={32} /><Tooltip contentStyle={tooltipStyle} labelFormatter={formatTick} formatter={(value) => [`${value} min`, "Tempo con ROSS"]} /><Area type="monotone" dataKey="minutes" stroke="#287e70" fill="url(#teamArea)" strokeWidth={2.5} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
        <div><h4>Quando parlano con ROSS</h4><div className="team-heatmap"><div className="heat-head"><span />{report.heatmap[0].cells.map((c) => <span key={c.label}>{c.label}</span>)}</div>{report.heatmap.map((row) => <div key={row.day} className="heat-line"><strong>{row.day}</strong>{row.cells.map((c) => <span key={c.label} style={{ opacity: 0.12 + (c.count / maxHeat) * 0.88 }} title={`${row.day} ${c.label}: ${c.count} conversazioni`} />)}</div>)}</div><small className="team-note">Più scuro = più conversazioni. Utile per scegliere quando proporre un'attività.</small></div>
      </div>
    </section>

    <section className="report-next"><span>DA DISCUTERE IN ÉQUIPE</span><ul className="report-checklist">{report.discuss.map((d) => <li key={d}>{d}</li>)}</ul></section>
    <footer>Riepilogo a uso interno. Descrive come stanno gli ospiti e di cosa hanno bisogno, mai il contenuto delle conversazioni con ROSS. La voce della struttura è anonima e riporta solo temi espressi da almeno 3 ospiti.</footer>
  </article>;
}

function ResidentReport({ resident, report, period }) {
  const navigate = useNavigate();
  const watch = report.signals.filter((x) => !x.positive);
  const positive = report.signals.filter((x) => x.positive);
  return <article className="report-paper surface">
    <PaperHeader period={period} />
    <section className="report-title"><div><span>COME STA</span><h1>{resident.name}</h1><p>{resident.age} anni · stanza {resident.room} · {resident.daysWithRoss} giorni con ROSS</p></div><Avatar resident={resident} size="xl" /></section>
    <section className="report-kpis">{report.kpis.map(([value, label]) => <div key={label}><strong className={String(value).length > 10 ? "kpi-text" : ""}>{value}</strong><span>{label}</span></div>)}</section>
    <section className="report-narrative"><span>IN SINTESI</span><h2>{report.headline}</h2>{report.paragraphs.map((text) => <p key={text}>{text}</p>)}</section>
    <section className="report-columns">
      <div><h3>Benessere · ultimi 7 giorni</h3><ul>{watch.map((sig) => <li key={sig.signal}>{capitalize(sig.signal)} <strong>{sig.note ? sig.trend : `${sig.count} su ${sig.of} · di solito ${sig.usual}`}</strong></li>)}{positive.map((sig) => <li key={sig.signal} className="is-positive">{capitalize(sig.signal)} <strong>{sig.count} su {sig.of} · di solito {sig.usual}</strong></li>)}{!report.signals.length && <li>{report.building ? "Baseline in costruzione" : "Nessun segnale particolare rispetto alla sua media"}</li>}</ul></div>
      <div><h3>Bisogni espressi</h3><ul>{report.needs.length ? report.needs.map((n) => <li key={n.text}>{n.text} <strong>{n.times > 1 ? `${n.times} volte` : "1 volta"}</strong></li>) : <li>Nessun bisogno particolare espresso</li>}</ul></div>
    </section>
    {report.relating && <section className="report-approach"><h3>Come avvicinarsi</h3>
      <ol className="report-steps">{report.firstSteps.map((step) => <li key={step}>{step}</li>)}</ol>
      <div className="report-hooks">{report.hooks.map((h) => <div key={h.label}><strong>{h.label}{h.isNew ? " · nuovo" : ""}</strong><small>{h.source}{h.lever ? ` · ${h.lever.toLowerCase()}` : ""}</small>{h.detail && <p><em>Dalla biografia d'ingresso:</em> {h.detail}</p>}{h.opener && <p><em>Per iniziare:</em> {h.opener}</p>}</div>)}</div>
      <p className="report-relating">Come rivolgersi: <strong>{report.relating.address}</strong> · Momento migliore: <strong>{report.relating.bestTime}</strong> · Durata: <strong>{report.relating.duration}</strong> · {report.relating.avoid}</p>
      <button className="text-link no-print" onClick={() => navigate(`/ospiti/${resident.id}?tab=avvicinare`)}>Tutte le indicazioni nella cartella <ArrowRight size={14} /></button>
    </section>}
    {report.checklist.length > 0 && <section className="report-next report-presence"><span>DA OSSERVARE IN ÉQUIPE</span><ul className="report-checklist">{report.checklist.map((item) => <li key={item}>{item}</li>)}</ul></section>}
    <section className="report-next"><span>SPUNTO PER LO STAFF</span><p>{report.next}</p></section>
    <section className="report-chart"><h3>Partecipazione {report.building ? "(baseline in costruzione)" : "rispetto alla sua media personale"}</h3><ParticipationChart series={report.series} building={report.building} /></section>
    <footer>Report a uso interno dell'équipe. Descrive come sta la persona e di cosa ha bisogno, mai il contenuto delle sue conversazioni con ROSS. Non contiene citazioni, diagnosi, valutazioni cliniche o informazioni dei documenti sanitari. I dettagli biografici vengono solo dalla biografia d'ingresso.</footer>
  </article>;
}
