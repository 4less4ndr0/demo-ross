import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ArrowRight, ChevronDown, Compass, EyeOff } from "lucide-react";

// Specchietto "Cosa ti dice ROSS" nella sidebar delle pagine Ospiti e Report: dà senso alla pagina,
// spiega cosa si trova e perché è fatta così. Stessa card verde della guida nella chat (InsightRail).
const readOpen = (key) => { try { return localStorage.getItem(key) !== "0"; } catch { return true; } };
const writeOpen = (key, open) => { try { localStorage.setItem(key, open ? "1" : "0"); } catch { /* storage non disponibile */ } };

export function SidebarGuide({ id, subtitle, intro, entries, onDone }) {
  const storageKey = `ross-guide-${id}`;
  const [open, setOpen] = useState(() => readOpen(storageKey));
  const navigate = useNavigate();
  const onChange = (value) => { const next = value === "guide"; setOpen(next); writeOpen(storageKey, next); };
  const ask = (question) => { onDone?.(); navigate(`/?q=${encodeURIComponent(question)}`); };
  const go = (to) => { onDone?.(); navigate(to); };
  return <AccordionPrimitive.Root type="single" collapsible value={open ? "guide" : ""} onValueChange={onChange} className="rail-accordion">
    <AccordionPrimitive.Item value="guide" className="rail-item compass-card">
      <AccordionPrimitive.Header className="rail-item-head">
        <AccordionPrimitive.Trigger className="rail-item-trigger"><span className="compass-title"><span className="leaf-mark"><Compass size={14} /></span><span className="compass-title-text">Cosa ti dice ROSS<small>{subtitle}</small></span></span><ChevronDown size={16} className="rail-chevron" /></AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="rail-item-content"><div className="rail-item-body">
        <p className="guide-intro">{intro}</p>
        {entries.map((e) => <div className="guide-entry" key={e.title}><strong>{e.title}</strong><span>{e.text}</span>{e.question && <button onClick={() => ask(e.question)}>Prova: «{e.question}» <ArrowRight size={12} /></button>}</div>)}
        <p><EyeOff size={13} /> Mai il contenuto delle conversazioni</p>
        <button className="compass-more" onClick={() => go("/impostazioni#privacy")}>Come proteggiamo gli ospiti</button>
      </div></AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  </AccordionPrimitive.Root>;
}

export const residentsGuide = {
  id: "ospiti",
  subtitle: "Perché questa pagina è fatta così",
  intro: "Qui trovi ogni ospite come lo conosce ROSS: come sta e come avvicinarlo. Non è l'anagrafica, che resta nel gestionale: è ciò che serve per stare accanto alla persona nel modo giusto.",
  entries: [
    { title: "Perché questo ordine", text: "In cima chi ha bisogno di più attenzione oggi: prima un'assenza insolita, poi i segnali da osservare, poi i bisogni espressi. Chi inizia la giornata sa da chi passare per primo.", question: "Chi ha bisogno di più attenzione oggi?" },
    { title: "Ognuno confrontato con sé stesso", text: "La partecipazione è sempre rispetto alla media della persona negli ultimi 14 giorni. Niente punteggi né classifiche: una persona riservata non è «peggio» di una socievole." },
    { title: "Il ritratto", text: "Quattro schede: Come sta (benessere, bisogni, presenza), Come avvicinarsi (primo approccio e spunti per ogni interesse), Conversazioni ROSS (quando e quanto, mai di cosa), Documenti (allegati dalla chat, in sola lettura)." },
    { title: "Cosa non trovi, e perché", text: "Niente storia di vita, grafo delle relazioni, ricordi o citazioni: sono della persona. I dettagli biografici compaiono solo se li hanno dati la famiglia o la struttura all'ingresso." },
    { title: "ROSS segnala, voi decidete", text: "ROSS non giudica la salute di nessuno: racconta la giornata e ciò che la persona esprime. I segnali sono spunti da verificare di persona: il giudizio resta all'équipe.", question: "Chi ha espresso segnali da osservare questa settimana?" },
  ],
};

export const reportsGuide = {
  id: "report",
  subtitle: "A cosa servono questi report",
  intro: "Due report da stampare o salvare in PDF, pensati per il lavoro d'équipe: uno racconta la struttura, l'altro la singola persona. Trasformano ciò che ROSS osserva in qualcosa di cui parlare insieme.",
  entries: [
    { title: "Riepilogo d'équipe", text: "Com'è la vita in struttura in questo periodo: benessere, voce degli ospiti, bisogni, presenza. Per la riunione d'équipe e la direzione: chiude con i punti da discutere.", question: "Prepara il riepilogo d'équipe del mese" },
    { title: "Singolo ospite", text: "Il «Come sta» di una persona: com'è andato il periodo, come avvicinarla, cosa osservare. Utile per un confronto in équipe o per chi la incontra da poco." },
    { title: "Perché anche su carta", text: "Le caselle «Da osservare» e «Da discutere» si spuntano a penna: ROSS segnala, l'équipe osserva, decide e annota." },
    { title: "Come si leggono i numeri", text: "Ogni ospite è confrontato solo con la propria media. La voce della struttura è anonima e un tema compare solo se lo esprimono almeno 3 ospiti. Minuti e orari vengono dalle conversazioni con ROSS." },
    { title: "Cosa non c'è", text: "Né citazioni né argomenti, né giudizi sulla salute, né i contenuti dei documenti della struttura. Il report racconta come sta la persona, non cosa ha raccontato." },
  ],
};
