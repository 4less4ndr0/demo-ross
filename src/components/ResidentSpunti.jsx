import { useSearchParams } from "react-router-dom";
import { Clock, Heart, HelpCircle, ThumbsDown } from "lucide-react";
import { channelResident, spuntoReading, spuntoTypeLabel } from "../data/channel";
import { whenText } from "../data/demoClock";
import { momentFilters, useMoments } from "../state/channelStore";
import { Esito, MomentActions, ProposeCard } from "../pages/StructureChannel";

// Struttura 2.0, ritratto → «Spunti»: una persona, come proporle meglio. Legge la sola fonte dei momenti
// (src/data/moments.js) e tiene solo quelli nati da uno spunto, raggruppati per esito. Card compatte:
// lo spunto, l'esito, una riga di racconto; «Cosa puoi fare» solo finché il momento non è Fatto.
// Serve a capire cosa le fa piacere, non a valutarla: niente punteggi né percentuali.
const plural = { attivita: "le attività", ricordo: "i ricordi", evento: "gli eventi", persona: "le persone" };
const groups = [
  { id: "attesa", title: "In attesa del momento giusto", icon: Clock, match: ["attesa"] },
  { id: "piaciuti", title: "Sono piaciuti", icon: Heart, match: ["accolto"] },
  { id: "pensa", title: "Ci sta pensando", icon: HelpCircle, match: ["pensa"] },
  { id: "no", title: "Non sono piaciuti, o non era il momento", icon: ThumbsDown, match: ["no", "non_ora"] },
];
const list = (items) => [...new Set(items.map((i) => plural[i.spunto?.tipo]).filter(Boolean))].join(", ");
const firstSentence = (text = "") => (text.match(/^.*?[.!?](\s|$)/) || [text])[0].trim();

export function ResidentSpunti({ resident }) {
  const moments = useMoments();
  const [params] = useSearchParams();
  const r = channelResident(resident.id);
  const first = r.first;
  const mine = moments.filter(momentFilters.spunti(r.id));
  const answered = mine.filter((m) => m.esito !== "attesa");
  const likedTypes = list(answered.filter((m) => m.esito === "accolto"));
  const notTypes = list(answered.filter((m) => ["no", "non_ora"].includes(m.esito)));
  const reading = spuntoReading[r.id];

  return (
    <div className="s2-profile">
      <div className="s2-profile-main">
        <section className="s2-card s2-reading">
          <span className="s2-eyebrow">Cosa ha capito ROSS</span>
          {answered.length ? <>
            <h3>{reading || `Con ${first} ROSS sta ancora imparando cosa funziona.`}</h3>
            {(likedTypes || notTypes) && <div className="s2-reading-facts">
              {likedTypes && <p><span className="s2-reception is-volentieri">Funzionano</span>{likedTypes}</p>}
              {notTypes && <p><span className="s2-reception is-no">Per ora meno</span>{notTypes}</p>}
            </div>}
            <p className="s2-reading-note">Da come {first} ha accolto gli spunti della struttura, non da ciò che ha raccontato. È un'indicazione per proporre meglio, non un giudizio.</p>
          </> : <>
            <h3>Ancora nessuno spunto ripreso con {first}.</h3>
            <p className="s2-reading-note">Proponine uno: ROSS lo porterà nella conversazione, se {first} ci sta, e qui racconterà com'è andata.</p>
          </>}
        </section>

        {groups.map((g) => {
          const items = mine.filter((m) => g.match.includes(m.esito));
          return items.length ? <SpuntoGroup key={g.id} title={g.title} icon={g.icon} tone={g.id} items={items} /> : null;
        })}
      </div>
      <aside className="s2-profile-side"><ProposeCard key={r.id} fixedId={r.id} prefill={params.get("spunto") ? { text: params.get("spunto"), type: params.get("tipo") } : null} /></aside>
    </div>
  );
}

function SpuntoGroup({ title, icon: Icon, tone, items }) {
  return (
    <section className={`s2-group is-${tone}`}>
      <h3><Icon size={17} />{title}</h3>
      <ul>
        {items.map((m) => (
          <li key={m.id} id={`m-${m.id}`} className="s2-card s2-spunto">
            <div className="s2-spunto-meta">{m.spunto.tipo && <span>{spuntoTypeLabel(m.spunto.tipo)}</span>}<Esito value={m.esito} /><small>{whenText(m.quando)}</small></div>
            <p className="s2-spunto-text">«{m.spunto.testo}»</p>
            <p className="s2-spunto-story">{m.esito === "attesa" ? "ROSS lo porterà nella conversazione quando ne avrà occasione." : firstSentence(m.racconto)}</p>
            {m.cosaPuoiFare && m.stato !== "fatto" && <>
              <p className="s2-suggestion"><span>Cosa puoi fare</span>{m.cosaPuoiFare}</p>
              <MomentActions moment={m} compact />
            </>}
          </li>
        ))}
      </ul>
    </section>
  );
}
