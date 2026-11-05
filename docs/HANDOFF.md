# ROSS · Vista Struttura: passaggio di consegne e changelog

> Documento per il team e documento vivo di sviluppo. **Aggiornalo a ogni modifica**: aggiungi una voce in cima al changelog (§6) e, se cambia qualcosa di strutturale, correggi le sezioni 0–5.
> Ultimo aggiornamento: 5 novembre 2026 · nuova vista **Struttura 2.0** (il canale con ROSS, poi Ospiti e ritratto con la scheda Spunti). Prima: 4 novembre 2026 · ospiti come archetipi e ritratto rivisto. Prima ancora: 2 novembre 2026 · vista Famiglia come app per iPhone. Precedente: 20 ottobre 2026 · demo riallineata per l'incontro con Papa Luciani / Promozione Lavoro (branch `claude/nifty-ride-9l6eka`).

**Come leggerlo.**
- Chi arriva ora legge la **§0** (10 minuti): cos'è ROSS, la filosofia, i personaggi, un giro della demo e le domande per il team.
- Chi prova la demo segue il **giro della §0.5**.
- Chi scrive codice parte dalle **§3–4**.
- Lo storico completo, PR per PR, è nella **§6**.

---

## 0. Per chi arriva ora

### 0.1 Cos'è ROSS e perché questa demo
ROSS è un **compagno di conversazione su tablet per gli ospiti delle RSA**: parla con loro, ricorda i loro interessi, propone musica, giochi e ricordi, e rispetta i momenti di riposo. Intorno all'ospite ci sono altre due persone che hanno bisogno di sapere qualcosa: **lo staff della struttura** e **la famiglia**. La demo mostra le tre prospettive, e soprattutto una domanda: *cosa deve sapere la struttura, e cosa no?*

**Il punto di partenza.** La prima versione della vista Struttura sembrava un gestionale parallelo: anagrafica, consegne, attività, analytics. Nella riunione "estratto convo fede ale" abbiamo deciso di cambiare rotta. ROSS **non sostituisce** i sistemi della RSA, ci **sta sopra**. Allo staff basta poter chiedere, anche da telefono: *"chi ha bisogno di più attenzione oggi?"*. Per questo la home è una chat.

**Cosa non è questa demo.** I dati sono inventati (Residenza Aurora, 8 ospiti) e la chat ha risposte preparate, senza un modello AI vero. Serve a discutere il prodotto, non a testare la tecnologia. La pillola "Vista demo" ha la voce **"Cosa è reale e cosa è simulato"** da aprire davanti a chi guarda.

**Ottobre 2026: la demo diventa uno strumento di ricerca.** La sintesi strategica su Notion (19–20/10) riporta il focus sul **compagno vocale per la persona** e sul valore per la famiglia; lo strumento per lo staff resta un'ipotesi aperta, da non proporre come prodotto. Per questo il giro parte dal tablet di Elena, poi la famiglia, e solo alla fine mostra cosa riceve la struttura. Le lezioni degli incontri sono entrate nella vista ROSS: Namastè (conversazioni private sul dispositivo, rischio di dipendenza), Borgo Mazzini (semplicità, aiuto con parole proprie, niente dati sanitari), Noventa (non aumentare il carico degli operatori).

### 0.2 La filosofia in sei frasi
1. **La struttura sa come sta e di cosa ha bisogno l'ospite, mai di cosa ha parlato.** Nella demo si legge *"Antonio ha espresso solitudine in 3 conversazioni su 5, di solito 1"*, mai *"Antonio ha parlato di sua moglie"*.
2. **Ognuno è confrontato solo con sé stesso.** Si dice *"sopra / in linea / sotto la sua media"*: niente voti, niente classifiche. Una persona riservata non è "peggio" di una socievole.
3. **Prima ciò che va bene.** Ogni ospite ha anche segnali positivi (serenità, buonumore, più iniziativa) e compaiono prima di ciò che è da osservare.
4. **ROSS segnala, l'équipe osserva e decide.** Nessun giudizio sulla salute: i segnali sono spunti da verificare di persona. Nei report ci sono caselle da spuntare a penna.
5. **Si parla come un compagno, non come un servizio sanitario.** Niente "cartella", "paziente", "monitoraggio", "diagnosi": la pagina di un ospite è il suo **ritratto** (vedi [`lessico-struttura.md`](lessico-struttura.md)).
6. **La famiglia vede solo ciò che l'ospite sceglie di condividere.** È ROSS a chiedere a Elena *"Ti va se lo racconto anche ad Anna?"*. La struttura non fa da intermediario tra famiglia e ospite.

Il metodo con cui è pensata è la **salutogenesi** ([`salutogenesi.md`](salutogenesi.md)): prima le risorse che aiutano la persona a stare bene. Il riferimento completo per la privacy è il [contratto informativo](contratto-informativo-struttura.md): tutto ciò che la struttura vede rientra nei **cinque punti cardinali** (benessere nel tempo, come relazionarsi, bisogni personali, voce della struttura, presenza e continuità).

### 0.3 Le tre viste e chi le usa

| Vista | Chi la usa | Cosa vede | Cosa non vede | Stato |
|---|---|---|---|---|
| **Struttura** (`/`) | Staff, psicologa, direzione | Come sta ogni ospite rispetto alla sua media, cosa va bene, cosa osservare, bisogni, come avvicinarlo, voce anonima degli ospiti, report per l'équipe | Contenuto delle conversazioni, storia di vita, ricordi, contributi della famiglia | **Rifatta** (PR #1–#27) |
| **Famiglia** (`/famiglia`) | Anna, la figlia di Elena | I racconti che Elena ha scelto di condividere, come sta questa settimana (solo il positivo), spunti per la prossima chiamata; può inviare ricordi, foto e musica direttamente a ROSS | I racconti che Elena ha tenuto per sé, i segnali da osservare | **Riallineata** al consenso (PR #21); **app per iPhone** (novembre) |
| **Struttura 2.0** (`/struttura-2`) | Staff della struttura | Un canale, non un archivio: propone a ROSS uno **spunto** per un ospite e riceve in cambio **cosa è emerso** (come è stato accolto lo spunto + suggerimento); nella scheda **Richieste**, le cose pratiche in due direzioni: dagli ospiti (richieste confermate: Da vedere · Ci pensiamo noi · Fatte oggi) e agli ospiti (comunicazioni che ROSS dice a ciascuno) | Di cosa ha parlato l'ospite, trascrizioni, punteggi, grafici, report, dati sanitari | **Nuova** (5/11), accanto alla Struttura attuale, che resta intatta. Schede **Il canale · Ospiti · Richieste**; il ritratto ha in più la scheda **Spunti**. In basso a destra la bolla **«ROSS, al volo»** (5/11): domande veloci su ciò che ROSS ha già raccontato, spunti e comunicazioni con conferma |
| **ROSS** (`/ross`) | L'ospite, sul tablet | La conversazione con ROSS; può chiedere a ROSS di far sapere al personale una piccola cosa pratica (con conferma), e ROSS le dice quando è sistemata; in home, «ROSS ti dice» con le comunicazioni pratiche della residenza | — | **Riallineata** (ottobre): trasparenza sull'IA, aiuto non di emergenza, "dimentica", chiusura verso le persone vere. **Richieste pratiche** (5/11) |

Nella Struttura ci sono **quattro stakeholder**, e il target principale non è ancora scelto: per questo esiste il selettore di ruolo.
- **Staff**: operatori e coordinatori, accesso condiviso senza login. Domande pratiche: chi seguire, cosa serve, come avvicinarsi.
- **Educatrice**: accesso personale con login. Domande su attività e interessi che coinvolgono e sui momenti della giornata meno coperti (aggiunta per Papa Luciani, che ha due educatrici).
- **Psicologa**: accesso personale con login. Domande sull'andamento rispetto alla media.
- **Direzione**: accesso personale con login. Domande su dati aggregati, adozione e valore.

### 0.4 I personaggi della demo (Residenza Aurora)

Ogni ospite rappresenta un **archetipo**: un modo diverso di vivere ROSS e la residenza. Gli archetipi servono al team e a chi presenta; **non compaiono mai come etichette nel prodotto** (scrivere "lo scettico" sulla scheda di Carlo sarebbe stigmatizzante). Il ritratto non è un modulo uguale per tutti: si adatta alla persona.

| Ospite | Archetipo | Con ROSS da | Modalità | Va bene | Da osservare | Bisogno espresso | Cosa mostra nella demo |
|---|---|---|---|---|---|---|---|
| **Elena Bianchi**, 79 | Il ponte che funziona | 118 giorni | Attiva | Serenità, gratitudine, partecipazione | — | — | Invito → uscita → racconto; condivide con Anna |
| **Ada Moretti**, 85 | La nuova arrivata | 11 giorni | Reattiva | Curiosità | — (ROSS la sta ancora conoscendo) | Attività di lettura | Ritratto "in costruzione"; negli allegati solo la biografia d'ingresso e le note della famiglia |
| **Teresa Gallo**, 88 | La veterana che trascina gli altri | 143 giorni | Attiva | Serenità, più iniziativa | — | — | Reciprocità: è una risorsa per la comunità |
| **Carlo Ferri**, 83 | Lo usa come uno strumento | 92 giorni | Reattiva | Buonumore | — | — | Domande pratiche (meteo, programma, promemoria): parlare poco con ROSS **non è un segnale**. In Reattiva gli inviti della struttura non partono |
| **Antonio Greco**, 74 | Lo adora, forse troppo | 39 giorni | Attiva | Voglia di spiegare | Tanto tempo con ROSS, poco fuori; solitudine; oggi non ha ancora parlato con ROSS | Sentire un familiare | Rischio di dipendenza (Namastè): "Spunti di ROSS" per invogliarlo alla vita della residenza |
| **Lucia Conti**, 76 | Quella che sta cambiando | 76 giorni | Attiva | Buonumore | Stanchezza; 2 momenti in cui ha fatto fatica a seguire | Uscire in giardino (3 volte) | ROSS rallenta e semplifica; giochi senza punteggi; va accompagnata |
| **Mario Rossi**, 81 | Il riservato | 64 giorni | Reattiva | Tranquillità | Fastidio fisico riferito | Ginocchio al mattino | Parla con ROSS quando vuole lui, poco e dopo le 17: ROSS ne sa poco ed è giusto così (non "silenzio radio") |
| **Bruno De Angelis**, 80 | Senza famiglia vicina | 101 giorni | Silenziosa | Voglia di raccontare | — | Freddo nel pomeriggio | Le sue persone sono gli altri ospiti e lo staff; ROSS lo porta verso di loro |

Elena è la protagonista delle viste Famiglia e ROSS, con la figlia **Anna**. La lista Ospiti è in ordine alfabetico.

### 0.5 Giro della demo in 5 minuti
Demo: https://4less4ndr0.github.io/demo-ross/. Se qualcosa sembra strano, vai sulla card in basso a sinistra → "Ripristina dati demo".

1. **Chiedi a ROSS** (home). Clicca "Chi ha bisogno di più attenzione oggi?". La risposta cita sempre la fonte. Dalla card in basso a sinistra cambia ruolo ("Sto chiedendo come") e guarda come cambiano le domande consigliate: la Direzione, per esempio, chiede "Cosa dicono gli ospiti della vita in struttura?".
2. **Il polso di ROSS**, la sidebar della chat. Apri "Cosa va bene" e "Da osservare": ogni voce fa una domanda alla chat. "Cosa ti dice ROSS" è la guida alla lettura.
3. **Ospiti** (`/ospiti`). In cima c'è Antonio, perché oggi non ha ancora parlato con ROSS. Ogni scheda mostra la foto, chi è, l'ultima conversazione e al massimo un avviso; il resto è nel ritratto.
4. **Ritratto di Antonio** (`/ospiti/antonio`). Tab *Come sta* (benessere rispetto alla sua media, bisogni, presenza) e *Come avvicinarsi* (primo approccio in 3 passi e spunti per interesse; i dettagli concreti arrivano solo dalla biografia d'ingresso).
5. **Panoramica** (`/panoramica`). La struttura in una schermata: sintesi, numeri chiave e grafici (ognuno rispetto alla propria media, segnali della settimana, voce della struttura con la soglia di anonimato, bisogni, presenza), ciascuno con "Cosa mostra" e "Come leggerlo". Clicca una barra per aprire il report di quell'ospite. "Stampa" o "Scarica riepilogo" generano il Riepilogo d'équipe per la riunione.
6. **Report** (`/report`). Il "Come sta" di un ospite alla volta, da stampare.
7. **Vista Famiglia**: tasto `2` o pillola "Vista demo" in basso a destra. Il racconto del giorno compare solo con il consenso di Elena; il resto è "tenuto per sé".
8. **Vista ROSS**: tasto `3`. Avvia la conversazione: alla fine ROSS chiede a Elena se può raccontarlo ad Anna. Tornando alla Famiglia (`2`), il racconto ora è condiviso.
9. **Una richiesta pratica, andata e ritorno**:
   - nella stessa conversazione, prima di salutare, Elena dice che la lampada sul comodino non si accende. ROSS chiede «Vuoi che lo dica al personale?» ed Elena risponde «Sì, diglielo»;
   - in **Struttura 2.0** (`5`), il canale mostra la riga «richieste nuove dagli ospiti → Richieste». Nella scheda **Richieste** la lampada è in «Da vedere» con «Confermato da Elena»: segnala «Ci pensiamo noi» e poi «Fatto»;
   - riapri la conversazione (`3`): ROSS apre con «Hanno sistemato la lampada sul comodino: adesso la luce va bene?»;
   - per il caso che **non** diventa una richiesta, all'inizio della conversazione scegli «Sono caduta»: ROSS rimanda al campanello e non crea niente.
10. **Una comunicazione agli ospiti:** nella scheda **Richieste**, in «Agli ospiti», scrivi una cosa pratica, scegli Elena (o tutti) e inviala. Sulla home del tablet (`3`, `/ross`) compare in «ROSS ti dice», con le parole semplici di ROSS. Nella Struttura 2.0 lo stato è a parole: In corso, Detto.
11. **«ROSS, al volo»** (Struttura 2.0, bolla in basso a destra, sopra la pillola «Vista demo»):
    - tocca «Le ultime 3 cose emerse» o «Ci sono richieste aperte?»: risposte brevi, ognuna con il link alla schermata giusta;
    - scrivi «Proponi a Bruno il torneo di sabato»: ROSS prepara la bozza dello spunto e chiede «Lo mando?». Con «Mando» lo spunto compare nel canale e nella scheda Spunti di Bruno;
    - prova una domanda fuori dal perimetro («Di cosa ha parlato Elena?», «Chi è il più solo?», «Ha preso le medicine?»): ROSS dice di no, con gentilezza, e propone cosa può fare.

**Per chi presenta:**
- la pillola "Vista demo" (tasti `1` Struttura, `2` Famiglia, `3` ROSS);
- la **visita guidata**, che si apre da sola a ogni apertura della demo (non nella Mappa, non con `?visita=0`) e poi dalla pillola, dalla card in basso a sinistra, da Impostazioni o con `?visita=1`: evidenzia un elemento alla volta e lo spiega in poche righe;
- il ripristino dei dati dalla card in basso a sinistra.

**Giro breve per un incontro di ricerca (3 minuti, si mostra solo alla fine, dopo aver ascoltato):** la visita guidata segue questo ordine.
1. **Tablet di Elena** (`/ross`): spunti del giorno (meteo, ricorrenza) e "Da Anna, per te", cioè ciò che la famiglia porta a ROSS; ROSS dice di essere un programma; "Aiuto" mostra che si chiede con parole proprie e che ROSS non è un sistema di emergenza.
2. **Conversazione**: alla fine ROSS chiede se può raccontarlo ad Anna e rimanda Elena alle persone vere.
3. **Famiglia** (`/famiglia`, `/famiglia/attivita`): "traduce, non trasmette", cioè un racconto e non dei dati; ciò che Elena tiene per sé resta suo.
4. **Struttura** (`/?q=emerso`, ritratto di Elena): sa come sta e come avvicinarla, mai di cosa ha parlato.
5. **Cosa la struttura riceve** (`/impostazioni#privacy`), poi "Cosa è reale e cosa è simulato".

### 0.6 Come ci siamo arrivati
Le tappe principali, per tema. Il dettaglio di ogni PR è nella §6.

| Tema | Cosa è cambiato | PR |
|---|---|---|
| Da gestionale a chat | Menu da 9 a 3 voci (Chiedi a ROSS · Ospiti · Report); home "Chiedi a ROSS"; barra superiore essenziale; selettore "Vista demo" in un angolo | #1–#6 |
| Privacy by design | Contratto informativo: regola d'oro e cinque punti cardinali; demo ricalibrata (via citazioni, argomenti, punteggi /10) | #7 |
| Sidebar e guide alla lettura | Accordion senza icone "i"; specchietto verde "Cosa ti dice ROSS", sempre nel menu laterale, anche in Ospiti e Report | #8–#10, #16–#17 |
| Stakeholder e domande | Tre ruoli (Staff senza login, Psicologa e Direzione con login) e domande consigliate concrete, senza turni | #12 |
| Ospiti e ritratto | Lista per attenzione; ritratto a 4 tab; tolte storia, relazioni e contributi della famiglia; "Come avvicinarsi" diventa una guida pratica | #13–#14 |
| Report | Riepilogo d'équipe o Singolo ospite, poi infografiche (sempre rispetto a sé stessi) e barre cliccabili | #15, #22–#23 |
| Lessico | Tono di voce dalle linee guida Notion: "ritratto" al posto di "cartella", niente parole cliniche | #18 |
| Equilibrio | Segnali positivi per ogni ospite, messi prima di ciò che è da osservare; testi narrativi allineati | #19–#20 |
| Vista Famiglia | Consenso dell'ospite; contributi della famiglia direttamente a ROSS; niente struttura in mezzo | #21 |
| Demo come strumento di ricerca | "Reale / simulato", giro che parte dalla persona, vista ROSS riallineata, ruolo Educatrice, Documenti → Allegati | ottobre 2026 |

### 0.7 Cosa chiediamo al team
Domande su cui ci serve il vostro parere (dettagli nella §5):
1. **Target:** per chi progettiamo prima, Staff, Psicologa o Direzione?
2. **Contenuti:** rileggere spunti di "Come avvicinarsi", segnali positivi, azioni suggerite della voce della struttura e testi degli specchietti. Sono stati scritti per la demo.
3. **Consenso:** va progettato un "raccontalo anche alla struttura"? E come fa l'ospite a cambiare idea su ciò che ha condiviso?
4. **Segnali gravi:** cosa succede se un ospite esprime dolore acuto, rischio per sé o maltrattamenti? Oggi non c'è un protocollo.
5. **Accessi:** i tre ruoli devono vedere perimetri diversi, o cambiano solo le domande?
6. **Vista ROSS:** riallineata a ottobre; resta da progettare il promemoria con avviso all'operatore (il caso di Namastè).
7. **Idee in coda:** frecce "← precedente · successivo →" nel report del singolo ospite; rileggere i testi della visita guidata.

### 0.8 Glossario
- **Ritratto:** la pagina di un ospite nella vista Struttura (mai "cartella").
- **Sua media:** la media personale dell'ospite negli ultimi 14 giorni; ogni confronto parte da lì.
- **Segnale:** qualcosa che l'ospite ha espresso in conversazione, nella forma "X conversazioni su Y, di solito Z", su almeno 7 giorni. Può essere positivo (serenità, buonumore) o da osservare (stanchezza, solitudine). Mai l'oggetto dell'emozione.
- **Cinque punti cardinali:** le sole cose che la struttura riceve, cioè benessere nel tempo, come relazionarsi, bisogni personali, voce della struttura, presenza e continuità.
- **Voce della struttura:** ciò che gli ospiti esprimono sulla vita in struttura (pasti, rumore, attività), anonimo e aggregato.
- **Soglia di anonimato:** un tema della voce compare solo se lo esprimono almeno 3 ospiti.
- **Biografia d'ingresso:** le informazioni date da famiglia o struttura all'ingresso; è l'unica fonte dei dettagli concreti in "Come avvicinarsi".
- **Emerso con ROSS:** un interesse scoperto in conversazione. La struttura ne vede solo la categoria, mai l'episodio.
- **Modalità Attiva / Reattiva / Silenziosa:** con Attiva ROSS propone lui; con Reattiva risponde se interpellato; con Silenziosa non avvia nulla e rispetta il riposo.
- **Riepilogo d'équipe / Come sta:** i due report stampabili, il primo sulla struttura, il secondo sul singolo ospite.
- **Vista demo:** la pillola in basso a destra per passare tra Struttura, Famiglia e ROSS. È un comando per chi presenta, non parte del prodotto.

---

## 1. Stato attuale in breve

- **Demo online:** https://4less4ndr0.github.io/demo-ross/ (GitHub Pages, branch `gh-pages`, aggiornato automaticamente a ogni push su `main`).
- **Repository:** `4less4ndr0/demo-ross`. Il lavoro si fa su un branch dedicato, poi PR verso `main`.
- **Perimetro del lavoro:** soprattutto la **vista Struttura**, cioè ciò che vede lo staff della RSA. La **vista Famiglia** (`/famiglia`) è stata riallineata al consenso dell'ospite (PR #21). La **vista ROSS** (`/ross`, il tablet dell'ospite) non è stata ridisegnata: è cambiato solo il copione della conversazione, dove ROSS chiede a Elena se condividere il ricordo con Anna.

**Com'è fatta oggi la vista Struttura:**

| Zona | Cosa c'è |
|---|---|
| Barra superiore | Solo quattro schede centrate sulla finestra: **Chiedi a ROSS · Ospiti · Report · Panoramica**. Restano ferme quando la sidebar cambia larghezza. Su mobile stanno sulla stessa riga dell'hamburger. |
| Sidebar sinistra | Logo, "Residenza Aurora" e data. **Chat:** accordion con Da osservare, **Cosa va bene**, Bisogni espressi, Voce della struttura, Presenza con ROSS e **Cosa ti dice ROSS** (guida alla lettura). **Ospiti (lista), Report e Panoramica:** sidebar larga con lo specchietto verde "Cosa ti dice ROSS" della pagina, aperto di default. **Ritratto e Impostazioni:** colonna di icone. In fondo: Impostazioni e card con l'account del ruolo (menu "Sto chiedendo come", impostazioni, presentazione, ripristino dati). |
| Chiedi a ROSS (`/`) | Chat a frizione zero sul modello ChatGPT. Risposte preparate e deterministiche con le fonti; 4 domande consigliate per ciascuno dei quattro stakeholder (Staff, Educatrice, Psicologa, Direzione); graffetta per allegare una foto o un file; microfono simulato; menu "…". |
| Ospiti (`/ospiti`) | Lista ordinata per attenzione (assenza insolita, segnali, bisogni). Ogni scheda: foto grande, nome, età, stanza, modalità di ROSS, ultima conversazione e al massimo un avviso da osservare. Cosa va bene, partecipazione e interessi stanno nel ritratto. Le foto (`public/ospiti/`) compaiono anche negli avatar di ritratto, chat e report. |
| Ritratto (`/ospiti/:id`) | Si adatta all'archetipo dell'ospite (§0.4). Quattro tab: **Come sta** (risorse, narrativa, "Spunti di ROSS" per invogliare alla vita della residenza, benessere nel tempo con prima ciò che va bene, bisogni, presenza, grafico rispetto alla media) · **Come avvicinarsi** (primo approccio in 3 passi, spunti per interesse, attività da far proporre a ROSS solo in modalità Attiva, stile di ROSS, momenti della giornata) · **Con ROSS** (come usa ROSS per tipo di conversazione, modalità e inviti chiesti a ROSS, settimane; mai di cosa) · **Allegati** (raggruppati per provenienza: dall'ingresso, dalla famiglia, dallo staff; si aprono e si leggono). Niente grafo delle relazioni; dalla famiglia solo ciò che sceglie di condividere con la struttura. |
| Report (`/report`) | Solo il **Come sta** del singolo ospite (`?ospite=ID`, `&stampa=1`), scelto da un menu in ordine di attenzione: infografiche (segnali rispetto al solito, bisogni, conversazioni per settimana, momenti della giornata, interessi che coinvolgono), come avvicinarsi, "Da valorizzare", checklist "Da osservare in équipe" e partecipazione rispetto alla media. |
| Panoramica (`/panoramica`) | Le analytics della struttura come schermata dell'app: sintesi, 6 numeri chiave, grafici in tre gruppi (Benessere nel tempo · Voce degli ospiti e bisogni · Presenza con ROSS), ognuno con "Cosa mostra" e "Come leggerlo", e i punti da discutere. "Stampa" / "Scarica riepilogo" stampano il **Riepilogo d'équipe** (documento completo con situazione per ospite), tenuto pronto fuori schermo. Le vecchie URL `/analytics` e `/report?ambito=struttura` portano qui. |
| Sessione live (`/interazione/:id`) | Conversazione avviata dallo staff: niente trascrizione; alla fine l'esito e un nuovo interesse per categoria. |
| Impostazioni (`/impostazioni`) | Tema, visita guidata, fasce delle modalità ROSS, "Cosa la struttura riceve da ROSS" (`#privacy`), ripristino dei dati demo. |
| Selettore "Vista demo" | Pillola in basso a destra, nella stessa posizione in tutte le viste. Menu Struttura/Famiglia/ROSS, tasti 1/2/3, "Cosa è reale e cosa è simulato", "Visita guidata". |
| Vista Famiglia (`/famiglia`) | App per iPhone: **Oggi · Da lei · + · Da te · Insieme**. **Oggi**: sorriso di oggi, racconto del giorno, spunto per la telefonata, come sta questa settimana. **Da lei** (`/famiglia/da-lei`, `#racconti` / `#ricordi`): ciò che Elena sceglie di condividere, cioè i racconti (giorno, settimana, mese) e i suoi ricordi. **+**: contributo a ROSS. **Da te** (`/famiglia/da-te`): contributi di Anna con lo stato e il link a com'è andata, ricordi della famiglia. **Insieme** (`/famiglia/insieme`): spunti salvati per le chiamate, metodo, cosa vedi e cosa no. Dettagli: `/famiglia/attivita/:id`, `/famiglia/ricordi/:id`. |

---

## 2. Decisioni di prodotto in vigore

Le regole complete sono in [`AGENTS.md`](../AGENTS.md), in [`contratto-informativo-struttura.md`](contratto-informativo-struttura.md) e in [`lessico-struttura.md`](lessico-struttura.md). In sintesi:

1. **ROSS sta sopra i sistemi della RSA.** Non è un gestionale: niente anagrafica, note di reparto, pianificazione attività o dati come "Adesso: sala lettura".
2. **La home è una chat** interrogabile anche da telefono, e ogni risposta cita la fonte.
3. **Quattro stakeholder, target ancora da scegliere.** **Staff** (operatori e coordinatori, una sola voce, accesso condiviso senza login), **Educatrice**, **Psicologa** e **Direzione** (accesso personale con login). La card mostra l'account del ruolo, mai una persona per lo staff. Domande consigliate concrete e con un nome; niente turni nella demo.
4. **Regola d'oro della privacy:** la struttura sa *come sta* e *di cosa ha bisogno* l'ospite, **mai di cosa ha parlato**. Niente trascrizioni, citazioni, argomenti, nomi raccontati, ricordi specifici, oggetto delle emozioni, giudizi sulla salute.
5. **Cinque punti cardinali**, le sole cose che la struttura riceve:
   - benessere nel tempo: segnali espressi su almeno 7 giorni, confrontati con la media personale;
   - come relazionarsi: interessi solo per categoria;
   - bisogni personali: per ospite;
   - voce della struttura: anonima, solo con almeno 3 ospiti;
   - presenza e continuità.
6. **Equilibrio:** ogni ospite mostra anche ciò che va bene, non solo ciò che è da osservare. Il positivo viene prima; ROSS segnala entrambi, l'équipe osserva e decide.
7. **Confronti solo con sé stessi:** partecipazione "sopra / in linea / sotto la sua media"; mai punteggi assoluti (/10), classifiche o baseline unica.
8. **Come avvicinarsi:** dettagli concreti **solo dalla biografia d'ingresso** (famiglia o struttura), con la fonte visibile; per gli interessi emersi con ROSS solo leva, spunto, attività e coinvolgimento, mai l'episodio.
9. **Nella struttura non ci sono** biografia/storia, grafo delle relazioni né contributi della famiglia: questi vanno direttamente a ROSS.
10. **Lessico:** ROSS parla come un compagno, non come un servizio sanitario. Mai cartella, clinico, diagnosi, sintomo, rilevare, disorientamento, baseline, ingaggio, paziente, terapia, monitoraggio. La pagina di un ospite è il suo **ritratto**.
11. **Allegati facoltativi:** una foto (anche dal telefono) o un file, dalla chat o dal tab Allegati; nessuna classificazione né dati sanitari come requisito; non entrano nel report "Come sta". ROSS li cita, non interpreta referti o valori.
12. **Report:** Riepilogo d'équipe (default) o Singolo ospite; numeri calcolati dalle conversazioni; niente "crescita della memoria" né icone "i".
13. **Specchietto verde "Cosa ti dice ROSS"** sempre nel menu laterale, mai nel corpo della pagina. Contestualizza: a cosa serve la pagina, cosa si trova, perché è fatta così, cosa non c'è.
14. **Interazioni in stile shadcn/ui** (Radix + Sonner) con i colori e i caratteri ROSS; niente Tailwind né tema neutro. Le azioni reversibili mostrano un toast con "Annulla".
15. **Barra superiore minimale** (solo le tre schede) e **selettore "Vista demo"** in un angolo: è un comando per chi presenta.

---

## 3. Mappa del codice

> **Mappa interattiva** (aggiornata al 5/11, con la Struttura 2.0): vista **Mappa** della demo (pillola "Vista demo" → Mappa, tasto 4, indirizzo `/mappa`; file `public/mappa-ross.html`): parti, file e collegamenti con nomi in italiano, tre percorsi guidati e le schermate. Come aggiornarla: [`docs/floorplan/README.md`](floorplan/README.md).

| File | Ruolo |
|---|---|
| `src/App.jsx` | Rotte. Le vecchie URL (`/consegne`, `/insight`, `/analytics`, `/interazioni`, `/attivita`, `/struttura`) reindirizzano alle nuove. Mostra il `Toaster` (Sonner) nella vista Struttura e il vecchio toast nelle viste Famiglia e ROSS. |
| `src/components/Layout.jsx` | Guscio della Struttura: sidebar (larga in chat, Ospiti e Report; a icone altrove), Sheet su mobile, schede in alto, card con l'account del ruolo (`roles[].account`), scorciatoia ⌘K che porta alla chat. |
| `src/components/InsightRail.jsx` | Accordion della sidebar della chat (Da osservare, Cosa va bene, Bisogni, Voce, Presenza con ROSS) e guida `readingGuide`. Le voci fanno domande alla chat tramite l'evento `ross:ask`. |
| `src/components/PageGuide.jsx` | `SidebarGuide`: specchietto "Cosa ti dice ROSS" di Ospiti, Report e Panoramica; testi in `residentsGuide`, `reportsGuide` e `overviewGuide`. |
| `src/components/ReportCharts.jsx` | Infografiche dei report: `DivergingBars` (con `onSelect` le righe diventano bottoni), `HorizontalBars` (con linea di riferimento), `Dumbbell`, `Columns`, `Sparkline`, `ChartCard`, `ChartLegend`. Colori fissi in `CHART` (e token `--chart-*` in `styles.css`): verde = va bene, corallo = da osservare, grigio = in linea, sabbia scura = bisogni. |
| `src/components/ParticipationChart.jsx` | Grafico della partecipazione rispetto alla media personale, usato nel ritratto e nel report. |
| `src/pages/StructureChannel.jsx` | **Struttura 2.0** (`/struttura-2`): `StructureChannelLayout` (marchio e schede Il canale · Ospiti · Richieste, con il pallino sulle richieste da vedere, fornisce `StructureView` con `base` e `v2`), `StructureChannelPage` (contenitore per Ospiti e ritratto, gli stessi componenti della Struttura), la pagina del canale (flusso in 3 passi, riga di rimando alle richieste, rete delle passioni, «Proponi uno spunto», «Cosa è emerso» con il filtro `momentFilters.canale`), `ProposeCard` (anche nel ritratto, con `fixedId` e `prefill`), `MomentCard`, `MomentActions` (Visto/Fatto) ed `Esito`. Stili `.s2-*` in fondo a `styles.css`. |
| `src/components/ResidenceMap.jsx` | Canale della 2.0: **«La residenza, adesso»**, un piano alla volta; su desktop il piano scelto è in 3D (`Floor3D`, `Room3D`: SVG con nomi e pallini in HTML sopra), su telefono la pianta piatta (`Plan`). Indice dei piani (`Tabs` verticali; su telefono pillole), pianta con alloggi e spazi posizionati in percentuale sulla geometria 18 × 6 di `floorsPlan`, pallino dello stato nell'angolo (`Pin`), tooltip Radix con lo stato a parole, legenda, dettaglio a destra (`RoomPanel`; su telefono `Sheet` dal basso). «Fatto, è ricollegato» con «Annulla», salvato in `ross-residence-v1`. |
| `src/data/residence.js` | Dati della pianta: `floorsPlan` (tre piani, alloggi e spazi comuni con coordinate), `deviceState` e `deviceNote` (stato del dispositivo, mai della persona), `stateLabel` e `legendLabel`, `stateOrder`, `roomState(stanza, ospiti, ricollegati)` (la modalità Silenziosa diventa «in pausa») e `startFloor` (il piano da aprire all'inizio). |
| `src/state/channelStore.js` | **La sola fonte dei momenti** letta da canale, Spunti e Con ROSS: `useMoments()`, `channelActions.send({ residentId, testo, tipo })` (crea un momento «spunto» in attesa; nella demo ROSS risponde in 6 secondi con `simulatedReply`) e `channelActions.mark(id, stato)` per Visto/Fatto, con «Annulla». I filtri delle tre viste sono in `momentFilters` (`canale`, `spunti(id)`, `storia(id)`). Nel browser (`ross-struttura2-v2`) si salvano solo lo stato dei momenti di partenza e i momenti nati da nuovi spunti; quelli di partenza si ricalcolano ogni volta da oggi. Per le richieste: `channelActions.request` (dal tablet, dopo il sì), `requestStep(id, "ci_pensiamo" o "fatto")` con «Annulla», `closeWithResident`, i filtri `richieste`, `haChiesto(id)` e `daChiudere(id)`, `getMoments()`. Tablet e Struttura 2.0 leggono lo stesso stato, anche in due finestre (evento `storage`). Richieste ripetute: `request` aggiorna la card esistente. Comunicazioni: `announce`, `toldTo`, filtri `daVedere`, `ciPensiamo`, `fatteOggi`, `comunicazioni`, `comunicazioniPer`; le comunicazioni sono escluse da `storia`. |
| `src/components/ResidentSpunti.jsx` | Ritratto → **Spunti** (una persona → come proporle meglio): «Cosa ha capito ROSS» (`spuntoReading` e i tipi che funzionano o per ora meno, dagli esiti), poi solo i momenti con origine «spunto» raggruppati per esito (in attesa, sono piaciuti, ci sta pensando, non sono piaciuti o non era il momento), in card compatte; «Cosa puoi fare» solo finché non è Fatto. Accanto il modulo per proporne uno (con `?spunto=…&tipo=…` arriva già scritto). |
| `src/data/channel.js` | Dati della Struttura 2.0: `channelResidents` (gli otto ospiti), `spuntoTypes`, `timingFor` (come ROSS porta lo spunto secondo la modalità), `spuntoReading` (cosa ha capito ROSS di ciascuno) e `simulatedReply` (la risposta preparata per tipo di spunto, in terza persona). |
| `src/pages/StructureRequests.jsx` | Struttura 2.0, scheda **Richieste** (`/struttura-2/richieste`): «Dagli ospiti» (le richieste confermate in tre gruppi: Da vedere · Ci pensiamo noi · Fatte oggi; card con categoria, «Confermato da …», «L'ha chiesto di nuovo oggi», «ROSS gliel'ha detto») e «Agli ospiti» (`AnnounceCard`: testo, a chi, quando dirlo, anteprima di come lo dirà ROSS; elenco delle comunicazioni con lo stato a parole). |
| `src/components/QuickChat.jsx` | Struttura 2.0, **«ROSS, al volo»**: la bolla in basso a destra (sopra la pillola «Vista demo») e il pannello (380×560 su desktop, non modale; `Sheet` a tutto schermo su telefono). Saluto e pillole, campo libero, messaggi di ROSS con al massimo 3 voci e un link alla schermata giusta, bozze da confermare (`DraftCard`: Mando · Modifica · Annulla) che chiamano `channelActions.send` o `channelActions.announce`. Esc chiude, il focus va al campo e poi torna alla bolla. La conversazione sta solo nella sessione (`sessionStorage`, `ross-quick-v1`). Il link «Cosa è reale e cosa è simulato» manda l'evento `ross:about` alla pillola. |
| `src/data/quickChat.js` | Il motore di «ROSS, al volo», separato dalla chat della Struttura attuale: `quickAnswer(domanda, momenti)` riconosce gli intenti con parole chiave normalizzate (senza accenti) e i nomi degli otto ospiti (`residentIn`). Tre capacità: **riassumere** (ultime 3 cose emerse, richieste aperte, cosa è emerso con una persona negli ultimi 7 giorni, spunti piaciuti, tutto dai filtri di `channelStore`), **agire con conferma** (bozza di spunto o di comunicazione, `draftSummary`), **spiegare ROSS** (cosa vede la struttura, perché non si sa di cosa parlano, cos'è uno spunto, il no dell'ospite, le urgenze). I rifiuti (contenuto, classifiche, salute, gestione) hanno testi fissi. Più `suggestions` e `greeting`. |
| `src/pages/RossExperience.jsx` | Tablet di Elena, con l'anatomia e l'estetica della schermata «Maria» (classi `ross-m-*`, semicerchio `ross-talk-arc`, dialog `ross-dialog`): la home con le schede «una cosa alla volta» e «Parla con ROSS» (`RossConversation`, copione `script`). Nel copione c'è la **richiesta pratica** della lampada: turni `lampada`, `lampada-conferma` (con «Sì, diglielo» parte `channelActions.request(lampRequest)`), la **chiusura del cerchio** (`cerchio`, se c'è una richiesta «Fatto» da chiudere: `momentFilters.daChiudere`) e il **caso salute** (`salute`, nessuna richiesta, rimando al campanello). In home la card **«ROSS ti dice»** con le comunicazioni per Elena (`momentFilters.comunicazioniPer`), che segna come dette (`toldTo`). |
| `src/data/moments.js` | I **momenti di partenza** della 2.0 (`seedMoments`): gli insight del canale, gli spunti passati e i momenti di ogni ospite (iniziative, uscite raccontate, scelte, interessi emersi, cose da guardare di persona). Ognuno ha `id`, `residentId`, `quando` (calcolato da oggi con `at(giorniFa, "hh:mm")`), `origine` (spunto · spontaneo · invito · scelta · da_osservare), `spunto` ed `esito` se nasce da uno spunto, `titolo`, `racconto`, `cosaPuoiFare`, `stato`. Più `esiti`, `labelOf` e `toneOf`. Sempre in terza persona, mai il contenuto delle conversazioni. Più le **richieste pratiche** (origine `richiesta`: `richiesta`, `categoria` stanza · comfort · desiderio, `chiusura`, `stato` in_attesa · ci_pensiamo · fatto, `chiusoConOspite`), con `requestStates` e `lampRequest`. Più le **comunicazioni** agli ospiti (origine `comunicazione`: `testo`, `frase`, `perChi`, `quandoDirlo`, `stato` in_corso · detto) e, nelle richieste, `richiestoDiNuovo` e `fattoIl`. |
| `src/data/demoClock.js` | L'**orologio della demo** per Struttura 2.0, Famiglia e tablet: `demoToday()`, `at(giorniFa, "hh:mm")`, `daysAgo`, `dayLabel` (Oggi · Ieri · giorno della settimana fino a 6 giorni · «La settimana scorsa» · «N settimane fa», con la data), `whenText`, `dayText`, `dayShort`, `rangeText`, `monthText`, `daysUntil`. La Struttura attuale resta sul giorno fisso `DEMO_TODAY`. |
| `src/data/interestGraph.js` | **Una sola fonte per i due grafi**: `passions` (passioni con chi le condivide e un'occasione; `sharedPassions` sono quelle con almeno 2 ospiti), `passionsOf`, `viaOf`, `personalLinks` (le occasioni di ciascuno, collegate al momento che ne dice l'esito), `outsideLinks`, `graphStatus` e `statusFromEsito`. |
| `src/components/PassionNetwork.jsx` | Canale, **«La rete delle passioni · tutta la residenza»**: solo `sharedPassions`, la passione scelta nell'indirizzo (`?passione=…`), azione collettiva «Proponilo a tutti e N». |
| `src/components/PortraitV2.jsx` | Ritratto della 2.0: `HowIsV2` (Come sta, con **«Le passioni di …»**: solo i suoi interessi, colori dagli esiti dei suoi spunti, gli altri ospiti come «con chi la condivide», «Proponilo come spunto» e «Vedi chi altro la condivide» verso `/struttura-2?passione=…`) e `WithRossV2` (Con ROSS: la sua storia dal filtro `momentFilters.storia`, gli spunti come riga compatta con il link a Spunti, filtri a pillole). |
| `src/components/PerspectiveSwitcher.jsx` | Pillola "Vista demo": menu, tasti 1/2/3, dialog "Cosa è reale e cosa è simulato" (`simulated`, `principles`), voce "Visita guidata". |
| `src/components/GuidedTour.jsx` | Visita guidata per capitoli: `chapters` (Struttura, Famiglia, Elena, ognuno con scheda d'apertura e `steps`), `sequence`, `startTour()` (evento `ross:tour`), avvio automatico a ogni caricamento (tranne `/mappa` e `?visita=0`) e con `?visita=1`; evidenzia, posiziona la scheda (sotto, sopra, di fianco o in basso su telefono), rende `inert` il resto della pagina. |
| `src/components/ui.jsx` | Primitive in stile shadcn, usate in tutte le viste: `Button`, `DropdownMenu*`, `Select`, `Sheet`, `Dialog` (con `className`, per esempio `family-dialog`), `Tabs*`, `Input`, `Textarea`, `Toaster`. |
| `src/components/DocumentDialogs.jsx` | Le quattro cartelle di «Cosa sa ROSS» (`folders`, `familyOf`, `useOf`, `folderChoices`) e i dialog per aggiungere un documento: `FileDocumentDialog` (anteprima, titolo, cartella; dalla chat anche l'ospite), `TextDocumentDialog` (testo incollato → `.txt`), `FolderChoice`. Usati dal ritratto e dalla chat. |
| `src/components/Common.jsx` | `Avatar` (foto da `public/ospiti/` con `residentPhoto`, iniziali come ripiego), `ModeBadge`, `InfoTip`, `SectionTitle`, `DataExplanation`. |
| `src/pages/AskRoss.jsx` | Chat: thread, suggerimenti, ambito `?ospite=`, domande via `?q=`, allegati, microfono simulato, menu "…", ascolto di `ross:ask` e `ross:focus-chat`. |
| `src/pages/Residents.jsx` | Lista ospiti in ordine alfabetico (usata anche dalla Struttura 2.0: i link seguono `useStructureView().base`); scheda con foto, chi è, ultima conversazione e un solo avviso. |
| `src/pages/ResidentProfile.jsx` | Ritratto dell'ospite con i quattro tab. I vecchi `?tab=memorie`/`relazioni` portano a Come avvicinarsi. |
| `src/pages/OperationalPages.jsx` | `ReportsPage` (solo singolo ospite, `ResidentReport`) e `OverviewPage` (Panoramica: `Overview` a schermo, `TeamReport` fuori schermo per la stampa, classe `.print-offscreen`). |
| `src/pages/LiveInteraction.jsx` | Sessione live: interessi dell'ospite in uso, esito con nuovo interesse per categoria (`journeyInterest` per Elena). |
| `src/pages/Settings.jsx` | Impostazioni unificate, con la sezione `#privacy`. |
| `src/data/chatScript.js` | Motore della chat: `roles` (Staff, Psicologa, Direzione, con `account`), `roleFor` (converte i ruoli vecchi salvati), `suggestions`, intenti a parole chiave con risposte per ruolo e fonti (tra cui `priorita`, `positivi`, `segnali`, `bisogni`, `voce`, `presenza`, `report`, `privacy`). |
| `src/data/careInsights.js` | **Dati conformi al contratto:** `signals` (da osservare e positivi), `needs`, `facilityVoice` (con azione suggerita), `relating`, `approachGuide` (primo approccio, stile, momenti, spunti per interesse), `presenceNotes`, `journeyInterest`, `cardinalPoints`. Helper: `hooksFor`, `attentionFor`, `attentionScore`, `byAttention`, `trendOf`, `describeSignal`, `signalDetail`, `groupByResident`. È il posto dove cambiare gli insight. |
| `src/data/reportNarrative.js` | `buildResidentReport(state, resident, period)` (narrativa, KPI, segnali, bisogni, come avvicinarsi, da valorizzare, checklist, serie del grafico) e `buildTeamReport(state, period)` per il Riepilogo d'équipe, calcolato da `state.interactions` e da `careInsights.js`. Dati delle infografiche: `trendRows`, `signalTypes` (con `who`), `needCategories`, `activityEngagement`, tendenza dei KPI rispetto al periodo precedente; per l'ospite `weekly`, `rhythm`, `engagement`. |
| `src/state/DemoContext.jsx` | Stato persistente in localStorage (`ross-rsa-demo-v2`): `role`, `documents`, `notify` con Sonner e "Annulla". I dati degli ospiti vengono sempre dalla demo: dal browser si conservano solo modalità e stato. |
| `src/data/demoData.js` | Dataset fittizio: ospiti, interazioni, `documents`, più dati usati solo dalle viste Famiglia e ROSS (biografia, memorie, `graphData`, `handoverEntries`). |
| `src/styles.css` | Stili unici; le sezioni aggiunte sono commentate (es. `/* Come avvicinarsi … */`, `/* Report: Riepilogo d'équipe … */`). |
| `docs/contratto-informativo-struttura.md` | Contratto informativo ROSS → struttura: regola d'oro, cinque punti, segnali ammessi (anche positivi), divieti, checklist, aree grigie. |
| `docs/lessico-struttura.md` | Lessico della Struttura dalle pagine Notion "TOV guidelines" e "Keywords": principi, tabella "non si dice / si dice", checklist. |

---

## 4. Come fare le modifiche più comuni

**Avvio locale:** `npm install`, poi `npm run dev` (http://localhost:5173).
**Prima di ogni PR:** `npm run build` e `npm run test:sites`. La build deve produrre `dist/client/index.html`, `dist/server/index.js` e `dist/.openai/hosting.json`.
**Deploy:** merge su `main`, poi il workflow `.github/workflows/deploy-pages.yml` pubblica su GitHub Pages in circa 30 secondi.
**Dati vecchi nel browser:** card in basso → "Ripristina dati demo".

- **Aggiungere una domanda alla chat:** in `src/data/chatScript.js` aggiungi un oggetto a `intents`, con `id`, `keywords` normalizzate senza accenti, eventuale `when(state)` e `answer({ state, role, resident, q })`. L'oggetto restituisce `text`, `bullets`, `residents`, `sources`, `action`. Usa `byRole` per le varianti Staff / Psicologa / Direzione. Se è una domanda consigliata, aggiungila a `suggestions` e verifica che il punteggio delle keyword non la faccia finire in un altro intento.
- **Cambiare gli insight** (segnali da osservare o positivi, bisogni, voce, come relazionarsi, spunti): modifica solo `src/data/careInsights.js`. Chat, sidebar, lista, ritratto e report li leggono da lì. Tieni l'equilibrio: ogni ospite con almeno un segnale positivo.
- **Cambiare la guida "Cosa ti dice ROSS":** chat → `readingGuide` in `src/components/InsightRail.jsx`; Ospiti e Report → `residentsGuide` / `reportsGuide` in `src/components/PageGuide.jsx`.
- **Nuovi controlli UI:** usa le primitive di `src/components/ui.jsx`, non `<select>` nativi né modali personalizzati.
- **Checklist prima di pubblicare un testo nuovo** (contratto §5 e lessico):
  - nessuna citazione, nessun argomento, nessun nome o luogo raccontato;
  - segnali su almeno 7 giorni, nella forma "X conversazioni su Y", confrontati con la media della persona;
  - verbi ammessi: *ha espresso*, *ha partecipato*, *si accorge*, *racconta*; mai *è*, *sente*, *soffre*;
  - voce della struttura solo anonima e con almeno 3 ospiti;
  - nessuna parola della colonna "Non si dice" di `docs/lessico-struttura.md` (cartella, clinico, diagnosi, baseline…).

---

## 5. Questioni aperte

1. **Vista ROSS:** riallineata a ottobre (trasparenza, aiuto, "dimentica", modalità). Da progettare: promemoria conversazionale con avviso selettivo all'operatore (Namastè); le date della demo sono ancora di settembre.
2. **Consenso verso la struttura:** per la famiglia il consenso è modellato (`sharedWithFamily`); per la struttura vale la regola d'oro, ma un eventuale "raccontalo anche alla struttura" è da progettare (contratto, §6.2). Dal 04/11 la **famiglia** può mandare una copia dei suoi contributi alla struttura ("Anche alla struttura" nel +): da decidere se serva anche il consenso di Elena, visto che si parla di lei.
3. **Nomi dei documenti:** "Fisioterapia", "Esami del sangue" restano perché sono documenti della struttura. Da decidere se rinominarli nella demo.
4. **Contenuti da validare:** spunti di "Come avvicinarsi" e dettagli d'ingresso, segnali positivi, azioni suggerite della voce della struttura e testi degli specchietti sono stati scritti per la demo e vanno riletti dal team.
5. **Consenso revocabile:** nella demo il consenso è per singolo racconto e non si può ritirare; da decidere come l'ospite possa cambiare idea.
6. **Protocollo per segnali gravi** (dolore acuto, rischio per sé, maltrattamenti): non esiste ancora (contratto, §6.3).
7. **Livelli di accesso per ruolo:** oggi tutti i ruoli vedono lo stesso perimetro; cambiano solo domande e profondità delle risposte (contratto, §6.4).
8. **Target:** va ancora scelta la figura principale. Il selettore di ruolo resta finché la scelta non è fatta.
9. **Visita guidata:** i passi sono in `steps` di `GuidedTour.jsx`; vanno rivisti se cambiano le schermate chiave o le classi CSS usate come bersaglio.
10. **Tooltip "i"** ancora presenti in Impostazioni.
11. **Chat preparata:** le risposte sono deterministiche, senza un modello AI vero. Un modello reale richiederebbe un backend, che GitHub Pages non ha.
12. **Ordine della visita:** parte dalla persona e chiude su "cosa la struttura riceve" e sulla pillola "Vista demo". Report e Panoramica sono fuori dal giro, di proposito.
13. **Idea in coda:** frecce "← precedente · successivo →" nel report del singolo ospite, nello stesso ordine per attenzione, per scorrere l'équipe senza tornare al riepilogo.
14. **Archetipi:** gli otto ospiti rappresentano otto modi di vivere ROSS (§0.4). Da validare con il team e con le strutture: mancano casi? (per esempio chi rifiuta del tutto ROSS, o chi ha una famiglia molto presente e conflittuale).

---

## 6. Changelog (dal più recente)

### Novembre 2026 · 05/11/2026 · Tablet: «Le cose importanti di oggi» in una cornice
- **Richiesta:** le novità da Anna, «ROSS ti dice», il gioco del giorno e i ricordi sono le quattro cose importanti della giornata. Vanno in una cornice propria, con quattro card uguali, come quelle del gioco e dei ricordi.
- **Fatto:**
  - nuova sezione `ross-m-today` con il titolo «Le cose importanti di oggi» e una griglia 2 × 2 di card uguali: icona, titolo, sottotitolo, testo e azioni in fondo. Su telefono le card vanno una sotto l'altra;
  - «Da Anna» non sparisce più con «Più tardi»: resta con «Va bene: te le racconto quando vuoi» e «Raccontamele adesso», così la griglia non ha buchi.
- **Verificato** a 1280 e 390px: le quattro card sono alte uguali e non ci sono errori in console.
- **Da sapere:** non è ancora pubblicato. È nel branch locale `claude/tablet-come-maria`, insieme al resto del tablet in stile Maria, e la PR 60 è stata chiusa su richiesta.

### Novembre 2026 · 05/11/2026 · Il tablet di Elena con l'anatomia e l'estetica di «Maria»
- **Richiesta:** prendere dal progetto Lovable «ross» la schermata di Maria (`/maria`), studiarne UI e UX (organizzazione, gioco del giorno, ricordi, album, promemoria, estetica) e portarla in tutta l'esperienza dell'ospite nella demo, conversazione compresa. Battito, passi e sonno non servono.
- **Studio di Maria** (dal codice sorgente: l'anteprima pubblicata non si apre da questo ambiente):
  - **struttura dall'alto:**
    1. barra con avatar e nome a sinistra, meteo e ora a destra;
    2. data piccola, saluto grande in serif e una frase calda, più tranquilla dopo le 17;
    3. due card grandi con un'icona in un cerchio tenue, titolo, sottotitolo, testo in tono di conversazione e un bottone a pillola nero;
    4. quattro scorciatoie piccole;
    5. due colonne: la giornata come fila nel tempo e il benessere;
    6. i promemoria in tre riquadri;
    7. una riga finale e, fisso in basso al centro, un semicerchio con il microfono;
  - **estetica:** fondo bianco caldo, card bianche con un bordo di mezzo pixel e raggio di 20px, inchiostro quasi nero, accenti pesca, ambra e salvia, Fraunces più DM Sans e un'entrata a cascata delle card.
- **Fatto (solo tablet):**
  - **la home di `RossHome` segue quell'anatomia**, con le funzioni di prima:
    - barra con ROSS, meteo · ora e **«Aiuto»** (prima era una delle quattro scorciatoie);
    - saluto con la trasparenza sull'IA, poi le novità da Anna e «ROSS ti dice»;
    - **«Il gioco del giorno»** (Indovina la canzone) e **«I tuoi ricordi»**, che apre la conversazione;
    - scorciatoie **Ascolta musica · Giochi insieme · Album foto · Anna ti chiama**;
    - **«Oggi, fuori da qui»** come fila nel tempo, con «Ci vado» e «Un'altra volta», e **«Spunti per oggi»** a righe;
    - **«I tuoi promemoria»** in tre riquadri, con il prossimo in pesca e «Ascoltalo»;
    - «Da Anna, per te», le modalità a segmenti e il **semicerchio «Parla con ROSS»**;
  - **stessa estetica ovunque:** home, scheda «una cosa alla volta» (le frasi «Puoi dirmi» diventano card con il microfono in un cerchio pesca), dialog (`ross-dialog`), conversazione e chiusura. Caratteri locali con `@fontsource-variable/fraunces` e `@fontsource-variable/dm-sans`;
  - visita guidata: i passi «Spunti per oggi» e «Aiuto» puntano ai nuovi elementi (`.ross-spunti`, `.ross-help-button`).
- **Da Maria restano fuori:**
  - battito, passi, sonno e ogni valore di salute;
  - nomi dei farmaci e «Segna come preso»: ROSS non registra se un promemoria è stato fatto;
  - «Allena la mente» ed «Esercizi cognitivi», per il rischio dispositivo medico;
  - i punteggi («ieri ne hai indovinate 4 su 5»);
  - l'agenda della struttura con le attività barrate;
  - «Rossana è sempre qui con te», per il rischio di dipendenza.
- **Verificato** a 1280, 1024 × 768 e 390px:
  - la home e la scheda di un gioco, «Aiuto» e la conversazione funzionano;
  - il semicerchio non copre la pillola «Vista demo» e i caratteri si caricano;
  - nessun errore in console. `npm run build` e `npm run test:sites` passano; la mappa è rigenerata.
- **Da sapere:**
  - il semicerchio è fisso, come in Maria: scorrendo copre per un attimo il centro in basso, e la pagina ha 150px di spazio in fondo;
  - su telefono è più piccolo e spostato a sinistra, per lasciare posto alla pillola;
  - la frase più tranquilla della sera di Maria non c'è, perché la demo resta alle 16:40: è un'idea per quando l'ora sarà reale;
  - la vecchia CSS della home (`.ross-hero-copy`, `.ross-touch-grid`…) è ancora nel file ma non si usa più.

### Novembre 2026 · 05/11/2026 · «La residenza, adesso»: il piano scelto in 3D
- **Richiesta:** mettere in 3D solo il piano che si sta guardando, non i tre insieme.
- **Fatto:**
  - su desktop il piano scelto è una **lastra in 3D**, vista dall'alto e un po' di lato (`Floor3D` e `Room3D` in `ResidenceMap.jsx`), con:
    - gli alloggi e gli spazi con i muretti in fondo e a sinistra;
    - la fila in fondo disegnata prima di quella davanti;
    - gli stessi colori della pianta 2D: bordo tenue dello stato, alloggio selezionato con il bordo scuro, un alone verde che pulsa sotto i ROSS attivi;
  - **nomi e pallini** stanno in HTML sopra l'SVG, in percentuale: restano leggibili a ogni larghezza, e la dimensione del testo segue la larghezza della pianta (`cqw`);
  - **cosa resta uguale:** indice dei piani, tooltip, tastiera (Invio o spazio su un alloggio), dettaglio, legenda e card entro circa 380px;
  - **telefono:** resta la pianta piatta, perché in 3D a 390px sarebbe troppo piccola.
- **Verificato** a 1400, 1024 e 390px:
  - si apre sul primo piano con Carlo, e il tooltip dice «ROSS: da sistemare»;
  - il dettaglio si apre e si chiude con il clic e con la tastiera, e si cambia piano;
  - il Salone si può selezionare, e il glow verde compare su Elena, Teresa e il Salone;
  - nessun errore in console. `npm run build` e `npm run test:sites` passano; la mappa è rigenerata.
- **Da sapere:** a 1024px con il dettaglio aperto il piano 3D diventa piccolo, ma i nomi si leggono ancora. Se serve più spazio, si può aprire il dettaglio sopra la pianta invece che accanto.

### Novembre 2026 · 05/11/2026 · Canale: il messaggio d'apertura torna in cima, sopra la pianta
- **Richiesta:** mettere il messaggio del canale («Tu porti uno spunto. ROSS ti restituisce un'occasione.», la descrizione, il flusso in tre passi e il rimando alle richieste) sopra la pianta dei piani.
- **Fatto:** in `StructureChannel.jsx` l'ordine del canale ora è: messaggio d'apertura → rimando alle richieste → «La residenza, adesso» → rete delle passioni → Proponi uno spunto e Cosa è emerso. La pianta ha più spazio sotto (`margin: 24px 0 28px`), così non tocca la rete delle passioni.
- **Verificato** a 1400 e 390px: l'ordine è giusto e non ci sono errori in console. `npm run build` e `npm run test:sites` passano; la mappa è rigenerata.
- **Da sapere:** la pianta non è più la prima cosa che si vede. Chi presenta alla direzione scorre di poco per arrivarci.

### Novembre 2026 · 05/11/2026 · «La residenza, adesso» diventa una pianta 2D, un piano alla volta
- **Richiesta:** la piantina 3D in apertura del canale mostrava i tre piani insieme in assonometria. Occupava troppo spazio, si leggeva male e i colori confondevano: l'attivo era arancione, come gli accenti della pagina. Serviva una pianta vista dall'alto, un piano alla volta, con un indice dei piani e colori leggibili al primo sguardo.
- **Fatto (solo nella 2.0):**
  - **tolto il 3D:** la pianta piatta per piano, che prima c'era solo su telefono, è ora la versione unica, con la stessa geometria di `floorsPlan` e le proporzioni 18 × 6;
  - **tre colonne su desktop:** l'indice dei piani (Secondo piano · Primo piano · Piano terra) con un pallino colorato per ogni ROSS e nessun numero, la pianta e il dettaglio. Il dettaglio compare solo con una selezione; senza, la pianta si allarga. La card è alta al massimo circa 380px;
  - **si apre** sul piano con un ROSS da sistemare (il primo piano, con Carlo); altrimenti sul primo piano con alloggi;
  - **pianta dall'alto:** alloggi con numero e nome; quelli senza ROSS in grigio chiaro con «senza ROSS»; gli spazi comuni con il nome, il giardino in verde chiarissimo. Lo stato è un pallino nell'angolo, il bordo prende lo stesso colore in versione tenue, e un tooltip lo dice a parole. L'alloggio selezionato ha il bordo scuro;
  - **colori:** verde con un alone che pulsa (fermo con «riduci movimento») = attivo adesso; neutro caldo = acceso; grigio con la luna = in pausa, perché è una scelta dell'ospite; rosso con «!» = da sistemare. Il rosso compare solo lì. Il testo secondario della pianta è più scuro, per restare in AA anche su sfondo grigio e verde;
  - **da sistemare:** nel dettaglio la nota e «Fatto, è ricollegato», con il toast «Annulla». Il pallino rosso sparisce anche dall'indice;
  - **legenda** in una riga compatta sotto la pianta: i quattro stati e «Alloggio senza ROSS»;
  - **tolti i tre numeri in alto** (alloggi con ROSS, ROSS negli spazi comuni, da sistemare): niente conteggi;
  - **telefono (≤700px):** l'indice diventa tre pillole sopra la pianta, il dettaglio un foglio dal basso (`Sheet` con `side="bottom"`, stili `.ui-sheet-bottom`).
- **Verificato** a 1400, 1024 e 390px:
  - si apre sul primo piano con Carlo, e il cambio di piano dall'indice funziona;
  - si possono selezionare un alloggio (Carlo, con la nota e «Fatto, è ricollegato») e uno spazio comune (il salone, con «Oggi qui»); Esc chiude il dettaglio;
  - legenda e pianta mostrano i quattro colori;
  - nessun errore in console. `npm run build` e `npm run test:sites` passano; la mappa è rigenerata.
- **Da sapere:**
  - gli stati restano fissi nella demo (`deviceState`); «ricollegato» si azzera con «Ripristina la demo»;
  - un pallino per ROSS nell'indice non è un numero, ma con tanti alloggi diventerebbe un conteggio: con una struttura vera va ripensato (per esempio un pallino per stato).

### Novembre 2026 · 05/11/2026 · Struttura 2.0: «La residenza, adesso»
- **Richiesta:** nel canale, come immagine d'apertura per la direzione, la piantina di un senior living con i ROSS disposti all'interno: quali sono attivi e quali in uso adesso (anteprima approvata).
- **Modifiche:**
  - nuovo `src/components/ResidenceMap.jsx` (dati in `src/data/residence.js`), in cima a «Il canale»;
  - piantina 3D su tre piani: piano terra con salone, sala lettura, cucina didattica, ingresso e giardino; 12 alloggi, 8 con ROSS;
  - in alto tre numeri sui dispositivi (alloggi con ROSS, ROSS negli spazi comuni, da sistemare); legenda degli stati;
  - un ROSS attivo «respira» con onde arancioni (fermo con «riduci movimento»); stati fissi nella demo: attivi Elena, Teresa e il salone, Carlo da sistemare, Mario e Bruno in pausa perché in modalità silenziosa;
  - scheda dell'alloggio o dello spazio con stato, modalità, passioni e i collegamenti al ritratto; su telefono pianta piatta per piano.

### Novembre 2026 · 05/11/2026 · Struttura 2.0: «ROSS, al volo», la piccola chat per le domande veloci
- **Richiesta:** nella 2.0 una bolla in basso a destra con una piccola chat in stile assistenza, per domande veloci. Non è uno strumento per interrogare ROSS sugli ospiti: riassume ciò che ROSS ha già restituito, agisce in fretta (con conferma) e spiega come funziona ROSS. La Struttura attuale e la sua chat restano intatte.
- **Fatto (solo nella 2.0, su tutte le sue pagine):**
  - **bolla** rotonda in basso a destra, sopra la pillola «Vista demo» con un po' di spazio; **pannello** 380×560 su desktop (non modale: si può continuare a usare la pagina), **Sheet** a tutto schermo su telefono. Titolo «ROSS, al volo», sottotitolo «Domande veloci su ciò che ROSS ti ha già raccontato», chiusura con la X ed Esc;
  - saluto, sei pillole suggerite e un campo libero. Ogni risposta è breve (al massimo 3 righe o 3 voci) e finisce con il link alla schermata giusta («Apri il canale», «Apri le richieste», «Apri il ritratto di Bruno»): su desktop il pannello resta aperto, su telefono si chiude;
  - **riassumere** dalla sola fonte dei momenti (`channelStore`): le ultime 3 cose emerse (filtro del canale), le richieste aperte (Da vedere e Ci pensiamo noi), cosa è emerso con una persona questa settimana (la sua storia, al massimo 3), gli spunti piaciuti di recente;
  - **agire con conferma:** «Proponi a Bruno il torneo di sabato» prepara la bozza (ospite, testo, tipo) e chiede «Lo mando?» con Mando · Modifica · Annulla. Con «Mando» parte `channelActions.send`, come dal canale. Allo stesso modo «Di' a tutti che domani manca l'acqua calda» prepara una comunicazione (`channelActions.announce`);
  - **spiegare ROSS:** cosa vede la struttura, perché non si sa di cosa parlano gli ospiti, cos'è uno spunto, cosa succede se un ospite dice di no, cosa fa ROSS con le urgenze; con il link alla pagina o a «Cosa è reale e cosa è simulato»;
  - **rifiuti** gentili e sempre con un'alternativa: contenuto delle conversazioni, classifiche, salute e urgenze, gestione (turni, farmaci, anagrafica). Una domanda che non riconosce riceve «Questo non lo so fare. Puoi chiedermi…» con tre pillole;
  - motore separato in `src/data/quickChat.js` (nessun intento della vecchia chat), ROSS in terza persona quando parla di sé nei testi della 2.0 e del tu a chi lavora; la conversazione vive solo nella sessione del browser;
  - accessibilità: ruolo `dialog`, focus nel campo all'apertura e di nuovo sulla bolla alla chiusura; i toast salgono sopra la bolla;
  - «Cosa è reale e cosa è simulato» ha la voce «ROSS, al volo»: risposte preparate e regole sulle parole, nessun modello AI.
- **Verificato** a 1440 e 390px: apertura e chiusura, pillole, la proposta a Bruno → Mando → lo spunto compare nel canale e nella scheda Spunti di Bruno, le quattro domande fuori perimetro, la bolla non copre la pillola «Vista demo» né i toast. `npm run build` e `npm run test:sites` passano; mappa rigenerata.
- **Da sapere:**
  - non è una seconda chat da archivio: se una domanda chiede ciò che l'ospite ha raccontato, la risposta è il rifiuto, non un riassunto;
  - le risposte sono testi preparati: per aggiungere una domanda, un intento in `quickAnswer` (attenzione all'ordine: i rifiuti vengono prima);
  - da decidere con le strutture se la bolla serva davvero accanto al canale, o se basti il canale.

### Novembre 2026 · 05/11/2026 · Struttura 2.0: l'header resta in alto, intero e leggibile
- **Richiesta:** su desktop le schede «Il canale · Ospiti» restavano fisse (la regola `.top-tabs{position:fixed}` per le finestre larghe), ma nella 2.0 erano senza sfondo e l'header non era fisso. Scorrendo passavano sopra il contenuto e sulle foto degli ospiti diventavano illeggibili.
- **Fatto (solo nella 2.0):**
  - è fisso l'**intero header** `.s2-top` (marchio e schede): `position:sticky`, sopra il contenuto, con lo sfondo della pagina velato (`color-mix` all'88%) e `backdrop-filter: blur(12px)`. Lo sfondo copre tutta la larghezza, anche oltre i 1180px del contenuto;
  - al primo scroll compare una linea sottile in basso (classe `is-scrolled`, aggiunta da `StructureChannelLayout`);
  - dentro l'header la regola fissa è annullata a tutte le larghezze (`position:static; transform:none`). Selettori con `.s2-app`, così la Struttura attuale non cambia;
  - **schede:** inattive in `var(--muted)`, in hover con sfondo `var(--surface-2)`, attiva con `var(--surface-3)`. Restano su una riga fino a 3 voci, con lo spazio per «Richieste»;
  - **telefono (fino a 700px):** header sticky anche lì; marchio e schede su una riga se ci stanno, altrimenti le schede vanno sotto, a tutta larghezza, su fondo pieno con un bordo;
  - **ancore:** `scroll-margin-top` sugli elementi con `id` e sulla rete delle passioni, così un link a una sezione non finisce sotto l'header. La pillola «Vista demo» (120), i menu (200) e i toast restano sopra l'header (40).
- **Verificato** scrollando a 1400, 1024 e 390px su canale, lista Ospiti e ritratto di Antonio: le schede restano sempre in cima e cliccabili. Dopo l'unione con la PR 53 le tre schede, «Richieste» compresa, stanno su una riga anche a 1024px.

### Novembre 2026 · 05/11/2026 · Struttura 2.0: la scheda «Richieste», le cose pratiche in due direzioni
- **Richiesta:** «Hanno chiesto» stava nel canale, con lo stesso stile degli spunti, e non si capiva che è un'altra cosa: lo spunto è un'occasione di relazione, la richiesta una faccenda pratica. Le cose pratiche vanno in una terza scheda, in due direzioni: dagli ospiti e agli ospiti.
- **Fatto:**
  - **barra della 2.0:** «Il canale · Ospiti · **Richieste**» (`/struttura-2/richieste`). La scheda Richieste ha un pallino, senza numero, quando ci sono richieste da vedere;
  - **canale:** tolto il blocco «Hanno chiesto». Sotto i tre passi c'è solo una riga discreta, «2 richieste nuove dagli ospiti → Richieste», e solo se ce ne sono da vedere. Il canale resta dedicato alle relazioni;
  - **Richieste · Dagli ospiti:**
    - le richieste confermate sono divise in tre gruppi: Da vedere · Ci pensiamo noi · Fatte oggi (solo oggi e ieri, niente storico);
    - ogni card ha foto, nome, stanza, quando, la richiesta in una riga, l'icona della categoria (stanza e oggetti · comfort · piccoli desideri) e «Confermato da …». Azioni «Ci pensiamo noi» e «Fatto», con «Annulla». Una richiesta fatta mostra «ROSS gliel'ha detto» oppure «ROSS glielo dirà alla prossima conversazione»;
    - **richieste ripetute:** se lo stesso ospite chiede di nuovo la stessa cosa non nasce una card nuova, quella esistente mostra «L'ha chiesto di nuovo oggi». Esempio: Bruno e il freddo in camera, ieri e di nuovo oggi;
    - nuovo esempio di lamentela su un servizio, accettata come piccolo desiderio: Teresa, «La minestra della cena arriva fredda»;
  - **Richieste · Agli ospiti** (comunicazioni pratiche, nuove):
    - un modulo con il testo (fino a 160 caratteri), a chi (Tutti · un piano · un ospite, con le foto) e quando dirlo (Oggi · Domani mattina). Sotto, «ROSS lo dirà così» e la spiegazione «Non è uno spunto: è un'informazione…»;
    - l'elenco delle comunicazioni inviate mostra lo stato a parole («In corso» · «Detto a tutti», o «Detto a …» per un solo ospite), mai con un conteggio;
    - esempi: l'acqua calda (tutti, in corso) e il parrucchiere al primo piano (detto a tutti);
  - **tablet di Elena:** in home una card **«ROSS ti dice»** con le comunicazioni per lei, per il suo piano o per tutti, con parole semplici («Domani mattina, fino alle 10, l'acqua calda non c'è. Te lo ricordo domattina.») e «Ho una domanda». La richiesta della lampada e il caso «Sono caduta» restano com'erano;
  - **dati:**
    - nuova origine `comunicazione` nella fonte unica (`moments.js`, `channelStore.js`: `announce`, `toldTo`, filtri `daVedere`, `ciPensiamo`, `fatteOggi`, `comunicazioni`, `comunicazioniPer`);
    - le richieste ripetute aggiornano `richiestoDiNuovo`, il «Fatto» salva `fattoIl`;
    - le comunicazioni non entrano nella storia della persona;
  - **«Cosa è reale e cosa è simulato»:** aggiornato con le comunicazioni.
- **Da sapere:**
  - **contenuto della PR:** il branch parte da quello della PR 51, che contiene anche il passaggio al tu e le richieste pratiche (PR 52). Quei due pezzi non erano ancora arrivati su `main`: la PR 52 era stata unita nel branch della 51, non in `main`. Ora arrivano su `main` tutti insieme;
  - **«Domani mattina»:** sul tablet la comunicazione compare subito, e ROSS dice che la ricorderà domattina.
- **Da decidere con le strutture:**
  1. **lamentele su persone** (staff o ospiti): per ora non si inoltrano. Si accettano solo quelle su cose e servizi, come piccolo desiderio;
  2. **chi riceve le richieste:** tutto lo staff, il coordinatore o la manutenzione? Oggi le vede chiunque apra la scheda;
  3. **richieste ripetute:** basta «L'ha chiesto di nuovo oggi», o serve altro? Per esempio dopo quante volte, o con quale tono, senza diventare una priorità.

### Novembre 2026 · 05/11/2026 · Richieste pratiche: dall'ospite alla struttura, e ritorno
- **Richiesta:** le «richieste pratiche». L'ospite dice a ROSS un piccolo problema della giornata (la lampadina, il bagno, il freddo in camera); se conferma, arriva alla struttura, e quando è risolto ROSS glielo dice. Non è un avviso: parte sempre da una richiesta esplicita e confermata, e ROSS non deduce mai un problema da ciò che sente.
- **Fatto:**
  - **tablet** (`/ross/conversazione`):
    - prima di salutare, Elena dice che la lampada sul comodino non si accende. ROSS chiede «Vuoi che lo dica al personale?» («Sì, diglielo» / «No, lascia stare»): con il sì risponde «Va bene, lo faccio sapere al personale.», con il no lascia stare;
    - se la Struttura 2.0 ha segnato la richiesta «Fatto», la conversazione successiva si apre con «Ciao Elena. Hanno sistemato la lampada sul comodino: adesso la luce va bene?», una volta sola. Se Elena risponde «Non ancora», ROSS chiede se dirlo di nuovo;
    - **caso salute:** all'inizio si può scegliere «Sono caduta». ROSS risponde «Per questo è meglio chiamare subito il personale: puoi usare il campanello qui accanto. Io non sono un sistema di emergenza.» e non crea nessuna richiesta;
  - **Struttura 2.0, canale:** sopra «Cosa è emerso» c'è **«Hanno chiesto»**, una card per richiesta con foto, nome, stanza, quando, la richiesta in una riga e «Confermato da …». Le azioni sono solo «Ci pensiamo noi» e «Fatto», con «Annulla»; con Fatto la card sparisce;
  - **ritratto:**
    - in «Con ROSS» la richiesta è una riga compatta (richiesta + stato);
    - in «Come sta», «Ha chiesto» mostra solo le richieste pratiche confermate. Spariscono dalla 2.0 il ginocchio di Mario (salute) e il desiderio di Antonio di sentire un familiare (emotivo); i dati della Struttura attuale restano;
  - **dati:** origine `richiesta` nella fonte unica dei momenti, con `stato` in attesa · ci pensiamo noi · fatto. Tablet e Struttura 2.0 leggono lo stesso stato, anche in due finestre;
  - **esempi:** Bruno (freddo in camera, in attesa), Lucia (il giornale al mattino, ci pensiamo noi), Carlo (il telecomando, fatto); la lampada di Elena nasce dal tablet. I due vecchi momenti «freddo nel pomeriggio» di Bruno e «ginocchio» di Mario sono stati tolti dalla 2.0;
  - **«Cosa è reale e cosa è simulato»:** il riconoscimento della richiesta è simulato.
- **Da sapere:**
  - **niente sistema di ticket:** nessuna priorità, assegnazione, tempo di risposta, numero o storico per stanza;
  - **il tablet resta al tu:** la richiesta chiedeva il Lei «come nel resto della vista ROSS», ma il copione con Elena è tutto al tu («Ti va di stare un po' insieme?»). Le frasi nuove sono al tu («Vuoi che lo dica al personale?», «puoi usare il campanello»), per non mischiare le due forme nella stessa conversazione. Se si vuole il Lei, va cambiato tutto il copione;
  - **il caso salute** è una terza risposta possibile all'inizio della conversazione («Sono caduta»), per mostrarlo a chi guarda;
  - **il branch** parte da quello della PR 51 (fonte unica dei momenti), non ancora unito a `main`.

### Novembre 2026 · 05/11/2026 · Struttura 2.0 tutta al tu
- **Richiesta:** uniformare tutto al tu.
- **Fatto:**
  - al tu tutti i «Cosa puoi fare» dei momenti (`moments.js`) e le risposte simulate di ROSS (`simulatedReply` in `channel.js`), per esempio «Tienile un posto in fondo» e «Passa a prenderlo tu»;
  - gli «Spunti di ROSS» nel «Come sta» della 2.0 si leggono al tu grazie a una piccola conversione (`tu()` in `PortraitV2.jsx`), senza toccare `careInsights.js`, che serve anche alla Struttura attuale.
- **Da sapere:** la Struttura attuale resta com'era, con gli spunti al voi.

### Novembre 2026 · 05/11/2026 · Struttura 2.0: una sola fonte di momenti, due grafi distinti, ROSS in terza persona, date intorno a oggi
- **Richiesta:** quattro sistemazioni della 2.0, senza toccare la Struttura attuale:
  - un'unica fonte per i momenti emersi con ROSS, con un filtro diverso per canale, Spunti e Con ROSS;
  - due grafi con ruoli distinti;
  - la voce di ROSS sempre in terza persona;
  - le date sempre intorno al giorno reale di oggi.
- **Fatto:**
  - **una sola fonte:**
    - `src/data/moments.js` unisce gli insight del canale, gli spunti passati e i momenti di ogni ospite, senza doppioni. Prima stavano in `initialInsights`, `spuntoHistory` e `highlights.js`, che è stato tolto;
    - `src/state/channelStore.js` è l'unico stato (`useMoments`, `momentFilters`);
    - uno spunto inviato dal canale, dal ritratto o dalla rete crea un momento «spunto» in attesa. Quando ROSS risponde, lo stesso momento prende esito, racconto e cosa fare e torna in cima. Visto/Fatto cambia in un posto e vale ovunque;
  - **tre viste con il loro filtro:**
    - **canale, «Cosa è emerso»:** solo i momenti con «Cosa puoi fare», non ancora Fatti, degli ultimi 7 giorni. Card completa con Visto/Fatto e «Vedi la storia di …», che apre Con ROSS;
    - **Spunti:** solo gli spunti, per esito, in card compatte. «Cosa puoi fare» compare solo finché non è Fatto;
    - **Con ROSS:** la storia, senza gli spunti in attesa. Gli spunti sono una riga compatta («Dal tuo spunto · esito» e il testo) con «Vedi in Spunti», senza ripetere cosa fare;
  - **due grafi, una sola fonte** (`interestGraph.js`):
    - nel canale, «La rete delle passioni · tutta la residenza» mostra solo le passioni con almeno 2 ospiti. L'azione è collettiva e la passione sta nell'indirizzo (`?passione=…`);
    - nel ritratto, «Le passioni di …» mostra solo i suoi interessi, colorati dagli esiti dei suoi spunti, con le foto di chi la condivide. L'azione è individuale («Proponilo come spunto»). Toccando una passione c'è «Vedi chi altro la condivide», che apre la rete già su quella passione;
  - **terza persona:** tutti i testi di ROSS della 2.0, compresa la risposta simulata («ROSS ha nominato Chiara… Non ha insistito: ci tornerà…», «ha chiesto a ROSS se…»). Tolte anche le parole dell'ospite tra virgolette: ora si legge «Ha accettato l'invito di ROSS»;
  - **date intorno a oggi:** `src/data/demoClock.js` (`demoToday`, `at`, `dayLabel`…). I momenti sono scostamenti in giorni da oggi e le etichette si calcolano. Allineate anche:
    - la Famiglia: schermata di blocco, Oggi, Da lei per giorno, settimana e mese, lo spunto salvato;
    - il tablet: la data in home e i giorni dei promemoria («per martedì»), contati da oggi.
- **Da sapere:**
  - la Struttura attuale resta sul suo giorno fisso (`DEMO_TODAY`, lunedì 21 settembre), come chiesto: le due Strutture non mostrano più la stessa data;
  - **contenuti legati al calendario, non toccati:**
    - sul tablet la ricorrenza «Il 23 settembre nasceva Gino Paoli» resta; la sua etichetta ora è «Una ricorrenza» invece di «Mercoledì è una ricorrenza»;
    - nella Famiglia restano testi come «la festa dei compleanni di settembre», «Il primo giorno del mese» e «dopo l'estate», anche se le date ora cambiano;
  - lo stato salvato prima (`ross-struttura2-v1`) non viene più letto: si riparte dai momenti di partenza;
  - i testi di «Cosa puoi fare» sono poi passati al tu: vedi la voce successiva.

### Novembre 2026 · 05/11/2026 · La rete delle passioni sale in cima al canale
- **Richiesta:** la rete delle passioni non deve stare in fondo.
- **Fatto:** nel canale ora viene subito dopo il flusso in tre passi e prima di «Proponi uno spunto» e «Cosa è emerso». L'etichetta è «Da dove partire · la rete delle passioni»: si guarda chi potrebbe fare qualcosa insieme, poi si propone.

### Novembre 2026 · 05/11/2026 · Filtri nel feed di «Con ROSS»
- **Richiesta:** aggiungere il filtro nel feed.
- **Fatto:**
  - sopra il feed ci sono quattro pillole:
    - **Tutto**;
    - **Belle notizie:** ciò che va bene e gli spunti accolti volentieri. Diventa verde quando è attiva;
    - **Da guardare di persona:** diventa corallo quando è attiva;
    - **I tuoi spunti**;
  - una pillola senza momenti è spenta (per esempio Teresa non ha nulla da guardare di persona); se un filtro è vuoto, una frase lo dice;
  - niente conteggi sulle pillole;
  - l'etichetta dei momenti delicati è ora «Da guardare di persona», come il filtro;
  - codice: `feedFilters` in `PortraitV2.jsx`, stili `.v2-feed-filters`.

### Novembre 2026 · 05/11/2026 · «Con ROSS» diventa il feed dei momenti da ricordare
- **Richiesta:** provare «Con ROSS» come feed degli highlights, cioè le cose più interessanti che emergono, con le date e ben formattate.
- **Fatto (ritratto della 2.0):**
  - in alto una card compatta: come vive ROSS, cosa fa volentieri (a parole), la modalità, «Proponi uno spunto»;
  - sotto, **«Cosa è emerso con ROSS, giorno per giorno»**: una linea del tempo, i più recenti in alto;
  - i giorni sono Oggi e Ieri con la data, poi il giorno della settimana, poi «La settimana scorsa» e «N settimane fa» con la data. Ogni momento ha l'ora, un'icona e un colore: verde per ciò che va bene, corallo per ciò che è da guardare di persona, neutro per inviti e spunti. Ha anche il tipo (Di sua iniziativa, Fuori dalla stanza, Con la famiglia, Interesse emerso, Un invito, Una sua scelta, Dal tuo spunto…), un titolo in serif e una riga;
  - **fonti:**
    - 2–4 momenti scritti per ogni ospite (`src/data/highlights.js`);
    - gli insight del canale, con com'è stato accolto lo spunto, «Nuovo» e «Cosa puoi fare»;
    - gli spunti passati;
  - le etichette del canale («Oggi, 11:20», «Venerdì», «2 settimane fa») si convertono in giorni con `dayAndTime` (giorno della demo: lunedì 21 settembre). L'insight sull'orto di Elena ora è «Venerdì», non «Lunedì».
- **Privacy:** solo categorie, scelte e come è andata. Per la famiglia si scrive «alla figlia», non il nome.

### Novembre 2026 · 05/11/2026 · La rete delle passioni, nel canale
- **Richiesta:** fare la rete delle passioni nel canale (prima idea in coda della voce precedente).
- **Fatto:** una card **«Chi potrebbe fare qualcosa insieme»** (all'inizio sotto le due funzioni, poi spostata in cima: vedi la voce successiva):
  - gli otto ospiti in cerchio, con la foto, e al centro sette passioni in comune: lavori con le mani, piante e aria aperta, musica e canto, come funzionano le cose, parole e letture, carte e scacchi, storie e luoghi di una volta. Ogni passione è collegata a chi la condivide;
  - toccando una passione si illuminano le sue persone. A destra si vede cosa ama ciascuno (per categoria), un'occasione e **«Proponilo a tutti e N»**: lo spunto arriva a ognuno ed entra in «In attesa del momento giusto»; ROSS risponde come per gli altri spunti;
  - le etichette si dispongono in cerchio dalla parte delle persone che legano e si allontanano se si toccano. Su telefono la rete diventa un elenco di passioni con le foto.
- **Privacy:** solo interessi dichiarati o emersi con ROSS, detti come categoria. Mai relazioni, ciò che si sono raccontati o chi ha detto sì.
- **Codice:** `PassionNetwork.jsx`, `passions` in `interestGraph.js`, stili `.s2-network-*`.

### Novembre 2026 · 05/11/2026 · Struttura 2.0: «Come sta» e «Con ROSS» a racconto, con la mappa dei legami
- **Richiesta:**
  - il grafico della partecipazione è inutile e le schede sono dei report: bisogna puntare sulla qualità, non sulla quantità;
  - i grafici vanno bene solo a supporto di concetti, mai al centro;
  - provare dei knowledge graph che colleghino interessi e attività.
- **Fatto, solo nel ritratto della 2.0** (la Struttura attuale non cambia):
  - **Come sta:**
    - «In questi giorni»: titolo e racconto di `narrativeFor` (`reportNarrative.js`);
    - tre riquadri: Cosa va bene, Da osservare di persona, Ha chiesto. Gli andamenti sono detti a parole («più del solito»), mai con i numeri;
    - **la mappa dei legami**;
    - «Cosa puoi fare»: il passo suggerito e gli spunti di ROSS, senza le motivazioni con i conteggi;
    - spariscono grafico della partecipazione, numeri della settimana e presenza;
  - **Con ROSS:** «Come vive ROSS» (titolo e testo di `usageStyle`), «Cosa fa volentieri con ROSS» detto a parole (soprattutto… a volte…), la modalità con «L'ha scelta lui/lei». Spariscono percentuali per tipo, tabelle settimanali, minuti e livelli di partecipazione;
  - **mappa dei legami** (`src/data/interestGraph.js`, componente `InterestMap`):
    - la persona al centro, 3 interessi, e attorno attività, ricordi, eventi e altri ospiti con la stessa passione;
    - i colori dicono com'è andato lo spunto: verde è piaciuto, ocra ci sta pensando, grigio non è piaciuto, corallo tratteggiato da provare;
    - si tocca un punto e si legge il consiglio; con «Proponilo come spunto» si apre Spunti con testo e tipo già compilati (`?spunto=…&tipo=…`);
    - sotto, ciò che sta fuori dai suoi interessi e non è piaciuto. Su telefono la mappa diventa un elenco;
  - il racconto di Ada non dice più «4 conversazioni su 6».
- **Da discutere:** quali altri strumenti danno valore alla qualità. Le idee in coda:
  1. ~~**la rete delle passioni**~~: fatta (voce successiva);
  2. **il filo dei momenti belli**: gli spunti accolti e le uscite raccontate dall'ospite, in fila nel tempo, senza conteggi;
  3. **il «prima e dopo» di uno spunto**: proposto, come l'ha accolto, cosa è successo dopo;
  4. **i momenti buoni della giornata**: mattino, pomeriggio e sera detti a parole, per sapere quando proporre;
  5. **la cartolina della settimana**: un paragrafo di ROSS per l'équipe, con una foto scattata dallo staff.

### Novembre 2026 · 05/11/2026 · Allegato dalla chat con titolo, ospite e cartella; bottone in cima al ritratto sistemato
- **Richiesta:** la stessa scelta della cartella anche per l'allegato dalla chat.
- **Fatto (chat «Chiedi a ROSS», Struttura attuale):**
  - con la graffetta, scelto il file, si apre «Aggiungi un file», lo stesso dialog del ritratto, con in più **«Per chi»**: gli otto ospiti, con quello della conversazione o quello trovato nel nome del file già scelto;
  - si sceglie poi il titolo e la cartella;
  - ROSS risponde «Ho messo «…» in «Cosa sa ROSS» di Ada, nella cartella «Dalla famiglia»». Il bottone «Apri «Dalla famiglia»» porta al ritratto con la cartella già aperta (`?tab=allegati&cartella=famiglia`);
  - il dialog sta fuori dal modulo della chat, così «Aggiungi il documento» non invia anche una domanda.
- **Corretto:** nel ritratto della 2.0 il bottone «Aggiungi un documento» in alto portava solo alla scheda «Cosa sa ROSS», e se ci si era già non faceva niente. Ora apre lo stesso menu delle cartelle (Carica dal dispositivo · Aggiungi contenuto testuale) e poi la cartella scelta. Nella Struttura attuale il bottone c'è anche sulla schermata con tutte le cartelle.
- **Cartella nell'indirizzo:** la cartella aperta sta nell'indirizzo (`?tab=allegati&cartella=…`), così il tasto Indietro del browser e i link funzionano.
- **Codice:** il menu con i suoi dialog è `AddDocumentMenu`. Cartelle (`folders`, `familyOf`, `useOf`, `folderChoices`) e dialog (`FolderChoice`, `FileDocumentDialog`, `TextDocumentDialog`, `textDocument`) spostati in `src/components/DocumentDialogs.jsx`, usati dal ritratto e dalla chat.

### Novembre 2026 · 05/11/2026 · Scelta della cartella anche per «Carica dal dispositivo»
- **Richiesta:** la stessa scelta della cartella del contenuto testuale, anche quando si carica un file.
- **Fatto:**
  - scelto il file, si apre «Aggiungi un file», con:
    - l'anteprima (miniatura per le foto, icona per gli altri file), tipo e peso;
    - il titolo, già compilato dal nome del file e modificabile;
    - «In quale cartella», che parte da quella aperta;
  - con «Aggiungi il documento» il file finisce lì; con «Annulla» non si aggiunge niente. Un `.txt` continua a diventare un documento leggibile;
  - la scelta della cartella è un componente comune (`FolderChoice`), usato anche da `TextDocumentDialog`; il nuovo dialog è `FileDocumentDialog`; stili `.file-doc-preview`.

### Novembre 2026 · 05/11/2026 · Scelta della cartella nel contenuto testuale
- **Richiesta:** in «Aggiungi contenuto testuale» poter scegliere la cartella.
- **Fatto:**
  - nel dialog c'è «In quale cartella», con tre pillole: Chi è {nome} · Dalla famiglia · Per stare bene. Parte selezionata la cartella aperta;
  - La sua giornata non si può scegliere, perché la compone ROSS;
  - l'anteprima dice dove finirà il `.txt`. Dopo il salvataggio, se la cartella scelta è un'altra, si apre quella;
  - codice in `TextDocumentDialog` (`choices`, `initial`), stili `.text-doc-folders`.

### Novembre 2026 · 05/11/2026 · «Cosa sa ROSS» in cartelle, con il controllo di cosa dirà ROSS
- **Richiesta:** rendere «Cosa sa ROSS» più chiaro, organizzato in cartelle (le informazioni dell'ospite, ciò che ha condiviso la famiglia, le cose fondamentali per stare bene, la sua giornata). Aggiungere un modo per controllare cosa ROSS sta per proporre, se si vuole vedere se sbaglia qualcosa.
- **Fatto (in tutte e due le Strutture):**
  - la prima schermata mostra quattro **cartelle** (icona, numero di documenti, a cosa serve, chi la scrive): Chi è {nome} · Dalla famiglia · Per stare bene · La sua giornata. Si apre una cartella e si torna con «Tutte le cartelle»;
  - **Per stare bene** raccoglie i promemoria dell'infermeria e le indicazioni di fisioterapisti ed educatori. Prima i promemoria stavano in «La sua giornata»;
  - **La sua giornata** contiene **«Cosa sta per dire ROSS»**:
    - promemoria, attività del calendario (con l'avviso se la modalità non è Attiva) e, nella 2.0, gli spunti in attesa;
    - ogni voce mostra le parole esatte di ROSS;
    - con «Qualcosa non va» si ferma: ROSS non la dirà finché non viene ripresa (toast con «Annulla»);
  - «Aggiungi un documento» sta dentro le cartelle e il documento finisce in quella aperta. Il nome del `.txt` creato da testo non ha più la punteggiatura finale doppia.
- **Codice:** `folders`, `familyOf` (con il vecchio `conoscere` → `persona`), `upcomingFor` e `Attachments` in `ResidentProfile.jsx`; stili `.folder-*` e `.ross-check-*` in fondo a `styles.css`.
- **Da sapere:** fermare una voce è simulato e resta solo nel browser. Per i promemoria dell'infermeria l'app ricorda di avvisarla di persona.

### Novembre 2026 · 05/11/2026 · «Aggiungi un documento» con contenuto testuale
- **Richiesta:** in «Cosa sa ROSS» togliere «Scatta una foto» e lasciare solo «Aggiungi un documento», con la possibilità di caricare un file o di incollare un testo che diventa un `.txt`.
- **Fatto (in tutte e due le Strutture, perché il componente è lo stesso):**
  - un solo bottone, «Aggiungi un documento», con un menu a due voci:
    - **Carica dal dispositivo:** foto, PDF, Word o `.txt`. Un `.txt` viene letto e il suo testo diventa il contenuto del documento;
    - **Aggiungi contenuto testuale:** un dialog con titolo facoltativo e testo da incollare. Nasce un documento «Nome.txt» (tipo "Testo"), che si apre e si legge;
  - nel ritratto della 2.0 il bottone in alto si chiama anche lui «Aggiungi un documento».
- Codice: `textDocument` e `TextDocumentDialog` in `ResidentProfile.jsx`, stili `.text-doc-*` in fondo a `styles.css`.

### Novembre 2026 · 05/11/2026 · Struttura 2.0 senza «Come avvicinarsi»
- **Richiesta:** togliere la scheda «Come avvicinarsi»: nella 2.0 sono gli spunti il modo per avvicinarsi.
- **Fatto, solo nella Struttura 2.0:**
  - il ritratto ha tre schede più Spunti: Spunti · Come sta · Con ROSS · Cosa sa ROSS. Un vecchio link con `?tab=avvicinare` apre Spunti;
  - in Come sta sparisce la card "Come avvicinarsi a …";
  - "Spunti di ROSS" e la card Modalità di Con ROSS portano a **Proponi uno spunto**, al posto degli inviti chiesti a ROSS.
- **Non cambiato:** nella Struttura attuale «Come avvicinarsi» resta com'è. I dati (`approachGuide`, `relating`) non sono stati toccati.

### Novembre 2026 · 05/11/2026 · Struttura 2.0: Ospiti, ritratto e scheda Spunti
- **Richiesta:** riprendere dalla Struttura attuale la scheda Ospiti e i ritratti con i documenti, così come sono. Nel ritratto aggiungere una scheda nuova con gli spunti proposti, quelli piaciuti e quelli non piaciuti, e un minimo di lettura.
- **Fatto:**
  - Struttura 2.0 ha due schede in alto: **Il canale** (`/struttura-2`) e **Ospiti** (`/struttura-2/ospiti`, ritratto in `/struttura-2/ospiti/:id`);
  - lista e ritratto sono **gli stessi componenti** della Struttura (`Residents`, `ResidentProfile`). Il contesto `StructureView` (`Common.jsx`) indica in quale Struttura si trovano: nella 2.0 i link restano nella 2.0 e sono nascosti chat, report e "Avvia conversazione". Al loro posto ci sono "Proponi uno spunto" e "Allega una foto o un file";
  - nel ritratto la scheda nuova **Spunti** è la prima e si apre di default. Contiene:
    - «Cosa ha capito ROSS»: una frase per ospite e i tipi di spunto che funzionano o per ora meno, ricavati da come sono stati accolti, mai da ciò che l'ospite ha raccontato;
    - gli spunti divisi in Sono piaciuti · Ci sta pensando · Non sono piaciuti, o non era il momento · In attesa, più ciò che è emerso senza spunto;
    - il modulo per proporne uno nuovo, già intestato all'ospite;
  - spunti e insight sono ora in uno stato condiviso (`channelStore.js`): uno spunto inviato dal ritratto compare anche nel canale, e viceversa. «Proponi uno spunto» del canale mostra tutti e otto gli ospiti;
  - nuova accoglienza "Non è piaciuto" accanto a quelle che c'erano; 9 spunti più vecchi (`spuntoHistory`) per Elena, Ada, Antonio e Bruno.
- **Da sapere:** le schede Come sta, Come avvicinarsi, Con ROSS e Cosa sa ROSS sono quelle della Struttura, con grafici e segnali "da osservare". Nella 2.0 sono state riprese su richiesta, anche se il canale li esclude.
- **Mappa rigenerata** con `docs/floorplan/aggiorna-mappa.py`, che ora aggiunge anche i file nuovi. Ci sono il gruppo "Struttura 2.0 · il canale" con i suoi 4 file, 3 schermate `/struttura-2…`, il percorso "La struttura propone, ROSS restituisce", una tappa nel giro "Start here" e la voce in cima a "Recent work". Lo script collega anche le pagine che App.jsx carica al bisogno.

### Novembre 2026 · 05/11/2026 · Struttura 2.0: il canale con ROSS
- **Richiesta:** cambiare punto di vista. La Struttura oggi è un archivio (inserisce, consulta, interroga): va provata una logica a **canale**. La struttura manda a ROSS uno spunto, ROSS lo porta all'ospite solo se ci sta, e restituisce di sua iniziativa ciò che è emerso. Per non rompere nulla, è una **vista nuova** e la Struttura attuale resta com'è.
- **Fatto:**
  - nuova vista **Struttura 2.0** (`/struttura-2`), nella pillola "Vista demo" (tasto `5`); la visita guidata non parte da sola qui;
  - una sola schermata: in alto il flusso in tre passi (Tu proponi → ROSS ne parla, se l'ospite ci sta → Tu ricevi cosa è emerso), poi **Proponi uno spunto** e **Cosa è emerso**;
  - **Proponi uno spunto:** foto dell'ospite, testo libero breve, tipo facoltativo (Attività, Ricordo, Evento, Persona). Una riga dice come ROSS lo porterà secondo la modalità dell'ospite (Attiva, Reattiva, Silenziosa);
  - **Cosa è emerso:** 6 insight di esempio su 4 ospiti. Ognuno ha l'ospite, lo spunto di partenza oppure "L'ha raccontato lei, spontaneamente", 1–2 frasi narrative, "Cosa puoi fare" e "… è contenta che tu lo sappia". Un esempio mostra l'ospite che non segue lo spunto (Ada e la nipote). Azioni solo **Visto** e **Fatto**, con "Annulla";
  - nella demo, 6 secondi dopo un nuovo spunto ROSS restituisce un insight preparato (toast con "Leggi"). È dichiarato in "Cosa è reale e cosa è simulato".
- **Non fatto, di proposito:** niente dashboard, KPI, grafici, punteggi, report, trascrizioni o schede da compilare. Panoramica e Report restano solo nella Struttura attuale.
- **Privacy (deciso il 05/11):** la regola d'oro resta valida anche qui. L'insight è un racconto narrativo di **come è stato accolto** lo spunto della struttura (etichetta "Accolto volentieri", "Ci sta pensando", "Non era il momento") e di cosa può aiutare. Non riporta cosa ha raccontato l'ospite. Gli insight spontanei nominano solo un interesse per categoria (il cucito, i treni), mai l'episodio. I testi d'esempio sono stati riscritti con questo criterio.

### Novembre 2026 · 04/11/2026 · Mappa rigenerata dopo gli archetipi
- **Richiesta:** rigenerare la Mappa (poi unito `main` con «Cosa sa ROSS», PR #48, e mappa rigenerata di nuovo).
- **Fatto (senza plugin Floorplan):** nuovo script `docs/floorplan/aggiorna-mappa.py`, che rilegge il codice e aggiorna i dati della mappa e i sorgenti in `docs/floorplan/`.
  - **Ricalcolati:** righe, simboli, hash e collegamenti di 37 file. In tutto 88 collegamenti, compreso il nuovo copione della chat → attività.
  - **Descrizioni nuove:** ritratto, segnali, copione, dati, chat, Famiglia, memoria della demo e stili.
  - **Percorsi:** "Dal ritratto al report" aggiornato con gli archetipi; due nuovi, "La struttura chiede a ROSS di proporre un'attività" e "Anna condivide anche con la struttura".
  - **Giro "Start here":** nuova tappa "Otto ospiti, otto archetipi".
  - **Recent work:** in cima "Ospiti come archetipi e ritratto rivisto"; restano le ultime quattro attività.
  - **Dopo il merge di `main`:** descrizioni e percorsi parlano di «Cosa sa ROSS» (ex Allegati); la copia di Anna per la struttura finisce in «Per conoscerla».
  - **Non rifatto:** il controllo Health.

### Novembre 2026 · 04/11/2026 · «Cosa sa ROSS» e promemoria per le medicine
- **Richiesta:** inserire in ogni profilo un documento della struttura con le medicine da ricordare, e organizzare i documenti utili a ROSS senza disperderli (anteprima approvata, senza le schede conversazionali del tablet).
- **Modifiche:**
  - ritratto: il tab **Allegati diventa «Cosa sa ROSS»**, con le tre sezioni Per conoscerla · La sua giornata · Per stare bene, la striscia "chi lo scrive → cosa ne fa ROSS → dove lo ritrova" e su ogni card chi l'ha scritto, cosa ne fa ROSS e chi lo vede; sezioni vuote come invito;
  - **promemoria per le medicine** in tutti gli 8 profili (documento della struttura: orari, parole dell'infermeria, frase di ROSS con il tu o il Lei, riquadro "Cosa ROSS non fa", consenso);
  - nuovi documenti di Elena: Le persone care, Le date importanti, Appuntamenti della settimana;
  - tablet di Elena: in Promemoria anche quello **dall'infermeria** (stasera alle 19:30); in Spunti per oggi la card **«Oggi in residenza»** (menù, chi c'è di turno, un'attività);
  - aggiornata in `AGENTS.md` la regola sui promemoria (prima: niente farmaci negli esempi).
- **Non inclusi (per scelta):** la scheda dedicata del promemoria dell'infermeria sul tablet e le fonti in «Cosa ricordo di te».

### Novembre 2026 · 04/11/2026 · Gli ospiti diventano archetipi; ritratto, inviti via ROSS e allegati rivisti
- **Richiesta:** rivedere le schede degli ospiti in funzione di ciò che è ROSS oggi. Ogni ospite rappresenta un archetipo (la nuova arrivata, lo scettico, quello che lo adora…), e i contenuti seguono. Poi: la struttura può chiedere a ROSS di proporre un'attività all'ospite, ma non in modalità reattiva; Ada ha solo la biografia d'ingresso e le note della famiglia; documenti simulati per ogni ospite; Carlo usa ROSS come uno strumento; per Antonio, consigli di ROSS per invogliarlo; Mario riservato ma non in "silenzio radio". In corso d'opera: nel + della Famiglia, un interruttore per condividere anche con la struttura.
- **Archetipi** (tabella in §0.4, regole in `AGENTS.md`): solo per il team e per chi presenta, mai etichette nel prodotto.
  - Dati in `src/data/careInsights.js`: `usageStyle` (come usa ROSS, per tipo di conversazione) e `rossTips` (spunti di ROSS per Antonio, Lucia, Bruno e Ada).
  - Le conversazioni in `demoData.js` seguono l'archetipo: Carlo fa domande pratiche brevi al mattino, Antonio fa conversazioni lunghe nel pomeriggio, Mario parla dopo le 17.
- **Segnali corretti:**
  - "Conversazioni più lunghe" di Antonio diventa **da osservare** ("tanto tempo con ROSS, poco fuori"): il successo è il tempo fuori, non i minuti con ROSS. Il positivo di Antonio è "voglia di spiegare".
  - Tolto "meno iniziativa" di Carlo, e la sua partecipazione torna "in linea": per lui parlare poco con ROSS è normale. La risposta a "Carlo si sta chiudendo?" ora lo spiega.
  - Gli scacchi non sono più descritti come "allenare la mente" (lessico da stimolazione cognitiva).
- **Modalità:** Antonio diventa Attiva (ROSS può invitarlo), Mario Reattiva (era Silenziosa). La modalità salvata nel browser vale solo se l'ha cambiata chi usa la demo (`modeSetByUser`), così i nuovi valori predefiniti si vedono anche senza ripristinare.
- **Ritratto, quattro tab:** Come sta · Come avvicinarsi · **Con ROSS** (ex "Conversazioni ROSS") · Allegati.
  - **Come sta:** card "Spunti di ROSS" con cosa fare, il perché (solo andamenti e categorie) e cosa fa già ROSS.
  - **Con ROSS:** come usa ROSS (barre per tipo di conversazione), la modalità con le parole dell'ospite e cosa significa per gli inviti, gli inviti chiesti a ROSS, poi le settimane.
- **Invito tramite ROSS:**
  - **dove si chiede:** da "Attività che potrebbero interessargli" ("Chiedi a ROSS di proporla") o dalla chat ("Proponi ad Antonio la radio in compagnia"; nuovo intent `proponi`);
  - **in modalità Attiva:** si vede come lo dirà ROSS, la richiesta parte e c'è un toast con "Annulla" (`state.rossInvites`, `askRossToInvite`);
  - **in Reattiva o Silenziosa:** un avviso spiega che l'invito non parte. Si può proporla di persona, oppure passare ad Attiva se la persona è d'accordo;
  - **dopo l'invito:** un sì non è una prenotazione; se vuole essere accompagnata, ROSS lo dice alla struttura con il suo permesso; un no non arriva a nessuno.
  - Domande consigliate aggiornate per Staff ed Educatrice; nuovo intent `invogliare` ("Come invogliare Antonio a partecipare?").
- **Allegati:**
  - documenti simulati per ogni ospite, raggruppati per provenienza: **Dall'ingresso** (biografia), **Dalla famiglia**, **Dallo staff**. Mai per tipo o dato sanitario;
  - si aprono in un dialog con il contenuto ("Documento dimostrativo");
  - Ada ha solo la biografia d'ingresso e le note della nipote; Bruno non ha documenti della famiglia.
- **Famiglia → struttura:** nel + c'è l'interruttore **"Anche alla struttura"**, spento di default.
  - Acceso, una copia va negli Allegati di Elena ("Dalla famiglia", `shareWithFacility`) e arricchisce la sua biografia.
  - A ROSS il contributo arriva comunque direttamente: la struttura lo riceve e basta, non lo verifica.
  - In "Da te" il contributo mostra "anche alla struttura".
- **Da fare:** valutare se la copia alla struttura richieda anche il consenso di Elena (§5).

### Novembre 2026 · 03/11/2026 · La visita guidata parte a ogni apertura
- **Richiesta:** far partire l'onboarding ogni volta che si apre la demo.
- **Fatto:** `GuidedTour.jsx` apre il benvenuto a ogni caricamento della pagina (anche dopo "Ripristina la demo"), tranne in `/mappa` e con `?visita=0`. Se si sceglie "Salta" (o ×, Esc) dal benvenuto, si torna alla pagina da cui si era partiti (per esempio `/ross` o `/famiglia`); dopo "Iniziamo" la visita si comporta come prima. Impostazioni spiega `?visita=0`.

### Novembre 2026 · 02/11/2026 · Mappa aggiornata con le ultime modifiche
- **Richiesta:** aggiornare la vista Mappa con le modifiche al tablet e alla conversazione.
- **Fatto (senza plugin Floorplan, con lo stesso script dell'aggiornamento precedente):** ricalcolati righe, simboli, collegamenti e schermate; nuove descrizioni per tablet, stato e dati (schede "una cosa alla volta", promemoria semplici, giochi, "Cosa ricordo di te", "Parla con ROSS" con sottotitoli e scelte, due attività per ospite); percorso "Elena racconta, Anna legge" con il ricordo in bozza e il no che non manda nulla ad Anna; nuovo percorso "Un promemoria, all'ora giusta"; quattro nuove voci in "Recent work". Sorgenti allineati in `docs/floorplan/`. Health non rifatto.

### Novembre 2026 · 02/11/2026 · "Parla con ROSS": una conversazione a voce, con i sottotitoli e scelte vere
- **Richiesta:** rifare la demo della conversazione con ROSS, che resta simulata (si avanza con il mouse o le frecce), emulando il più possibile una conversazione vera.
- **Da Notion:**
  - flusso minimo: ricordo → conversazione → memoria in bozza → racconto autorizzato ([Scheda tecnica](https://app.notion.com/p/40591e1a386a8125bdc1cd5ffd0b7301), [B2C panoramica](https://app.notion.com/p/12af89fa759d468ab4b44ffcffe81355));
  - la persona può accettare, rimandare, interrompere, correggere o rifiutare: «Va bene, possiamo farlo un'altra volta»;
  - solo la voce, con lo schermo come supporto;
  - chiusura verso le persone vere;
  - trasparenza sull'intelligenza artificiale;
  - tono "presenza senza intrusione" ([Tone of Voice](https://app.notion.com/p/363a3a0f4ca145b3812809678bf41dd5)).
- **Prima:** una citazione grande con sotto le note per il pubblico ("ROSS inizia senza imporre un argomento") come se le leggesse Elena, un pannello laterale con etichette e mini-trascrizione da gestionale, e un unico bottone "Elena risponde".
- **Modifiche:**
  - **sottotitoli**: le parole di ROSS compaiono mentre parla; quando parla Elena c'è l'onda della voce e la sua voce diventa testo (in corsivo); sopra, sbiadite, le due battute precedenti; in alto lo stato ("ROSS parla", "Ti ascolto…", "Aspetto la tua risposta") e la frase di trasparenza sull'IA;
  - **scelte vere** nei momenti in cui decide Elena: «Non adesso» all'inizio, musica o fotografia, «Sì, segnatela» / «No, lasciamo stare» per il ricordo nuovo (che resta **in bozza** finché lei non dice sì), «Ti va se lo racconto anche ad Anna?», e l'invito al canto. Con il no, Anna non vede nulla (`completeRossConversation(shared)`, `rossJourney.shared`; la Famiglia ne tiene conto);
  - la cartolina compare solo quando ROSS dice «Te la faccio vedere»;
  - **comandi per chi presenta** in una barra a parte: Indietro, Riproduci/Pausa (avanza da sola e si ferma alle scelte), Avanti, Note; tasti ← →, spazio, N. Le spiegazioni per il pubblico stanno solo nelle Note;
  - **fine**: "Cosa resta di questa conversazione" (resta sul dispositivo, il ricordo, cosa riceve Anna), con "Torna a ROSS" e "Ripeti la conversazione";
  - visita guidata e "Cosa è reale e cosa è simulato" aggiornate.
- **File:** `src/pages/RossExperience.jsx`, `src/state/DemoContext.jsx`, `src/pages/FamilyExperience.jsx`, `src/components/GuidedTour.jsx`, `src/components/PerspectiveSwitcher.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Tablet: il prossimo promemoria e "le altre cose da ricordare"
- **Richiesta:** accanto alla card del promemoria, una seconda card con più promemoria: quello in arrivo e poi gli altri.
- **Modifiche:**
  - la sezione Promemoria del tablet ha due card: **il prossimo** (con "Ascoltalo ora" e "Non ricordarmelo più") e **"Le altre cose da ricordare"**, un elenco in fila nel tempo. Toccando una riga si apre la sua scheda;
  - oltre ai promemoria di Anna ci sono quelli che **Elena ha chiesto lei** a ROSS ("Me l'hai chiesto tu"): il pranzo della domenica e il libro di ricette da restituire (`state.ownReminders`, mai farmaci; niente videochiamate per ora);
  - nella scheda, un promemoria di Elena si legge "mi avevi chiesto di ricordarti: «…»".
- **Nota:** chi ha già usato la demo vede ancora i vecchi esempi (le gocce per gli occhi): basta "Ripristina la demo".
- **File:** `src/pages/RossExperience.jsx`, `src/state/DemoContext.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Tablet di Elena: schede "una cosa alla volta", promemoria semplici, giochi e "cosa ricordo di te"
- **Richiesta:** migliorare la vista ROSS partendo da Notion, a cominciare dai promemoria, con schede dedicate anche a promemoria e attività (giochi). **La home del tablet resta com'è**: solo migliorie.
- **Da Notion:**
  - un promemoria come «alle 14 la pastiglia» è un dato sanitario, e ROSS regge come "app di promemoria" solo se il promemoria è semplice ([Dati sanitari: promemoria…, 2/11](https://app.notion.com/p/40c91e1a386a810aa624dad9a570ad81));
  - la terapia resta fuori da ROSS (scheda Namastè);
  - i promemoria contestuali sono tra i momenti d'uso più promettenti, ma possono essere letti come segno di incapacità ([Ricerca AI - Anziani](https://app.notion.com/p/3fd91e1a386a806c991ee3a0eb2e4622));
  - "solo la voce" e "ROSS chiede prima di usare lo schermo" (non negoziabili; stress test sulla TV).
- **Modifiche:**
  - **schede "una cosa alla volta"** (`RossStage`): si aprono a tutto schermo dalla home. ROSS e la sua frase al centro, sotto "Puoi dirmi:" con le frasi da dire a voce, "Torna a ROSS" in alto. Le novità da Anna passano da qui (al posto del vecchio dialog): se c'è una foto ROSS chiede prima «Te la faccio vedere?»;
  - **promemoria semplici**: nuova sezione **Promemoria** in home ("Te li ricordo stasera alle 21, con le parole di chi li ha lasciati. Non controllo se li hai fatti"), con "Ascoltalo ora" e "Non ricordarmelo più"; nella scheda «Va bene», «Ricordamelo domattina», «Non ricordarmelo più» (`state.reminders`). I promemoria non stanno più tra le novità (l'avviso dice "C'è anche un promemoria: te lo dico stasera"). In `familyMessages.js` tolto il riconoscimento delle medicine e la frase "chiedi pure al personale"; ogni promemoria ha il suo "quando" (per stasera, per domani, per sabato);
  - **esempi senza farmaci**: il messaggio di Anna di oggi ricorda il parrucchiere di domani; la frase d'esempio della dettatura il compleanno di Sofia. Nella Famiglia, la nota del + diventa "I promemoria ROSS glieli ripete la sera, con le tue parole. Non controlla se li ha fatti e non te lo riferisce";
  - **giochi** dal pannello Attività: «Indovina la canzone» (Mina, Modugno, Celentano) e «Il gioco delle parole», senza punteggi né risposte sbagliate;
  - **"Cosa ricordo di te"** dal pannello Ricordi e foto: conferma, correggi («Era blu, non rossa») o dimentica (con conferma);
  - **trasparenza AI**: "Sono ROSS, un compagno digitale basato sull'intelligenza artificiale";
  - **visita guidata**: nuovo passo "Il promemoria, all'ora giusta" (`reminders: true` rimette i promemoria da ricordare); il passo "Spunti per oggi" punta a `.ross-spunti`.
- **File:** `src/pages/RossExperience.jsx`, `src/data/familyMessages.js`, `src/state/DemoContext.jsx`, `src/state/familyNews.js`, `src/pages/FamilyExperience.jsx`, `src/components/GuidedTour.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Vista Mappa aggiornata con le ultime modifiche
- **Richiesta:** aggiornare la vista Mappa (`/mappa`) con le novità delle ultime PR.
- **Modifiche:**
  - i dati della mappa (`window.FLOORPLAN` in `public/mappa-ross.html`) sono stati ricalcolati dal codice attuale: 37 file (nuovi `src/data/familyMessages.js`, `src/data/activities.js`, `src/state/lockScreen.js`, `src/state/familyNews.js`), righe, simboli e collegamenti di import di ogni file; le 16 schermate dalle rotte di `App.jsx` (Da lei, Da te e Insieme al posto di Storia, Attività e Condivisi);
  - descrizioni aggiornate: Famiglia come app per iPhone, tablet con le novità da Anna, pillola "Vista demo" (cornice iPhone, schermata di blocco, ripristino), Ospiti in ordine alfabetico, attività suggerite;
  - percorsi guidati: "Elena racconta, Anna legge" passa dalla notifica sull'iPhone; nuovo percorso **"Anna manda, ROSS riordina, Elena ascolta"**; il giro "Start here" ha una tappa su come ROSS riordina i messaggi;
  - "Recent work" racconta le ultime cinque novità (Famiglia su iPhone, schede Da lei / Da te / Insieme, il + come messaggio libero, visita guidata e ripristino, Ospiti in ordine alfabetico);
  - sorgenti in `docs/floorplan/` (architettura, descrizioni, lavori recenti) allineate alla mappa.
- **Limite:** il plugin Floorplan non è disponibile in questo ambiente, quindi l'aggiornamento è stato fatto con uno script sui dati incorporati. Il controllo automatico (Health) non è stato rifatto: va rigenerato con il plugin quando possibile (istruzioni in `docs/floorplan/README.md`).
- **File:** `public/mappa-ross.html`, `docs/floorplan/`, `docs/HANDOFF.md`.

### Novembre 2026 · Ospiti in ordine alfabetico e attività nel ritratto
- **Richiesta:** togliere l'ordine per attenzione dalla lista Ospiti e mostrare, in "Come avvicinarsi", attività del calendario collegate agli interessi condivisi (anteprima approvata, senza riquadri sulle schede).
- **Modifiche:**
  - lista Ospiti in ordine alfabetico; sottotitolo aggiornato; tolta dallo specchietto la voce "Perché questo ordine";
  - ritratto → Come avvicinarsi: nuova sezione **"Attività che potrebbero interessarle"** sotto "Interessi e spunti" (dati in `src/data/activities.js`: due attività per ogni ospite, legate a interessi della biografia d'ingresso, negli orari del suo momento migliore e con il tu o il Lei che preferisce; se un ospite non ne ha, compare uno stato vuoto). Finestre **Dettagli attività** (prenotazione, accompagnamento, referente) e **Come ROSS potrebbe proporla** (esempio simulato con "sì" e "no", banda "nessun invito è stato inviato"); "Vedi tutte le attività" apre il calendario di esempio;
  - tutti i dati sono dimostrativi: nessun collegamento a un calendario reale, nessun invito inviato, un "sì" non è una prenotazione.

### Novembre 2026 · 02/11/2026 · Tablet: niente voce automatica
- **Richiesta:** togliere la voce che parte da sola quando ROSS racconta le novità da Anna.
- **Modifiche:** tolta la sintesi vocale del browser dal tablet di Elena. Il racconto delle novità resta a schermo, una cosa alla volta (foto grande, frase grande, "Rispondile", "Avanti"); tolto "Ripeti". "Ascolta" sulle schede "Da Anna, per te" apre lo stesso racconto. Aggiornati "Cosa è reale e cosa è simulato" e il passo della visita guidata.
- **File:** `src/pages/RossExperience.jsx`, `src/components/PerspectiveSwitcher.jsx`, `src/components/GuidedTour.jsx`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · "Ripristina la demo" nella pillola Vista demo
- **Richiesta:** un tasto nella vista demo che riporti tutto com'era, dopo aver fatto delle prove (per esempio messaggi di prova mandati da Anna).
- **Modifiche:** nella pillola "Vista demo" c'è **"Ripristina la demo"**. Cancella tutto ciò che la demo ha salvato in questo browser (le chiavi `ross-*`: dati, messaggi di prova, spunti salvati, cornice iPhone, guide aperte o chiuse) e ricarica la pagina sulla stessa vista. Tornano anche la schermata di blocco e l'avviso "Anna ti ha mandato qualcosa" del primo avvio. Dopo il ricaricamento compare "Demo ripristinata: tutto è tornato com'era". Resta anche "Ripristina dati demo" nella card in basso a sinistra della Struttura.
- **File:** `src/components/PerspectiveSwitcher.jsx`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Visita guidata: la notifica sul tablet di Elena
- **Richiesta:** aggiungere alla visita guidata il tablet di Elena con la notifica delle novità da Anna.
- **Modifiche:**
  - il capitolo Elena ha un nuovo secondo passo, **"Anna ti ha mandato qualcosa"** (lente "Comprensibile"): evidenzia l'avviso e spiega che ROSS ha riordinato ciò che Anna ha mandato e lo racconta a voce, una cosa alla volta, con i promemoria per ultimi; la scheda d'apertura del capitolo lo elenca per primo; il capitolo passa a 8 passi;
  - i passi possono chiedere l'avviso con `news: true`: torna visibile anche dopo "Più tardi" e, se Elena aveva già ascoltato tutto, il messaggio di oggi di Anna torna "da ascoltare" (`replayFamilyNews`), così la visita funziona anche a demo già usata.
- **File:** `src/components/GuidedTour.jsx`, `src/pages/RossExperience.jsx`, `src/state/familyNews.js` (nuovo), `src/state/DemoContext.jsx`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Il + diventa un messaggio libero; ROSS riordina e racconta a Elena
- **Richiesta:** il + non deve sembrare un modulo: un campo libero ("raccontale qualcosa, mandale qualcosa"), un microfono per parlare liberamente (trascrizione) e una graffetta per allegare. Sul tablet di Elena un avviso quando arriva qualcosa di nuovo; ROSS rielabora "il marasma" di ciò che manda la famiglia e lo rende fruibile a voce (la foto si vede; "tua figlia ti ha ricordato la medicina").
- **Modifiche:**
  - **Famiglia, il +** (`ComposerSheet`): campo libero, microfono (dettatura del browser in italiano; se il microfono non parte entro 2 secondi, una frase d'esempio scritta come se la si dicesse), graffetta (due immagini della demo o "Dal telefono…", con le foto rimpicciolite a 640px), "Manda". Sotto, in tempo reale, **"Come lo racconterà ROSS a Elena"**. Per i promemoria sulle medicine: "ROSS glielo dirà con le tue parole, ma non controlla se l'ha presa: per le medicine c'è il personale". In Da te, al posto dei quattro riquadri, un campo finto che apre il +; l'elenco mostra il tipo capito da ROSS e "detto a voce"; il dettaglio mostra come lo racconta ROSS;
  - **ROSS rielabora** (`src/data/familyMessages.js`): `elaborate()` divide il messaggio in frasi, separa i promemoria, riconosce foto, domanda, ricordo, musica o pensiero e prepara la frase da dire, con le parole di Anna tra virgolette. Esempio: "Ciao mamma, stasera ti chiamo… Ricordati le gocce per gli occhi" diventa un pensiero e un promemoria;
  - **Tablet di Elena**: avviso "Da Anna, adesso · Anna ti ha mandato N cose. Vuoi che te le racconti?" ("Sì, raccontamele" / "Più tardi"); il racconto è una scheda grande, una cosa alla volta, nell'ordine foto e parole, poi domande, ricordi, musica e infine i promemoria, letta con la voce del browser (Ripeti, Rispondile, Avanti / Ho finito). Le schede "Da Anna, per te" mostrano la frase di ROSS. Nuovo messaggio d'esempio di oggi (dettato a voce) già in attesa sul tablet;
  - stato: `unheard` sui contributi nuovi, `parts` (la rielaborazione), `via` (voce o testo), azione `markFamilyHeard`; nuovi tipi `reminder` e `message`;
  - "Cosa è reale e cosa è simulato": nuova voce "Voce e messaggi".
- **Da discutere con il team:** i promemoria sulle medicine toccano il caso di Namastè (promemoria con avviso all'operatore, §0.7). Oggi ROSS li ripete con le parole di Anna e rimanda al personale, senza controllare né avvisare nessuno.
- **File:** `src/pages/FamilyExperience.jsx`, `src/pages/RossExperience.jsx`, `src/data/familyMessages.js` (nuovo), `src/state/DemoContext.jsx`, `src/components/PerspectiveSwitcher.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Famiglia: le schede seguono la direzione delle cose
- **Richiesta:** ripensare le sezioni: ciò che la famiglia manda con il + in "Da te", ciò che viene da Elena in "Da lei"; decidere dove va Momenti e a cosa serve.
- **Modifiche:**
  - tab bar **Oggi · Da lei · + · Da te · Insieme**: a sinistra del + ciò che arriva da Elena, a destra ciò che parte da Anna e la relazione;
  - **Da lei** (`/famiglia/da-lei`) unisce Momenti e Ricordi: vista **Racconti** (l'ex Momenti, con i filtri Oggi/Settimana/Mese) e vista **Ricordi** (solo quelli raccontati da Elena, con la riga "Altri ricordi Elena li ha tenuti per sé"). Momenti serve a mostrare cosa ha fatto Elena nel tempo, nelle sue parole, e che ROSS è un ponte verso la vita fuori;
  - **Da te** (`/famiglia/da-te`): i contributi di Anna; un contributo "Ripreso con Elena" ha il bottone "Guarda com'è andata", che apre il racconto (la cartolina); in fondo "I ricordi che hai raccontato" (Sofia, la scuola: dalla biografia d'ingresso), che prima stavano tra i ricordi di Elena;
  - **Insieme** (`/famiglia/insieme`, nuova): gli spunti per le prossime chiamate salvati da Oggi (nuovo stato `savedPrompts`, con toast e "Annulla"; uno di esempio), "Tre spunti da ciò che la fa stare bene" (il metodo, prima su Oggi) e "Cosa vedi e cosa no · Decide Elena";
  - **Oggi**: "Salva lo spunto" non crea più un contributo per ROSS ma lo salva in Insieme; senza "Come puoi esserle vicina";
  - i vecchi indirizzi `/famiglia/storia`, `/famiglia/attivita`, `/famiglia/condivisi` reindirizzano; i dettagli tengono la scheda giusta (un ricordo della famiglia torna a Da te, uno di Elena a Da lei);
  - visita guidata: Da lei (racconti), Da lei (ricordi), Da te, Insieme al posto di Momenti, Ricordi, Da te e "Come puoi esserle vicina";
  - la schermata di blocco automatica non accende più la cornice iPhone se è spenta (lo fanno solo la pillola e la visita guidata);
  - rimossi dal repository gli screenshot di prova (`shots/`) finiti per errore in due commit precedenti, e `shots/` è ora in `.gitignore`.
- **File:** `src/pages/FamilyExperience.jsx`, `src/App.jsx`, `src/state/DemoContext.jsx`, `src/state/lockScreen.js`, `src/components/GuidedTour.jsx`, `src/styles.css`, `.gitignore`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Famiglia: il + al centro della tab bar
- **Richiesta:** spostare il **+** dalla barra in alto al centro della barra in basso.
- **Modifiche:** la tab bar ha ora due schede, il **+** (cerchio scuro da 52pt, leggermente rialzato) e altre due schede: Oggi · Ricordi · **+** · Momenti · Da te. La barra in alto tiene solo il logo, o "‹ Indietro", e il titolo. La visita guidata (passo "Da te, per Elena") lo indica al centro della barra in basso.
- **File:** `src/pages/FamilyExperience.jsx`, `src/styles.css`, `src/components/GuidedTour.jsx`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Visita guidata: tutte le schede dell'app di Anna
- **Richiesta:** la visita si fermava a Oggi e non mostrava le altre schermate dell'app di Anna.
- **Modifiche:**
  - il capitolo Famiglia passa a 7 passi: la notifica, poi Oggi (racconto, settimana, come esserle vicina), poi **Momenti** ("Momenti, non misurazioni"), **Ricordi** ("I ricordi di Elena") e **Da te** ("Da te, per Elena"), che spiega anche il **+** e prende il posto del vecchio passo "Condividi con ROSS";
  - la scheda d'apertura del capitolo elenca le quattro schede;
  - dentro l'iPhone l'elemento evidenziato si ferma sotto la barra di navigazione (prima finiva sotto la barra) e lo scorrimento è istantaneo, così l'evidenziazione non insegue la pagina.
- **File:** `src/components/GuidedTour.jsx`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Visita guidata: la notifica è il primo passo della Famiglia
- **Richiesta:** aggiungere la schermata di blocco come primo passo della visita guidata.
- **Modifiche:**
  - il capitolo Famiglia si apre con **"Il primo contatto: una notifica"** (lente "Decide la persona"): l'iPhone di Anna è bloccato e sono evidenziate le notifiche di ROSS. "Anna non apre un'app per controllare: è ROSS a farsi vivo, e solo perché Elena ha scelto di raccontare";
  - il capitolo passa da 4 a 5 passi e la sua scheda d'apertura lo elenca tra le cose da guardare;
  - i passi possono chiedere la schermata di blocco con `lock: true`: la visita la richiede in quel passo e la toglie negli altri (anche tornando indietro); se la cornice iPhone è spenta, si accende;
  - fuori da quel passo, durante la visita la schermata di blocco non compare da sola.
- **File:** `src/components/GuidedTour.jsx`, `src/state/lockScreen.js`, `src/pages/FamilyExperience.jsx`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Famiglia: notifica sulla schermata di blocco
- **Richiesta:** mostrare come arriva ad Anna un racconto di Elena, con una notifica sulla schermata di blocco dell'iPhone.
- **Modifiche:**
  - la prima volta che si apre Oggi (con la cornice iPhone accesa) compare la schermata di blocco: data, ora e due notifiche di ROSS, cioè "Elena ha voluto raccontarti una cosa · Il sorriso di oggi: …" (ora) e "La tua cartolina è arrivata a Elena" (ieri);
  - toccando la prima si apre Oggi, toccando la seconda si apre il momento "La cartolina di Anna"; si sblocca anche scorrendo verso l'alto, con la rotella o con Esc;
  - il testo segue lo stato della demo (conversazione con ROSS, uscita condivisa), come il "sorriso di oggi" della pagina; la logica del racconto di oggi è in `todayLines`;
  - si richiama da "Vista demo" → **"Notifica sulla schermata di blocco"**, che accende anche la cornice iPhone; non compare durante la visita guidata e si chiude se la visita parte;
  - stile: sfondo caldo con i colori della Famiglia, notifiche in vetro in stile iOS, torcia e fotocamera decorative; senza animazioni con "riduci movimento"; il resto dell'app è `inert` finché il telefono è bloccato.
- **File:** `src/pages/FamilyExperience.jsx`, `src/state/lockScreen.js`, `src/components/PerspectiveSwitcher.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Famiglia: Momenti ha una settimana e un mese da mostrare
- **Richiesta:** in Momenti, Settimana e Mese ripetevano i momenti di oggi; inventare contenuti per entrambe.
- **Modifiche:**
  - **Settimana (15–21 settembre):** un gruppo per giorno, con un titolo umano ("La cartolina che le hai mandato", "Fuori, in giardino", "Un momento suo"…). Dentro ci sono momenti con ROSS, un'uscita raccontata da Elena ("In giardino con un'amica") e due conversazioni tenute per sé;
  - **Mese (settembre):** in cima la card "I fili del mese" (gli interessi tornati più spesso, tra i racconti condivisi), poi tre settimane, ognuna con un titolo e una frase di sintesi ("La settimana della Sicilia", "Torna la musica", "Si riprende il filo dopo l'estate") e i suoi momenti principali;
  - regole rispettate: il racconto compare solo se Elena l'ha condiviso, altrimenti il titolo resta generico ("Conversazione libera") con il solo "com'è andata"; le uscite (festa dei compleanni, giardino, canto in salone) compaiono come "Fuori da ROSS · raccontato al ritorno", perché è Elena a raccontarle; nessun punteggio;
  - "La cartolina di Anna" collega Momenti a Da te: il contributo di Anna "Ripreso con Elena";
  - il canto in salone di oggi compare in Momenti solo se Elena ha scelto di raccontarlo ad Anna;
  - nel dettaglio di un'uscita: "Fuori da ROSS, raccontato da Elena" e "Come c'è arrivata" (ROSS ha proposto, ha deciso lei).
- **File:** `src/pages/FamilyExperience.jsx` (`activityDetails` con i campi `day`, `short`, `at`, `outside`), `src/styles.css`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Note dei segnali con la maiuscola quando stanno da sole
- **Richiesta:** in "Come sta questa settimana" la nota di "Partecipazione" iniziava con la minuscola ("ha raccontato 4 attività…").
- **Modifiche:** sistemato alla fonte. `signalDetail` (`src/data/careInsights.js`) mette la maiuscola alla nota quando la mostra da sola, e lo stesso fa il grafico del report (`OperationalPages.jsx`). Il dato resta minuscolo perché serve anche dentro le frasi della chat ("Elena: partecipazione, ha raccontato…"). Corretto in Famiglia, nel ritratto e nel report di Elena.
- **File:** `src/data/careInsights.js`, `src/pages/OperationalPages.jsx`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Famiglia: ogni scheda ha un contenuto suo
- **Richiesta:** Oggi ripeteva pezzi delle altre schede; pulirla.
- **Modifiche:**
  - **Oggi** tiene solo ciò che è di oggi o serve ad agire adesso: il sorriso di oggi, il racconto del giorno, lo spunto per la telefonata, "Come sta questa settimana", "Come puoi esserle vicina";
  - l'elenco dei momenti nel racconto diventa un solo rimando, "Rivedi i momenti di oggi" (Mina, fotografie di viaggio, Cefalù…), che apre Momenti;
  - tolti da Oggi "Ricordi da riaprire insieme" (c'è la scheda Ricordi e lo spunto per la telefonata) e "Porta a ROSS qualcosa di vostro" (basta il **+** in alto, l'azione principale in stile iOS); tolto anche il secondo link "Rivedi i momenti" sotto la settimana;
  - le domande di ogni scheda: Oggi "come sta oggi, cosa le dico?", Momenti "cosa ha fatto con ROSS?", Ricordi "chi è?", Da te "cosa ho portato io?".
- **File:** `src/pages/FamilyExperience.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Famiglia: "Giornata" diventa "Momenti"
- **Richiesta:** "Oggi" e "Giornata" si sovrapponevano come nomi.
- **Modifiche:** la scheda diventa **Momenti** (Oggi · Ricordi · Momenti · Da te), con il titolo "I momenti di Elena" e l'etichetta "Racconti, non misurazioni". Copre giorno, settimana e mese, e riprende parole già usate nell'app ("momenti condivisi", "Rivedi i momenti").
- **File:** `src/pages/FamilyExperience.jsx`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Famiglia: nomi e contenuti presi dal vecchio mockup
- **Richiesta:** valutare cosa prendere dal vecchio mockup ("La giornata di Maria", Benessere, Avvisi, Mente e ricordi) **senza cambiare l'estetica attuale**.
- **Modifiche:**
  - schede in basso rinominate: **Oggi · Ricordi · Giornata · Da te** (prima Storia, Attività, Condivisi); gli indirizzi non cambiano;
  - titoli con sottotitolo umano: "I ricordi di Elena", "La giornata di Elena" (etichetta "Momenti, non misurazioni"), "Cosa hai portato a ROSS" (etichetta "Da te, per Elena");
  - in cima a Oggi una riga rassicurante, adattata dal "Tutto tranquillo" e dal "Momento felice" del mockup: "Con ROSS è stata una bella giornata. Il sorriso di oggi: …", con un solo momento tra quelli condivisi da Elena; parla di ROSS e non della salute;
  - lasciati fuori: battito, passi, sonno, temperatura, idratazione, farmaci, punteggi dei giochi, intensità delle conversazioni (dati sanitari, monitoraggio o punteggi).
- **File:** `src/pages/FamilyExperience.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Toggle "Famiglia su iPhone" nella pillola Vista demo
- **Richiesta:** poter forzare la visualizzazione da telefono dell'app di Anna anche quando si presenta.
- **Modifiche:**
  - nella pillola **"Vista demo"** c'è l'interruttore **"Famiglia su iPhone"** (scorciatoia `I`), attivo di default e salvato con i dati della demo;
  - **acceso:** l'app di Anna sta sempre nella cornice iPhone, a qualsiasi larghezza di finestra (proiettore, laptop, telefono): se lo spazio non basta, il telefono si rimpicciolisce;
  - **spento:** l'app riempie la finestra, come aprendo il link da telefono; sugli schermi larghi resta una colonna da telefono al centro;
  - nuova primitiva `DropdownMenuSwitchItem` in `ui.jsx` (interruttore dentro un menu, che resta aperto).
- **File:** `src/components/PerspectiveSwitcher.jsx`, `src/components/ui.jsx`, `src/state/DemoContext.jsx`, `src/pages/FamilyExperience.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 02/11/2026 · Vista Famiglia come app per iPhone
- **Richiesta:** la vista Famiglia era pensata per desktop; adattarla a mobile seguendo le linee guida Apple per le app iPhone (margini, dimensioni, fruizione da telefono).
- **Modifiche:**
  - **riferimenti HIG applicati:** margini laterali 16pt (20pt dai 430pt in su), aree di tocco ≥ 44pt, testo di base 17pt e mai sotto 11pt (prima c'erano testi da 8–10px), barra di navigazione 44pt + area sicura, tab bar 49pt + indicatore Home, campi da 17px (niente zoom automatico su iOS), `viewport-fit=cover` con `env(safe-area-inset-*)`;
  - **struttura da app:** barra di navigazione in alto (logo o "‹ Indietro", titolo in linea che compare scorrendo, bottone **+** "Condividi con ROSS"), titolo grande serif nel contenuto, **tab bar in basso** con quattro schede (Oggi · Storia · Attività · Condivisi), liste in stile iOS con chevron, controllo segmentato Oggi/Settimana/Mese, filtri a pillole che scorrono in orizzontale;
  - **dialog → sheet dal basso** con maniglia, dentro lo schermo del telefono (`Dialog` in `ui.jsx` accetta ora `container`);
  - **su desktop l'app sta in una cornice iPhone** (393 × 852pt, barra di stato e Dynamic Island simulate) con la didascalia "L'app di Anna, sul suo iPhone"; su telefono è a tutto schermo e la pillola "Vista demo" sale sopra la tab bar;
  - contenuti, consenso e testi invariati; corallo e menta più scuri solo per il testo piccolo (contrasto AA);
  - visita guidata: bersagli aggiornati (`.fam-story`, `.fam-week`, `.fam-resource`, `.fam-add`) e scorrimento dentro lo schermo del telefono;
  - rimosse dal CSS le vecchie regole desktop della Famiglia, ora inutilizzate.
- **Da fare:** rigenerare la mappa Floorplan (`docs/floorplan/README.md`), serve il plugin.
- **File:** `src/pages/FamilyExperience.jsx`, `src/components/ui.jsx`, `src/components/GuidedTour.jsx`, `src/styles.css` (sezione "Vista Famiglia come app per iPhone"), `index.html`, `AGENTS.md`, `docs/HANDOFF.md`.

### Novembre 2026 · 01/11/2026 · Vista "Mappa": la mappatura della demo
- **Richiesta:** usare [Floorplan](https://github.com/haydenschmitty/floorplan) per una nuova visualizzazione della demo con la sua mappatura.
- **Modifiche:**
  - nuova vista **Mappa** nella pillola "Vista demo" (quarta voce, tasto 4, indirizzo `/mappa`): mostra a tutto schermo la mappa generata con Floorplan, con la pillola sempre in basso a destra;
  - la mappa ha 9 parti più due servizi esterni (memoria del browser, hosting Sites), 33 file descritti in italiano, 16 schermate rilevate, tre percorsi guidati ("Lo staff chiede a ROSS", "Dal ritratto al report", "Elena racconta, Anna legge"), un giro "Start here" e "Recent work";
  - controllo automatico di Floorplan pulito: nessun problema trovato.
- **File:** `src/pages/DemoMap.jsx`, `src/App.jsx`, `src/components/PerspectiveSwitcher.jsx`, `src/styles.css`, `public/mappa-ross.html`, `docs/floorplan/` (sorgenti della mappa e README per aggiornarla), `AGENTS.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · Visita guidata: "Indice" per tornare all'inizio
- **Richiesta:** oltre a "Indietro" (passo precedente) serve un modo per tornare all'inizio della visita.
- **Modifiche:** bottone "Indice" in alto a destra di ogni scheda (accanto alla ×, tranne nel benvenuto). Riporta alla prima scheda con l'agenda cliccabile (Il metodo, Struttura, Famiglia, Elena). Da tastiera si usa il tasto Home.
- **File:** `src/components/GuidedTour.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · Visita guidata più solida e metodo più chiaro
- **Richiesta:** le schede del metodo erano poco chiare; nel video la visita "non è proprio top".
- **Problemi visti nel video:**
  - la scheda di un passo compariva per un attimo sulla pagina sbagliata, prima del cambio di pagina;
  - l'evidenziazione inseguiva lo scroll;
  - la scheda ancorata all'elemento a volte lo copriva o finiva in un angolo.
- **Modifiche:**
  - la scheda e l'evidenziazione compaiono **solo quando la pagina è pronta** (pagina giusta, elemento trovato, scroll fermo per qualche fotogramma); intanto resta lo sfondo scurito;
  - **scheda agganciata** in basso al centro (in alto se in basso coprirebbe l'elemento); su telefono a tutta larghezza; entra con una breve dissolvenza;
  - lo scroll porta l'elemento nello spazio libero sopra la scheda; gli elementi più alti dello spazio vengono evidenziati solo nella parte visibile; i livelli fissi (barra, pillola) non fanno scorrere la pagina;
  - "Chiedi a ROSS" punta alle domande consigliate, non a tutta la chat;
  - **metodo riscritto:**
    - scheda 1: due domande a confronto ("Che cosa non va?" e "Che cosa aiuta Elena a stare bene?"), l'esempio di Elena e una nota su salutogenesi e Antonovsky;
    - scheda 2: "Tre domande che ROSS si fa" (Elena capisce cosa succede? Ce la fa con quello che ha? Ne vale la pena, per lei? E chi decide?).
- **Verifica:** script Playwright su computer e telefono con 24 passi; nessuna scheda sulla pagina sbagliata, nessuna sovrapposizione tra scheda ed evidenziazione, nessun errore.
- **File:** `src/components/GuidedTour.jsx`, `src/styles.css`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · La salutogenesi nella demo
- **Richiesta:** il workspace Notion ha molto materiale sulla salutogenesi. Va aggiunta a Struttura e Famiglia (non al tablet di Elena) e spiegata nella visita guidata.
- **Fonti:** Notion "Ricerca su Salutogenesi" (Garista, Antonovsky, Eriksson & Lindström), "Studiare la salutogenesi", landing B2C ("cornice, non prova di efficacia").
- **Modifiche:**
  - **visita guidata:**
    - nuovo capitolo "Il metodo" dopo il benvenuto: "Partiamo da ciò che fa stare bene" e "Comprensibile, gestibile, significativa", con il co-power;
    - un'etichetta "lente" su ogni passo (Comprensibile, Gestibile, Significativo, Risorse, Prima le risorse, Decide la persona, Reciprocità);
    - nuovo passo Famiglia "Come puoi esserle vicina"; il ritratto punta alla card delle risorse; la scheda "ponte verso la vita fuori" richiama la stessa lente;
  - **Struttura:**
    - card "Le risorse di …" in cima a "Come sta" (cosa dà significato, cosa aiuta a farcela, cosa va bene, dai dati esistenti);
    - voce "Il metodo: la salutogenesi" in tutti gli specchietti "Cosa ti dice ROSS";
    - "Risorse da valorizzare" nel report;
    - riga "Metodo" in Impostazioni#privacy;
  - **Famiglia:** card "Come puoi esserle vicina" con 3 spunti (significativo, gestibile, reciprocità: "Chiedile un consiglio"); riga sul metodo in "Come sta questa settimana";
  - **"Cosa è reale e cosa è simulato":** principio "Lente salutogenica";
  - **documentazione:** nuovo `docs/salutogenesi.md`; testi in `src/data/salutogenesis.js`.
- **File:** `src/data/salutogenesis.js` (nuovo), `src/components/GuidedTour.jsx`, `src/pages/ResidentProfile.jsx`, `src/pages/FamilyExperience.jsx`, `src/pages/OperationalPages.jsx`, `src/pages/Settings.jsx`, `src/components/InsightRail.jsx`, `src/components/PageGuide.jsx`, `src/components/PerspectiveSwitcher.jsx`, `src/styles.css`, `docs/salutogenesi.md` (nuovo), `AGENTS.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · ROSS come ponte verso la vita fuori: gli inviti a uscire
- **Richiesta:** ROSS deve incentivare la partecipazione alla vita quotidiana fuori da ROSS: uno dei problemi più grandi è che gli anziani si chiudono. Va fatto dialogare con le altre viste e messo in risalto nella visita guidata.
- **Principio:** invito → uscita → racconto. ROSS sa che qualcuno è uscito solo se è la persona a raccontarlo.
- **Modifiche:**
  - **tablet:**
    - nuova sezione "Oggi, fuori da qui" (`outsideInvites` in `demoData.js`): "Si canta insieme, alle 17:30 in salone" e "Anna ti chiama, dopo cena"; oggi piove, quindi le proposte sono al coperto;
    - "Ci vado" porta a "Ci vediamo dopo il canto in salone" e ROSS resta in silenzio; "Sono tornata" apre "Com'è andata?" e poi "Lo racconto ad Anna?" (stato `outing`, azioni `goOut` e `comeBack`);
    - la conversazione si chiude con l'invito al canto, e la schermata finale ha "Ci vado, al canto";
  - **Famiglia:** se Elena condivide l'uscita, il racconto di oggi ha il momento "Al canto in salone" e lo spunto "Chiedile del canto in salone"; "Come sta questa settimana" mostra anche la partecipazione;
  - **Struttura:**
    - segnale positivo di Elena "partecipazione" ("ha raccontato 4 attività in residenza questa settimana, di solito 2");
    - nuovo intento `accompagnare` ("Chi vorrebbe partecipare ma ha bisogno di essere accompagnato?": Lucia e il giardino, Ada e la lettura, Elena da valorizzare), tra le domande consigliate di Staff ed Educatrice;
  - **visita guidata:**
    - nuovo passo "Chi accompagnare" nella Struttura e nuovo passo "Oggi, fuori da qui" nel tablet;
    - testi della Famiglia e della conversazione aggiornati;
    - prima della chiusura, una scheda grande "ROSS è un ponte verso la vita fuori" con come si vede in ognuna delle tre viste;
  - **"Cosa è reale e cosa è simulato":** anche il calendario della residenza è simulato.
- **Rimandati:** il contributo "Vengo a trovarti" dalla Famiglia; "inviti accolti" come indicatore principale in Panoramica.
- **File:** `src/data/demoData.js`, `src/state/DemoContext.jsx`, `src/data/careInsights.js`, `src/data/chatScript.js`, `src/pages/RossExperience.jsx`, `src/pages/FamilyExperience.jsx`, `src/components/GuidedTour.jsx`, `src/components/PerspectiveSwitcher.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · Visita guidata per capitoli
- **Richiesta:** 15 schede di fila non erano organizzate per tema. Servono capitoli, e al passaggio da una vista all'altra una scheda più grande che dica cosa caratterizza la vista e cosa guarderemo: Struttura, Famiglia, Elena.
- **Modifiche:**
  - **ordine e struttura:** benvenuto con l'agenda delle tre parti (cliccabile), poi Struttura (4 passi), Famiglia (3), Elena (6), chiusura sulla pillola "Vista demo"; 18 schede in tutto;
  - **schede d'apertura dei capitoli:** "Parte N di 3 · chi la usa", "Ora vediamo…", una frase su cosa caratterizza la vista, "Cosa guarderemo" numerato e il bottone "Guardiamoli"; la pagina della vista resta visibile, scurita, dietro la scheda;
  - **passi:** stepper dei capitoli (corrente, visti con ✓, cliccabile per saltare) e avanzamento nel capitolo ("2 di 4 · Struttura");
  - **dati:** in `chapters` (capitolo, testi, `features`, `steps`), da cui si ricava la sequenza.
- **Nota:** l'ordine ora parte dalla Struttura, come chiesto. Prima la visita partiva dal tablet di Elena.
- **File:** `src/components/GuidedTour.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · La Struttura prende l'estetica di Famiglia e ROSS
- **Richiesta:** le viste Famiglia e ROSS non dialogavano con la Struttura; portare la loro estetica anche sulla Struttura.
- **Modifiche (solo CSS, colori invariati):**
  - raggio delle card a 24px (28px per chat, racconto e partecipazione) con ombra morbida;
  - schede in alto a pillole senza cornice, come la navigazione della Famiglia; barra in alto semitrasparente;
  - titoli di pagina in serif più grandi e descrizioni in serif; etichette in maiuscolo;
  - racconto del ritratto in serif; più spazio in cima alle pagine.
- **File:** `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · Visita guidata al posto della modalità presentazione
- **Richiesta:** la modalità presentazione era poco utile. Serve una modalità di onboarding che spieghi passo per passo cosa si trova nelle schermate, con un elemento evidenziato e una nota ("clicca qui per…"), seguendo le buone pratiche di UI/UX.
- **Buone pratiche applicate:**
  - un elemento alla volta, testi di una o due frasi, avanzamento "3 di 15";
  - si può sempre saltare, andare indietro o chiudere;
  - il focus entra nella scheda e il resto della pagina è `inert`;
  - tastiera completa (Esc e frecce); niente animazioni con "riduci movimento".
- **Modifiche:**
  - nuovo `src/components/GuidedTour.jsx` con 15 passi in 4 capitoli: Benvenuti, il tablet di Elena (6 passi, conversazione compresa), la famiglia (3), la struttura (4), più la pillola "Vista demo";
  - a ogni passo la visita porta alla pagina giusta, aspetta l'elemento, lo scorre al centro e lo evidenzia;
  - la scheda si mette sotto, sopra o di fianco all'elemento; su telefono va in basso; se l'elemento non c'è (per esempio la sidebar su mobile), va al centro;
  - si avvia dalla pillola "Vista demo", dal menu della card in basso a sinistra, da Impostazioni ("Inizia la visita") o con `?visita=1` (anche il vecchio `?presentation=true`);
  - tolti la modalità presentazione (stato `presentation`, `togglePresentation`, bottone "Avanti", `presentationRoutes`) e le sue regole CSS.
- **File:** `src/components/GuidedTour.jsx` (nuovo), `src/App.jsx`, `src/components/PerspectiveSwitcher.jsx`, `src/components/Layout.jsx`, `src/pages/Settings.jsx`, `src/state/DemoContext.jsx`, `src/styles.css`, `AGENTS.md`, `README.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · shadcn/ui in tutte le viste, colori invariati
- **Richiesta:** applicare shadcn/ui (https://github.com/shadcn-ui/ui) senza modificare i colori. Scelta: estendere le primitive già in uso nella Struttura a Famiglia e tablet ROSS, senza Tailwind.
- **Modifiche:**
  - **`ui.jsx`:**
    - `Dialog` accetta `className`;
    - nuove primitive `Input` e `Textarea` (stessi colori, anello di focus come i bottoni);
    - nuove `Tabs`, `TabsList` e `TabsTrigger` (Radix Tabs, nuova dipendenza `@radix-ui/react-tabs`: frecce da tastiera e ruoli ARIA), che conservano le classi esistenti;
  - **Famiglia:** i modali (nuovo contributo, dettaglio dei condivisi) diventano `Dialog` con la classe `family-dialog`, che porta le variabili `--family-*`; i campi del modulo diventano `Input` e `Textarea`; "Oggi / Settimana / Mese" e i filtri di Storia e foto diventano `Tabs`;
  - **ROSS:** i pannelli (ricordi, attività, musica, aiuto) diventano `Dialog`;
  - **Struttura:** le schede del ritratto diventano `Tabs` e gli orari in Impostazioni diventano `Input`;
  - **toast di Sonner in tutte le viste:** tolti il vecchio toast di Famiglia e ROSS (`toast` in `DemoContext`) e il componente `Modal` di `Common.jsx`.
- **File:** `src/components/ui.jsx`, `src/components/Common.jsx`, `src/App.jsx`, `src/state/DemoContext.jsx`, `src/pages/FamilyExperience.jsx`, `src/pages/RossExperience.jsx`, `src/pages/LiveInteraction.jsx`, `src/pages/ResidentProfile.jsx`, `src/pages/Settings.jsx`, `src/styles.css`, `package.json`, `AGENTS.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · Home del tablet senza occhi
- **Richiesta:** togliere dalla home del tablet gli occhi di ROSS e l'etichetta "Con te".
- **Modifiche:** il saluto occupa tutta la larghezza; gli occhi restano solo nella conversazione e nella schermata finale.
- **File:** `src/pages/RossExperience.jsx`, `src/styles.css`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · Home del tablet a spunti di conversazione
- **Richiesta:** la home di ROSS deve proporre spunti, come nel riferimento condiviso: meteo spiegato come occasione ("oggi piove, è il giorno giusto per…"), ricorrenze (il compleanno di un cantante → una sua canzone) e soprattutto i contributi che la famiglia sceglie di condividere.
- **Modifiche:**
  - **testata:** meteo e ora;
  - **saluto:** "Buon pomeriggio, Elena." con la data;
  - **"Spunti per oggi":** "Oggi piove: un pomeriggio da fotografie" porta alla conversazione su Cefalù; "Il 23 settembre nasceva Gino Paoli" propone «Il cielo in una stanza» di Mina;
  - **"Da Anna, per te":** fino a 3 contributi da `state.familyContributions` (foto, ricordo, argomento, musica), con quelli non ancora ripresi per primi; ciò che Anna aggiunge dalla vista Famiglia compare subito qui;
  - **dati:** nuovo contributo demo "Quando eri la maestra di quinta";
  - **"Cosa è reale e cosa è simulato":** aggiunta la voce su meteo, ora e ricorrenze.
- **File:** `src/pages/RossExperience.jsx`, `src/state/DemoContext.jsx`, `src/components/PerspectiveSwitcher.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · Tablet di Elena in tema chiaro
- **Richiesta:** passare la vista ROSS al tema chiaro.
- **Modifiche:**
  - variabili `--ross-*` sulla palette crema e verde scuro della Struttura, con la nuova `--ross-ink` per bordi e velature (al posto dei bianchi trasparenti);
  - sfondo con un alone caldo arancio; occhi senza fusione `screen`;
  - "Parla con ROSS" e la modalità attiva diventano pulsanti scuri;
  - colori di Elena, dei badge "nuovo" e della pillola "Vista demo" leggibili sul fondo chiaro.
- **File:** `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · Modali della vista Famiglia di nuovo visibili
- **Problema:** cliccando "Condividi" nella vista Famiglia, il modale "Racconta un ricordo" compariva spostato in basso e tagliato.
- **Causa:** `.screen-enter` animava `transform` con fill-mode `both`. L'animazione restava in effetto e il contenitore della pagina diventava il riferimento per gli elementi `position:fixed`, quindi l'overlay si centrava sull'intera pagina invece che sulla finestra.
- **Fix:** fill-mode `backwards` in `src/styles.css`. L'entrata resta uguale; finita l'animazione l'overlay torna fisso sulla finestra. Vale anche per i modali della vista ROSS.
- **File:** `src/styles.css`, `docs/HANDOFF.md`.

### Ottobre 2026 · 20/10/2026 · Demo per l'incontro con Papa Luciani / Promozione Lavoro
- **Richiesta:** rivedere la demo alla luce del workspace Notion (sintesi strategica e audit del 19–20/10, brief Papa Luciani, protocolli Namastè e Borgo Mazzini) per l'incontro del 21/10.
- **Perché:** la demo deve diventare uno strumento di ricerca centrato sulla persona; lo strumento per lo staff non va proposto come prodotto; va detto cosa è simulato.
- **Modifiche:**
  - pillola "Vista demo": nuova voce **"Cosa è reale e cosa è simulato"** (dialog con ciò che è simulato e i principi in progettazione);
  - percorso "Avanti": `/ross` → conversazione → Famiglia → attività → chat (`?q=emerso`) → ritratto di Elena → Come avvicinarsi → Impostazioni#privacy;
  - **vista ROSS:** riga di trasparenza ("Sono ROSS, un programma… non sono una persona. Quello che ci diciamo resta qui"); Aiuto con parole proprie, "ROSS non è un sistema di emergenza", "Dimentica quello che ti ho detto" con conferma; modalità allineate a quelle della struttura con le parole di Elena (via "Riposo"); fine conversazione che rimanda ad Anna; "Ho salvato la nostra conversazione" diventa "Mi ricorderò di quello che mi hai raccontato, e resta qui tra noi"; testo dei modali leggibile sul fondo scuro;
  - **ruolo Educatrice** (Giulia Serra, con login) con tre nuovi intenti: `attivita` (attività che coinvolgono rispetto alla media personale), `spunti` (uno spunto per ospite), `momenti` (fasce con meno conversazioni);
  - **Documenti → Allegati:** facoltativi e non strutturati; si allega una foto (anche dalla fotocamera del telefono) o un file dal tab o dalla chat; niente tipi Fisioterapia/Esami, esempi senza dati sanitari; intento `allegati` al posto di `documenti`; `?tab=documenti` porta ad Allegati; gli allegati della demo vengono sempre dal dataset.
- **Non fatto (deciso in chat):** pannello "Chi riceve cosa" (il consenso resta famiglia ↔ Elena); promemoria con avviso all'operatore e date di ottobre, rimandati a dopo l'incontro.
- **File:** `src/components/PerspectiveSwitcher.jsx`, `src/pages/RossExperience.jsx`, `src/data/chatScript.js`, `src/pages/ResidentProfile.jsx`, `src/pages/AskRoss.jsx`, `src/state/DemoContext.jsx`, `src/data/demoData.js`, `src/components/PageGuide.jsx`, `src/components/InsightRail.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### PR #27 · 27/09/2026 · Schede ospite con foto
- **Richiesta:** usare le foto del collage al posto delle iniziali e rendere la scheda ospite meno confusa: foto grande, nome, età, stanza, modalità, ultima conversazione con ROSS e al massimo un avviso su un tema da osservare.
- **Modifiche:**
  - 8 foto ritagliate dal collage in `public/ospiti/ID.webp`; `Avatar` le usa ovunque (lista, ritratto, chat, report), con le iniziali come ripiego;
  - scheda della lista Ospiti: foto grande con la modalità sovrapposta, nome, età e stanza, ultima conversazione, un solo avviso (il primo tra assenza insolita e segnali da osservare; i bisogni non generano avvisi); tolti la pillola della partecipazione, il chip "Va bene", i bisogni, il "+N" e gli interessi; la scheda si apre anche da tastiera;
  - specchietto "Cosa ti dice ROSS" della pagina Ospiti e regole in `AGENTS.md` aggiornati.
- **Nota:** in copertina l'equilibrio positivo / da osservare non c'è più; resta nel ritratto, nel riepilogo e nella chat.
- **File:** `public/ospiti/*.webp`, `src/components/Common.jsx`, `src/pages/Residents.jsx`, `src/components/PageGuide.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### PR #26 · 27/09/2026 · Le analytics della struttura escono dai Report
- **Richiesta:** il Riepilogo d'équipe non deve stare in Report; serve una sezione a parte, accanto a Report, organizzata come un'app (non come un foglio), con tutti i grafici e la descrizione di ognuno, non troppo complessa, sempre stampabile/scaricabile.
- **Modifiche:**
  - nuova scheda **Panoramica** (`/panoramica`) dopo Report: sintesi, 6 numeri chiave in card, grafici in tre gruppi con "Cosa mostra" e "Come leggerlo", punti da discutere; periodo, "Scarica riepilogo" e "Stampa" in testata;
  - la stampa usa il Riepilogo d'équipe esistente, tenuto fuori schermo (così i grafici hanno dimensioni anche in stampa);
  - **Report** mostra solo il "Come sta" dell'ospite scelto: tolti i tab Riepilogo d'équipe / Singolo ospite;
  - redirect: `/analytics` e `/report?ambito=struttura` → `/panoramica`; chat, menu "…" e guida della chat puntano alla Panoramica; nuovo specchietto `overviewGuide`, `reportsGuide` riscritto; percorso "Avanti" della presentazione passa da Panoramica e dal report di Elena.
- **File:** `src/pages/OperationalPages.jsx`, `src/App.jsx`, `src/components/Layout.jsx`, `src/components/PageGuide.jsx`, `src/components/InsightRail.jsx`, `src/components/PerspectiveSwitcher.jsx`, `src/data/chatScript.js`, `src/pages/AskRoss.jsx`, `src/styles.css`, `AGENTS.md`, `docs/HANDOFF.md`.

### PR #25 · 27/09/2026 · Rimandi all'handoff da README e AGENTS
- Ripresi dalla PR #11 (prima versione di questo documento, ormai superata e chiusa) i due rimandi che mancavano su `main`: sezione "Passaggio di consegne" nel `README.md`, che indica la §0 a chi arriva ora, e riga in testa ad `AGENTS.md` ("leggilo prima di lavorare").
- Solo documentazione.
- **File:** `README.md`, `AGENTS.md`, `docs/HANDOFF.md`.

### PR #24 · 27/09/2026 · Passaggio di consegne per il team
- **Richiesta:** aggiornare questo documento per dare il contesto al team.
- **Modifiche:**
  - nuova **§0 "Per chi arriva ora"**: cos'è ROSS e perché la demo, la filosofia in sei frasi con esempi, le tre viste e chi le usa, i personaggi della demo, un giro della demo in 5 minuti, le tappe per tema, le domande per il team, il glossario;
  - guida "Come leggerlo" in testa al documento;
  - in §5 i punti 12 (percorso "Avanti" da riallineare) e 13 (frecce precedente/successivo).
- Solo documentazione, nessuna modifica al codice.
- **File:** `docs/HANDOFF.md`, `AGENTS.md`.

### PR #23 · 27/09/2026 · Barre cliccabili nel Riepilogo d'équipe
- **Richiesta:** dal grafico "Ognuno rispetto alla propria media" aprire il report di ciascun ospite, così il riepilogo fa anche da indice.
- **Modifiche:**
  - `DivergingBars` accetta `onSelect`: le righe diventano bottoni (mouse, Invio/Spazio), con una freccia che compare al passaggio del mouse o con il focus, il nome sottolineato e "apri il report" nel tooltip;
  - nel Riepilogo ogni riga apre `?ospite=ID`, anche Ada, che non ha barra; sotto il grafico, solo a schermo, la nota "Tocca un nome per aprire il suo report";
  - aprendo un report, anche dal link "Report →" della tabella, la pagina torna in cima;
  - "Cosa coinvolge di più" resta non cliccabile; in stampa niente freccia né nota.
- **File:** `src/components/ReportCharts.jsx`, `src/pages/OperationalPages.jsx`, `src/styles.css`, `AGENTS.md`.

### PR #22 · 27/09/2026 · Report più visivi: infografiche
- **Richiesta:** nella sezione Report della Struttura mancavano grafici e infografiche.
- **Regole:** ogni grafico confronta ciascuno con sé stesso (mai classifiche tra ospiti); la voce della struttura mostra la soglia di anonimato di 3 ospiti; colore con un solo significato e sempre con etichetta o legenda; palette validata con lo script della skill dataviz (`#1b8a70` / `#d4552f` passano tutti i controlli).
- **Riepilogo d'équipe:**
  - KPI "ospiti con ROSS" e "tempo con ROSS" con variazione rispetto al periodo precedente (solo se ci sono dati: a 7 giorni −5%, a 30 giorni nessun confronto) e sparkline dei minuti;
  - "Ognuno rispetto alla propria media": barre divergenti per ospite al posto della barra impilata (Ada: "ROSS la sta ancora conoscendo");
  - "Cosa hanno espresso questa settimana": barre per segnale, prima i positivi, nomi nel tooltip;
  - "Voce della struttura" con linea della soglia di anonimato e "Di cosa hanno bisogno" per tipo di bisogno (nuovo campo `category` su `needs`);
  - presenza in schede (minuti al giorno, mappa oraria) più "Cosa coinvolge di più": durata delle conversazioni per tipo di attività rispetto alla media di chi le fa.
- **Singolo ospite:** "Questa settimana rispetto al solito" (dumbbell di solito → questa settimana; i segnali con nota restano testo), bisogni, conversazioni per settimana (solo da quando la persona conosce ROSS), momenti della giornata, "Cosa coinvolge {nome}"; legenda sul grafico della partecipazione.
- **Stampa:** schede che non si spezzano, colori conservati, tooltip nascosti.
- **File:** `src/components/ReportCharts.jsx` (nuovo), `src/pages/OperationalPages.jsx`, `src/data/reportNarrative.js`, `src/data/careInsights.js`, `src/components/ParticipationChart.jsx`, `src/styles.css`, `AGENTS.md`.

### PR #21 · 26/09/2026 · Vista Famiglia riallineata: consenso dell'ospite, niente struttura in mezzo
- **Richiesta:** sistemare anche la vista Famiglia con la stessa filosofia.
- **Decisioni:** la famiglia vede racconti e ricordi solo se Elena sceglie di condividerli, con il consenso visibile; tolti il programma della residenza e "Scrivi alla struttura".
- **Modifiche:**
  - consenso: `sharedWithFamily` sui ricordi (gli spaghetti alle vongole restano privati), `shared` sui momenti; la chiacchierata delle 17:18 è privata finché nella conversazione ROSS chiede "Ti va se lo racconto anche ad Anna?" ed Elena risponde "Sì, raccontaglielo";
  - badge "Elena ha voluto raccontartelo" e dicitura "Elena ha tenuto questo racconto per sé";
  - contributi della famiglia direttamente a ROSS: stati "Disponibile a ROSS" e "Ripreso con Elena"; via "Da verificare", "in verifica", "verificato dalla struttura";
  - home: "Come sta questa settimana" (serenità e gratitudine di Elena) al posto di "Domani in residenza"; racconto del giorno in due stati, prima e dopo la conversazione;
  - Storia e foto e dettaglio ricordo: provenienza "Raccontato da Elena" / "Dalla famiglia" al posto dello stato di verifica;
  - Attività: tolta la striscia "Vita in residenza"; Condivisi da me: "già ripresi con Elena" / "in attesa del momento giusto"; tolto il tipo "Scrivi alla struttura";
  - vista ROSS: solo il copione della conversazione e la schermata finale ("Racconterò ad Anna il nuovo ricordo, come mi hai chiesto").
- **File:** `src/pages/FamilyExperience.jsx`, `src/pages/RossExperience.jsx`, `src/state/DemoContext.jsx`, `src/data/demoData.js`, `src/styles.css`, `AGENTS.md`, `docs/contratto-informativo-struttura.md`.

### PR #20 · 26/09/2026 · Passaggio di consegne aggiornato e testi narrativi allineati
- **Controllo di coerenza:** i segnali positivi arrivano da un'unica fonte (`careInsights.js`) e compaiono nella lista, nel ritratto, nella chat e in entrambi i report; le schede e il riepilogo mostrano un positivo per ospite, il ritratto e il report tutti.
- **Testi narrativi** (`reportNarrative.js`, usati nel ritratto e nel report) riscritti per citare anche ciò che va bene: buonumore di Lucia e Carlo, tranquillità di Mario, gratitudine di Elena, iniziativa di Teresa, curiosità di Ada.
- Sezioni 1–5 riallineate allo stato dopo la PR #19: sidebar con "Cosa va bene" e specchietti, ritratto, due report, decisioni su equilibrio, lessico, confronti con sé stessi e "Come avvicinarsi", mappa del codice con i nuovi helper, questioni aperte (viste Famiglia e ROSS, nomi dei documenti, contenuti da validare).
- Voci del changelog del branch etichettate con il numero di PR (#12–#19); riferimenti Notion "TOV guidelines" e "Keywords" aggiunti.

### PR #19 · 26/09/2026 · Più equilibrio tra ciò che va bene e ciò che è da osservare
- **Richiesta:** trend e insight pendevano sul negativo; serve un buon mix, anche nello stesso ospite.
- **Modifiche:**
  - dati: ogni ospite ha almeno un segnale positivo (buonumore, tranquillità, gratitudine, curiosità, voglia di raccontare, più iniziativa, conversazioni più lunghe); i 4 da osservare restano; voce della struttura con il nuovo tema "Gentilezza del personale"; solo Carlo resta sotto la sua media;
  - lista Ospiti: chip verde "Va bene" prima dei motivi di attenzione; ritratto: prima ciò che va bene, poi ciò che è da osservare;
  - sidebar della chat: nuovo accordion "Cosa va bene" e voce nella guida;
  - chat: intento "Cosa sta andando bene?", domande consigliate per i tre ruoli, riga "Da valorizzare" nella risposta sulle priorità; tolto l'ultimo "/10" dalle risposte;
  - riepilogo d'équipe: sintesi che parte dal positivo, KPI "con segnali positivi", chip positivi per ospite, punto "Da valorizzare"; report del singolo ospite con la sezione "Da valorizzare".
- **File:** `src/data/careInsights.js`, `src/data/chatScript.js`, `src/data/reportNarrative.js`, `src/data/demoData.js`, `src/pages/Residents.jsx`, `src/pages/ResidentProfile.jsx`, `src/pages/OperationalPages.jsx`, `src/components/InsightRail.jsx`, `src/components/PageGuide.jsx`, `AGENTS.md`, `docs/contratto-informativo-struttura.md`.

### PR #18 · 26/09/2026 · Lessico e tono di voce dalle linee guida Notion
- **Richiesta:** togliere "cartella" e le altre parole cliniche; allineare il tono delle schede Chiedi a ROSS, Ospiti e Report alle linee guida Notion ("TOV guidelines", "Keywords").
- **Decisione:** la pagina di un ospite si chiama **ritratto**.
- **Modifiche:**
  - "cartella" → "ritratto" in link, pulsanti, guide e titoli (eyebrow "RITRATTO · STANZA …");
  - via "diagnosi", "valutazione clinica", "valori clinici", "documenti sanitari", "cartella clinica": ora "ROSS non giudica la salute di nessuno", "i documenti ufficiali restano nel gestionale";
  - "baseline" → "media personale" / "ROSS la sta ancora conoscendo"; "Ingaggio con ROSS" → "Presenza con ROSS";
  - "disorientamento" → "ha fatto fatica a seguire il filo"; "stati d'animo" → "umore"; "rilevato" → "notato"; "infermeria" → "chi se ne occupa"; "profilo" → "card in basso";
  - "cinque punti cardinali" tolto dai testi visibili;
  - nuovo `docs/lessico-struttura.md` con principi, tabella delle sostituzioni e checklist; regola in AGENTS.md.
- **Restano:** i nomi dei documenti caricati dalla struttura (es. "Fisioterapia") e gli identificativi interni del codice. Le voci precedenti del changelog restano come sono state scritte.

### PR #17 · 26/09/2026 · Lo specchietto va nella sidebar
- **Richiesta:** lo specchietto "Cosa ti dice ROSS" deve stare sempre nel menu laterale, come nella chat, non in cima alla pagina.
- **Modifiche:** su Ospiti (lista) e Report la sidebar resta larga (320px) e contiene lo specchietto della pagina, aperto di default; tolto dal corpo delle pagine. La cartella del singolo ospite mantiene la sidebar a icone. Su mobile compare nel menu dall'hamburger.
- **File:** `src/components/PageGuide.jsx`, `src/components/Layout.jsx`, `src/pages/Residents.jsx`, `src/pages/OperationalPages.jsx`, `src/styles.css`, `AGENTS.md`.

### PR #16 · 26/09/2026 · "Cosa ti dice ROSS" anche in Ospiti e Report
- **Richiesta:** portare lo specchietto verde della chat anche nelle schede Ospiti e Report, per contestualizzare la filosofia: a cosa servono, cosa si trova, perché sono fatte così.
- **Modifiche:** nuovo `PageGuide` (stesso stile verde con la bussola), chiuso di default e apribile, con 5 voci per pagina e domande da fare alla chat; nascosto in stampa.
  - Ospiti: perché questo ordine, ognuno confrontato con sé stesso, la cartella, cosa non trovi e perché, ROSS segnala e voi decidete.
  - Report: Riepilogo d'équipe, Singolo ospite, perché anche su carta, come si leggono i numeri, cosa non c'è.
- **File:** `src/components/PageGuide.jsx`, `src/pages/Residents.jsx`, `src/pages/OperationalPages.jsx`, `src/styles.css`, `AGENTS.md`.

### PR #15 · 26/09/2026 · Report: Riepilogo d'équipe e Singolo ospite
- **Richiesta:** rivedere la sezione Report con la stessa filosofia; l'équipe sceglie tra il report generale sulla struttura e quello del singolo ospite.
- **Modifiche:**
  - pagina Report con i tab **Riepilogo d'équipe** (default) · **Singolo ospite** (preimpostato sull'ospite che ha più bisogno di attenzione);
  - Riepilogo d'équipe sui cinque punti cardinali: sintesi generata, KPI, ospiti sopra / in linea / sotto la propria media (niente baseline unica), segnali per tipo, voce della struttura con azione suggerita, situazione per ospite ordinata per attenzione, minuti al giorno e mappa oraria calcolati dalle conversazioni (tornano con la chat), punti da discutere con caselle;
  - Singolo ospite: KPI di partecipazione rispetto alla media (via "/10"), benessere degli ultimi 7 giorni, **Come avvicinarsi** (3 passi e 2 interessi principali), checklist **Da osservare in équipe**;
  - rimossi "Crescita della memoria", istogramma delle durate, torta delle tipologie, icone "i" e `dailyMetrics`;
  - helper condivisi `attentionFor`, `attentionScore`, `byAttention`, `trendOf` in `careInsights.js`; `facilityVoice` ha un'azione suggerita;
  - chat e menu: "Riepilogo d'équipe" al posto di "Report di struttura".
- **File:** `src/pages/OperationalPages.jsx`, `src/data/reportNarrative.js`, `src/data/careInsights.js`, `src/pages/Residents.jsx`, `src/data/demoData.js`, `src/data/chatScript.js`, `src/pages/AskRoss.jsx`, `src/components/InsightRail.jsx`, `src/styles.css`, `AGENTS.md`.

### PR #14 · 26/09/2026 · "Come avvicinarsi" diventa una guida pratica
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

### PR #13 · 26/09/2026 · Vista Ospiti riallineata al contratto informativo
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

### PR #12 · 26/09/2026 · Tre stakeholder, domande consigliate e passaggio di consegne
- **Anche:** nasce questo documento (`docs/HANDOFF.md`), con la regola in AGENTS.md di aggiornarlo a ogni modifica.
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
  - *Riorganizzare la piattaforma R.O.S.S. lato RSA* ed *estratto convo fede ale*;
  - *TOV guidelines* e *Keywords* (Marketing & Brand): tono di voce e parole da usare o evitare.
- Documenti interni al repository: [`AGENTS.md`](../AGENTS.md), [`README.md`](../README.md), [`contratto-informativo-struttura.md`](contratto-informativo-struttura.md), [`lessico-struttura.md`](lessico-struttura.md).
