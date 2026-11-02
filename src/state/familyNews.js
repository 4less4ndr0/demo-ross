// Novità da Anna sul tablet di Elena: la visita guidata può chiedere di mostrare l'avviso
// "Anna ti ha mandato qualcosa" anche se Elena l'ha già ascoltato o ha detto "più tardi".
let pending = false;

export const requestFamilyNews = () => { pending = true; window.dispatchEvent(new CustomEvent("ross:news")); };
export const consumeFamilyNews = () => { const show = pending; pending = false; return show; };

// Promemoria di Anna: la visita guidata li rimette "da ricordare" se Elena li aveva già chiusi.
let remindersPending = false;
export const requestReminders = () => { remindersPending = true; window.dispatchEvent(new CustomEvent("ross:reminders")); };
export const consumeReminders = () => { const show = remindersPending; remindersPending = false; return show; };
