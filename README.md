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

## Percorso demo consigliato

1. Panoramica struttura e sezione “ROSS ha notato”.
2. Profilo di Elena Bianchi.
3. Tab Relazioni per il Knowledge Graph.
4. Tab Memorie per la Memory Library.
5. Attività e mini-giochi.
6. “Avvia interazione” per la conversazione immersiva.
7. Termina, conferma la nuova memoria e apri il profilo aggiornato.
8. Report e Passaggio consegne.

La voce `Presentazione` riduce la navigazione e mostra il pulsante “Avanti nella demo”. È possibile aprire direttamente la modalità con `?presentation=true`.

## Struttura

- `src/data/demoData.js`: dataset centrale, deterministico, con ospiti, memorie, biografia, attività, interazioni e metriche di 30 giorni.
- `src/state/DemoContext.jsx`: stato persistente, temi, reset e azioni che aggiornano realmente la demo.
- `src/components/`: layout, componenti comuni e Knowledge Graph.
- `src/pages/`: dashboard, ospiti, profilo, attività, interazione, insight, analytics, report e configurazione.
- `src/styles.css`: token dei tre temi e layout responsive.

## Modificare la demo

### Ospiti e dati

Modificare gli array in `src/data/demoData.js`. Ogni ospite deve avere un `id` univoco. Per collegare memorie e interazioni usare lo stesso valore nel campo `residentId`.

### Aggiungere un ospite

1. Aggiungere l'oggetto in `residents`.
2. Aggiungere eventuali interazioni con il relativo `residentId`.
3. Aggiungere memorie e relazioni solo se esistono anche nel resto del dataset.

### Aggiungere attività o giochi

Le attività vivono nell'array `activities`. Le attività normali aprono la simulazione di interazione. I mini-giochi presenti sono `associations`, `categories` e `memory-game`; la loro UI è in `src/pages/Activities.jsx`.

### Copy e navigazione

La navigazione principale è centralizzata in `src/components/Layout.jsx`. I testi specifici di ogni schermata sono nelle rispettive pagine.

### Temi

I token `ross`, `neutral` e `care` sono all'inizio di `src/styles.css`. Il tema selezionato è persistente.

## Reset

Usare `Struttura → Ripristina dataset demo`. In alternativa cancellare la chiave `ross-rsa-demo-v2` dal localStorage del browser.

## Note di prodotto

- Le metriche descrivono esclusivamente interazioni osservabili attraverso R.O.S.S.
- Non vengono presentate diagnosi, biometria, stato emotivo certo o valutazioni cliniche.
- La dicitura “elaborazione locale” descrive la direzione architetturale della demo e non una certificazione tecnica o normativa.
