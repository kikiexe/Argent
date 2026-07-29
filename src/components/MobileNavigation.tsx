"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Folder01Icon, Receipt, UserIcon } from "@hugeicons/core-free-icons";

export default function MobileNavigation() {
  const pathname = usePathname();

  // Show the navigation tab bar only on authenticated app pages
  const allowedPaths = ["/dashboard", "/categories", "/transactions", "/profile"];
  if (!pathname || !allowedPaths.includes(pathname)) {
    return null;
  }

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home01Icon },
    { href: "/categories", label: "Categories", icon: Folder01Icon },
    { href: "/transactions", label: "Transactions", icon: Receipt },
    { href: "/profile", label: "Profile", icon: UserIcon }
  ];

  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 flex sm:hidden items-center gap-3 pointer-events-none">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 border pointer-events-auto ${
              isActive
                ? "bg-ink text-canvas border-ink scale-105"
                : "bg-card text-ink/60 border-hairline hover:text-ink hover:border-ink/20"
            }`}
          >
            <HugeiconsIcon
              icon={link.icon}
              size={18}
              strokeWidth={isActive ? 2.5 : 1.8}
              className="transition-transform duration-200"
            />
          </Link>
        );
      })}
    </div>
  );
}
