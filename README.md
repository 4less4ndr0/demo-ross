# R.O.S.S. RSA Demo

**Online:** https://4less4ndr0.github.io/demo-ross/

Demo web interattiva di R.O.S.S. per RSA e Senior Living. È un progetto separato dal repository canonico R.O.S.S. e usa solo dati fittizi della struttura `Residenza Aurora`.

## Avvio locale

Requisiti: Node.js 20 o superiore.

```bash
npm install
npm run dev
```

Aprire l'indirizzo mostrato da Vite. La demo salva modifiche, memorie confermate, note e preferenze nel `localStorage` del browser.

## Build e test statico

```bash
npm run build
npm run test:sites
```

La build client viene generata in `dist/client`. Il progetto include anche il worker e i metadati necessari per una futura pubblicazione tramite Sites.

## Pubblicazione su GitHub Pages

Ogni push su `main` avvia `.github/workflows/deploy-pages.yml`, che compila con `BASE_PATH=/demo-ross/` e pubblica `dist/client` sul branch `gh-pages`, servito da GitHub Pages (`404.html` = copia di `index.html`, così i link diretti alle rotte funzionano).

Per provare la build Pages in locale:

```bash
BASE_PATH=/demo-ross/ npm run build && npx vite preview --base /demo-ross/
```

## Posizionamento della vista Struttura

ROSS non è un gestionale sostitutivo: si affianca ai sistemi già in uso nella RSA. La vista Struttura è quindi una **chat a frizione zero** ("Chiedi a ROSS"), interrogabile anche da telefono, che risponde dalle conversazioni raccolte da ROSS e dai documenti caricati, citando sempre la fonte.

- **Chiedi a ROSS** (`/`): chat al centro, insight aggregati a sinistra (su mobile in un pannello a scomparsa). Il selettore "Chiedo come" (Operatore, Coordinatrice, Psicologa, Direzione) cambia le domande suggerite e la profondità delle risposte: serve anche a capire quale figura trae più valore dallo strumento.
- **Ospiti** (`/ospiti`, `/ospiti/:id`): dashboard ospiti e cartella con i tab Sintesi, Conversazioni ROSS, Memorie e storia, Relazioni, Documenti.
- **Report** (`/report?ospite=ID`): report narrativo stampabile "Come sta" per ogni ospite, per l'équipe (contenuti in `src/data/reportNarrative.js`); `?ambito=struttura` per l'engagement aggregato; `&stampa=1` apre subito la stampa.
- **Impostazioni** (`/impostazioni`): tema, presentazione, fasce delle modalità ROSS, ripristino del dataset.

Le vecchie rotte (`/consegne`, `/insight`, `/analytics`, `/interazioni`, `/attivita`, `/struttura`) reindirizzano alla nuova collocazione.

## Percorso demo consigliato

1. Chiedi a ROSS: cambia ruolo e prova le domande suggerite, poi "Riassumimi il turno".
2. Allega un documento in chat (es. `fisioterapia_elena.pdf`) e apri la cartella di Elena → Documenti.
3. Vista ROSS: conversazione con Elena su Cefalù.
4. Torna in Struttura: "Cosa è emerso oggi con Elena?" → verifica e conferma il ricordo.
5. Tab Relazioni per il Knowledge Graph.
6. Vista Famiglia.
7. Report narrativo "Come sta" per ogni ospite (dalla cartella: "Stampa report") e report di struttura.

La voce `Presentazione` riduce la navigazione e mostra il pulsante “Avanti nella demo”. È possibile aprire direttamente la modalità con `?presentation=true`.

## Struttura

- `src/data/demoData.js`: dataset centrale, deterministico, con ospiti, memorie, biografia, attività, interazioni e metriche di 30 giorni.
- `src/state/DemoContext.jsx`: stato persistente, temi, reset e azioni che aggiornano realmente la demo.
- `src/components/`: layout, componenti comuni e Knowledge Graph.
- `src/pages/`: chat "Chiedi a ROSS", ospiti, cartella ospite, interazione live, report, impostazioni e le viste Famiglia e ROSS.
- `src/data/chatScript.js`: ruoli, domande suggerite e risposte preparate della chat (deterministiche, con fonti). Per aggiungere una domanda: nuovo intento con parole chiave e testo per ruolo.
- `src/styles.css`: token dei tre temi e layout responsive.

## Modificare la demo

### Ospiti e dati

Modificare gli array in `src/data/demoData.js`. Ogni ospite deve avere un `id` univoco. Per collegare memorie e interazioni usare lo stesso valore nel campo `residentId`.

### Aggiungere un ospite

1. Aggiungere l'oggetto in `residents`.
2. Aggiungere eventuali interazioni con il relativo `residentId`.
3. Aggiungere memorie e relazioni solo se esistono anche nel resto del dataset.

### Aggiungere attività o giochi

Le attività vivono nell'array `activities` e alimentano le viste Famiglia e ROSS. La vista Struttura non ha più un Activity Center: il focus del test è la conversazione tra ROSS e l'ospite.

### Copy e navigazione

La navigazione principale è centralizzata in `src/components/Layout.jsx`. I testi specifici di ogni schermata sono nelle rispettive pagine.

### Temi

I token `ross`, `neutral` e `care` sono all'inizio di `src/styles.css`. Il tema selezionato è persistente.

## Reset

Usare `Impostazioni → Ripristina dataset demo`. In alternativa cancellare la chiave `ross-rsa-demo-v2` dal localStorage del browser.

## Note di prodotto

- Le metriche descrivono esclusivamente interazioni osservabili attraverso R.O.S.S.
- La chat riporta solo ciò che ROSS ha ascoltato o che è stato caricato; non interpreta valori clinici dei documenti.
- Non vengono presentate diagnosi, biometria, stato emotivo certo o valutazioni cliniche.
- La dicitura “elaborazione locale” descrive la direzione architetturale della demo e non una certificazione tecnica o normativa.
