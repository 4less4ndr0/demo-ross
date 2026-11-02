// Calendario demo della struttura (fittizio, nessun collegamento reale).
// Ogni attività suggerita si collega solo a un interesse che l'ospite ha scelto di condividere con la struttura.
export const suggestedActivities = {
  elena: [
    { id: "canto", title: "Si canta insieme", when: "Oggi, 17:30", where: "Salone", description: "Un momento per ascoltare e cantare alcune canzoni italiane.", reason: "Elena ha condiviso il suo interesse per la musica.", booking: "Non serve prenotare", escort: "Sì, su richiesta: un operatore può accompagnarla dal piano", contact: "Giulia, educatrice (nome di esempio)", invite: "Elena, oggi alle cinque e mezza in salone si canta insieme. Ti va se te ne parlo?" },
    { id: "giardino", title: "Un momento in giardino", when: "Domani, 10:00", where: "Giardino interno", description: "Un'occasione per curare insieme alcune piante.", reason: "Elena ha condiviso il suo interesse per il giardinaggio.", booking: "Gradita, posti per 8 persone", escort: "Non previsto: il giardino è al piano terra", contact: "Marco, animatore (nome di esempio)", invite: "Elena, domani alle dieci in giardino si curano insieme le piante. Ti va se te ne parlo?" },
  ],
};

// Attività in programma (esempio), per «Vedi tutte le attività».
export const scheduledActivities = [
  { when: "Oggi, 17:30", title: "Si canta insieme", where: "Salone" },
  { when: "Domani, 10:00", title: "Un momento in giardino", where: "Giardino interno" },
  { when: "Domani, 16:00", title: "Lettura del giornale", where: "Sala lettura" },
  { when: "Mercoledì, 10:30", title: "Laboratorio di cucito", where: "Salotto" },
  { when: "Giovedì, 16:30", title: "Torneo di carte", where: "Sala comune" },
];
