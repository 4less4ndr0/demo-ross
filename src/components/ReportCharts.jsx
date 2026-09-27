import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Infografiche dei report. Regole: ognuno confrontato con sé stesso, colore con un solo significato
// (verde = va bene / sopra la media, corallo = da osservare / sotto la media, grigio = in linea),
// sempre accompagnato da un'etichetta. Palette validata con lo script della skill dataviz.
export const CHART = { pos: "#1b8a70", neg: "#d4552f", mid: "#a39d92", need: "#a8761b", grid: "#e7e2d7" };
const toneOf = { up: "pos", down: "neg", flat: "mid", building: "mid", positivo: "pos", negativo: "neg", neutro: "mid", pos: "pos", neg: "neg", mid: "mid", need: "need" };
export const chartTooltip = { borderRadius: 12, border: "1px solid var(--line)", boxShadow: "var(--shadow)", background: "var(--surface)", color: "var(--text)", fontSize: 12 };

export function ChartCard({ title, question, children, wide, note }) {
  return <figure className={`infographic-card${wide ? " is-wide" : ""}`}>
    <figcaption><h4>{title}</h4>{question && <p>{question}</p>}</figcaption>
    {children}
    {note && <small className="chart-note">{note}</small>}
  </figure>;
}

export function ChartLegend({ items }) {
  return <div className="chart-legend">{items.map((item) => <span key={item.label}><i className={`swatch-${toneOf[item.tone]}${item.shape ? ` swatch-${item.shape}` : ""}`} />{item.label}{item.count != null && <strong>{item.count}</strong>}</span>)}</div>;
}

// Tooltip leggero per i grafici in HTML: compare al passaggio del mouse o con il focus da tastiera.
const Tip = ({ children }) => children ? <span className="chart-tip" role="tooltip">{children}</span> : null;

// Barre divergenti attorno allo zero ("sua media"): a destra sopra, a sinistra sotto.
export function DivergingBars({ rows, format = (v) => v, emptyLabel = "ROSS la sta ancora conoscendo", left = "sotto", right = "sopra", center = "sua media", ariaLabel }) {
  const max = Math.max(0.1, ...rows.filter((r) => r.value != null).map((r) => Math.abs(r.value)));
  return <div className="diverging" role="img" aria-label={ariaLabel}>
    {rows.map((row) => {
      const tone = toneOf[row.tone] || (row.value > 0 ? "pos" : row.value < 0 ? "neg" : "mid");
      const width = row.value == null ? 0 : Math.max(1.5, (Math.abs(row.value) / max) * 50);
      return <div key={row.id || row.label} className="diverging-row" tabIndex={0}>
        <span className="chart-label">{row.label}</span>
        <span className="diverging-track">
          {row.value == null ? <em>{emptyLabel}</em> : <i className={`bar-${tone} ${row.value < 0 ? "is-left" : "is-right"}`} style={row.value < 0 ? { right: "50%", width: `${width}%` } : { left: "50%", width: `${width}%` }} />}
        </span>
        <span className="chart-value">{row.value == null ? "—" : format(row.value)}</span>
        <Tip>{row.tip}</Tip>
      </div>;
    })}
    <div className="diverging-axis"><span /><span><small>← {left}</small><b>{center}</b><small>{right} →</small></span><span /></div>
  </div>;
}

// Barre orizzontali con etichetta diretta; `reference` disegna una linea verticale (es. soglia di anonimato).
export function HorizontalBars({ rows, max: forcedMax, reference, ariaLabel }) {
  const max = forcedMax || Math.max(1, ...rows.map((r) => r.value));
  const refLeft = reference ? `${(reference.value / max) * 100}%` : null;
  return <div className="hbars" role="img" aria-label={ariaLabel}>
    {rows.map((row) => <div key={row.label} className="hbar-row" tabIndex={0}>
      <span className="chart-label">{row.label}</span>
      <span className="hbar-track">
        <i className={`bar-${toneOf[row.tone] || "pos"}`} style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} />
        {reference && <b className="hbar-ref" style={{ left: refLeft }} />}
      </span>
      <span className="chart-value">{row.valueLabel ?? row.value}</span>
      <Tip>{row.tip}</Tip>
    </div>)}
    {reference && <div className="hbar-row hbar-axis"><span /><span className="hbar-track"><small style={{ left: refLeft }}>{reference.label}</small></span><span /></div>}
  </div>;
}

// "Di solito" → "questa settimana" per ogni segnale, sulla stessa scala (conversazioni della settimana).
export function Dumbbell({ rows, ariaLabel }) {
  const scaled = rows.filter((r) => !r.note);
  const max = Math.max(1, ...scaled.map((r) => Math.max(r.of, r.usual ?? 0, r.count)));
  const pct = (v) => `${(v / max) * 100}%`;
  return <div className="dumbbell" role="img" aria-label={ariaLabel}>
    {rows.map((row) => {
      const tone = row.positive ? "pos" : "neg";
      if (row.note) return <div key={row.signal} className="dumbbell-row is-note"><span className="chart-label">{row.label}</span><span className="dumbbell-note"><i className={`dot-${tone}`} />{row.note}</span></div>;
      const lo = Math.min(row.usual ?? row.count, row.count);
      const hi = Math.max(row.usual ?? row.count, row.count);
      return <div key={row.signal} className="dumbbell-row" tabIndex={0}>
        <span className="chart-label">{row.label}</span>
        <span className="dumbbell-track">
          {row.usual != null && <b className={`dumbbell-link link-${tone}`} style={{ left: pct(lo), width: `calc(${pct(hi)} - ${pct(lo)})` }} />}
          {row.usual != null && <i className="dot-usual" style={{ left: pct(row.usual) }} />}
          <i className={`dot-${tone}`} style={{ left: pct(row.count) }} />
        </span>
        <span className="chart-value">{row.count} su {row.of}<small>{row.usual == null ? "prime settimane" : `di solito ${row.usual}`}</small></span>
        <Tip>{row.tip}</Tip>
      </div>;
    })}
    <div className="dumbbell-row dumbbell-axis"><span /><span className="dumbbell-track">{Array.from({ length: max + 1 }, (_, v) => <small key={v} style={{ left: pct(v) }}>{v}</small>)}</span><span /></div>
  </div>;
}

// Colonne (serie singola) con valore sopra ogni colonna e tooltip.
export function Columns({ data, dataKey, labelKey = "label", height = 170, color = CHART.pos, domain, valueLabel, tooltip }) {
  return <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 22, right: 4, bottom: 0, left: 4 }}>
      <CartesianGrid vertical={false} stroke={CHART.grid} />
      <XAxis dataKey={labelKey} tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11, fill: "var(--muted)" }} />
      <YAxis hide domain={domain || [0, "dataMax"]} />
      <Tooltip cursor={{ fill: "var(--surface-2)" }} contentStyle={chartTooltip} formatter={tooltip} labelFormatter={(label, payload) => payload?.[0]?.payload?.tipLabel || label} />
      <Bar dataKey={dataKey} fill={color} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
        <LabelList dataKey={valueLabel || dataKey} position="top" style={{ fontSize: 12, fontWeight: 600, fill: "var(--text)" }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>;
}

// Minuti al giorno in piccolo, dentro il KPI "tempo con ROSS".
export function Sparkline({ data, dataKey = "minutes", formatLabel }) {
  return <div className="kpi-spark"><ResponsiveContainer width="100%" height={34}>
    <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
      <Tooltip contentStyle={chartTooltip} labelFormatter={(_, payload) => formatLabel?.(payload?.[0]?.payload) || ""} formatter={(value) => [`${value} min`, "Tempo con ROSS"]} />
      <Area type="monotone" dataKey={dataKey} stroke={CHART.pos} fill={CHART.pos} fillOpacity={0.12} strokeWidth={2} dot={false} isAnimationActive={false} />
    </AreaChart>
  </ResponsiveContainer></div>;
}
