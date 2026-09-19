import type { ReactNode } from "react";

type PanelProps = {
  className?: string;
  children: ReactNode;
};

export function Panel({ className = "", children }: PanelProps) {
  return (
    <div className={`bg-brand-panel border border-brand-border ${className}`}>
      {children}
    </div>
  );
}

type PanelHeaderProps = {
  title: string;
  meta: string;
  metaClassName?: string;
};

/** 32px panel header strip: title on the left, mono meta text on the right. */
export function PanelHeader({
  title,
  meta,
  metaClassName = "text-fg-3",
}: PanelHeaderProps) {
  return (
    <div className="h-8 px-3 border-b border-brand-border flex items-center justify-between shrink-0 bg-brand-panel">
      <span className="text-[11px] font-bold text-white tracking-wider uppercase">
        {title}
      </span>
      <span className={`text-[10px] font-mono ${metaClassName}`}>{meta}</span>
    </div>
  );
}
