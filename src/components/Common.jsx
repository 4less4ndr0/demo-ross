import { HelpCircle, Info } from "lucide-react";
import { useRef, useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// Foto degli ospiti della demo (public/ospiti, ritagliate dal collage): dove manca restano le iniziali.
const photoIds = new Set(["antonio", "lucia", "mario", "carlo", "ada", "bruno", "elena", "teresa"]);
export const residentPhoto = (resident) => photoIds.has(resident.id) ? `${import.meta.env.BASE_URL}ospiti/${resident.id}.webp` : null;

export function Avatar({ resident, size = "md" }) {
  const photo = residentPhoto(resident);
  return <span className={`avatar avatar-${size} avatar-${resident.color || "mint"}${photo ? " avatar-photo" : ""}`} aria-label={resident.name} role="img">{photo ? <img src={photo} alt="" loading="lazy" /> : resident.initials}</span>;
}

export function ModeBadge({ mode }) {
  return <span className={`mode-badge mode-${mode.toLowerCase()}`}><span />{mode}</span>;
}

// Tooltip informativo (Radix): in un portal, evita i bordi dello schermo; hover, focus e tocco.
export function InfoTip({ label, text }) {
  const [open, setOpen] = useState(false);
  const touched = useRef(false);
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>
          <span className="info-tip" role="button" tabIndex="0" aria-label={`${label}: ${text}`}
            onPointerDown={(event) => { if (event.pointerType !== "mouse") { event.preventDefault(); touched.current = true; setOpen((value) => !value); } }}
            onFocus={(event) => { if (touched.current) event.preventDefault(); }}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); if (!touched.current) setOpen(true); touched.current = false; }}>
            <Info size={15} />
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="ui-tooltip" side="bottom" align="center" sideOffset={8} collisionPadding={12} onPointerDownOutside={() => setOpen(false)}>
            <strong>{label}</strong>{text}
            <TooltipPrimitive.Arrow className="ui-tooltip-arrow" width={12} height={6} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
      {action}
    </div>
  );
}

export function Metric({ icon: Icon, value, label, detail, tip, tone = "mint" }) {
  return (
    <div className="metric">
      <span className={`metric-icon tone-${tone}`}><Icon size={21} /></span>
      <div><strong>{value}</strong><span>{label}{tip && <InfoTip label={label} text={tip} />}</span><small>{detail}</small></div>
    </div>
  );
}

export function EmptyState({ title = "Nessun risultato", description = "Prova a cambiare filtri o ricerca.", icon: Icon = HelpCircle }) {
  return <div className="empty-state"><Icon size={28} /><strong>{title}</strong><p>{description}</p></div>;
}

export function ProgressBar({ value, tone = "mint" }) {
  return <div className="progress-track" aria-label={`${value}%`}><span className={`tone-${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function DataExplanation({ children }) {
  return <div className="data-explanation"><Info size={15} />{children}</div>;
}
