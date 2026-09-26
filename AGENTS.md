# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Decisioni di prodotto (vista Struttura)

- ROSS si posiziona **on top** dei sistemi della RSA: non è un gestionale e non ne duplica funzioni (niente anagrafica, note di reparto, pianificazione attività).
- La home della Struttura è una chat a frizione zero sul modello ChatGPT ("Chiedi a ROSS"), usabile anche da telefono. Le risposte citano sempre la fonte (conversazione ROSS, documento, nota).
- Il target non è ancora definito: il selettore di ruolo resta finché la scelta non è fatta. Gli stakeholder sono **tre**: **Staff** (operatori e coordinatori in prima linea, una sola voce, accesso condiviso **senza login**), **Psicologa** e **Direzione** (accesso personale **con login**). La card profilo mostra l'account del ruolo, mai una persona per lo staff.
- **Domande consigliate** per stakeholder, concrete e con un nome: lo Staff chiede chi seguire, cosa serve e come avvicinarsi; la Psicologa l'andamento rispetto alla media; la Direzione aggregato, adozione e valore. Nella demo non esistono turni: niente domande tipo "Riassumi il turno".
- **Come avvicinarsi**: guida pratica per lo staff (primo approccio in 3 passi, spunti per interesse con leva, spunto, attività e coinvolgimento rispetto alla media, stile di ROSS, momenti della giornata). I **dettagli concreti** compaiono **solo se vengono dalla biografia d'ingresso**, con la fonte visibile; per gli interessi emersi con ROSS mai l'episodio. Dati in `approachGuide` (`src/data/careInsights.js`).
- **Vista Ospiti**: la lista mette prima chi ha bisogno di più attenzione (assenza insolita, segnali, bisogni) e mostra la partecipazione solo rispetto alla media della persona (mai punteggi assoluti tipo /10, mai dati del gestionale come "Adesso: sala lettura"). La cartella ha **4 tab**: Come sta · Come avvicinarsi · Conversazioni ROSS · Documenti. Nella struttura **non** ci sono biografia/storia, grafo delle relazioni né contributi della famiglia: questi vanno direttamente a ROSS.
- I documenti clinici (fisioterapia, esami) sono visibili ma secondari: il protagonista del test è la conversazione tra ROSS e l'ospite. Si allegano **solo dalla chat** (graffetta); il tab Documenti della cartella è in sola lettura.
- **Report**: l'équipe sceglie tra **Riepilogo d'équipe** (default: situazione della struttura sui cinque punti cardinali, stato per ospite ordinato per attenzione, punti da discutere) e **Singolo ospite**. Numeri calcolati dalle conversazioni, confronti solo con la media di ciascuno: niente baseline unica, niente "crescita della memoria", niente icone "i".
- Ogni ospite ha un **report narrativo stampabile** ("Come sta", `/report?ospite=ID`) pensato per l'équipe interna: tono osservativo, nessuna diagnosi, non cita i documenti. Si apre dalla cartella ("Stampa report"), dalla chat o dal menu Report.
- Barra superiore: solo le **tre schede centrate**; nome della struttura e data stanno nella sidebar sotto il logo R.O.S.S. Tema, presentazione e modalità ROSS si gestiscono da Impostazioni o dal menu della card operatore, non dalla barra.
- Menu della Struttura: **tre schede al centro della barra superiore** (Chiedi a ROSS · Ospiti · Report; su mobile in una riga sotto la barra), più Impostazioni in fondo alla sidebar. Non reintrodurre pagine separate per insight, consegne, analytics o interazioni: vanno accorpate nella chat, nella cartella o nel report.
- **Sidebar contestuale**: card ad accordion (solo titoli con conteggio, si aprono al clic), senza icone "i": le spiegazioni stanno nella guida alla lettura "Cosa ti dice ROSS", che copre tutta la schermata. In "Chiedi a ROSS" contiene "Il polso di ROSS" (insight aggregati, `src/components/InsightRail.jsx`, che fanno domande alla chat via evento `ross:ask`); nelle altre pagine si riduce a una colonna di icone. Su mobile si apre dall'hamburger.
- Il **ruolo** ("Sto chiedendo come") si sceglie dal menu della card profilo in basso a sinistra; la chat mostra solo un'etichetta del ruolo attivo e il menu "…" della conversazione.
- **Interazioni in stile shadcn/ui** nella vista Struttura: bottoni, dropdown, select (anche nei moduli), dialog, sheet laterali e toast usano le primitive di `src/components/ui.jsx` (Radix + Sonner) con i token visivi ROSS (colori caldi, serif editoriale). Non adottare il tema neutro di shadcn né Tailwind. Le azioni reversibili mostrano un toast con "Annulla". Le viste Famiglia e ROSS mantengono i propri componenti.
- **Selettore "Vista demo"** (Struttura / Famiglia / ROSS): pillola discreta **in basso a destra, nella stessa posizione in tutte le viste**, con menu a tendina e scorciatoie 1/2/3. In modalità presentazione contiene anche "Avanti". Non va al centro dello schermo: è un comando per chi presenta, non parte del prodotto.

## Passaggio di consegne

- `docs/HANDOFF.md` è il documento vivo con stato attuale, mappa del codice, questioni aperte e changelog della vista Struttura. **Aggiornalo a ogni modifica**: nuova voce in cima al changelog (§6) e, se cambia qualcosa di strutturale, correggi le sezioni 1–5.

## Privacy by design: cosa la struttura riceve

- **Regola d'oro**: la struttura sa *come sta* e *di cosa ha bisogno* l'ospite, **mai *di cosa ha parlato***. Il riferimento completo è `docs/contratto-informativo-struttura.md`.
- Mai trascrizioni, citazioni, argomenti, nomi di persone o luoghi raccontati, ricordi specifici, oggetto delle emozioni, diagnosi.
- Tutto ciò che la struttura vede rientra nei **cinque punti cardinali**: benessere nel tempo (segnali espressi, finestra ≥ 7 giorni, confronto con la media personale), come relazionarsi (interessi solo per categoria), bisogni personali (per ospite), voce della struttura (aggregata, anonima, ≥ 3 ospiti), presenza e continuità.
