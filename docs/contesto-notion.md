# Contesto da Notion · direzione di ROSS

> Sintesi del workspace Notion di ROSS (tutte le aree), con priorità ai documenti dell'ultimo mese. Letta il **2 novembre 2026**. Notion resta la fonte: se una pagina cambia, aggiorna questo file.
> **Leggila prima di proporre o fare modifiche di prodotto alla demo.** Dove questo file contraddice `HANDOFF.md` o `AGENTS.md`, vale questo file finché il team non decide diversamente.

---

## 1. In una frase

ROSS è un **compagno vocale per la persona anziana** che la aiuta a raggiungere le risorse che ha già (persone, interessi, ricordi, abitudini). Fa da **ponte, scelto da lei**, verso famiglia e operatori. **Non** è uno strumento di sorveglianza, gestione o reportistica. Il valore per le strutture è un'**ipotesi aperta**, non una decisione presa.

## 2. Il perché e i 6 non negoziabili

Fonte: [1. Fissare il perché e i punti non negoziabili](https://app.notion.com/p/1f95ca9721224e08bc5c203657508d72), approvato da Alessandro e Federico il 23/10.

> Invecchiando si rischia di perdere il filo con le persone e con ciò che fa stare bene. Spesso le risorse ci sono già: un figlio disponibile, un interesse, un ricordo, un'abitudine. Ma non sempre si riescono a riconoscere e raggiungere. ROSS le rende vicine con lo strumento più naturale che c'è, la voce. **L'anziano resta protagonista: racconta, sceglie e può dire di no.**

| # | Principio | Diciamo no a |
|---|---|---|
| 1 | **Risorse, non deficit** (lente salutogenica) | raccontare l'anziano come un problema; misurare il declino |
| 2 | **Prima l'anziano**: ogni funzione gli dà un beneficio diretto, chiunque paghi | funzioni per rendere l'ospite "più gestibile" |
| 3 | **Narratore, non osservato**: sa cosa viene raccontato, può correggere o tenerlo per sé | ascolto continuo, registrazioni, **dashboard di controllo** |
| 4 | **Ponte, non sostituto, in due direzioni**: l'anziano anche racconta, consiglia, custodisce la memoria familiare | vendere ROSS per ridurre il personale; flusso a senso unico "anziano produce → famiglia riceve" |
| 5 | **Solo la voce**: se servono schermo, app o formazione, non è ROSS | interfacce da imparare |
| 6 | **Fuori dal medico** | diagnosi, terapie, promesse cliniche, allarmi sanitari |

**Filtro per le funzioni** (senso di coerenza): una funzione entra se rafforza almeno una dimensione e l'anziano può accettarla, rimandarla o rifiutarla.
- **Comprensibilità** (capisco cosa succede?)
- **Gestibilità** (su chi posso contare? È il ponte familiare.)
- **Significatività** (cosa conta per me? Ricordi, biografia, attività.)

**Regola sulle segnalazioni** (proposta, da confermare): **"il racconto sì, la misura no"**. Niente punteggi d'umore, niente allarmi.

## 3. Cosa ROSS NON fa, NON mostra, NON promette

Questa lista vale per demo, deck e conversazioni. Fonti: non negoziabili, [protocollo discovery v0.2](https://app.notion.com/p/02b8668c82d44490bb38c5b6ae4e0a37), [AI Act report](https://app.notion.com/p/40591e1a386a81289138e3a507bfc17c), [tema DM](https://app.notion.com/p/95291e1a386a8361aba48144ccb8592a), [Requisiti di progetto](https://app.notion.com/p/6f30fa4073c74da682f93a4ea21a0ed9).

- **Niente monitoraggio né sorveglianza.** Non si presenta come strumento di gestione del personale, di produzione di report o di sostituzione dell'ascolto diretto.
- **Niente alert, dashboard di controllo, report interpretativi o dati sanitari** verso struttura o famiglia (scheda Namastè, assunzione OR4). Se lo staff li chiede, si annota come **tensione col perimetro**, non come requisito.
- **Niente punteggi sulla persona, livelli di priorità o classifiche** (AI Act: possono spostare ROSS ad alto rischio). Nessuna etichetta generale ("persona problematica", "priorità alta"); si descrive solo un evento concreto.
- **Niente emozioni dedotte da voce o volto.** Si distinguono tre casi:
  - "ha detto che è triste": ammesso;
  - "le parole esprimono una giornata difficile": interpretazione del testo, con cautela;
  - "dal tono deduce tristezza": vietato in pratica, perché rientra nell'alto rischio (Allegato III 1c).
- **Niente valutazione del declino cognitivo.** Diventerebbe un dispositivo medico (Classe IIa+). Formule vietate: "previene il declino", "screening". Formula ammessa: "intrattenimento/fitness mentale".
- **Niente promessa di sicurezza o emergenza.** Il SOS del prototipo non invia nulla e **non va mostrato come funzionante**.
- **Niente pressione:** colpevolizzazione, falsa urgenza, esclusività affettiva, insistenza dopo un no, design che crea dipendenza (art. 5 AI Act). Il rifiuto si accetta così: "Va bene, possiamo farlo un'altra volta."
- **Niente trascrizioni o audio grezzo condivisi.** "Traduce, non trasmette."
- **Non condividere non penalizza:** la mancata condivisione è un esito legittimo, non un uso incompleto.
- **Parole vietate:** *paziente, terapia, robot, monitoraggio, controllo*, più il lessico della demo ([`lessico-struttura.md`](lessico-struttura.md)).
- **Trasparenza AI obbligatoria** (art. 50, dal 2/8/2026): "Sono ROSS, un compagno digitale basato sull'intelligenza artificiale…". Gli output per la famiglia portano la dicitura "Testo generato da ROSS…".

## 4. Cosa ROSS fa (visione, da validare)

Flusso MVP condiviso da Scheda tecnica, AI Act e B2C: **biografia → conversazione → memoria controllabile → restituzione narrativa autorizzata.** Il claim è *"Il compagno che non dimentica"*.

1. ROSS dice di essere un'AI.
2. Persona e famiglia costruiscono una biografia essenziale.
3. ROSS propone una conversazione legata a un ricordo o a un interesse.
4. La persona può interrompere, correggere, rifiutare.
5. Un nuovo dettaglio resta **in bozza**; la persona (o il familiare) lo conferma, lo modifica o lo cancella.
6. Alla famiglia arriva **un breve spunto narrativo autorizzato** per esserci, non una cronaca.

Altre idee, tutte ipotesi da testare e non da costruire:
- **reciprocità**: l'anziano consiglia e custodisce la memoria familiare;
- **invito verso l'esterno**: ROSS sa chiudere e rimanda alle persone vere;
- **album dei ricordi** con la famiglia: entra nell'indagine B2C come domanda, non si sviluppa;
- **compagnia umana a distanza** (studenti): spunto di Nicola;
- **ROSS sulla TV** vs dispositivo dedicato: test A/B approvato il 30/10; il team è diviso.

## 5. Dove siamo nella strategia (ottobre–novembre 2026)

- **Il bivio è aperto** (assunzione T1): companion per la persona, strumento per lo staff o offerta integrata. Le evidenze non lo chiudono. La direzione motivata va portata a **Zeno (H-FARM) verso metà novembre**.
- **La discovery si allarga e parte dall'anziano** (post-coaching con Nicola Sassu, protocollo v0.2 del 1/11). Il campione è di 36 colloqui: 12 anziani, 10 familiari, 8 professionisti, 6 enti. Gli enti sono prima **facilitatori**, solo dopo eventualmente utilizzatori. Ad oggi **zero voci dirette di anziani**.
- **Strumento per lo staff** (la "Parte A" del report del 2/11, People Management Tool): è il bisogno più documentato nelle strutture (Namastè: informazioni disperse; PAI e relazioni da ricostruire), ma resta **ipotesi aperta, da non proporre come prodotto né come sviluppo commerciale**. Fabio Piubello sta costruendo internamente qualcosa di simile (un LLM sulle procedure): può essere cliente o competitor.
- **Prodotto integrato** (companion più vista struttura): nato il 21/10 con Promozione Lavoro, che lo ha visto bene. Da capire cosa si condivide, con quali permessi e se regge sui costi.
- **Segmento:** anziani con autonomia lungo lo spettro abitativo (alloggi protetti, cohousing, comunità alloggio, domicilio). La RSA classica è un estremo: secondo Fabio, circa 10 ospiti su 100 sono coinvolgibili.
- **Chi paga:** non dimostrato (struttura, famiglia o entrambe).
- **Promessa per la struttura**, se si parla di staff: "informazioni che non si perdono e tempo che torna alla relazione", **mai "risparmio di personale"**.

## 6. Cosa è reale oggi

Fonte: audit tecnico del 20/10, nella [Scheda tecnica](https://app.notion.com/p/40591e1a386a8125bdc1cd5ffd0b7301).

- Il prototipo: web → Flask → SQLite → Ollama (Llama/Qwen) → voce sintetica in uscita. **L'input è testo: manca il riconoscimento vocale.**
- Non operativi: report completo, alert, contatti esterni, SOS reale, account e ruoli, cifratura verificata, test con anziani.
- Knowledge Graph: progettato, non verificato.
- Prototipo "discreto" stimato per fine febbraio, ma la stima è condizionata.
- Federico (30/10): per la demo "conta l'impatto, non cosa c'è dietro". Il protocollo chiede comunque di **dire sempre cosa funziona e cosa è simulato**.

## 7. Calendario vicino

| Data | Cosa | Note per la demo |
|---|---|---|
| **6/11, 11–15** | **Namastè**, Polo di Treviolo (BG): visita con Rita Florenti (CdA) e Carlotta Ribotti (coordinatrice). Federico e Alessandro presenti. | Partire dal concept minimo (conversazione a voce su attività, passioni, ricordi). La condivisione con l'operatore va presentata solo come ipotesi, scelta dall'ospite. **Esclusi alert, dashboard, report interpretativi, dati sanitari.** Possibile prova di 10 minuti con 1–2 ospiti, con informativa e consenso ([bozza pronta](https://app.notion.com/p/40b91e1a386a81db9e3dc1d06551db0f)). Obiezioni attese: "diventa il migliore amico", privacy, "abbiamo già provato i sensori", "e se non prende la terapia?" (la terapia resta fuori da ROSS). Chiedere un micro-test con soglie scritte. |
| **9/11, 10:00** | **Promozione Lavoro** (Fabio Piubello) in H-FARM. Manifestazione d'interesse firmata il 28/10: co-design, pilot, co-finanziamento, non vincolante. Forse presente Mauro. | Mostrare il lavoro e **scegliere il primo ambito**. Strutture candidate: Ceggia e Caldiero (autosufficienti). Fabio ha visto bene il prodotto integrato. Leva: carenza di personale, raccontata come "informazioni che non si perdono", non come risparmio. |
| **10/11** | Borgo Mazzini (ISRAA), da riprogrammare | Hanno già Alexa Plus, giudicata soddisfacente: va dimostrato il vantaggio in più. |
| ~**15/11** | Direzione motivata a Zeno | |

**Prima del 6/11** serve una **formula unica sulla privacy**, concordata con il tech lead. Finora alle strutture è stata raccontata in modi diversi: "niente cloud" a Namastè, "backend con trascrizioni" a Guild.

## 8. Implicazioni per questa demo

Lettura del team ROSS su Notion, incrociata con lo stato della demo al 2/11.

**Già allineato:**
- giro guidato che parte dal tablet di Elena;
- consenso dell'ospite prima di condividere ("Ti va se lo racconto ad Anna?");
- trasparenza AI;
- "dimentica";
- chiusura verso le persone vere;
- lessico pulito;
- salutogenesi;
- "reale/simulato";
- la Famiglia vede solo ciò che Elena sceglie.

**In tensione con le decisioni recenti:**
1. **Vista Struttura come dashboard:**
   - ospiti "ordinati per attenzione" e "Chi ha bisogno di più attenzione oggi?" sono **priorità automatiche**;
   - "Da osservare", "Il polso di ROSS", Panoramica con KPI e grafici e il Riepilogo d'équipe sono vicini a **dashboard di controllo e report interpretativi**;
   - "solitudine, stanchezza, momenti di difficoltà" sono **stati della persona inferiti** e comunicati alla struttura **senza che l'ospite li abbia scelti**.

   È esattamente ciò che la scheda Namastè esclude. Lo stesso vale per il protocollo v0.2.
2. **Presenza ("Oggi non ha ancora parlato con ROSS")** verso la struttura: somiglia allo Status Notification, che il report AI Act lascia fuori dall'MVP. Va almeno formulato come evento, senza gravità.
3. **Vista tablet di ROSS con schermo e tocchi:** il punto 5 dice "solo la voce". La demo deve far capire che lo schermo è un supporto per mostrarla, non l'interfaccia richiesta all'anziano.
4. **Struttura come destinatario di default:** oggi la struttura riceve segnali su tutti gli ospiti. Nella direzione attuale riceve **solo ciò che l'ospite sceglie di condividere**, come già avviene per la famiglia. Chi non condivide non viene penalizzato.
5. **Demo pubblica su GitHub Pages:** i requisiti chiedono niente demo pubbliche delle feature brevettabili prima del deposito, e niente comunicazione esterna prima del marchio.

## 9. Fonti principali (per area)

- **HQ / riunioni:**
  - [30/10 call team](https://app.notion.com/p/40a91e1a386a81a0a274e43ed730caa5): demo priorità della settimana, ipotesi TV, deck.
- **Market & Growth:**
  - [Report "Che cosa stiamo imparando"](https://app.notion.com/p/3e291e1a386a807fb648c1cb1ee8c066) (2/11)
  - [Post-coaching Nicola](https://app.notion.com/p/49ed7c637b9943708da43a4c88d3f476)
  - [Protocollo discovery v0.2](https://app.notion.com/p/02b8668c82d44490bb38c5b6ae4e0a37)
  - [Assunzioni da esplorare](https://app.notion.com/p/40b91e1a386a8185b379da179c7dbed6)
  - [Fabbisogno informativo nelle strutture](https://app.notion.com/p/ceb650de8eda48dea6ae659dbf3edaa5)
- **Business & Fundraising:**
  - [Perché e non negoziabili](https://app.notion.com/p/1f95ca9721224e08bc5c203657508d72)
  - [Preparazione call Timothy](https://app.notion.com/p/40191e1a386a806ca791f03ff3ae94be): il bivio.
- **Product & R&D:**
  - [Requisiti di progetto](https://app.notion.com/p/6f30fa4073c74da682f93a4ea21a0ed9)
  - [Scheda tecnica](https://app.notion.com/p/40591e1a386a8125bdc1cd5ffd0b7301)
  - [B2C panoramica](https://app.notion.com/p/12af89fa759d468ab4b44ffcffe81355)
  - [Salutogenesi](https://app.notion.com/p/d4f22276089b4831bc6fa717e30f43a8)
  - [Riorganizzare la piattaforma](https://app.notion.com/p/e44fcac134ad4703bd2af4dded68bde1): scadenza 4/11.
- **Legal & IP / Compliance:**
  - [AI Act report](https://app.notion.com/p/40591e1a386a81289138e3a507bfc17c)
  - [Tema DM](https://app.notion.com/p/95291e1a386a8361aba48144ccb8592a)
  - [Informativa demo Namastè](https://app.notion.com/p/40b91e1a386a81db9e3dc1d06551db0f)
- **CRM:**
  - [Scheda pre-incontro Namastè 6/11](https://app.notion.com/p/40b91e1a386a815f8b3dc8db92adc3b4)
  - [Aggiornamento Piubello 9/11](https://app.notion.com/p/40b91e1a386a81119a09ee3585930e75)
  - [Brief Promozione Lavoro 21/10](https://app.notion.com/p/cbeec388d7bd4160a6dfda231459d455)
