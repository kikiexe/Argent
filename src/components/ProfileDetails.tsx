"use client";

import { useEffect, useState, useTransition } from "react";
import { logout } from "@/app/actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Mail01Icon, Calendar01Icon, SmartPhone01Icon, InformationCircleIcon, Logout01Icon, CheckmarkCircle02Icon, Shield01Icon, LockIcon } from "@hugeicons/core-free-icons";

interface ProfileDetailsProps {
  user: {
    id: string;
    email?: string;
    created_at: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
    };
  };
}

export default function ProfileDetails({ user }: ProfileDetailsProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(display-mode: standalone)");
      setIsStandalone(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => {
        setIsStandalone(e.matches);
      };
      
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      startTransition(async () => {
        await logout();
      });
    }
  };

  const email = user.email || "guest@pecune.com";
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0].replace(/[._]/g, " ");
  
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri: Detail Profil */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl font-sans font-black shadow-inner">
            {initials}
          </div>
          
          <div>
            <h3 className="font-sans text-lg font-black text-ink capitalize">
              {fullName}
            </h3>
            <span className="text-xs text-body font-semibold">
              Pengguna Terautentikasi
            </span>
          </div>

          <div className="border-t border-hairline pt-4 flex flex-col gap-2">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-canvas-soft hover:bg-rose-500/10 text-body hover:text-budget-red p-3 rounded-2xl font-sans font-bold text-xs tracking-wider uppercase transition-all duration-150 disabled:opacity-50"
            >
              <HugeiconsIcon icon={Logout01Icon} size={14} strokeWidth={2} />
              <span>{isPending ? "Keluar..." : "Keluar Akun"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Detail Informasi Detail & PWA */}
      <div className="lg:col-span-2 space-y-6">
        {/* Informasi Akun */}
        <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm space-y-4">
          <h4 className="font-sans text-xs font-bold tracking-widest text-body uppercase border-b border-hairline pb-3 flex items-center gap-1.5">
            <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={2} />
            <span>Detail Akun</span>
          </h4>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-canvas-soft flex items-center justify-center text-body">
                <HugeiconsIcon icon={Mail01Icon} size={14} strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <span className="block text-[9px] font-sans font-bold tracking-widest text-body uppercase">Alamat Email</span>
                <span className="text-xs font-semibold text-ink">{email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-canvas-soft flex items-center justify-center text-body">
                <HugeiconsIcon icon={Calendar01Icon} size={14} strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <span className="block text-[9px] font-sans font-bold tracking-widest text-body uppercase">Terdaftar Sejak</span>
                <span className="text-xs font-semibold text-ink">{formatDate(user.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-canvas-soft flex items-center justify-center text-body">
                <HugeiconsIcon icon={InformationCircleIcon} size={14} strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <span className="block text-[9px] font-sans font-bold tracking-widest text-body uppercase">User ID</span>
                <span className="text-[10px] font-mono text-ink-soft select-all">{user.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Aplikasi PWA */}
        <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm space-y-4">
          <h4 className="font-sans text-xs font-bold tracking-widest text-body uppercase border-b border-hairline pb-3 flex items-center gap-1.5">
            <HugeiconsIcon icon={SmartPhone01Icon} size={14} strokeWidth={2} />
            <span>Informasi Aplikasi PWA</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline space-y-1">
              <span className="block text-[8px] font-sans font-bold tracking-widest text-body uppercase">Nama Aplikasi</span>
              <span className="text-sm font-black text-ink">Pecune Ledger</span>
            </div>

            <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline space-y-1">
              <span className="block text-[8px] font-sans font-bold tracking-widest text-body uppercase">Versi Rilis</span>
              <span className="text-sm font-black text-ink">v0.1.0 (Beta)</span>
            </div>

            <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline space-y-1">
              <span className="block text-[8px] font-sans font-bold tracking-widest text-body uppercase">Display Mode</span>
              <span className="text-sm font-black text-ink capitalize">
                {isStandalone ? "Standalone App (PWA)" : "Web Browser"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-canvas-soft border border-hairline space-y-1">
              <span className="block text-[8px] font-sans font-bold tracking-widest text-body uppercase">Status Offline</span>
              <span className="text-sm font-black text-budget-green flex items-center gap-1">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={2} />
                <span>Didukung (Manifest)</span>
              </span>
            </div>
          </div>

          <div className="p-4 border border-dashed border-hairline rounded-2xl bg-canvas-soft/40 space-y-2">
            <h5 className="font-sans text-[10px] font-black text-ink uppercase tracking-wider">
              Apa itu Progressive Web App (PWA)?
            </h5>
          <p className="font-sans text-[10px] text-body font-medium leading-relaxed">
              Pecune dapat dipasang langsung di HP atau komputer Anda melalui menu browser (pilih &apos;Tambahkan ke Layar Utama&apos; atau klik ikon pasang di bilah alamat). Setelah dipasang, aplikasi dapat dibuka seperti aplikasi biasa tanpa navigasi browser, dan berjalan lebih cepat.
            </p>
          </div>
        </div>

        {/* Kebijakan Privasi & Keamanan */}
        <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm space-y-4">
          <h4 className="font-sans text-xs font-bold tracking-widest text-body uppercase border-b border-hairline pb-3 flex items-center gap-1.5">
            <HugeiconsIcon icon={Shield01Icon} size={14} strokeWidth={2} />
            <span>Kebijakan Privasi &amp; Keamanan</span>
          </h4>

          <div className="space-y-4 text-xs font-sans leading-relaxed text-body">
            <div className="space-y-1">
              <h5 className="font-bold text-ink flex items-center gap-1.5">
                <HugeiconsIcon icon={LockIcon} size={12} strokeWidth={2} className="text-indigo-600" />
                Data Keuangan Aman &amp; Privat
              </h5>
              <p>
                Semua catatan keuangan, kategori, dan transaksi Anda hanya bisa dilihat dan diatur oleh Anda sendiri. Sistem memastikan tidak ada pengguna lain yang dapat mengintip atau mengakses data keuangan Anda.
              </p>
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-ink">Akses Masuk yang Aman</h5>
              <p>
                Sesi masuk Anda dilindungi menggunakan metode penguncian standar industri yang aman di browser Anda. Ini mencegah pihak lain membajak akun Anda saat sedang digunakan.
              </p>
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-ink">Bebas Pelacak &amp; Iklan</h5>
              <p>
                Kami tidak memasang iklan, tidak merekam aktivitas keuangan Anda untuk dijual ke pihak luar, dan tidak melacak apa pun yang Anda catat. Data keuangan Anda sepenuhnya rahasia milik Anda sendiri.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
