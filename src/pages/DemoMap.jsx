import { useEffect } from "react";

// Vista "Mappa": la mappatura della demo (parti, schermate, collegamenti e percorsi guidati),
// generata con Floorplan. I sorgenti e come aggiornarla sono in docs/floorplan/.
export function DemoMap() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Mappa della demo · ROSS";
    return () => { document.title = previous; };
  }, []);

  return (
    <main className="demo-map">
      <iframe src={`${import.meta.env.BASE_URL}mappa-ross.html`} title="Mappa della demo ROSS: parti, schermate e collegamenti" />
    </main>
  );
}
