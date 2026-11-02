// Schermata di blocco dell'iPhone di Anna (vista Famiglia): si vede la prima volta che si apre Oggi
// in ogni caricamento della demo, e di nuovo quando chi presenta la richiede dalla pillola "Vista demo".
let pending = true;

export const requestLockScreen = () => { pending = true; window.dispatchEvent(new CustomEvent("ross:lockscreen")); };
export const consumeLockScreen = () => { const show = pending; pending = false; return show; };
