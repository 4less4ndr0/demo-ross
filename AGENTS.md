# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Decisioni di prodotto (vista Struttura)

- ROSS si posiziona **on top** dei sistemi della RSA: non è un gestionale e non ne duplica funzioni (niente anagrafica, note di reparto, pianificazione attività).
- La home della Struttura è una chat a frizione zero sul modello ChatGPT ("Chiedi a ROSS"), usabile anche da telefono. Le risposte citano sempre la fonte (conversazione ROSS, documento, nota).
- Il target non è ancora definito: il selettore di ruolo (Operatore, Coordinatrice, Psicologa, Direzione) resta finché la scelta non è fatta.
- I documenti clinici (fisioterapia, esami) sono visibili ma secondari: il protagonista del test è la conversazione tra ROSS e l'ospite. Si allegano **solo dalla chat** (graffetta); il tab Documenti della cartella è in sola lettura.
- Ogni ospite ha un **report narrativo stampabile** ("Come sta", `/report?ospite=ID`) pensato per l'équipe interna: tono osservativo, nessuna diagnosi, non cita i documenti. Si apre dalla cartella ("Stampa report"), dalla chat o dal menu Report.
- Menu della Struttura: Chiedi a ROSS · Ospiti · Report, più Impostazioni. Non reintrodurre pagine separate per insight, consegne, analytics o interazioni: vanno accorpate nella chat, nella cartella o nel report.
