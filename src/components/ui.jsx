// Primitive in stile shadcn/ui (Radix + Sonner) con i token visivi di ROSS.
import { forwardRef } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Toaster as SonnerToaster } from "sonner";
import { Check, ChevronDown, X } from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export const Button = forwardRef(function Button({ variant = "default", size = "md", className, ...props }, ref) {
  return <button ref={ref} className={cx("ui-button", `ui-button-${variant}`, `ui-button-${size}`, className)} {...props} />;
});

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuSub = DropdownPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;

export function DropdownMenuContent({ className, sideOffset = 6, align = "end", ...props }) {
  return <DropdownPrimitive.Portal><DropdownPrimitive.Content sideOffset={sideOffset} align={align} className={cx("ui-menu", className)} {...props} /></DropdownPrimitive.Portal>;
}
export function DropdownMenuItem({ className, icon: Icon, shortcut, children, destructive, ...props }) {
  return <DropdownPrimitive.Item className={cx("ui-menu-item", destructive && "ui-menu-item-destructive", className)} {...props}>{Icon && <Icon size={15} />}<span>{children}</span>{shortcut && <kbd>{shortcut}</kbd>}</DropdownPrimitive.Item>;
}
export function DropdownMenuRadioItem({ children, ...props }) {
  return <DropdownPrimitive.RadioItem className="ui-menu-item ui-menu-radio" {...props}><span className="ui-menu-indicator"><DropdownPrimitive.ItemIndicator><Check size={14} /></DropdownPrimitive.ItemIndicator></span><span>{children}</span></DropdownPrimitive.RadioItem>;
}
export function DropdownMenuLabel({ children }) {
  return <DropdownPrimitive.Label className="ui-menu-label">{children}</DropdownPrimitive.Label>;
}
export function DropdownMenuSeparator() {
  return <DropdownPrimitive.Separator className="ui-menu-separator" />;
}

export function Sheet({ open, onOpenChange, side = "left", title, description, children, className }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="ui-sheet-overlay" />
      <DialogPrimitive.Content className={cx("ui-sheet", `ui-sheet-${side}`, className)} aria-describedby={undefined} onOpenAutoFocus={(event) => { event.preventDefault(); event.currentTarget.focus(); }}>
        <DialogPrimitive.Title className={title ? "ui-sheet-title" : "ui-sr-only"}>{title || "Pannello"}</DialogPrimitive.Title>
        {description && <DialogPrimitive.Description className="ui-sheet-description">{description}</DialogPrimitive.Description>}
        {children}
        <DialogPrimitive.Close className="ui-sheet-close" aria-label="Chiudi"><X size={16} /></DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}

export function Dialog({ open, onClose, title, size = "md", children }) {
  return <DialogPrimitive.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="ui-sheet-overlay ui-dialog-overlay" />
      <DialogPrimitive.Content className={cx("modal", `modal-${size}`, "ui-dialog")} aria-describedby={undefined}>
        <header><DialogPrimitive.Title asChild><h2>{title}</h2></DialogPrimitive.Title><DialogPrimitive.Close className="ui-button ui-button-ghost ui-button-icon" aria-label="Chiudi"><X size={17} /></DialogPrimitive.Close></header>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}

const toOptions = (values) => values.map((v) => (typeof v === "string" ? { value: v, label: v } : v));

export function Select({ value, onValueChange, options, groups, label, className, placeholder }) {
  options = options && toOptions(options);
  const all = groups ? groups.flatMap((g) => g.options) : options;
  const current = all.find((o) => o.value === value);
  return <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
    <SelectPrimitive.Trigger className={cx("ui-select-trigger", className)} aria-label={label}>
      <SelectPrimitive.Value placeholder={placeholder}>{current?.label}</SelectPrimitive.Value>
      <SelectPrimitive.Icon><ChevronDown size={15} /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className="ui-menu ui-select-content" position="popper" sideOffset={6}>
        <SelectPrimitive.Viewport>
          {(groups || [{ options }]).map((group, index) => <SelectPrimitive.Group key={group.label || index}>
            {index > 0 && <SelectPrimitive.Separator className="ui-menu-separator" />}
            {group.label && <SelectPrimitive.Label className="ui-menu-label">{group.label}</SelectPrimitive.Label>}
            {group.options.map((option) => <SelectPrimitive.Item key={option.value} value={option.value} className="ui-menu-item ui-menu-radio">
              <span className="ui-menu-indicator"><SelectPrimitive.ItemIndicator><Check size={14} /></SelectPrimitive.ItemIndicator></span>
              <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>)}
          </SelectPrimitive.Group>)}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>;
}

export function Toaster() {
  return <SonnerToaster position="bottom-right" offset={{ bottom: 96, right: 24 }} mobileOffset={{ bottom: 96 }} closeButton toastOptions={{ classNames: { toast: "ui-toast", title: "ui-toast-title", description: "ui-toast-description", actionButton: "ui-toast-action", closeButton: "ui-toast-close" } }} />;
}
