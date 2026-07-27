"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Folder01Icon, Receipt } from "@hugeicons/core-free-icons";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home01Icon },
    { href: "/categories", label: "Categories", icon: Folder01Icon },
    { href: "/transactions", label: "Transactions", icon: Receipt }
  ];

  return (
    <nav className="hidden sm:flex items-center gap-6 font-sans text-xs font-bold tracking-widest uppercase">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all duration-150 ${
              isActive
                ? "text-link border-link font-bold"
                : "text-body border-transparent hover:text-ink hover:border-body"
            }`}
          >
            <HugeiconsIcon icon={link.icon} size={14} strokeWidth={isActive ? 2.2 : 1.8} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
