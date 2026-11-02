// Schermata di blocco dell'iPhone di Anna (vista Famiglia).
// "first": si vede la prima volta che si apre Oggi in ogni caricamento della demo, ma non durante la visita guidata.
// "asked": richiesta esplicita (pillola "Vista demo" o primo passo del capitolo Famiglia della visita), vale sempre.
let pending = "first";

export const requestLockScreen = () => { pending = "asked"; window.dispatchEvent(new CustomEvent("ross:lockscreen")); };
// La prima volta si vede solo con la cornice iPhone accesa; una richiesta esplicita vale sempre (e la cornice si accende).
export const consumeLockScreen = (duringTour = false, phoneOn = true) => { const show = pending === "asked" || (pending === "first" && !duringTour && phoneOn); pending = null; return show; };
export const releaseLockScreen = () => window.dispatchEvent(new CustomEvent("ross:unlock"));
