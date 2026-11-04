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

# --- Descrizioni scritte a mano per i file cambiati ---
desc = {
  "src/pages/ResidentProfile.jsx": ("Ritratto dell'ospite", "Il ritratto si adatta alla persona: Come sta (risorse, racconto, \"Spunti di ROSS\" per invogliarla alla vita della residenza), Come avvicinarsi (con le attività da far proporre a ROSS, solo in modalità Attiva), Con ROSS (come lo usa, modalità, inviti chiesti) e «Cosa sa ROSS»: i documenti di struttura e famiglia raggruppati per ciò che ROSS ne fa (Per conoscerla · La sua giornata · Per stare bene), compresi i promemoria per le medicine."),
  "src/data/careInsights.js": ("Segnali e guida per ospite", "Per ogni ospite: cosa va bene, cosa osservare rispetto alla sua media, bisogni, la guida \"Come avvicinarsi\", come usa ROSS (il suo archetipo) e gli spunti di ROSS per invogliarlo a uscire."),
  "src/data/chatScript.js": ("Copione della chat", "Domande consigliate per ruolo e tutte le risposte preparate di \"Chiedi a ROSS\", sempre con la fonte; anche \"Proponi ad Antonio…\" (parte solo in modalità Attiva) e \"Come invogliare Antonio?\"."),
  "src/data/demoData.js": ("Residenza Aurora inventata", "Gli otto ospiti, ognuno un archetipo (la nuova arrivata, chi lo usa come strumento, chi lo adora troppo…), le loro conversazioni con ROSS, i documenti simulati di «Cosa sa ROSS» (anche i promemoria per le medicine della struttura) e gli inviti fuori dalla stanza."),
  "src/data/reportNarrative.js": ("Testi dei report", "Scrive in forma di racconto il report \"Come sta\" di ogni ospite, coerente con il suo archetipo, e il Riepilogo d'équipe della struttura."),
  "src/pages/AskRoss.jsx": ("Chat \"Chiedi a ROSS\"", "La home della Struttura: si fa una domanda, anche da telefono, e ROSS risponde citando la fonte. Se si chiede di proporre un'attività, la richiesta parte davvero (o compare l'avviso della modalità)."),
  "src/pages/FamilyExperience.jsx": ("Schermate della Famiglia", "L'app per iPhone di Anna: Oggi, Da lei (racconti e ricordi di Elena), il + per mandarle qualcosa (con l'interruttore \"Anche alla struttura\"), Da te e Insieme, con la schermata di blocco."),
  "src/pages/RossExperience.jsx": ("Schermate del tablet", "La home di Elena con le schede \"una cosa alla volta\" (novità da Anna, promemoria, anche quello dall'infermeria, giochi, cosa ricordo di te), \"Oggi in residenza\" e \"Parla con ROSS\" con i sottotitoli."),
  "src/state/DemoContext.jsx": ("Memoria condivisa della demo", "Tiene ruolo, tema, conversazioni, allegati, consensi, messaggi di Anna (e la copia per la struttura), promemoria, inviti chiesti a ROSS e spunti salvati; li salva nel browser e mostra gli avvisi con \"Annulla\"."),
  "src/styles.css": ("Aspetto di tutte le viste", "Colori, caratteri e spaziature di Struttura (anche spunti di ROSS, \"Con ROSS\", avvisi di modalità e «Cosa sa ROSS»), Famiglia (app per iPhone) e tablet (schede \"una cosa alla volta\")."),
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
  {"ref": "n:struttura.ospiti", "note": "Nel ritratto di Elena, tab «Cosa sa ROSS», in Per conoscerla: la copia arricchisce la sua biografia. La struttura la riceve e basta, non la approva."}]}
for coll in (G["flows"], arch["flows"]):
    coll[:] = [flow_ritratto if f["id"] == "ritratto" else f for f in coll if f["id"] not in ("invito", "anche-struttura")] + [flow_invito, flow_struttura]

tour_ospiti = {"ref": "n:struttura.ospiti", "title": "Otto ospiti, otto archetipi", "note": "Ogni ospite rappresenta un modo diverso di vivere ROSS: la nuova arrivata, chi lo usa come uno strumento, chi lo adora troppo, il riservato… Il ritratto si adatta alla persona. Gli archetipi sono per chi presenta, mai etichette nel prodotto."}
for coll in (G["tour"], arch["tour"]):
    coll[:] = [t for t in coll if t["ref"] != "n:struttura.ospiti"]
    coll.insert(2, tour_ospiti)

# --- Lavori recenti: la nuova attività in cima, si tengono le ultime quattro ---
task = {"title": "Ospiti come archetipi e ritratto rivisto",
        "request": "Rivedere le schede degli ospiti in funzione di cos'è ROSS oggi: ogni ospite un archetipo; inviti via ROSS solo in modalità Attiva; allegati per ogni ospite; condividere dalla Famiglia anche con la struttura",
        "summary": "Otto archetipi (Carlo lo usa come strumento, Antonio lo adora troppo, Mario riservato, Ada appena arrivata…). Il ritratto ha \"Spunti di ROSS\" e il tab \"Con ROSS\"; la struttura può chiedere a ROSS di proporre un'attività, che parte solo in modalità Attiva. Nel + della Famiglia c'è \"Anche alla struttura\"."}
items = [
  ("f:src/pages/ResidentProfile.jsx", "Spunti di ROSS, tab \"Con ROSS\", invito con avviso di modalità; dopo PR #48 i documenti stanno in «Cosa sa ROSS»."),
  ("f:src/data/careInsights.js", "Come usa ROSS ogni ospite e gli spunti per invogliarlo; segnali di Antonio e Carlo corretti."),
  ("f:src/data/chatScript.js", "Nuove risposte \"Proponi a…\" e \"Come invogliare…\"; Carlo che parla poco non è un segnale."),
  ("f:src/data/demoData.js", "Documenti simulati per ogni ospite; conversazioni e modalità secondo l'archetipo."),
  ("f:src/pages/FamilyExperience.jsx", "Interruttore \"Anche alla struttura\" nel +."),
  ("f:src/state/DemoContext.jsx", "Inviti chiesti a ROSS e copia dei messaggi di Anna per la struttura."),
]
rec = json.load(open("docs/floorplan/recent-work.json", encoding="utf-8"))
rec["tasks"] = [t for t in rec["tasks"] if t["title"] != task["title"]]
rec["tasks"].insert(0, dict(task, items=[{"ref": r, "change": "changed", "note": n} for r, n in items]))
rec["tasks"] = rec["tasks"][:4]
rec["updatedAt"] = NOW
G["recent"] = {"updatedAt": NOW, "tasks": [{k: t[k] for k in ("title", "request", "summary")} for t in rec["tasks"]],
               "items": [{"id": it["ref"], "task": ti, "change": it["change"], "note": it["note"]} for ti, t in enumerate(rec["tasks"]) for it in t["items"]]}

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
