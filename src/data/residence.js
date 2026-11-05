// La Residenza Aurora vista dall'alto (Struttura 2.0, «Il canale»). Dati dimostrativi.
// Si mostra lo stato dei ROSS e degli spazi, non lo stato delle persone: dispositivo acceso, attivo,
// in pausa perché l'ospite ha scelto il silenzio, da sistemare. Mai cosa si dice, mai da quanto.
// 12 alloggi, 8 con ROSS: ROSS si sceglie, non si impone.
// Coordinate in metri "di piantina": ogni piano è 18 × 6, x verso destra, y verso il fondo.

// Lo stato del dispositivo (non della persona). La modalità Silenziosa, scelta dall'ospite, diventa «in pausa».
export const deviceState = {
  elena: "attivo",
  teresa: "attivo",
  lucia: "acceso",
  antonio: "acceso",
  ada: "acceso",
  carlo: "da_sistemare",
};
export const deviceNote = {
  carlo: "Scollegato da stamattina: probabilmente è stata staccata la spina. Basta ricollegarlo.",
};

export const floorsPlan = [
  { id: "0", label: "Piano terra", rooms: [
    { id: "salone", kind: "comune", name: "Salone", x0: 0, y0: 0, x1: 7, y1: 2.8, ross: "attivo", today: "Alle 17:30 si canta insieme, con ROSS che fa partire le canzoni." },
    { id: "lettura", kind: "comune", name: "Sala lettura", x0: 7, y0: 0, x1: 11, y1: 2.8, ross: "acceso", today: "Al mattino ROSS legge i titoli del giornale a chi si ferma." },
    { id: "cucina", kind: "comune", name: "Cucina didattica", x0: 11, y0: 0, x1: 18, y1: 2.8, ross: null, today: "Mercoledì alle 15:00 si fa la pasta in casa." },
    { id: "ingresso", kind: "comune", name: "Ingresso", x0: 0, y0: 3.4, x1: 5, y1: 6, ross: null },
    { id: "giardino", kind: "giardino", name: "Giardino interno", x0: 5, y0: 3.4, x1: 18, y1: 6, ross: null, today: "Domani alle 10:00 si curano le piante." },
  ] },
  { id: "1", label: "Primo piano", rooms: [
    { id: "106", kind: "alloggio", residentId: "mario", x0: 0, y0: 0, x1: 6, y1: 2.6 },
    { id: "109", kind: "alloggio", residentId: "antonio", x0: 6, y0: 0, x1: 12, y1: 2.6 },
    { id: "112", kind: "alloggio", x0: 12, y0: 0, x1: 18, y1: 2.6 },
    { id: "118", kind: "alloggio", residentId: "carlo", x0: 0, y0: 3.4, x1: 6, y1: 6 },
    { id: "121", kind: "alloggio", residentId: "bruno", x0: 6, y0: 3.4, x1: 12, y1: 6 },
    { id: "124", kind: "alloggio", x0: 12, y0: 3.4, x1: 18, y1: 6 },
  ] },
  { id: "2", label: "Secondo piano", rooms: [
    { id: "204", kind: "alloggio", residentId: "elena", x0: 0, y0: 0, x1: 6, y1: 2.6 },
    { id: "208", kind: "alloggio", x0: 6, y0: 0, x1: 12, y1: 2.6 },
    { id: "211", kind: "alloggio", residentId: "lucia", x0: 12, y0: 0, x1: 18, y1: 2.6 },
    { id: "215", kind: "alloggio", residentId: "ada", x0: 0, y0: 3.4, x1: 6, y1: 6 },
    { id: "219", kind: "alloggio", x0: 6, y0: 3.4, x1: 12, y1: 6 },
    { id: "223", kind: "alloggio", residentId: "teresa", x0: 12, y0: 3.4, x1: 18, y1: 6 },
  ] },
];

export const stateLabel = {
  attivo: "Attivo adesso",
  acceso: "Acceso",
  pausa: "In pausa: silenzio scelto dall'ospite",
  da_sistemare: "Da sistemare",
};

// Lo stato di un ROSS in un alloggio, tenendo conto della modalità attuale dell'ospite.
export function roomState(room, residents) {
  if (room.kind !== "alloggio") return room.ross || null;
  if (!room.residentId) return null;
  const mode = residents.find((r) => r.id === room.residentId)?.mode;
  const s = deviceState[room.residentId];
  if (s === "da_sistemare") return s;
  if (mode === "Silenziosa") return "pausa";
  return s || "acceso";
}
