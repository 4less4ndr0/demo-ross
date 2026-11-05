import { Clock, Heart, HelpCircle, Sparkles, ThumbsDown } from "lucide-react";
import { spuntoHistory, spuntoReading, spuntoTypeLabel } from "../data/channel";
import { useChannel } from "../state/channelStore";
import { channelResident } from "../data/channel";
import { InsightFooter, ProposeCard } from "../pages/StructureChannel";

// Struttura 2.0, ritratto dell'ospite, scheda «Spunti»: cosa la struttura ha proposto a ROSS per questa persona,
// e come è stato accolto. Serve a capire cosa le fa piacere, non a valutarla: niente punteggi né percentuali.
const plural = { attivita: "le attività", ricordo: "i ricordi", evento: "gli eventi", persona: "le persone" };
const groups = [
  { id: "piaciuti", title: "Sono piaciuti", icon: Heart, match: ["volentieri"] },
  { id: "pensa", title: "Ci sta pensando", icon: HelpCircle, match: ["pensa"] },
  { id: "no", title: "Non sono piaciuti, o non era il momento", icon: ThumbsDown, match: ["no", "non-ora"] },
];
const list = (items) => [...new Set(items.map((i) => plural[i.type]).filter(Boolean))].join(", ");

export function ResidentSpunti({ resident }) {
  const data = useChannel();
  const r = channelResident(resident.id);
  const first = r.first;

  const fromInsights = data.insights.filter((i) => i.residentId === r.id && i.spunto)
    .map((i) => ({ id: i.id, when: i.when, type: i.spunto.type, text: i.spunto.text, reception: i.reception, story: i.story, suggestion: i.suggestion, insight: i }));
  const proposed = [...fromInsights, ...spuntoHistory.filter((h) => h.residentId === r.id)];
  const pending = data.spunti.filter((s) => s.residentId === r.id && s.status === "attesa");
  const spontaneous = data.insights.filter((i) => i.residentId === r.id && !i.spunto);

  const liked = proposed.filter((p) => p.reception === "volentieri");
  const notLiked = proposed.filter((p) => ["no", "non-ora"].includes(p.reception));
  const reading = spuntoReading[r.id];
  const likedTypes = list(liked);
  const notTypes = list(notLiked);

  return (
    <div className="s2-profile">
      <div className="s2-profile-main">
        <section className="s2-card s2-reading">
          <span className="s2-eyebrow">Cosa ha capito ROSS</span>
          {proposed.length ? <>
            <h3>{reading || `Con ${first} ROSS sta ancora imparando cosa funziona.`}</h3>
            {(likedTypes || notTypes) && <div className="s2-reading-facts">
              {likedTypes && <p><span className="s2-reception is-volentieri">Funzionano</span>{likedTypes}</p>}
              {notTypes && <p><span className="s2-reception is-no">Per ora meno</span>{notTypes}</p>}
            </div>}
            <p className="s2-reading-note">Da come {first} ha accolto gli spunti della struttura, non da ciò che ha raccontato. È un'indicazione per proporre meglio, non un giudizio.</p>
          </> : <>
            <h3>Ancora nessuno spunto per {first}.</h3>
            <p className="s2-reading-note">Proponine uno: ROSS lo porterà nella conversazione, se {first} ci sta, e qui ti racconterà com'è andata.</p>
          </>}
        </section>

        {pending.length > 0 && <SpuntoGroup title="In attesa del momento giusto" icon={Clock} items={pending.map((s) => ({ ...s, when: "Appena inviato", story: "ROSS lo porterà nella conversazione quando ne avrà occasione." }))} />}
        {groups.map((g) => {
          const items = proposed.filter((p) => g.match.includes(p.reception));
          return items.length ? <SpuntoGroup key={g.id} title={g.title} icon={g.icon} tone={g.id} items={items} first={first} /> : null;
        })}

        {spontaneous.length > 0 && <SpuntoGroup title={`Emerso da ${first}, senza spunto`} icon={Sparkles} tone="spontaneous" items={spontaneous.map((i) => ({ id: i.id, when: i.when, story: i.story, suggestion: i.suggestion, insight: i }))} />}
      </div>
      <aside className="s2-profile-side"><ProposeCard key={r.id} spunti={data.spunti} fixedId={r.id} /></aside>
    </div>
  );
}

function SpuntoGroup({ title, icon: Icon, tone = "", items }) {
  return (
    <section className={`s2-group is-${tone}`}>
      <h3><Icon size={17} />{title}<small>{items.length}</small></h3>
      <ul>
        {items.map((item) => {
          const r = item.insight && channelResident(item.insight.residentId);
          return (
            <li key={item.id} id={item.insight ? item.insight.id : undefined} className="s2-card s2-spunto">
              <div className="s2-spunto-meta">{item.type && <span>{spuntoTypeLabel(item.type)}</span>}<small>{item.when}</small></div>
              {item.text && <p className="s2-spunto-text">«{item.text}»</p>}
              {item.story && <p className="s2-spunto-story">{item.story}</p>}
              {item.suggestion && <p className="s2-suggestion"><span>Cosa puoi fare</span>{item.suggestion}</p>}
              {item.insight && <InsightFooter insight={item.insight} resident={r} />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
