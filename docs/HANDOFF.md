# ROSS · Vista Struttura: passaggio di consegne e changelog

> Documento vivo. **Aggiornalo a ogni modifica**: aggiungi una voce in cima al changelog (§6) e, se cambia qualcosa di strutturale, correggi le sezioni 1–5.
> Ultimo aggiornamento: 26 settembre 2026 · stato del branch `claude/optimistic-carson-xag798` (dopo la PR #12 più il riallineamento della vista Ospiti).

---

## 1. Stato attuale in breve

- **Demo online:** https://4less4ndr0.github.io/demo-ross/ (GitHub Pages, branch `gh-pages`, aggiornato automaticamente a ogni push su `main`).
- **Repository:** `4less4ndr0/demo-ross`. Il lavoro si fa su un branch dedicato, poi PR verso `main`.
- **Perimetro del lavoro:** solo la **vista Struttura**, cioè ciò che vede lo staff della RSA. Le viste **Famiglia** (`/famiglia`) e **ROSS** (`/ross`, il tablet dell'ospite) non sono state ridisegnate.

**Com'è fatta oggi la vista Struttura:**

| Zona | Cosa c'è |
|---|---|
| Barra superiore | Solo tre schede centrate sulla finestra: **Chiedi a ROSS · Ospiti · Report**. Su mobile stanno sulla stessa riga dell'hamburger. |
| Sidebar sinistra | Logo, "Residenza Aurora" e data. Nella chat contiene anche un accordion con Da osservare, Bisogni espressi, Voce della struttura, Ingaggio con ROSS e **Cosa ti dice ROSS** (guida alla lettura). In fondo: Impostazioni e card profilo con l'account del ruolo (menu con il ruolo "Sto chiedendo come", impostazioni, presentazione e ripristino dei dati). Nelle altre pagine la sidebar si riduce a una colonna di icone. |
| Chiedi a ROSS (`/`) | Chat a frizione zero sul modello ChatGPT. Risposte preparate e deterministiche con le fonti, suggerimenti per ruolo, graffetta per allegare documenti, microfono simulato, menu "…". |
| Ospiti (`/ospiti`, `/ospiti/:id`) | Lista ordinata per attenzione (assenza insolita, segnali, bisogni) con partecipazione rispetto alla media personale. Cartella con quattro tab: Come sta · Come avvicinarsi · Conversazioni ROSS (per settimana) · Documenti (sola lettura). Niente biografia, grafo o contributi della famiglia. |
| Report (`/report`) | Due report stampabili, scelti con i tab: **Riepilogo d'équipe** (default, anche `?ambito=struttura`): sintesi, KPI, benessere rispetto alla media di ciascuno, voce della struttura, situazione per ospite, presenza e uso di ROSS, punti da discutere. **Singolo ospite** (`?ospite=ID`, `&stampa=1`): "Come sta" con come avvicinarsi e checklist "Da osservare in équipe". |
| Impostazioni (`/impostazioni`) | Tema, presentazione, fasce delle modalità ROSS, "Cosa la struttura riceve da ROSS" (`#privacy`), ripristino dei dati demo. |
| Selettore "Vista demo" | Pillola in basso a destra, nella stessa posizione in tutte le viste. Menu Struttura/Famiglia/ROSS, tasti 1/2/3; in presentazione mostra anche "Avanti". |

---

## 2. Decisioni di prodotto in vigore

Le regole complete sono in [`AGENTS.md`](../AGENTS.md) e in [`contratto-informativo-struttura.md`](contratto-informativo-struttura.md). In sintesi:

1. **ROSS sta sopra i sistemi della RSA.** Non è un gestionale: niente anagrafica, note di reparto o pianificazione attività.
2. **La home è una chat** interrogabile anche da telefono, e ogni risposta cita la fonte.
3. **Target non ancora definito.** Il selettore di ruolo serve anche a scoprire chi trae più valore dallo strumento. Tre stakeholder: **Staff** (operatori e coordinatori, accesso condiviso senza login), **Psicologa** e **Direzione** (accesso personale con login). Niente turni nella demo.
4. **Regola d'oro della privacy:** la struttura sa *come sta* e *di cosa ha bisogno* l'ospite, **mai di cosa ha parlato**. Quindi niente trascrizioni, citazioni, argomenti, nomi raccontati, ricordi specifici, oggetto delle emozioni, diagnosi.
5. **Cinque punti cardinali**, le sole cose che la struttura riceve:
   - benessere nel tempo: segnali espressi su almeno 7 giorni, confrontati con la media personale;
   - come relazionarsi: interessi solo per categoria;
   - bisogni personali: per ospite;
   - voce della struttura: anonima, solo con almeno 3 ospiti;
   - presenza e continuità.
6. **Documenti clinici secondari:** si allegano solo dalla chat e non entrano nel report "Come sta".
7. **Report "Come sta"** pensato per l'équipe interna: tono osservativo, niente diagnosi, niente citazioni.
8. **Interazioni in stile shadcn/ui** (Radix + Sonner) con i colori e i caratteri ROSS; niente Tailwind né tema neutro. Le azioni reversibili mostrano un toast con "Annulla".
9. **Barra superiore minimale:** tema, presentazione e modalità ROSS non stanno nella barra.
10. **Il selettore "Vista demo"** è un comando per chi presenta: sta in un angolo, mai al centro.

---

## 3. Mappa del codice

| File | Ruolo |
|---|---|
| `src/App.jsx` | Rotte. Le vecchie URL (`/consegne`, `/insight`, `/analytics`, `/interazioni`, `/attivita`, `/struttura`) reindirizzano alle nuove. Mostra il `Toaster` (Sonner) nella vista Struttura e il vecchio toast nelle viste Famiglia e ROSS. |
| `src/components/Layout.jsx` | Guscio della Struttura: sidebar (larga in chat, a icone altrove), Sheet su mobile, schede in alto, card profilo con l'account del ruolo (`roles[].account` in `chatScript.js`), scorciatoia ⌘K che porta alla chat. |
| `src/components/InsightRail.jsx` | Accordion della sidebar e guida `readingGuide` ("Cosa ti dice ROSS"). Le voci fanno domande alla chat tramite l'evento `ross:ask`. |
| `src/components/PerspectiveSwitcher.jsx` | Pillola "Vista demo": menu, tasti 1/2/3, "Avanti" in presentazione, sequenza `presentationRoutes`. |
| `src/components/ui.jsx` | Primitive in stile shadcn: `Button`, `DropdownMenu*`, `Select`, `Sheet`, `Dialog`, `Toaster`. |
| `src/components/Common.jsx` | `Avatar`, `ModeBadge`, `InfoTip` (Radix Tooltip: portal, apertura al tocco), `SectionTitle`, `Modal` (usato ancora nelle viste Famiglia e ROSS), `DataExplanation`. |
| `src/pages/AskRoss.jsx` | Chat: thread, suggerimenti, ambito `?ospite=`, domande via `?q=`, allegati, microfono simulato, menu "…", ascolto di `ross:ask` e `ross:focus-chat`. |
| `src/data/chatScript.js` | Motore della chat: `roles`, `suggestions`, intenti a parole chiave con risposte per ruolo e fonti. L'intento `privacy` rifiuta con garbo le domande sul contenuto delle conversazioni. |
| `src/data/careInsights.js` | **Dati conformi al contratto:** `signals`, `needs`, `facilityVoice`, `relating`, `presenceNotes`, `journeyInterest`, `cardinalPoints`, `approachGuide` (primo approccio, stile di ROSS, momenti della giornata, spunti per interesse) e helper come `hooksFor` (interessi con spunti, ordinati per coinvolgimento). È il posto dove cambiare gli insight. |
| `src/data/reportNarrative.js` | `buildResidentReport(state, resident, period)` (narrativa, KPI, segnali, bisogni, come avvicinarsi, checklist, serie del grafico) e `buildTeamReport(state, period)` per il Riepilogo d'équipe, calcolato da `state.interactions` e dai dati di `careInsights.js`. |
| `src/pages/OperationalPages.jsx` | `ReportsPage` con i tab Riepilogo d'équipe / Singolo ospite, `TeamReport` e `ResidentReport`. |
| `src/pages/ResidentProfile.jsx` | Cartella: Come sta (narrativa, benessere nel tempo, bisogni, presenza, grafico rispetto alla media), Come avvicinarsi (relazionarsi e interessi per categoria), Conversazioni ROSS (raggruppate per settimana, senza argomenti), Documenti. I vecchi `?tab=memorie`/`relazioni` portano a Come avvicinarsi. |
| `src/components/ParticipationChart.jsx` | Grafico della partecipazione rispetto alla media personale, usato nella cartella e nel report "Come sta". |
| `src/pages/Residents.jsx` | Lista ospiti ordinata per attenzione: ultima conversazione, partecipazione rispetto alla media, fino a 2 motivi di attenzione, interessi per categoria. |
| `src/pages/LiveInteraction.jsx` | Sessione live avviata dallo staff: niente trascrizione; alla fine l'esito e un nuovo interesse per categoria. |
| `src/pages/Settings.jsx` | Impostazioni unificate, con la sezione `#privacy`. |
| `src/state/DemoContext.jsx` | Stato persistente in localStorage (`ross-rsa-demo-v2`): `role`, `documents`, `notify` con Sonner e "Annulla" (ripristina l'istantanea dello stato). |
| `src/data/demoData.js` | Dataset fittizio: ospiti, biografia, interazioni, `insights`, `handoverEntries`, `documents`, `graphData`. |
| `src/styles.css` | Stili unici. Le sezioni aggiunte sono commentate, per esempio `/* Chiedi a ROSS … */`, `/* UI in stile shadcn/ui … */`, `/* Sidebar insight ad accordion … */`. |
| `docs/contratto-informativo-struttura.md` | Contratto informativo ROSS → struttura: regola d'oro, cinque punti, divieti, checklist, aree grigie. |

---

## 4. Come fare le modifiche più comuni

**Avvio locale:** `npm install`, poi `npm run dev` (http://localhost:5173).
**Prima di ogni PR:** `npm run build` e `npm run test:sites`. La build deve produrre `dist/client/index.html`, `dist/server/index.js` e `dist/.openai/hosting.json`.
**Deploy:** merge su `main`, poi il workflow `.github/workflows/deploy-pages.yml` pubblica su GitHub Pages in circa 30 secondi.
**Dati vecchi nel browser:** card profilo → "Ripristina dati demo".

- **Aggiungere una domanda alla chat:** in `src/data/chatScript.js` aggiungi un oggetto a `intents`, con `id`, `keywords` normalizzate senza accenti, eventuale `when(state)` e `answer({ state, role, resident })`. L'oggetto restituisce `text`, `bullets`, `residents`, `sources` e `action`. Usa `byRole` per le varianti per ruolo. Se è una domanda suggerita, aggiungila anche a `suggestions`.
- **Cambiare gli insight** (segnali, bisogni, voce, come relazionarsi): modifica solo `src/data/careInsights.js`. Chat, sidebar, cartella e report li leggono da lì.
- **Aggiungere una voce alla guida "Cosa ti dice ROSS":** aggiungi un elemento a `readingGuide` in `src/components/InsightRail.jsx` (`title`, `text`, eventuale `question`).
- **Nuovi controlli UI:** usa le primitive di `src/components/ui.jsx`, non `<select>` nativi né modali personalizzati.
- **Checklist privacy prima di pubblicare un testo nuovo** (vedi il contratto, §5):
  - nessuna citazione, nessun argomento, nessun nome o luogo raccontato;
  - segnali emotivi solo su almeno 7 giorni, nella forma "X conversazioni su Y", confrontati con la media della persona;
  - verbi ammessi: *ha espresso*, *da osservare*; mai *è*, *sente*, *soffre*;
  - la voce della struttura solo anonima e con almeno 3 ospiti.

---

## 5. Questioni aperte

1. **Vista Famiglia:** mostra ancora il ricordo di Cefalù e dice che "la struttura lo sta verificando" (`FamilyExperience.jsx`, `DemoContext.jsx`), ma dal 26/09 i contributi della famiglia vanno direttamente a ROSS e la struttura non li verifica: testi e flusso vanno riallineati. La brochure promette alla famiglia "con le sue parole". Va deciso che regole valgono per la famiglia (contratto, §6.1).
2. **Consenso dell'ospite a condividere** un contenuto con la struttura o con la famiglia (contratto, §6.2).
3. **Protocollo per segnali gravi** (dolore acuto, rischio per sé, maltrattamenti): non esiste ancora (contratto, §6.3).
4. **Livelli di accesso per ruolo:** oggi il perimetro è uguale per tutti i ruoli (contratto, §6.4).
5. **Target:** va ancora scelta la figura principale. Il selettore di ruolo resta finché la scelta non è fatta.
6. **Presentazione:** la sequenza "Avanti" è in `PerspectiveSwitcher.jsx`; va rivista se cambiano le schermate chiave.
7. **Tooltip "i"** ancora presenti in Impostazioni (nei report sono stati tolti).
8. **Chat preparata:** le risposte sono deterministiche, senza un modello AI vero. Un modello reale richiederebbe un backend, che GitHub Pages non ha.

---

## 6. Changelog (dal più recente)

### Branch `claude/optimistic-carson-xag798` · 26/09/2026 · Report: Riepilogo d'équipe e Singolo ospite
- **Richiesta:** rivedere la sezione Report con la stessa filosofia; l'équipe sceglie tra il report generale sulla struttura e quello del singolo ospite.
- **Modifiche:**
  - pagina Report con i tab **Riepilogo d'équipe** (default) · **Singolo ospite** (preimpostato sull'ospite che ha più bisogno di attenzione);
  - Riepilogo d'équipe sui cinque punti cardinali: sintesi generata, KPI, ospiti sopra / in linea / sotto la propria media (niente baseline unica), segnali per tipo, voce della struttura con azione suggerita, situazione per ospite ordinata per attenzione, minuti al giorno e mappa oraria calcolati dalle conversazioni (tornano con la chat), punti da discutere con caselle;
  - Singolo ospite: KPI di partecipazione rispetto alla media (via "/10"), benessere degli ultimi 7 giorni, **Come avvicinarsi** (3 passi e 2 interessi principali), checklist **Da osservare in équipe**;
  - rimossi "Crescita della memoria", istogramma delle durate, torta delle tipologie, icone "i" e `dailyMetrics`;
  - helper condivisi `attentionFor`, `attentionScore`, `byAttention`, `trendOf` in `careInsights.js`; `facilityVoice` ha un'azione suggerita;
  - chat e menu: "Riepilogo d'équipe" al posto di "Report di struttura".
- **File:** `src/pages/OperationalPages.jsx`, `src/data/reportNarrative.js`, `src/data/careInsights.js`, `src/pages/Residents.jsx`, `src/data/demoData.js`, `src/data/chatScript.js`, `src/pages/AskRoss.jsx`, `src/components/InsightRail.jsx`, `src/styles.css`, `AGENTS.md`.

### Branch `claude/optimistic-carson-xag798` · 26/09/2026 · "Come avvicinarsi" diventa una guida pratica
- **Richiesta:** rendere il tab più profondo e utile allo staff, con spunti concreti per ogni interesse, senza entrare nel privato.
- **Decisione:** i dettagli concreti (es. "seguiva le corse di rally") compaiono solo se arrivano dalla biografia d'ingresso, con la fonte; per gli interessi emersi con ROSS solo leva, spunto, attività e coinvolgimento (contratto §3.2).
- **Modifiche:**
  - tab Come avvicinarsi: primo approccio in 3 passi, striscia come rivolgersi / momento / durata / attenzione, una card per interesse (cosa lo coinvolge, dettaglio d'ingresso, per iniziare, da proporre, barra del coinvolgimento con ROSS rispetto alla sua media) ordinate per coinvolgimento, "Come parla ROSS con {nome}" e momenti della giornata;
  - dati in `approachGuide` e `hooksFor` (`src/data/careInsights.js`) per tutti gli 8 ospiti;
  - Come sta: la card "Come avvicinarsi" mostra lo spunto dell'interesse più coinvolgente;
  - chat: "Come posso coinvolgere X?" risponde con i 3 passi e lo spunto principale;
  - report "Come sta": riga "Per iniziare";
  - i dati degli ospiti salvati nel browser non sovrascrivono più quelli della demo (si conservano solo modalità e stato).
- **File:** `src/data/careInsights.js`, `src/pages/ResidentProfile.jsx`, `src/data/chatScript.js`, `src/data/reportNarrative.js`, `src/pages/OperationalPages.jsx`, `src/state/DemoContext.jsx`, `src/styles.css`, `docs/contratto-informativo-struttura.md`, `AGENTS.md`.

### Branch `claude/optimistic-carson-xag798` · 26/09/2026 · Vista Ospiti riallineata al contratto informativo
- **Richiesta:** rivedere lista e cartella ospite con la stessa filosofia (come sta e di cosa ha bisogno, mai di cosa ha parlato; ROSS sopra il gestionale).
- **Decisioni:** la storia esce dalla struttura; tab Relazioni eliminato; contributi della famiglia direttamente a ROSS.
- **Modifiche:**
  - lista: tolto "Adesso" (dato da gestionale) e il punteggio /10; partecipazione "sopra / in linea / sotto la sua media"; fino a 2 motivi di attenzione; ordine per attenzione (Antonio, oggi assente, per primo);
  - cartella a 4 tab: **Come sta** (narrativa, benessere nel tempo con segnali positivi separati, bisogni, presenza, grafico rispetto alla media al posto delle 4 percentuali fisse), **Come avvicinarsi** (come rivolgersi, momento, durata, attenzione, cosa funziona, interessi per fonte), **Conversazioni ROSS** (per settimana, date in italiano, "Reminiscenza", solo Alta/Media/Bassa), **Documenti**;
  - rimossi timeline della storia e "Aggiungi evento", contributi della famiglia, grafo delle relazioni (e la dipendenza `react-force-graph-2d`), indice di socialità;
  - headline del report riscritte con i verbi ammessi (niente "è serena", "sente freddo", confronti con altri ospiti); "Spunto per lo staff" al posto di "prossimo turno";
  - sessione live: interessi in uso dell'ospite e nuovo interesse coerente con il percorso demo (fotografia);
  - Antonio: ultima conversazione "ieri alle 17:40", coerente con l'assenza di oggi.
- **File:** `src/pages/Residents.jsx`, `src/pages/ResidentProfile.jsx`, `src/components/ParticipationChart.jsx`, `src/pages/OperationalPages.jsx`, `src/pages/LiveInteraction.jsx`, `src/data/reportNarrative.js`, `src/data/demoData.js`, `src/data/chatScript.js`, `src/components/PerspectiveSwitcher.jsx`, `src/styles.css`, `package.json`.

### Branch `claude/optimistic-carson-xag798` · 26/09/2026 · Tre stakeholder e domande consigliate
- **Richiesta:** nelle card suggerite il testo non era allineato. Domande come "Riassumimi il turno" erano troppo generiche, e nella demo non ci sono turni. Chi lavora in prima linea non ha un login, psicologa e direzione sì: operatori e coordinatori diventano una voce unica.
- **Modifiche:**
  - ruoli da quattro a tre: **Staff** (senza login), **Psicologa**, **Direzione** (con login); `roleFor()` converte i vecchi valori `operatore` e `coordinatrice` salvati nel browser;
  - card profilo con l'account del ruolo ("Staff di reparto", "Dott.ssa Marta Bianchi", "Paolo Ferri") al posto di Giulia Serra; nel menu "senza login" o "con login";
  - domande consigliate riscritte per stakeholder (Staff: chi seguire, di cosa ha bisogno, come coinvolgere, chi non ha parlato; Psicologa: segnali e andamento rispetto alla media; Direzione: voce della struttura, uso di ROSS, bisogni ricorrenti, report di struttura);
  - intento `turno` sostituito da `priorita` ("Chi ha bisogno di più attenzione oggi?"): presenza insolita, segnali e bisogni per ospite; anche "turno" e `/consegne` portano lì;
  - intento `report`: "report di struttura" apre il report aggregato;
  - testo delle card allineato a sinistra;
  - placeholder e guida "La chat" senza riferimenti al turno.
- **File:** `src/data/chatScript.js`, `src/pages/AskRoss.jsx`, `src/components/Layout.jsx`, `src/components/InsightRail.jsx`, `src/state/DemoContext.jsx`, `src/styles.css`, `README.md`, `AGENTS.md`.

### PR #10 · 26/09/2026 · "Cosa ti dice ROSS" diventa la guida alla lettura
- **Richiesta:** le spiegazioni delle icone "i" devono stare in "Cosa ti dice ROSS", che diventa un aiuto per leggere tutta la schermata.
- **Modifiche:**
  - tolte le icone "i" dai titoli dell'accordion;
  - `readingGuide` in `InsightRail.jsx` con sei voci: La chat, Da osservare, Bisogni espressi, Voce della struttura, Ingaggio con ROSS, Ospiti e Report;
  - ogni voce ha un pulsante "Prova: «…»" che fa una domanda in chat.
- **File:** `src/components/InsightRail.jsx`, `src/styles.css`, `AGENTS.md`.
- **Commit:** `48390e3` · merge `c5a230d`.

### PR #9 · 26/09/2026 · Sidebar ad accordion
- **Richiesta:** togliere "Il polso di ROSS · Com'è andata oggi" e le tre card con i numeri; le card devono essere un accordion con i soli titoli, più grandi.
- **Modifiche:**
  - Radix Accordion (`@radix-ui/react-accordion`), tutte le voci chiuse all'avvio, più voci apribili insieme;
  - conteggio accanto a ogni titolo;
  - titoli accorciati: "Da osservare" e "Ingaggio con ROSS".
- **File:** `src/components/InsightRail.jsx`, `src/styles.css`, `package.json`.
- **Commit:** `9ff2b3e` · merge `e38f8e8`.

### PR #8 · 26/09/2026 · Tooltip non più tagliati
- **Problema:** i tooltip CSS dentro la sidebar, che scorre, uscivano a sinistra e venivano tagliati.
- **Modifiche:**
  - `InfoTip` riscritto con Radix Tooltip: portal, evita i bordi dello schermo, sta sopra i pannelli laterali;
  - apertura al tocco su mobile, gestendo a parte tocco e click;
  - rimosso il vecchio CSS `.tooltip`.
- **File:** `src/components/Common.jsx`, `src/styles.css`, `package.json`.
- **Commit:** `fb6ed30` · merge `5de5959`.

### PR #7 · 26/09/2026 · Privacy by design: contratto informativo e demo ricalibrata
- **Richiesta:** capire cosa ROSS deve comunicare alla struttura (migliorare la qualità di vita, assistere al meglio, far emergere il non detto), senza mai dire di cosa parla l'ospite. Ricalibrare la schermata di conseguenza. Rendere utile il riquadro "Elaborazione locale".
- **Fonti:** brochure ROSS (PDF) e, su Notion:
  - "Che cosa sappiamo delle RSA?";
  - "Key messages finali";
  - "Requisiti di progetto" (F2, F8, F9, F10, F11, F12);
  - incontro con Anni Sereni del 24/08;
  - task "Riorganizzare la piattaforma lato RSA".
- **Decisioni:**
  - mai trascrizioni (F10);
  - ricordi solo come categorie;
  - bisogni personali per ospite, opinioni sulla struttura aggregate e anonime;
  - prima il framework, poi la demo.
- **Modifiche, fase 1 (commit `163a8b1`):** `docs/contratto-informativo-struttura.md` con regola d'oro, cinque punti cardinali, divieti, regole di forma, aree grigie, mappa d'impatto. Regola registrata in `AGENTS.md`.
- **Modifiche, fase 2 (commit `8cc6a6f`):**
  - **Dati:** nuovo `src/data/careInsights.js`.
  - **Chat:** `chatScript.js` riscritto sui cinque punti, con l'intento `privacy` e le fonti "Dati ROSS · ultimi 7 giorni" o "Biografia d'ingresso".
  - **Sidebar:** Da osservare, Bisogni espressi, Voce della struttura, Ingaggio. Il riquadro "Elaborazione locale" diventa **"Cosa ti dice ROSS"**, con i cinque punti e "Mai il contenuto delle conversazioni".
  - **Report "Come sta":** senza citazioni né temi.
  - **Cartella:** Conversazioni senza argomento; "Storia e interessi" al posto della Memory Library, con i contributi della famiglia da verificare; grafo costruito solo dalla biografia.
  - **Sessione live:** tolta la trascrizione; alla fine l'esito e un nuovo interesse per categoria.
  - **Percorso ROSS → Struttura:** porta a "nuovo interesse emerso: fotografia", non più al ricordo della macchina fotografica.
  - **Impostazioni:** "Cosa la struttura riceve da ROSS" (`#privacy`).
  - **Dati demo:** `insights` e `handoverEntries` resi conformi; biografia con testi neutri.
- **Verifica:** 15 domande in chat e 9 pagine controllate contro fughe di contenuto (nessuna).
- **Merge:** `4396f1c`.

### PR #6 · 26/09/2026 · Selettore "Vista demo" in basso a destra
- **Richiesta:** il selettore Struttura/Famiglia/ROSS era al centro dello schermo; va spostato e trasformato in un menu a tendina "Vista demo".
- **Decisioni:** pillola in basso a destra e non in alto, perché nelle viste Famiglia e ROSS l'angolo in alto a destra è occupato. Aggiunti i tasti 1/2/3.
- **Modifiche:**
  - `PerspectiveSwitcher.jsx` riscritto con un DropdownMenu;
  - "Avanti" della presentazione ora dentro la pillola, e funziona anche nelle viste Famiglia e ROSS;
  - recuperato lo spazio in basso nelle pagine della Struttura.
- **Commit:** `82b1145` · merge `4393ac1`.

### PR #5 · 26/09/2026 · Schede in alto sempre nella stessa posizione
- **Problema:** le schede erano centrate sull'area del contenuto, che cambia con la larghezza della sidebar (320px in chat, 76px altrove), quindi si spostavano.
- **Modifiche:** schede `position:fixed` centrate sulla finestra (sopra i 900px) e `scrollbar-gutter:stable`.
- **Commit:** `f0c5c90` · merge `7d7c847`.

### PR #4 · 26/09/2026 · Barra superiore essenziale
- **Richiesta:** eliminare dalla barra i controlli già presenti altrove; spostare struttura e data vicino al logo.
- **Modifiche:**
  - tolti Presentazione, tema e l'etichetta fissa "Attiva": restano in Impostazioni e nel menu operatore;
  - "Residenza Aurora" e la data sotto il logo nella sidebar;
  - titolo degli insight cambiato in "Com'è andata oggi";
  - gli Sheet non danno più il focus automatico al primo controllo (aprivano un tooltip da soli).
- **Commit:** `90bc71e`, `ba1a713` · merge `dbcc233`.

### PR #3 · 26/09/2026 · Navigazione a schede, insight nella sidebar, ruolo dal profilo
- **Richiesta** (dai disegni sulla schermata):
  - menu principale in alto a schede;
  - "Il polso di ROSS" nella sidebar, solo nella chat;
  - ruolo scelto dalla card operatore;
  - su mobile schede sotto la barra.
- **Modifiche:**
  - `Layout.jsx` con schede `top-tabs`, sidebar larga in chat e a icone altrove;
  - estratto `InsightRail.jsx` con l'evento `ross:ask`;
  - ruolo "Sto chiedendo come" nel menu operatore; nella chat resta solo un'etichetta del ruolo.
- **Commit:** `f7f70ec` · merge `6335cac`.

### PR #2 · 26/09/2026 · Report narrativo per ospite e interazioni in stile shadcn/ui
- **Report "Come sta"** per ogni ospite (commit `cd15e07`):
  - destinatario l'équipe;
  - stampa A4, `?stampa=1`;
  - accessibile dalla cartella, dalla chat e dal menu Report;
  - documenti allegabili solo dalla chat.
- **Stile shadcn/ui** (commit `3c2e889`):
  - `src/components/ui.jsx` con Radix e Sonner;
  - Toaster con "Annulla" basato su un'istantanea dello stato;
  - Sheet per il menu mobile;
  - DropdownMenu per operatore, tema, chat e cartella;
  - Select al posto dei select nativi;
  - bottoni in stile shadcn solo dentro `.app-shell`.
- **Dialog e select nei moduli** (commit `1718a40`): Radix Dialog per le modali della cartella e per la fine della sessione live; Select anche nei moduli.
- **Merge:** `155b62f`.

### PR #1 · 26/09/2026 · La vista Struttura diventa "Chiedi a ROSS"
- **Contesto** (riunione "estratto convo fede ale"):
  - la demo sembrava un gestionale parallelo;
  - ROSS deve stare sopra i sistemi esistenti;
  - l'interfaccia diventa un chatbot tipo ChatGPT;
  - il target è ancora da definire.
- **Decisioni:**
  - selettore di ruolo come strumento per scoprire il target;
  - documenti visibili ma secondari;
  - pagine vecchie accorpate o cancellate;
  - chat con risposte preparate.
- **Modifiche:**
  - nuova home `AskRoss.jsx` e `chatScript.js`;
  - menu ridotto da 9 a 3 voci: Chiedi a ROSS · Ospiti · Report;
  - Consegne, Insight, Interazioni e ricerca (⌘K) accorpati nella chat;
  - Analytics spostato nel report di struttura;
  - Struttura unita a Impostazioni;
  - Attività e Dashboard cancellati;
  - cartella con cinque tab;
  - redirect dalle vecchie URL;
  - rimossi 12 KB di CSS non più usato, con verifica visiva al pixel.
- **Commit:** `4273f2c` · merge `c80a547`.

### Prima di questo lavoro (fino al 25/09/2026)
- Demo iniziale con viste Struttura, Famiglia e ROSS (`f91ba6a`, `37a7a0d`).
- Deploy spostato da Vercel a GitHub Pages sul branch `gh-pages` (`82db8c8`, `eea457a`, `0af0f11`).

---

## 7. Riferimenti

- Brochure ROSS (PDF interno) e pagina Notion "Brochure ROSS".
- Notion:
  - *Report ad oggi "Che cosa sappiamo delle RSA?"* (23/09/2026);
  - *ROSS, Key messages finali*;
  - *Requisiti di Progetto, ROSS* (F1–F14);
  - *Incontro 24/08/2026, Anni Sereni*;
  - *Riorganizzare la piattaforma R.O.S.S. lato RSA* ed *estratto convo fede ale*.
- Documenti interni al repository: [`AGENTS.md`](../AGENTS.md), [`README.md`](../README.md), [`contratto-informativo-struttura.md`](contratto-informativo-struttura.md).
