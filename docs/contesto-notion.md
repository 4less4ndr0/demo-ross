# Contesto da Notion · Product & R&D

> Sintesi delle pagine Notion che governano il lavoro sulla demo. Letta il 2 novembre 2026. Notion resta la fonte: se una pagina cambia, aggiorna questo file.
> Leggila **prima** di proporre o fare modifiche di prodotto alla demo.

## Fonti

| Pagina Notion | Cosa contiene | Ultima modifica |
|---|---|---|
| [Parti da qui · Product & R&D](https://app.notion.com/p/2c391e1a386a83698437019549de711f) | Perimetro dell'area, regole di lavoro, hub | 29/10 |
| [Requisiti prodotto](https://app.notion.com/p/c60beef08f0b47ec9c7b515ba59c48f0) | Hub: Feature List, Requisiti di progetto, Scheda tecnica, AI Act, Salutogenesi, B2C | 02/11 |
| [Requisiti di progetto](https://app.notion.com/p/6f30fa4073c74da682f93a4ea21a0ed9) | Tesi "compagno, non dispositivo", personas Maria/Marco, feature F1–F16, vincoli non negoziabili | 11/10 |
| [Scheda tecnica](https://app.notion.com/p/40591e1a386a8125bdc1cd5ffd0b7301) | Cosa fa davvero il prototipo, architettura, hardware, roadmap tecnica | 27/10 |
| [Feature List](https://app.notion.com/p/cf491e1a386a8388888f0113cac2242b) | Funzioni CORE / Day 1 / Day 2 | 10/10 |
| [Riorganizzare la piattaforma R.O.S.S.](https://app.notion.com/p/e44fcac134ad4703bd2af4dded68bde1) | Task High, in corso, **scadenza 4/11**: semplificare la demo lato RSA e definire l'MVP | 26/10 |
| [Descrizione piattaforma R.O.S.S.](https://app.notion.com/p/20a14365fe564dcd829444f426cbe542) | Documento per direzione e area tecnica delle strutture (Civitas Vitae) | 19/10 |
| [Report "Che cosa stiamo imparando…"](https://app.notion.com/p/3e291e1a386a807fb648c1cb1ee8c066) | Evidenze da 7 strutture, Parte A (software) e Parte B (compagno vocale) | 02/11 |
| [Protocollo di intervista RSA](https://app.notion.com/p/4324b90f0dba4bb78ba3cb5e2dee4fce) | Tracce per gli incontri; cosa non fare | 02/11 |

## 1. Le due strade (report del 2/11)

- **Parte A · Software per le strutture.** People Management Tool B2B, **solo software, senza hardware**: una memoria qualitativa e viva di ogni ospite, interrogabile dallo staff. È la **porta d'ingresso su cui si lavora adesso**. In validazione, non dimostrata.
- **Parte B · Compagno vocale fisico.** Il dispositivo negli alloggi. È la visione d'origine. Prototipo con stima a fine febbraio, ancora condizionata.
- **Il ponte:** la memoria del software diventa il contesto che il compagno consulta; il compagno la arricchisce con il consenso dell'ospite. Il ponte **non è automatico**: le due strade si validano separatamente.

**Conseguenza per la demo:** davanti a una struttura la vista Struttura deve reggersi **anche senza il dispositivo**. Oggi quasi tutto ciò che mostra viene dalle "conversazioni con ROSS" (Parte B).

## 2. Cosa chiede la Parte A (dal report e dalla Descrizione piattaforma)

- **Bisogno:** continuità dell'informazione. La conoscenza qualitativa (abitudini, storia, cosa rassicura) è dispersa tra carta, chat, Drive e memoria delle persone, e va ricostruita ogni volta (segnale forte: Namastè).
- **Ciclo:** contributo → memoria condivisa → risposta o spunto → verifica → aggiornamento.
- **Input piccoli, nessun nuovo data entry:** biografia d'ingresso dalla famiglia, osservazioni brevi dello staff.
- **Restituzioni:** sintesi del turno per gli operatori, panoramiche per coordinamento e direzione, aggiornamenti alle famiglie solo se autorizzati, **prima bozza di relazioni/PAI** sempre rivista da una persona.
- **Ogni spunto ha fonte, contesto e possibilità di correzione:** un'ipotesi non diventa una verità sulla persona.
- **Si affianca al gestionale**, non lo sostituisce; niente dati clinici.
- **Condizioni di adozione:** non aggiungere lavoro (Noventa), superare il filtro dell'area tecnica (Civitas Vitae), chiarire il confine con il monitoraggio (Guild Living).
- **Domanda aperta:** il valore esiste anche senza AI? Una cartella qualitativa ordinata potrebbe già bastare.
- **Prova proposta:** 4–6 settimane su un nucleo, senza hardware; misure: tempo per trovare un'informazione, uso per turno, aggiornamenti fatti senza il nostro aiuto.
- **Primo utente da definire:** operatori, coordinamento o direzione.

## 3. Vincoli non negoziabili (Requisiti di progetto §5)

- **Compagno, non dispositivo medico.** Niente claim clinici, diagnosi, scoring sanitario, punteggi di stato cognitivo. Tetto: rischio limitato dell'AI Act; posizionamento non-MDR.
- **Parole vietate** ovunque (demo, codice, materiali): *paziente, terapia, robot, monitoraggio, controllo*. Parole chiave: *accompagna, rassicura, ricorda, compagno, presenza, routine*. Il lessico della demo aggiunge i suoi divieti ([`lessico-struttura.md`](lessico-struttura.md)).
- **Niente emozioni dedotte dal tono di voce** (porterebbe ROSS ad alto rischio). I segnali della demo vengono da ciò che l'ospite *esprime*, non dalla voce.
- **Trasparenza sull'AI** (art. 50): ROSS dice di essere un programma, come momento del prodotto.
- **Niente push automatici di stato** verso la famiglia; restituzioni narrative, non dati.
- **Proprietà intellettuale:** le feature coperte dal Patent 1 (F1–F10) **non vanno mostrate pubblicamente in dettaglio prima del deposito**; demo a interlocutori con NDA sì, demo pubbliche no. ⚠️ La demo oggi è pubblica su GitHub Pages.

## 4. Cosa è reale oggi (Scheda tecnica, audit del 20/10)

- Prototipo: web → Flask → SQLite → Ollama (Llama/Qwen) → voce sintetica. **L'input è testo: manca il riconoscimento vocale.**
- Non operativi: report giornaliero completo, alert, contatto esterno, SOS reale, autenticazione e ruoli, cifratura verificata, test con anziani reali.
- Knowledge Graph: progettato, non verificato nel codice.
- **Regola:** con le strutture queste funzioni si raccontano come **direzione di prodotto**, non come disponibili. La demo deve distinguere chiaramente il simulato dal reale ("Cosa è reale e cosa è simulato").
- Rischio segnalato dalla scheda: "confondere l'avanzamento della demo con l'avanzamento del prodotto".

## 5. Come presentare alle strutture (Protocollo di intervista)

- **Map first, pitch later:** prima capire come gestiscono oggi le informazioni, poi la demo.
- Non presentare tutte le funzionalità; non presentare ROSS come gestionale già pronto.
- Non promettere rilevazione clinica, monitoraggio o inferenze su ciò che l'ospite non ha scelto di condividere.
- Non trattare l'entusiasmo come validazione.
- Domanda di chiusura utile: "Se preparassimo una demo molto semplice, quale situazione reale dovrebbe mostrare?"

## 6. Task aperto di riferimento

**Riorganizzare la piattaforma R.O.S.S.** (Product & R&D, High, scadenza 4/11). Output attesi:
1. principi di semplificazione dell'esperienza RSA;
2. funzionalità da mantenere, eliminare o rinviare;
3. interfaccia principale (chat inclusa);
4. MVP da validare con una struttura;
5. decisioni e prossimi passi per aggiornare la demo.
