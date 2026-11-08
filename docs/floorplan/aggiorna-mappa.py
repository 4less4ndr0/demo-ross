# Aggiorna i dati incorporati in public/mappa-ross.html (window.FLOORPLAN) e i sorgenti in docs/floorplan/
# rileggendo il codice: righe, hash, simboli, collegamenti di import; più descrizioni, percorsi e lavori recenti scritti a mano.
import json, hashlib, re, os, subprocess, datetime, sys
ROOT = sys.argv[1]
os.chdir(ROOT)
NOW = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
HEAD = subprocess.check_output(["git", "rev-parse", "HEAD"]).decode().strip()
BRANCH = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"]).decode().strip()

html = open("public/mappa-ross.html", encoding="utf-8").read()
start = html.index("window.FLOORPLAN = {") + len("window.FLOORPLAN = ")
G, end = json.JSONDecoder().raw_decode(html, start)
arch = json.load(open("docs/floorplan/architecture.json", encoding="utf-8"))

# --- Una sola Struttura (07/11/2026): la vecchia Struttura (chat, report, panoramica, impostazioni) non c'è più ---
# Via i file eliminati, i gruppi rimasti vuoti, i loro collegamenti, le schermate, i percorsi e le note.
G["files"] = [f for f in G["files"] if os.path.exists(f["p"])]
if not any(f["p"] == "src/data/narratives.js" for f in G["files"]):
    G["files"].append({"p": "src/data/narratives.js", "n": "dati", "r": ".", "l": "javascript", "loc": 0, "name": "", "d": "", "h": "", "sig": "", "s": []})
gone = {n["id"] for n in G["nodes"] if n["id"].startswith("struttura.") and n["id"] != "struttura.v2" and not any(f["n"] == n["id"] for f in G["files"])}
G["nodes"] = [n for n in G["nodes"] if n["id"] not in gone]
arch["nodes"] = [n for n in arch["nodes"] if n["id"] not in gone]
alive_refs = {f"n:{n['id']}" for n in G["nodes"]} | {f"f:{f['p']}" for f in G["files"]}
G["links"] = [l for l in G["links"] if l["a"] in alive_refs and l["b"] in alive_refs]
arch["edges"] = [e for e in arch["edges"] if e["from"] not in gone and e["to"] not in gone]
arch["annotations"] = [a for a in arch["annotations"] if os.path.exists(a["path"])]
old_urls = {"/", "/report", "/panoramica", "/impostazioni", "/interazione/:id", "/ospiti", "/ospiti/:id"}
G["screens"] = [x for x in G["screens"] if x["url"] not in old_urls and not x["url"].startswith("/struttura-2")]
for d in os.listdir("docs/floorplan/descriptions"):
    if d[:-5] in gone: os.remove(f"docs/floorplan/descriptions/{d}")

# --- Struttura 2.0: nuovo gruppo e nuovi file (si aggiungono una volta sola) ---
V2 = "struttura.v2"
v2_files = ["src/pages/StructureChannel.jsx", "src/pages/StructureRequests.jsx", "src/components/ResidentSpunti.jsx", "src/components/PortraitV2.jsx", "src/components/PassionNetwork.jsx", "src/data/channel.js", "src/data/interestGraph.js", "src/data/moments.js", "src/data/demoClock.js", "src/state/channelStore.js", "src/components/QuickChat.jsx", "src/data/quickChat.js", "src/components/ResidenceMap.jsx", "src/data/residence.js"]
v2_node = {"id": V2, "parent": "struttura", "label": "Il canale con ROSS", "kind": "ui",
  "summary": "La Struttura come canale, non come archivio: propone a ROSS uno spunto per un ospite e riceve cosa è emerso, cioè come è stato accolto e cosa può aiutare. Ospiti e ritratto sono quelli della Struttura, con in più la scheda Spunti.",
  "details": "", "tags": [], "paths": v2_files, "packages": [], "hosts": []}
if not any(n["id"] == V2 for n in G["nodes"]):
    i = next(k for k, n in enumerate(G["nodes"]) if n["id"] == "struttura.cornice")
    G["nodes"].insert(i + 1, dict(v2_node))
if not any(n["id"] == V2 for n in arch["nodes"]):
    i = next(k for k, n in enumerate(arch["nodes"]) if n["id"] == "struttura.cornice")
    arch["nodes"].insert(i + 1, {k: v2_node[k] for k in ("id", "label", "kind", "summary", "paths")})
for p in v2_files:
    if not any(f["p"] == p for f in G["files"]):
        G["files"].append({"p": p, "n": V2, "r": ".", "l": "javascript", "loc": 0, "name": "", "d": "", "h": "", "sig": "", "s": []})
if not any(f["p"] == "src/components/DocumentDialogs.jsx" for f in G["files"]):
    G["files"].append({"p": "src/components/DocumentDialogs.jsx", "n": "struttura.ospiti", "r": ".", "l": "javascript", "loc": 0, "name": "", "d": "", "h": "", "sig": "", "s": []})
G["files"].sort(key=lambda f: f["p"])
v2_desc = "docs/floorplan/descriptions/struttura.v2.json"
v2d = json.load(open(v2_desc, encoding="utf-8")) if os.path.exists(v2_desc) else {"files": {}}
for p in v2_files: v2d["files"].setdefault(p, {})
json.dump(v2d, open(v2_desc, "w", encoding="utf-8"))
for coll in (G["nodes"], arch["nodes"]):
    for n in coll:
        if n["id"] == V2: n["paths"] = v2_files; n["label"] = v2_node["label"]

# --- Descrizioni scritte a mano per i file cambiati ---
desc = {
  "src/components/GuidedTour.jsx": ("Visita guidata", "La visita per capitoli: Struttura (il canale, la residenza, la rete delle passioni, cosa è emerso, il ritratto, le richieste), Famiglia ed Elena."),
  "src/data/narratives.js": ("Il racconto di ciascuno", "Per ogni ospite il titolo, la presenza con ROSS e cosa fare, che il ritratto usa in «Come sta». Come sta, mai di cosa ha parlato."),
  "src/pages/RossExperience.jsx": ("Schermate del tablet", "La home di Elena con le schede \"una cosa alla volta\" e \"Parla con ROSS\" con i sottotitoli. Nella conversazione Elena può chiedere a ROSS di far sapere al personale una piccola cosa pratica (la lampada), con conferma; quando è sistemata ROSS glielo dice. Salute e urgenze: solo il campanello."),
  "src/components/DocumentDialogs.jsx": ("Cartelle e aggiunta di documenti", "Le quattro cartelle di «Cosa sa ROSS» e le finestre per aggiungere un documento: un file con anteprima, titolo e cartella (dalla chat anche per quale ospite) o un testo incollato che diventa un .txt."),
  "src/components/ResidenceMap.jsx": ("La residenza, adesso", "La pianta della Residenza Aurora vista dall'alto, un piano alla volta, in apertura del canale: indice dei piani, alloggi e spazi con lo stato del loro ROSS (attivo, acceso, in pausa, da sistemare) e il dettaglio di ciò che si tocca. Mai cosa si dice."),
  "src/data/residence.js": ("I piani e i ROSS della residenza", "La geometria dei tre piani, lo stato dei dispositivi (mai delle persone), le etichette degli stati e il piano da aprire all'inizio."),
  "src/components/QuickChat.jsx": ("ROSS, al volo", "La bolla in basso a destra della Struttura e la sua piccola chat: domande veloci su ciò che ROSS ha già raccontato, bozze di spunti e comunicazioni che partono solo dopo «Mando»."),
  "src/data/quickChat.js": ("Le risposte di ROSS, al volo", "Il motore della piccola chat: riconosce le domande con parole chiave e i nomi degli ospiti, riassume dai momenti, prepara le bozze e rifiuta ciò che è fuori perimetro (contenuto, classifiche, salute, gestione)."),
  "src/pages/StructureRequests.jsx": ("Le richieste, in due direzioni", "La scheda Richieste della Struttura: ciò che gli ospiti hanno chiesto a ROSS di far sapere e hanno confermato (Da vedere · Ci pensiamo noi · Fatte oggi), e le comunicazioni pratiche che la struttura vuole far sapere agli ospiti."),
  "src/data/moments.js": ("I momenti emersi con ROSS", "La sola fonte dei momenti della Struttura: spunti con il loro esito, iniziative, inviti, scelte, cose da guardare di persona, richieste pratiche e comunicazioni."),
  "src/data/demoClock.js": ("L'orologio della demo", "Fa partire la Struttura, la Famiglia e il tablet dal giorno reale di oggi: date come scostamenti in giorni ed etichette calcolate (Oggi, Ieri, il giorno della settimana)."),
  "src/state/channelStore.js": ("Memoria del canale", "Tiene la sola fonte dei momenti della Struttura e i filtri delle sue viste; Visto e Fatto cambiano in un posto e valgono ovunque; nella demo ROSS risponde agli spunti dopo pochi secondi."),
  "src/components/PassionNetwork.jsx": ("La rete delle passioni", "Nel canale della Struttura: gli ospiti in cerchio e le passioni che condividono (per categoria), per vedere chi potrebbe fare qualcosa insieme."),
  "src/components/PortraitV2.jsx": ("Come sta e Con ROSS, a racconto", "Nel ritratto «Come sta» e «Con ROSS» raccontano invece di misurare: come sta in questi giorni, cosa va bene, cosa osservare, cosa ha chiesto, le sue passioni e i momenti da ricordare."),
  "src/data/interestGraph.js": ("Le passioni, per i due grafi", "Per ogni ospite, i suoi interessi e le attività, i ricordi, gli eventi e le persone della residenza collegati, con com'è andato lo spunto: è piaciuto, ci sta pensando, non è piaciuto, da provare. In più le passioni in comune tra gli ospiti, con un'occasione per ciascuna."),
  "src/pages/StructureChannel.jsx": ("La Struttura: il canale", "La Struttura non interroga ROSS: gli propone uno spunto per un ospite e riceve cosa è emerso. Header con le schede Il canale · Ospiti · Richieste; nel canale la residenza adesso, la rete delle passioni, Proponi uno spunto e Cosa è emerso."),
  "src/components/ResidentSpunti.jsx": ("Scheda Spunti del ritratto", "Cosa ha capito ROSS dagli spunti, quelli piaciuti, in sospeso e non piaciuti, e il modulo per proporne uno."),
  "src/data/channel.js": ("Spunti e insight d'esempio", "Gli spunti della struttura e gli insight di ROSS d'esempio, come è stato accolto ciascuno, gli spunti più vecchi e cosa ha capito ROSS di ogni ospite. Mai cosa ha raccontato l'ospite."),
  "src/state/channelStore.js": ("Memoria del canale", "Tiene spunti inviati e insight della Struttura 2.0, condivisi tra canale e ritratto; nella demo la risposta di ROSS arriva dopo pochi secondi, anche se si cambia pagina."),
  "src/pages/Residents.jsx": ("Lista degli ospiti", "Gli ospiti in ordine alfabetico, con foto, modalità e ultima conversazione con ROSS; da qui si apre il ritratto."),
  "src/pages/ResidentProfile.jsx": ("Ritratto dell'ospite", "Quattro schede: Spunti (aperta di default), Come sta, Con ROSS e «Cosa sa ROSS», in quattro cartelle: Chi è, Dalla famiglia, Per stare bene e La sua giornata, con il controllo di ciò che ROSS sta per dire."),
  "src/components/Common.jsx": ("Pezzi comuni della Struttura", "Il logo di ROSS, le foto e le iniziali degli ospiti, la modalità, i titoli e le note."),
  "src/App.jsx": ("Mappa delle schermate", "Decide quale schermata mostrare per ogni indirizzo: la Struttura (il canale con ROSS) alla radice, poi Famiglia, tablet e Mappa. I vecchi indirizzi (/struttura-2, /report, /panoramica, /impostazioni…) portano alla pagina giusta."),
  "src/components/PerspectiveSwitcher.jsx": ("Pillola \"Vista demo\"", "Il comando per chi presenta, in basso a destra: Struttura, Famiglia, ROSS e Mappa (tasti 1–4), iPhone, schermata di blocco, cosa è reale e cosa è simulato, visita guidata e ripristino."),
  "src/styles.css": ("Aspetto di tutte le viste", "Colori, caratteri e spaziature della Struttura (canale, ritratto, richieste, pianta della residenza, ROSS al volo), della Famiglia (app per iPhone) e del tablet di Elena (in stile Maria)."),
}

def symbols(path, old):
    olddoc = {s[0]: s[4] for s in (old or [])}
    out = []
    lines = open(path, encoding="utf-8").read().splitlines()
    for i, line in enumerate(lines, 1):
        m = re.match(r"^(?:export\s+)?(?:default\s+)?(?:async\s+)?(function|const|class)\s+([A-Za-z_$][\w$]*)", line)
        if not m: continue
        kind = "function" if m.group(1) == "function" or re.search(r"=\s*(?:\([^)]*\)|[\w$]+)\s*=>", line) and m.group(1) == "const" and False else m.group(1)
        doc = olddoc.get(m.group(2), "")
        if not doc and i > 1 and lines[i - 2].startswith("//"):
            doc = lines[i - 2][2:].strip()
        out.append([m.group(2), kind, i, 0, doc])
    return out

lang = {".js": "javascript", ".jsx": "javascript", ".mjs": "javascript", ".css": "css", ".html": "html"}
for f in G["files"]:
    p = f["p"]
    raw = open(p, "rb").read()
    text = raw.decode("utf-8")
    h = hashlib.sha1(raw).hexdigest()[:12]
    changed = h != f["h"]
    f["h"] = h
    f["loc"] = sum(1 for l in text.splitlines() if l.strip())
    if "s" in f and f.get("l") == "javascript":
        f["s"] = symbols(p, f["s"])
        f["sig"] = hashlib.sha1("\n".join(s[0] for s in f["s"]).encode()).hexdigest()[:12]
    if p in desc:
        f["name"], f["d"] = desc[p]
    if changed: print("cambiato:", p, f["loc"], "righe")

# --- Collegamenti di import, ricalcolati per tutti i file ---
known = {f["p"] for f in G["files"]}
def resolve(src, spec):
    if not spec.startswith("."): return None
    base = os.path.normpath(os.path.join(os.path.dirname(src), spec))
    for cand in [base, base + ".js", base + ".jsx", base + ".mjs", base + "/index.js"]:
        if cand in known: return cand
    return None
imports = {}
for p in sorted(known):
    if not p.endswith((".js", ".jsx", ".mjs")): continue
    text = open(p, encoding="utf-8").read()
    for m in re.finditer(r"import\s+(?:([\w$]+)\s*,?\s*)?(?:\{([^}]*)\})?\s*(?:\*\s+as\s+([\w$]+))?\s*from\s*[\"']([^\"']+)[\"']", text):
        target = resolve(p, m.group(4))
        if not target: continue
        names = []
        if m.group(1): names.append(m.group(1))
        if m.group(2): names += [n.strip().split(" as ")[0] for n in m.group(2).split(",") if n.strip()]
        if m.group(3): names.append(m.group(3))
        key = (p, target)
        imports.setdefault(key, [])
        imports[key] += [n for n in names if n not in imports[key]]
# Import dinamici (lazy) e di solo effetto (CSS): se il file li contiene ancora, si tiene il collegamento con i suoi nomi.
for l in G["links"]:
    if l["k"] != "import": continue
    a, b = l["a"][2:], l["b"][2:]
    if (a, b) in imports or not os.path.exists(a) or not os.path.exists(b): continue
    spec = os.path.splitext(os.path.relpath(b, os.path.dirname(a)))[0]
    text = open(a, encoding="utf-8").read()
    if re.search(r"import\s*\(?\s*[\"']\./" + re.escape(spec) + r"(\.\w+)?[\"']", text):
        imports[(a, b)] = l["names"]
# Import dinamici di App.jsx (load(() => import("./pages/…"), "Nome")): anche per le pagine nuove.
app = open("src/App.jsx", encoding="utf-8").read()
for m in re.finditer(r"import\(\s*[\"'](\./[^\"']+)[\"']\s*\)\s*,\s*[\"']([\w$]+)[\"']", app):
    target = resolve("src/App.jsx", m.group(1))
    if not target: continue
    names = imports.setdefault(("src/App.jsx", target), [])
    if m.group(2) not in names: names.append(m.group(2))
other = [l for l in G["links"] if l["k"] != "import"]
G["links"] = [{"a": f"f:{a}", "b": f"f:{b}", "k": "import", "w": 1, "names": n} for (a, b), n in sorted(imports.items())] + other

# --- Statistiche dei nodi ---
byfile = {f["p"]: f for f in G["files"]}
for n in G["nodes"]:
    fs = [f for f in G["files"] if f["n"] == n["id"] or f["n"].startswith(n["id"] + ".")]
    if not fs: continue
    langs = {}
    for f in fs: langs[f["l"]] = langs.get(f["l"], 0) + f["loc"]
    n["stats"] = {"files": len(fs), "loc": sum(f["loc"] for f in fs), "langs": langs, "repos": ["."]}

# --- Nodi, percorsi e giro: testi scritti a mano ---
node_text = {
  "struttura": "Lo strumento per l'équipe della RSA: un canale con ROSS, non un archivio. La struttura propone a ROSS uno spunto per un ospite e riceve cosa è emerso; in più la lista degli ospiti con il ritratto e le richieste pratiche. Come sta e di cosa ha bisogno, mai di cosa ha parlato.",
  "struttura.ospiti": "La lista degli ospiti in ordine alfabetico e il ritratto di ciascuno: Spunti, Come sta, Con ROSS e «Cosa sa ROSS», con le quattro cartelle dei documenti.",
  "dati": "La Residenza Aurora inventata: otto ospiti come otto archetipi, segnali positivi e da osservare, come ognuno usa ROSS, il racconto di ciascuno, i momenti emersi con ROSS e i contributi della famiglia.",
  "famiglia": "L'app per iPhone di Anna, la figlia di Elena: Oggi · Da lei · + · Da te · Insieme. Vede solo ciò che Elena sceglie di raccontarle; con il + le manda qualcosa a voce o per iscritto (e, se vuole, una copia alla struttura), e ROSS lo riordina per Elena.",
}
for coll in (G["nodes"], arch["nodes"]):
    for n in coll:
        if n["id"] in node_text: n["summary"] = node_text[n["id"]]

flow_ritratto = {"id": "ritratto", "title": "Dalla lista al ritratto", "description": "Dalla lista degli ospiti al ritratto di uno di loro, che si apre sugli spunti.", "steps": [
  {"ref": "n:struttura.ospiti", "note": "La lista è in ordine alfabetico; si apre il ritratto, che si adatta alla persona (il suo archetipo)."},
  {"ref": "f:src/components/ResidentSpunti.jsx", "note": "Si apre sugli spunti: cosa ha capito ROSS e com'è andata ogni proposta."},
  {"ref": "f:src/components/PortraitV2.jsx", "note": "Come sta e Con ROSS raccontano invece di misurare: niente grafici, minuti o percentuali."}]}
flow_struttura = {"id": "anche-struttura", "title": "Anna condivide anche con la struttura", "description": "Con l'interruttore nel +, una copia di ciò che Anna manda a ROSS arriva anche negli allegati di Elena.", "steps": [
  {"ref": "n:famiglia", "note": "Anna scrive o detta nel + e accende \"Anche alla struttura\" (spento di default)."},
  {"ref": "n:stato", "note": "A ROSS il messaggio arriva comunque direttamente; una copia diventa un allegato \"Dalla famiglia\"."},
  {"ref": "n:struttura.ospiti", "note": "Nel ritratto di Elena, tab «Cosa sa ROSS», nella cartella Dalla famiglia. La struttura la riceve e basta, non la approva."}]}
flow_canale = {"id": "canale", "title": "La struttura propone, ROSS restituisce", "description": "La Struttura: uno spunto per un ospite va a ROSS, che lo porta nella conversazione solo se l'ospite ci sta, e torna come racconto di com'è andata.", "steps": [
  {"ref": "f:src/pages/StructureChannel.jsx", "note": "Nel canale o nel ritratto (scheda Spunti) si sceglie l'ospite e si scrive lo spunto: attività, ricordo, evento o persona."},
  {"ref": "f:src/state/channelStore.js", "note": "Lo spunto resta in attesa del momento giusto, secondo la modalità dell'ospite; nella demo ROSS risponde dopo pochi secondi."},
  {"ref": "f:src/data/channel.js", "note": "Torna un insight: come è stato accolto, 1–2 frasi narrative e cosa si può fare. Mai cosa ha raccontato l'ospite."},
  {"ref": "f:src/components/ResidentSpunti.jsx", "note": "Nel ritratto gli spunti si dividono in piaciuti, in sospeso e non piaciuti, e ROSS dice cosa ha capito per proporre meglio."}]}
for coll in (G["flows"], arch["flows"]):
    coll[:] = [flow_ritratto if f["id"] == "ritratto" else f for f in coll if f["id"] not in ("chiedi", "invito", "anche-struttura", "canale")] + [flow_struttura, flow_canale]

tour_ospiti = {"ref": "n:struttura.ospiti", "title": "Otto ospiti, otto archetipi", "note": "Ogni ospite rappresenta un modo diverso di vivere ROSS: la nuova arrivata, chi lo usa come uno strumento, chi lo adora troppo, il riservato… Il ritratto si adatta alla persona. Gli archetipi sono per chi presenta, mai etichette nel prodotto."}
for coll in (G["tour"], arch["tour"]):
    coll[:] = [t for t in coll if t["ref"] != "n:struttura.ospiti"]
    coll.insert(2, tour_ospiti)
tour_v2 = {"ref": "n:struttura.v2", "title": "Un canale, non un archivio", "note": "La struttura non interroga ROSS: gli propone uno spunto per un ospite, ROSS ne parla con lui se ci sta e restituisce cosa è emerso. Nel canale anche la residenza adesso, la rete delle passioni e le richieste pratiche."}
for coll in (G["tour"], arch["tour"]):
    coll[:] = [t for t in coll if t["ref"] != "n:struttura.v2" and (t["ref"] in alive_refs)]
    coll.insert(3, tour_v2)

# --- Lavori recenti: la nuova attività in cima, si tengono le ultime quattro ---
task = {"title": "Una sola Struttura: il canale con ROSS",
        "request": "Cancellare la vecchia vista della Struttura, del tutto, e mettere al suo posto la Struttura 2.0, rinominata Struttura.",
        "summary": "La Struttura è il canale con ROSS, alla radice della demo (/, /ospiti, /richieste). Tolte la chat Chiedi a ROSS, Report, Panoramica, Impostazioni, la sessione live, la sidebar e i loro stili; i vecchi indirizzi portano alla pagina giusta. Ritratto con Spunti, Come sta, Con ROSS e Cosa sa ROSS."}
items = [
  ("f:src/App.jsx", "La Struttura alla radice; i vecchi indirizzi rimandano."),
  ("f:src/pages/ResidentProfile.jsx", "Solo Spunti, Come sta, Con ROSS e Cosa sa ROSS."),
  ("f:src/components/PerspectiveSwitcher.jsx", "Una sola Struttura (tasto 1)."),
  ("f:src/components/GuidedTour.jsx", "Il capitolo Struttura racconta il canale."),
  ("f:src/data/narratives.js", "Nuovo: il racconto di ciascuno, preso dal vecchio report."),
  ("f:src/styles.css", "Tolti gli stili della vecchia Struttura."),
]
rec = json.load(open("docs/floorplan/recent-work.json", encoding="utf-8"))
rec["tasks"] = [t for t in rec["tasks"] if t["title"] != task["title"]]
for t in rec["tasks"]:
    t["items"] = [it for it in t["items"] if any(f"f:{f['p']}" == it["ref"] or it["ref"].startswith("n:") for f in G["files"])]
rec["tasks"].insert(0, dict(task, items=[{"ref": r, "change": "changed", "note": n} for r, n in items]))
rec["tasks"] = rec["tasks"][:4]
rec["updatedAt"] = NOW
G["recent"] = {"updatedAt": NOW, "tasks": [{k: t[k] for k in ("title", "request", "summary")} for t in rec["tasks"]],
               "items": [{"id": it["ref"], "task": ti, "change": it["change"], "note": it["note"]} for ti, t in enumerate(rec["tasks"]) for it in t["items"]]}

# --- Schermate della Struttura (il canale con ROSS) ---
v2_behind = [{"id": "f:src/App.jsx", "note": "The screen itself", "kind": "screen"}, {"id": "f:src/pages/StructureChannel.jsx", "note": "A component on this screen", "kind": "part"}]
v2_screens = [
  ("/", "Struttura · Il canale", "Proponi uno spunto per un ospite e leggi cosa è emerso; sopra, la residenza adesso e la rete delle passioni.", ["src/components/ResidenceMap.jsx", "src/components/PassionNetwork.jsx"]),
  ("/ospiti", "Struttura · Ospiti", "La lista degli ospiti in ordine alfabetico.", ["src/pages/Residents.jsx"]),
  ("/ospiti/:id", "Struttura · Ritratto", "Il ritratto: Spunti, Come sta, Con ROSS e Cosa sa ROSS.", ["src/pages/ResidentProfile.jsx", "src/components/ResidentSpunti.jsx", "src/components/PortraitV2.jsx"]),
  ("/richieste", "Struttura · Richieste", "Le cose pratiche, in due direzioni: dagli ospiti e agli ospiti.", ["src/pages/StructureRequests.jsx"]),
]
G["screens"] = [x for x in G["screens"] if x["url"] not in {u for u, *_ in v2_screens}]
for url, name, text, extra in v2_screens:
    G["screens"].append({"id": f"screen:guscio:{url}", "url": url, "file": "src/App.jsx", "app": "guscio", "fw": "react-router", "name": name, "description": text,
                         "behind": v2_behind + [{"id": f"f:{p}", "note": "A component on this screen", "kind": "part"} for p in extra]})
G["screens"].sort(key=lambda x: x["url"])

# --- Meta ---
G["meta"].update({"generatedAt": NOW, "scanAt": NOW})
G["meta"]["repos"][0].update({"head": HEAD, "branch": BRANCH})
G["meta"]["counts"] = {"files": len(G["files"]), "loc": sum(f["loc"] for f in G["files"]), "unassigned": 0}
G["meta"]["exported"]["at"] = NOW

# --- Sorgenti in docs/floorplan ---
for name in os.listdir("docs/floorplan/descriptions"):
    path = f"docs/floorplan/descriptions/{name}"
    d = json.load(open(path, encoding="utf-8"))
    for p in d["files"]:
        if p in desc: d["files"][p] = {"name": desc[p][0], "description": desc[p][1]}
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2); open(path, "a").write("\n")
json.dump(arch, open("docs/floorplan/architecture.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2); open("docs/floorplan/architecture.json", "a").write("\n")
json.dump(rec, open("docs/floorplan/recent-work.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2); open("docs/floorplan/recent-work.json", "a").write("\n")

blob = json.dumps(G, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
open("public/mappa-ross.html", "w", encoding="utf-8").write(html[:start] + blob + html[end:])
print("link import:", len(G["links"]) - len(other), "· file:", G["meta"]["counts"])
