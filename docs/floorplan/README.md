# Mappa del codice (Floorplan)

Mappa interattiva di come è fatta la demo, generata con [Floorplan](https://github.com/haydenschmitty/floorplan): ogni parte e ogni file hanno un nome e una descrizione in italiano, con i collegamenti tra loro.

## Aprirla

Si apre **dentro la demo**: pillola "Vista demo" in basso a destra → **Mappa** (tasto 4), oppure l'indirizzo `/mappa`. Il file è [`public/mappa-ross.html`](../../public/mappa-ross.html): unico, offline, senza codice sorgente.

Dentro trovi:
- **la panoramica**: Guscio dell'app, Vista Struttura (con Chiedi a ROSS, Ospiti e ritratto, Report e Panoramica, Cornice, Struttura 2.0 · il canale), Vista Famiglia, Tablet di ROSS, Pezzi comuni, Memoria della demo, Contenuti della demo, Pubblicazione, Controlli;
- **Start here**: un giro di un minuto per chi arriva ora;
- **Flows**: otto percorsi guidati ("Lo staff chiede a ROSS", "Dal ritratto al report", "Elena racconta, Anna legge", "Anna manda, ROSS riordina, Elena ascolta", "Un promemoria, all'ora giusta", "La struttura chiede a ROSS di proporre un'attività", "Anna condivide anche con la struttura", "La struttura propone, ROSS restituisce");
- **Screens**: le 19 schermate dell'app e cosa c'è dietro a ciascuna;
- **Recent work**: le ultime quattro modifiche, in cima "Struttura 2.0: il canale con ROSS" (Proponi uno spunto, Cosa è emerso, Ospiti e ritratto con la scheda Spunti).

Il controllo automatico (Health) non ha trovato problemi: niente chiavi nel codice, niente server esposti.

## Cosa c'è in questa cartella

| File | Cosa contiene |
|---|---|
| `../../public/mappa-ross.html` | La mappa esportata, mostrata dalla vista Mappa |
| `architecture.json` | Le parti della demo, i percorsi guidati e il giro "Start here" |
| `descriptions/*.json` | Nome e descrizione di ogni file |
| `recent-work.json` | Le modifiche evidenziate in "Recent work" |

## Aggiornarla

**Ultimo aggiornamento: 5 novembre 2026 (dopo la Struttura 2.0), senza plugin**, con lo script [`aggiorna-mappa.py`](aggiorna-mappa.py): `python3 docs/floorplan/aggiorna-mappa.py .` dalla radice del progetto. Rilegge il codice (righe, hash, simboli e collegamenti di import di ogni file, compresi gli import dinamici) e aggiorna `window.FLOORPLAN` dentro `public/mappa-ross.html` e i tre sorgenti di questa cartella. Descrizioni, percorsi, giro e lavori recenti sono scritti a mano in cima allo script: per un aggiornamento futuro si cambiano lì. I file nuovi non entrano da soli: si aggiungono con il loro gruppo, come fa la sezione "Struttura 2.0" dello script (nodo `struttura.v2`, file, schermate e `descriptions/struttura.v2.json`). Il controllo automatico (Health) non è stato rifatto: va rigenerato con il plugin quando possibile.


Floorplan è un plugin di Claude Code (e Codex). Per rigenerare la mappa dopo nuove modifiche:

1. installa il plugin: `claude plugin marketplace add haydenschmitty/floorplan` e `claude plugin install floorplan@floorplan`;
2. copia `architecture.json`, `descriptions/` e `recent-work.json` di questa cartella in `floorplan/` alla radice del progetto (la cartella `floorplan/` resta fuori da git da sola);
3. chiedi a Claude "aggiorna il floorplan": rilegge solo ciò che è cambiato;
4. esporta con `node floorplan/serve.mjs --export public/mappa-ross.html --include flows,notes,recent` e ricopia qui i tre sorgenti.

Con il plugin installato, la mappa locale ha anche la barra **Ask**: si possono fare domande sul codice ("dove nasce la risposta su Antonio?") e ricevere una risposta con i pezzi coinvolti.
