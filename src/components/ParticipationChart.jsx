import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--line)", boxShadow: "var(--shadow)", background: "var(--surface)", color: "var(--text)" };

const months = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const formatTick = (value) => { const [month, day] = value.split("-"); return `${Number(day)} ${months[Number(month) - 1]}`; };

// Partecipazione dell'ospite rispetto alla sua media personale (serie di buildResidentReport).
export function ParticipationChart({ series, building, height = 170 }) {
  return <ResponsiveContainer width="100%" height={height}><LineChart data={series}><XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} tickFormatter={formatTick} /><YAxis domain={["dataMin - 5", "dataMax + 5"]} hide /><Tooltip contentStyle={tooltipStyle} labelFormatter={formatTick} />{!building && <Line type="monotone" dataKey="baseline" name="Sua media" stroke="#a39d92" strokeDasharray="5 5" dot={false} isAnimationActive={false} />}<Line type="monotone" dataKey="participation" name="Partecipazione" stroke="#1b8a70" strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer>;
}
