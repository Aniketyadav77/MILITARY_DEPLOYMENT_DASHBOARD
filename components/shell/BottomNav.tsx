"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { isActivePath, navItems } from "@/lib/navigation";

const base =
  "flex flex-col items-center justify-center px-6 h-full border-t-2 transition-none";
const activeStyle = "border-white text-white bg-brand-bg";
const idleStyle =
  "border-transparent text-fg-3 hover:text-white hover:bg-hover";

/** 56px bottom navigation rail shared by every screen; highlights the active route. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="h-[56px] bg-brand-panel border-t border-brand-border flex items-stretch shrink-0 z-50"
    >
      {navItems.map(({ label, icon, href }) => {
        const active = href !== undefined && isActivePath(pathname, href);
        const className = `${base} ${active ? activeStyle : idleStyle}`;
        const content = (
          <>
            <Icon name={icon} size={18} />
            <span
              className={`text-[10px] tracking-wider mt-0.5 uppercase ${active ? "font-bold" : "font-medium"}`}
            >
              {label}
            </span>
          </>
        );

        return href ? (
          <Link
            key={label}
            href={href}
            className={className}
            aria-current={active ? "page" : undefined}
          >
            {content}
          </Link>
        ) : (
          <button key={label} type="button" className={className}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}
