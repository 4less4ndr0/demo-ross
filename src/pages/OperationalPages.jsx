import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, ChartCard, ChartLegend, Columns, DivergingBars, Dumbbell, HorizontalBars, Sparkline } from "../components/ReportCharts";
import { ArrowRight, Download, Printer } from "lucide-react";
import { ParticipationChart } from "../components/ParticipationChart";
import { byAttention } from "../data/careInsights";
import { buildResidentReport, buildTeamReport } from "../data/reportNarrative";
import { useDemo } from "../state/DemoContext";
import { Button, Select } from "../components/ui";
import { Avatar, SectionTitle } from "../components/Common";

// Report per l'équipe (docs/contratto-informativo-struttura.md): Riepilogo d'équipe sui cinque punti cardinali
// oppure "Come sta" del singolo ospite. Mai il contenuto delle conversazioni, confronti solo con la media della persona.
const tooltipStyle = { borderRadius: 12, border: "1px solid var(--line)", boxShadow: "var(--shadow)", background: "var(--surface)", color: "var(--text)" };
const months = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const formatTick = (value) => { const [month, day] = value.split("-"); return `${Number(day)} ${months[Number(month) - 1]}`; };
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const voiceTag = { positivo: "Apprezzato", negativo: "Da migliorare", neutro: "Richiesta" };
const signed = (value, digits = 1, unit = "") => `${value > 0 ? "+" : value < 0 ? "−" : "±"}${Math.abs(value).toFixed(digits)}${unit}`;
const ospiti = (n) => `${n} ${n === 1 ? "ospite" : "ospiti"}`;
const rhythmLabels = { 1: "Bassa", 2: "Media", 3: "Alta" };

function Kpis({ kpis, days }) {
  return <section className="report-kpis">{kpis.map(([value, label, change]) => <div key={label}>
    <strong className={String(value).length > 10 ? "kpi-text" : ""}>{value}</strong><span>{label}</span>
    {change && <em className="kpi-change">{change.text}</em>}
    {days && label === "tempo con ROSS" && <Sparkline data={days} formatLabel={(d) => d && formatTick(d.date)} />}
  </div>)}</section>;
}

export function ReportsPage() {
  const { state } = useDemo();
  const [params, setParams] = useSearchParams();
  const residentId = params.get("ospite");
  const single = Boolean(residentId) || params.get("tipo") === "ospite";
  const resident = state.residents.find((r) => r.id === residentId) || byAttention(state.residents)[0];
  const [period, setPeriod] = useState("30");
  const showTeam = () => setParams({});
  const showResident = (id) => { setParams({ ospite: id }); window.scrollTo({ top: 0 }); };

  useEffect(() => {
    if (params.get("stampa") !== "1") return undefined;
    const timer = window.setTimeout(() => { window.print(); const next = new URLSearchParams(params); next.delete("stampa"); setParams(next, { replace: true }); }, 900);
    return () => window.clearTimeout(timer);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="report-screen screen-enter">
    <SectionTitle eyebrow="REPORT" title={single ? `Come sta ${resident.name}` : "Riepilogo d'équipe"} description={single ? `Report narrativo per l'équipe · ultimi ${period} giorni. Come sta e di cosa ha bisogno, mai il contenuto delle conversazioni.` : `La situazione della struttura negli ultimi ${period} giorni: benessere, voce degli ospiti, bisogni e presenza. Per le riunioni d'équipe e la direzione.`} action={<div className="action-group"><Button variant="outline" onClick={() => window.print()}><Download size={16} /> Salva PDF</Button><Button onClick={() => window.print()}><Printer size={16} /> Stampa</Button></div>} />
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
    <Kpis kpis={report.kpis} days={report.days} />
    <section className="report-narrative"><span>IN SINTESI</span><p className="team-summary">{report.summary}</p></section>

    <section className="team-block"><h3>Benessere nel tempo</h3><p className="team-question">Chi sta partecipando più o meno del solito, e cosa hanno espresso gli ospiti questa settimana. Ognuno è confrontato solo con sé stesso.</p>
      <div className="infographic-grid">
        <ChartCard title="Ognuno rispetto alla propria media" question="Partecipazione negli ultimi 14 giorni. Non è una classifica: ogni barra parte dalla media di quella persona." note="Il valore indica di quanto la partecipazione si discosta dalla media personale.">
          <DivergingBars ariaLabel="Partecipazione di ogni ospite rispetto alla propria media" rows={report.trendRows.map((r) => ({ ...r, tip: r.value == null ? `${r.label}: ROSS la sta ancora conoscendo, ancora nessun confronto` : `${r.label}: ${signed(r.value)} rispetto alla sua media` }))} format={(v) => signed(v)} onSelect={(r) => onResident(r.id)} />
          <ChartLegend items={report.distribution.map((d) => ({ tone: d.tone, shape: d.tone === "building" ? "dash" : undefined, label: d.label, count: d.count }))} />
          <small className="chart-hint no-print">Tocca un nome per aprire il suo report</small>
        </ChartCard>
        <ChartCard title="Cosa hanno espresso questa settimana" question="Per ogni segnale, quanti ospiti lo hanno espresso più del solito negli ultimi 7 giorni." note="Spunti da osservare di persona, non giudizi sulla salute.">
          <ChartLegend items={[{ tone: "pos", label: "Va bene" }, { tone: "neg", label: "Da osservare" }]} />
          <HorizontalBars ariaLabel="Segnali espressi questa settimana per numero di ospiti" max={Math.max(3, ...report.signalTypes.map((x) => x.count))} rows={report.signalTypes.map((x) => ({ label: capitalize(x.signal), value: x.count, tone: x.positive ? "pos" : "neg", valueLabel: ospiti(x.count), tip: `${capitalize(x.signal)}: ${x.who.join(", ")}` }))} />
        </ChartCard>
      </div>
    </section>

    <section className="team-block"><h3>Voce della struttura e bisogni</h3><p className="team-question">Cosa esprimono gli ospiti sulla vita in struttura, in forma anonima, e di cosa hanno bisogno.</p>
      <div className="infographic-grid">
        <ChartCard title="Voce della struttura" question="Quanti ospiti hanno espresso ogni tema. Un tema compare solo se lo esprimono almeno 3 ospiti.">
          <HorizontalBars ariaLabel="Temi della voce della struttura per numero di ospiti" max={report.total} reference={{ value: 3, label: "soglia di anonimato · 3 ospiti" }} rows={report.voice.map((v) => ({ label: v.topic, value: v.count, tone: v.tone, valueLabel: `${v.count} su ${report.total}`, tip: `${v.count} ospiti hanno espresso ${v.text} · ${v.period}` }))} />
          <ChartLegend items={[{ tone: "positivo", label: "Apprezzato" }, { tone: "neutro", label: "Richiesta" }, { tone: "negativo", label: "Da migliorare" }]} />
        </ChartCard>
        <ChartCard title="Di cosa hanno bisogno" question="Bisogni espressi a ROSS, raggruppati per tipo: quante volte li hanno espressi e quanti ospiti." note="Chi ha espresso cosa è nella situazione per ospite, qui sotto.">
          <HorizontalBars ariaLabel="Bisogni espressi per tipo" max={Math.max(4, ...report.needCategories.map((c) => c.value))} rows={report.needCategories.map((c) => ({ label: c.label, value: c.value, tone: "need", valueLabel: `${c.value} ${c.value === 1 ? "volta" : "volte"}`, tip: `${c.label}: espresso ${c.value} ${c.value === 1 ? "volta" : "volte"} da ${ospiti(c.residents)}` }))} />
        </ChartCard>
      </div>
      <ul className="voice-list">{report.voice.map((v) => <li key={v.topic}><span className={`voice-tag voice-${v.tone}`}>{voiceTag[v.tone]}</span><div><strong>{v.topic}</strong><small>{v.count} ospiti hanno espresso {v.text} · {v.period}</small></div><em>{v.action}</em></li>)}</ul>
    </section>

    <section className="team-block"><h3>Situazione per ospite</h3><p className="team-question">Prima chi ha bisogno di più attenzione. Il dettaglio è nel report di ciascuno.</p>
      <div className="team-table">{report.rows.map((row) => <div key={row.resident.id} className="team-row">
        <div className="team-person"><Avatar resident={row.resident} size="sm" /><div><strong>{row.resident.name}</strong><small className={`trend-text trend-${row.trend.tone}`}>{row.trend.tone === "building" ? "ROSS la sta ancora conoscendo" : `Partecipazione ${row.trend.label}`}</small></div></div>
        <p className="team-headline">{row.headline}</p>
        <div className="team-flags">{row.positive.slice(0, 1).map((p) => <span key={p} className="attention-chip attention-ok">{capitalize(p)}</span>)}{row.watch.map((w) => <span key={w} className="attention-chip attention-watch">{capitalize(w)}</span>)}{row.need && <span className="attention-chip attention-need">{row.need}</span>}</div>
        <p className="team-next"><span>Spunto</span>{row.next}</p>
        <button className="text-link no-print" onClick={() => onResident(row.resident.id)}>Report <ArrowRight size={14} /></button>
      </div>)}</div>
    </section>

    <section className="team-block team-presence"><h3>Presenza e uso di ROSS</h3><p className="team-question">Quanto e quando gli ospiti parlano con ROSS, e quali attività li coinvolgono di più.</p>
      <div className="infographic-grid">
        <ChartCard title="Minuti al giorno" question={`Tempo passato con ROSS da tutti gli ospiti, negli ultimi ${period} giorni.`}>
          <ResponsiveContainer width="100%" height={180}><AreaChart data={report.days} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}><CartesianGrid vertical={false} stroke={CHART.grid} /><XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} tickFormatter={formatTick} tick={{ fontSize: 11, fill: "var(--muted)" }} /><YAxis tickLine={false} axisLine={false} width={32} tick={{ fontSize: 11, fill: "var(--muted)" }} /><Tooltip contentStyle={tooltipStyle} labelFormatter={formatTick} formatter={(value) => [`${value} min`, "Tempo con ROSS"]} /><Area type="monotone" dataKey="minutes" stroke={CHART.pos} fill={CHART.pos} fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} /></AreaChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Quando parlano con ROSS" question="Conversazioni per giorno e fascia oraria. Più scuro = più conversazioni: utile per scegliere quando proporre un'attività.">
          <div className="team-heatmap" role="img" aria-label="Conversazioni per giorno e fascia oraria"><div className="heat-head"><span />{report.heatmap[0].cells.map((c) => <span key={c.label}>{c.label}</span>)}</div>{report.heatmap.map((row) => <div key={row.day} className="heat-line"><strong>{row.day}</strong>{row.cells.map((c) => <span key={c.label} style={{ opacity: 0.12 + (c.count / maxHeat) * 0.88 }} title={`${row.day} ${c.label}: ${c.count} conversazioni`} />)}</div>)}</div>
        </ChartCard>
        <ChartCard wide title="Cosa coinvolge di più" question="Per ogni tipo di attività con ROSS, quanto durano le conversazioni rispetto alla media di chi le fa. Ognuno è confrontato con sé stesso, poi si fa la media." note="Calcolato sulla durata delle conversazioni del periodo, mai sul loro contenuto.">
          <DivergingBars ariaLabel="Durata delle conversazioni per tipo di attività rispetto alla media personale" left="più brevi" right="più lunghe" center="media di ciascuno" rows={report.activityEngagement.map((a) => ({ ...a, tip: `${a.label}: conversazioni ${a.value >= 0 ? `più lunghe del ${a.value}%` : `più brevi del ${Math.abs(a.value)}%`} rispetto alla media di chi la fa · ${a.count} conversazioni` }))} format={(v) => signed(v, 0, "%")} />
        </ChartCard>
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
  const name = resident.name.split(" ")[0];
  return <article className="report-paper surface">
    <PaperHeader period={period} />
    <section className="report-title"><div><span>COME STA</span><h1>{resident.name}</h1><p>{resident.age} anni · stanza {resident.room} · {resident.daysWithRoss} giorni con ROSS</p></div><Avatar resident={resident} size="xl" /></section>
    <Kpis kpis={report.kpis} />
    <section className="report-narrative"><span>IN SINTESI</span><h2>{report.headline}</h2>{report.paragraphs.map((text) => <p key={text}>{text}</p>)}</section>
    <section className="infographic-grid report-infographics">
      <ChartCard title="Questa settimana rispetto al solito" question={`Segnali espressi negli ultimi 7 giorni: in quante conversazioni, rispetto alla media di ${name}.`}>
        {report.signals.length ? <>
          <Dumbbell ariaLabel={`Segnali espressi da ${name} rispetto al solito`} rows={[...positive, ...watch].map((sig) => ({ ...sig, label: capitalize(sig.signal), note: sig.note, tip: sig.usual == null ? `${capitalize(sig.signal)}: ${sig.count} conversazioni su ${sig.of}, ROSS la sta ancora conoscendo` : `${capitalize(sig.signal)}: ${sig.count} conversazioni su ${sig.of} questa settimana, di solito ${sig.usual}` }))} />
          <ChartLegend items={[...(positive.length ? [{ tone: "pos", label: "Va bene" }] : []), ...(watch.length ? [{ tone: "neg", label: "Da osservare" }] : []), ...(report.building ? [] : [{ tone: "mid", shape: "ring", label: "Di solito" }])]} />
        </> : <p className="chart-empty">{report.building ? "ROSS la sta ancora conoscendo" : "Nessun segnale particolare rispetto alla sua media"}</p>}
      </ChartCard>
      <ChartCard title="Bisogni espressi" question="Ciò che ha chiesto per sé a ROSS, e quante volte.">
        <ul className="chart-list">{report.needs.length ? report.needs.map((n) => <li key={n.text}>{n.text} <strong>{n.times > 1 ? `${n.times} volte` : "1 volta"}</strong></li>) : <li>Nessun bisogno particolare espresso</li>}</ul>
      </ChartCard>
      <ChartCard title={report.weekly.length < 4 ? "Conversazioni da quando conosce ROSS" : "Conversazioni nelle ultime 4 settimane"} question="Quante conversazioni con ROSS a settimana. I minuti sono nel dettaglio.">
        <Columns data={report.weekly.map((w) => ({ ...w, tipLabel: w.week }))} dataKey="conversations" domain={[0, (max) => Math.max(5, max)]} tooltip={(value, _, item) => [`${value} conversazioni · ${item.payload.minutes} min`, "Con ROSS"]} />
      </ChartCard>
      {report.rhythm && <ChartCard title="Momenti della giornata" question={`Disponibilità a conversare, da quando ${name} parla con ROSS.`}>
        <Columns data={Object.entries(report.rhythm).map(([moment, level]) => ({ label: capitalize(moment), level, levelLabel: rhythmLabels[level] }))} dataKey="level" valueLabel="levelLabel" domain={[0, 3]} tooltip={(value) => [rhythmLabels[value], "Disponibilità"]} />
      </ChartCard>}
      {report.engagement.length > 0 && <ChartCard wide={Boolean(report.rhythm)} title={`Cosa coinvolge ${name}`} question={`Quanto durano le conversazioni che partono da ogni interesse, rispetto alla media di ${name}.`} note="Interessi solo per categoria: i racconti restano tra ROSS e la persona.">
        <HorizontalBars ariaLabel={`Interessi che coinvolgono ${name}`} max={Math.max(60, ...report.engagement.map((e) => e.value))} rows={report.engagement.map((e) => ({ label: `${e.label}${e.isNew ? " · nuovo" : ""}`, value: e.value, tone: "pos", valueLabel: signed(e.value, 0, "%"), tip: `${e.label}: conversazioni più lunghe del ${e.value}% rispetto alla sua media · partecipazione alta ${e.high[0]} volte su ${e.high[1]}` }))} />
      </ChartCard>}
    </section>
    {report.relating && <section className="report-approach"><h3>Come avvicinarsi</h3>
      <ol className="report-steps">{report.firstSteps.map((step) => <li key={step}>{step}</li>)}</ol>
      <div className="report-hooks">{report.hooks.map((h) => <div key={h.label}><strong>{h.label}{h.isNew ? " · nuovo" : ""}</strong><small>{h.source}{h.lever ? ` · ${h.lever.toLowerCase()}` : ""}</small>{h.detail && <p><em>Dalla biografia d'ingresso:</em> {h.detail}</p>}{h.opener && <p><em>Per iniziare:</em> {h.opener}</p>}</div>)}</div>
      <p className="report-relating">Come rivolgersi: <strong>{report.relating.address}</strong> · Momento migliore: <strong>{report.relating.bestTime}</strong> · Durata: <strong>{report.relating.duration}</strong> · {report.relating.avoid}</p>
      <button className="text-link no-print" onClick={() => navigate(`/ospiti/${resident.id}?tab=avvicinare`)}>Tutte le indicazioni nel ritratto <ArrowRight size={14} /></button>
    </section>}
    {report.valorize.length > 0 && <section className="report-next"><span>DA VALORIZZARE</span><ul className="report-checklist">{report.valorize.map((item) => <li key={item}>{item}</li>)}</ul></section>}
    {report.checklist.length > 0 && <section className="report-next report-presence"><span>DA OSSERVARE IN ÉQUIPE</span><ul className="report-checklist">{report.checklist.map((item) => <li key={item}>{item}</li>)}</ul></section>}
    <section className="report-next"><span>SPUNTO PER LO STAFF</span><p>{report.next}</p></section>
    <section className="report-chart"><h3>Partecipazione {report.building ? "(ROSS la sta ancora conoscendo)" : "rispetto alla sua media personale"}</h3><ParticipationChart series={report.series} building={report.building} /><div className="participation-legend"><ChartLegend items={[{ tone: "pos", label: "Partecipazione" }, ...(report.building ? [] : [{ tone: "mid", label: "Sua media (tratteggiata)" }])]} /></div></section>
    <footer>Report a uso interno dell'équipe. Descrive come sta la persona e di cosa ha bisogno, mai il contenuto delle sue conversazioni con ROSS. Non contiene citazioni, giudizi sulla salute né i contenuti dei documenti della struttura. I dettagli biografici vengono solo dalla biografia d'ingresso.</footer>
  </article>;
}
