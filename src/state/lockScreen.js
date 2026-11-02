// Schermata di blocco dell'iPhone di Anna (vista Famiglia).
// "first": si vede la prima volta che si apre Oggi in ogni caricamento della demo, ma non durante la visita guidata.
// "asked": richiesta esplicita (pillola "Vista demo" o primo passo del capitolo Famiglia della visita), vale sempre.
let pending = "first";

export const requestLockScreen = () => { pending = "asked"; window.dispatchEvent(new CustomEvent("ross:lockscreen")); };
export const consumeLockScreen = (duringTour = false) => { const show = pending === "asked" || (pending === "first" && !duringTour); pending = null; return show; };
export const releaseLockScreen = () => window.dispatchEvent(new CustomEvent("ross:unlock"));
