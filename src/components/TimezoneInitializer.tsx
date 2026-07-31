"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TimezoneInitializer() {
  const router = useRouter();

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, val] = cookie.split("=").map((c) => c.trim());
      if (key) acc[key] = val;
      return acc;
    }, {} as Record<string, string>);

    if (cookies["user-timezone"] !== timezone) {
      document.cookie = `user-timezone=${encodeURIComponent(timezone)}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    }
  }, [router]);

  return null;
}
