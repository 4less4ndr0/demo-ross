import { useEffect, useRef, useState } from "react";
import { FileText, Folder, Paperclip, TextCursorInput, Upload } from "lucide-react";
import { attachmentFrom } from "../state/DemoContext";
import { Avatar } from "./Common";
import { Button, Dialog, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Input, Textarea } from "./ui";

// «Cosa sa ROSS» in quattro cartelle (decisione del 05/11/2026): chi è la persona, cosa ha condiviso la famiglia,
// le cose fondamentali per stare bene e la sua giornata, dove si controlla cosa ROSS sta per dire o proporre.
// Ogni documento dice chi l'ha scritto, cosa ne fa ROSS e chi lo vede. Una cartella vuota è un invito, non un buco.
export const folders = [
  { id: "persona", color: "lilac", title: (n) => `Chi è ${n}`, hint: (n, m) => `La sua storia, cosa ${m ? "gli" : "le"} piace, come preferisce essere ${m ? "chiamato" : "chiamata"}. ROSS lo usa per parlar${m ? "gli" : "le"} in modo personale.`, who: "Struttura e staff", use: "Ne parla con la persona in modo personale", empty: (n) => `Ancora niente su chi è ${n}. All'ingresso si può aggiungere la biografia, o un testo con cosa ${n} ama.` },
  { id: "famiglia", color: "coral", title: () => "Dalla famiglia", hint: () => "Ciò che la famiglia ha scelto di condividere con la struttura e con ROSS. La struttura lo riceve e basta, non lo approva.", who: "Famiglia", use: "Ne parla con la persona in modo personale", empty: (n) => `La famiglia non ha ancora condiviso niente con la struttura. Può farlo dall'app, accendendo «Anche alla struttura».` },
  { id: "benessere", color: "mint", title: () => "Per stare bene", hint: () => "Le cose fondamentali, la base: i promemoria dell'infermeria e le indicazioni di fisioterapisti ed educatori. ROSS ricorda e invita, la persona sceglie.", who: "Infermeria, fisioterapisti, educatori", use: "Glielo ricorda o la invita, senza insistere", empty: (n) => `Niente da ricordare a ${n} per ora. L'infermeria o un fisioterapista può aggiungere un promemoria o un'indicazione.` },
  { id: "giornata", color: "sand", title: () => "La sua giornata", hint: (n) => `Cosa ROSS ricorderà e proporrà a ${n}, oggi e domani. Se qualcosa non va, lo fermi qui.`, who: "ROSS, dai documenti e dal calendario", use: "Glielo ricorda al momento giusto", empty: (n) => `Nessun promemoria o proposta in arrivo per ${n}.` },
];
const legacyFamily = { conoscere: "persona" };
export const familyOf = (d) => legacyFamily[d.family] || d.family || (d.origin === "famiglia" ? "famiglia" : d.reminders || d.kind === "Indicazione" ? "benessere" : d.origin === "struttura" ? "giornata" : "persona");
export const useOf = (d) => d.use || folders.find((f) => f.id === familyOf(d))?.use;
// Le cartelle in cui si può aggiungere un documento (La sua giornata no: la compone ROSS).
export const folderChoices = (name) => folders.filter((f) => f.id !== "giornata").map((f) => ({ id: f.id, color: f.color, label: f.title(name) }));

// «Aggiungi contenuto testuale»: si incolla un testo e diventa un documento .txt di «Cosa sa ROSS».
export const txtName = (title, text) => (title.trim() || text.trim().split("\n")[0].slice(0, 60) || "Testo").replace(/\.txt$/i, "").replace(/[\s.,;:!?…]+$/, "") || "Testo";
export const textDocument = (residentId, title, text) => {
  const clean = text.trim();
  const name = txtName(title, clean);
  return { residentId, origin: "staff", kind: "Testo", title: `${name}.txt`, summary: clean.length > 160 ? `${clean.slice(0, 157)}…` : clean, body: [["Testo", clean]] };
};

// «In quale cartella»: parte da quella aperta; si può sceglierne un'altra (La sua giornata no: la compone ROSS).
export function FolderChoice({ choices, value, onChange }) {
  return <fieldset className="text-doc-folders"><legend>In quale cartella</legend><div>{choices.map((c) => <button type="button" key={c.id} className={`folder-${c.color}`} aria-pressed={value === c.id} onClick={() => onChange(c.id)}><span className="folder-icon"><Folder size={15} /></span>{c.label}</button>)}</div></fieldset>;
}

// «Carica dal dispositivo»: scelto il file, si vede cosa si sta aggiungendo, si corregge il titolo e si sceglie la cartella.
// Dalla chat (`residents`) si sceglie anche per chi è: le cartelle seguono il nome dell'ospite scelto.
export function FileDocumentDialog({ file, onClose, onSave, name, choices, initial, residents, residentId, onResidentChange }) {
  const [title, setTitle] = useState("");
  const [family, setFamily] = useState(initial);
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!file) return undefined;
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    setFamily(initial);
    const url = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setPreview(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [file, initial]);
  const ext = file ? (file.name.match(/\.([^.]+)$/)?.[1] || "").toLowerCase() : "";
  const size = file ? (file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} kB`) : "";
  const save = (event) => { event.preventDefault(); onSave(file, title, family); };
  return <Dialog open={Boolean(file)} onClose={onClose} title="Aggiungi un file" size="md">
    {file && <form className="text-doc-form" onSubmit={save}>
      <div className="file-doc-preview">{preview ? <img src={preview} alt="" /> : <span className="document-icon"><FileText size={22} /></span>}<div><strong>{file.name}</strong><small>{[ext.toUpperCase(), size].filter(Boolean).join(" · ")}{ext === "txt" ? " · il testo diventa il contenuto del documento" : ""}</small></div></div>
      {residents && <fieldset className="text-doc-folders file-doc-people"><legend>Per chi</legend><div>{residents.map((r) => <button type="button" key={r.id} aria-pressed={residentId === r.id} onClick={() => onResidentChange(r.id)}><Avatar resident={r} size="sm" />{r.name.split(" ")[0]}</button>)}</div></fieldset>}
      <label><span>Titolo</span><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Come comparirà in «Cosa sa ROSS»" /></label>
      <FolderChoice choices={choices} value={family} onChange={setFamily} />
      <p className="text-doc-note">ROSS lo usa per accompagnare {name}: non interpreta referti né valori.</p>
      <div className="text-doc-actions"><Button type="button" variant="outline" onClick={onClose}>Annulla</Button><Button type="submit">Aggiungi il documento</Button></div>
    </form>}
  </Dialog>;
}

export function TextDocumentDialog({ open, onClose, onSave, name, choices, initial }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [family, setFamily] = useState(initial);
  useEffect(() => { if (open) setFamily(initial); }, [open, initial]);
  const close = () => { setTitle(""); setText(""); onClose(); };
  const save = (event) => { event.preventDefault(); if (!text.trim()) return; onSave(title, text, family); setTitle(""); setText(""); };
  return <Dialog open={open} onClose={close} title="Aggiungi contenuto testuale" size="md">
    <form className="text-doc-form" onSubmit={save}>
      <p>Incolla o scrivi un testo: diventa un documento .txt che ROSS usa per accompagnare {name}.</p>
      <label><span>Titolo <small>(se vuoi)</small></span><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Per esempio: Note dell'educatrice" /></label>
      <FolderChoice choices={choices} value={family} onChange={setFamily} />
      <label><span>Testo</span><Textarea rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder="Incolla qui il testo…" autoFocus /></label>
      {text.trim() && <small className="text-doc-preview"><FileText size={14} />{txtName(title, text)}.txt · {text.trim().length} caratteri · in «{choices.find((c) => c.id === family)?.label}»</small>}
      <div className="text-doc-actions"><Button type="button" variant="outline" onClick={close}>Annulla</Button><Button type="submit" disabled={!text.trim()}>Aggiungi il documento</Button></div>
    </form>
  </Dialog>;
}

// «Aggiungi un documento»: il menu (Carica dal dispositivo · Aggiungi contenuto testuale) con i suoi dialog.
// Si usa dentro una cartella (parte da quella) e in cima al ritratto della Struttura 2.0; `onAdded` riceve la cartella scelta.
export function AddDocumentMenu({ resident, initial = "persona", onAdd, onAdded, className = "ghost-button" }) {
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [writing, setWriting] = useState(false);
  const name = resident.name.split(" ")[0];
  const choices = folderChoices(name);
  const start = initial && initial !== "giornata" ? initial : "persona";
  const pick = (event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) setPending(file); };
  const saveFile = (file, title, family) => {
    // Un .txt si legge subito: il testo diventa il contenuto del documento.
    if (/\.txt$/i.test(file.name) || file.type === "text/plain") file.text().then((text) => onAdd({ ...textDocument(resident.id, title, text), family }));
    else { const doc = attachmentFrom(file); onAdd({ residentId: resident.id, origin: "staff", ...doc, title: title.trim() || doc.title, family }); }
    setPending(null); onAdded?.(family);
  };
  const saveText = (title, text, family) => { onAdd({ ...textDocument(resident.id, title, text), family }); setWriting(false); onAdded?.(family); };
  return <>
    <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className={className}><Paperclip size={16} /> Aggiungi un documento</button></DropdownMenuTrigger>
      <DropdownMenuContent align="end"><DropdownMenuItem icon={Upload} onSelect={() => fileRef.current?.click()}>Carica dal dispositivo</DropdownMenuItem><DropdownMenuItem icon={TextCursorInput} onSelect={() => setWriting(true)}>Aggiungi contenuto testuale</DropdownMenuItem></DropdownMenuContent>
    </DropdownMenu>
    <input ref={fileRef} type="file" hidden accept="image/*,.pdf,.doc,.docx,.txt" onChange={pick} />
    <FileDocumentDialog file={pending} onClose={() => setPending(null)} name={name} choices={choices} initial={start} onSave={saveFile} />
    <TextDocumentDialog open={writing} onClose={() => setWriting(false)} name={name} choices={choices} initial={start} onSave={saveText} />
  </>;
}
