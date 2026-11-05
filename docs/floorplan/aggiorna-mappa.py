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

# --- Struttura 2.0: nuovo gruppo e nuovi file (si aggiungono una volta sola) ---
V2 = "struttura.v2"
v2_files = ["src/pages/StructureChannel.jsx", "src/components/ResidentSpunti.jsx", "src/data/channel.js", "src/state/channelStore.js"]
v2_node = {"id": V2, "parent": "struttura", "label": "Struttura 2.0 · il canale", "kind": "ui",
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
if not os.path.exists(v2_desc):
    json.dump({"files": {p: {} for p in v2_files}}, open(v2_desc, "w", encoding="utf-8"))

# --- Descrizioni scritte a mano per i file cambiati ---
desc = {
  "src/components/DocumentDialogs.jsx": ("Cartelle e aggiunta di documenti", "Le quattro cartelle di «Cosa sa ROSS» e le finestre per aggiungere un documento: un file con anteprima, titolo e cartella (dalla chat anche per quale ospite) o un testo incollato che diventa un .txt."),
  "src/pages/StructureChannel.jsx": ("Struttura 2.0: il canale", "La Struttura 2.0: la struttura non interroga ROSS, gli propone uno spunto per un ospite e riceve cosa è emerso. Schede Il canale · Ospiti; Proponi uno spunto e Cosa è emerso (Visto, Fatto)."),
  "src/components/ResidentSpunti.jsx": ("Scheda Spunti del ritratto", "Nel ritratto della Struttura 2.0: cosa ha capito ROSS dagli spunti, quelli piaciuti, in sospeso e non piaciuti, ciò che è emerso senza spunto e il modulo per proporne uno."),
  "src/data/channel.js": ("Spunti e insight d'esempio", "Gli spunti della struttura e gli insight di ROSS d'esempio, come è stato accolto ciascuno, gli spunti più vecchi e cosa ha capito ROSS di ogni ospite. Mai cosa ha raccontato l'ospite."),
  "src/state/channelStore.js": ("Memoria del canale", "Tiene spunti inviati e insight della Struttura 2.0, condivisi tra canale e ritratto; nella demo la risposta di ROSS arriva dopo pochi secondi, anche se si cambia pagina."),
  "src/pages/Residents.jsx": ("Lista degli ospiti", "Mostra gli ospiti in ordine alfabetico, con foto, modalità e ultima conversazione con ROSS. È la stessa nella Struttura e nella Struttura 2.0."),
  "src/pages/ResidentProfile.jsx": ("Ritratto dell'ospite", "Il ritratto si adatta alla persona: Come sta, Come avvicinarsi, Con ROSS e «Cosa sa ROSS», in quattro cartelle: Chi è, Dalla famiglia, Per stare bene e La sua giornata, dove si controlla cosa ROSS sta per dire e si ferma ciò che non va. Si aggiunge un file o un testo incollato, che diventa un .txt. Nella Struttura 2.0 si apre su Spunti, senza Come avvicinarsi (ci si avvicina con gli spunti), senza chat né report."),
  "src/components/Common.jsx": ("Pezzi comuni della Struttura", "Foto e iniziali degli ospiti, modalità, titoli e note; dice anche se Ospiti e ritratto stanno nella Struttura o nella Struttura 2.0."),
  "src/App.jsx": ("Mappa delle schermate", "Decide quale schermata mostrare per ogni indirizzo delle viste (anche la Struttura 2.0 in /struttura-2) e rimanda i vecchi indirizzi a quelli nuovi."),
  "src/components/PerspectiveSwitcher.jsx": ("Pillola \"Vista demo\"", "Il comando per chi presenta, in basso a destra: Struttura, Struttura 2.0, Famiglia, ROSS e Mappa, iPhone, schermata di blocco, cosa è reale e cosa è simulato, visita guidata e ripristino."),
  "src/styles.css": ("Aspetto di tutte le viste", "Colori, caratteri e spaziature di Struttura e Struttura 2.0 (canale, scheda Spunti), Famiglia (app per iPhone) e tablet (schede \"una cosa alla volta\")."),
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
  "struttura": "Lo strumento per l'équipe della RSA in due versioni da confrontare: la Struttura (chiedere a ROSS, ritratti, report e panoramica) e la Struttura 2.0 (il canale: la struttura propone uno spunto, ROSS restituisce cosa è emerso). Mai il contenuto delle conversazioni.",
  "struttura.ospiti": "La lista degli ospiti in ordine alfabetico e il ritratto di ciascuno, che si adatta al suo archetipo: Come sta (con gli spunti di ROSS), Come avvicinarsi (attività da far proporre a ROSS), Con ROSS e Allegati per provenienza.",
  "dati": "La Residenza Aurora inventata: otto ospiti come otto archetipi, segnali positivi e da osservare, come ognuno usa ROSS, spunti per invogliarli, risposte preparate della chat, testi dei report, allegati simulati, il metodo salutogenico e le regole con cui ROSS riordina i messaggi della famiglia.",
  "famiglia": "L'app per iPhone di Anna, la figlia di Elena: Oggi · Da lei · + · Da te · Insieme. Vede solo ciò che Elena sceglie di raccontarle; con il + le manda qualcosa a voce o per iscritto (e, se vuole, una copia alla struttura), e ROSS lo riordina per Elena.",
}
for coll in (G["nodes"], arch["nodes"]):
    for n in coll:
        if n["id"] in node_text: n["summary"] = node_text[n["id"]]

flow_ritratto = {"id": "ritratto", "title": "Dal ritratto al report", "description": "Dalla lista degli ospiti al ritratto di uno di loro, fino al report stampabile \"Come sta\".", "steps": [
  {"ref": "n:struttura.ospiti", "note": "La lista è in ordine alfabetico; si apre il ritratto, che si adatta alla persona (il suo archetipo)."},
  {"ref": "n:dati", "note": "Il ritratto legge i segnali rispetto alla sua media, come usa ROSS e gli spunti di ROSS per invogliarla alla vita della residenza."},
  {"ref": "n:struttura.report", "note": "\"Stampa report\" apre il racconto narrativo per l'équipe, con le infografiche."}]}
flow_invito = {"id": "invito", "title": "La struttura chiede a ROSS di proporre un'attività", "description": "Lo staff chiede a ROSS di invitare un ospite; ROSS lo fa solo se la modalità lo permette, e decide l'ospite.", "steps": [
  {"ref": "n:struttura.chat", "note": "Dalla chat (\"Proponi ad Antonio la radio in compagnia\") o dal ritratto (\"Chiedi a ROSS di proporla\")."},
  {"ref": "f:src/data/chatScript.js", "note": "Il copione trova l'ospite e l'attività dal calendario e controlla la modalità."},
  {"ref": "f:src/pages/ResidentProfile.jsx", "note": "In modalità Attiva si vede come ROSS lo dirà; in Reattiva o Silenziosa un avviso spiega che l'invito non parte: si propone di persona."},
  {"ref": "n:stato", "note": "L'invito chiesto resta nel tab \"Con ROSS\", con \"Annulla\" nel toast. Un sì non è una prenotazione; un no non arriva a nessuno."}]}
flow_struttura = {"id": "anche-struttura", "title": "Anna condivide anche con la struttura", "description": "Con l'interruttore nel +, una copia di ciò che Anna manda a ROSS arriva anche negli allegati di Elena.", "steps": [
  {"ref": "n:famiglia", "note": "Anna scrive o detta nel + e accende \"Anche alla struttura\" (spento di default)."},
  {"ref": "n:stato", "note": "A ROSS il messaggio arriva comunque direttamente; una copia diventa un allegato \"Dalla famiglia\"."},
  {"ref": "n:struttura.ospiti", "note": "Nel ritratto di Elena, tab «Cosa sa ROSS», nella cartella Dalla famiglia. La struttura la riceve e basta, non la approva."}]}
flow_canale = {"id": "canale", "title": "La struttura propone, ROSS restituisce", "description": "Struttura 2.0: uno spunto per un ospite va a ROSS, che lo porta nella conversazione solo se l'ospite ci sta, e torna come racconto di com'è andata.", "steps": [
  {"ref": "f:src/pages/StructureChannel.jsx", "note": "Nel canale o nel ritratto (scheda Spunti) si sceglie l'ospite e si scrive lo spunto: attività, ricordo, evento o persona."},
  {"ref": "f:src/state/channelStore.js", "note": "Lo spunto resta in attesa del momento giusto, secondo la modalità dell'ospite; nella demo ROSS risponde dopo pochi secondi."},
  {"ref": "f:src/data/channel.js", "note": "Torna un insight: come è stato accolto, 1–2 frasi narrative e cosa si può fare. Mai cosa ha raccontato l'ospite."},
  {"ref": "f:src/components/ResidentSpunti.jsx", "note": "Nel ritratto gli spunti si dividono in piaciuti, in sospeso e non piaciuti, e ROSS dice cosa ha capito per proporre meglio."}]}
for coll in (G["flows"], arch["flows"]):
    coll[:] = [flow_ritratto if f["id"] == "ritratto" else f for f in coll if f["id"] not in ("invito", "anche-struttura", "canale")] + [flow_invito, flow_struttura, flow_canale]

tour_ospiti = {"ref": "n:struttura.ospiti", "title": "Otto ospiti, otto archetipi", "note": "Ogni ospite rappresenta un modo diverso di vivere ROSS: la nuova arrivata, chi lo usa come uno strumento, chi lo adora troppo, il riservato… Il ritratto si adatta alla persona. Gli archetipi sono per chi presenta, mai etichette nel prodotto."}
for coll in (G["tour"], arch["tour"]):
    coll[:] = [t for t in coll if t["ref"] != "n:struttura.ospiti"]
    coll.insert(2, tour_ospiti)
tour_v2 = {"ref": "n:struttura.v2", "title": "Struttura 2.0: un canale, non un archivio", "note": "Una seconda versione della Struttura, da confrontare con la prima: la struttura non interroga ROSS, gli propone uno spunto per un ospite e riceve com'è andata. Niente dashboard, punteggi o trascrizioni."}
for coll in (G["tour"], arch["tour"]):
    coll[:] = [t for t in coll if t["ref"] != "n:struttura.v2"]
    coll.insert(3, tour_v2)

# --- Lavori recenti: la nuova attività in cima, si tengono le ultime quattro ---
task = {"title": "Struttura 2.0: il canale con ROSS",
        "request": "Cambiare punto di vista: la struttura non consulta né interroga ROSS, gli propone spunti e riceve insight. In una vista nuova, senza rompere la Struttura attuale; poi Ospiti e ritratto, con una scheda per gli spunti piaciuti e non piaciuti",
        "summary": "Nuova vista /struttura-2 (tasto 5): Proponi uno spunto e Cosa è emerso, con Visto e Fatto. Gli insight dicono come è stato accolto lo spunto, mai cosa ha raccontato l'ospite. Ospiti e ritratto sono quelli della Struttura, con in più la scheda Spunti."}
items = [
  ("f:src/pages/StructureChannel.jsx", "Nuovo: schede Il canale · Ospiti, Proponi uno spunto, Cosa è emerso."),
  ("f:src/components/ResidentSpunti.jsx", "Nuovo: la scheda Spunti del ritratto."),
  ("f:src/data/channel.js", "Nuovo: spunti, insight, accoglienza e cosa ha capito ROSS."),
  ("f:src/state/channelStore.js", "Nuovo: stato condiviso tra canale e ritratto, risposta simulata di ROSS."),
  ("f:src/pages/ResidentProfile.jsx", "Nella Struttura 2.0: scheda Spunti al posto di Come avvicinarsi, niente chat né report."),
  ("f:src/pages/Residents.jsx", "I link seguono la Struttura in cui si è."),
  ("f:src/components/PerspectiveSwitcher.jsx", "Voce Struttura 2.0 (tasto 5) e nota in \"Cosa è reale e cosa è simulato\"."),
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

# --- Schermate della Struttura 2.0 ---
v2_behind = [{"id": "f:src/App.jsx", "note": "The screen itself", "kind": "screen"}, {"id": "f:src/pages/StructureChannel.jsx", "note": "A component on this screen", "kind": "part"}]
v2_screens = [
  ("/struttura-2", "Struttura 2.0 · Il canale", "Proponi uno spunto per un ospite e leggi cosa è emerso: come è stato accolto e cosa puoi fare.", []),
  ("/struttura-2/ospiti", "Struttura 2.0 · Ospiti", "La lista degli ospiti della Struttura, che qui apre il ritratto della Struttura 2.0.", ["src/pages/Residents.jsx"]),
  ("/struttura-2/ospiti/:id", "Struttura 2.0 · Ritratto", "Il ritratto della Struttura con in più la scheda Spunti: piaciuti, in sospeso, non piaciuti e cosa ha capito ROSS.", ["src/pages/ResidentProfile.jsx", "src/components/ResidentSpunti.jsx"]),
]
G["screens"] = [x for x in G["screens"] if not x["url"].startswith("/struttura-2")]
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
