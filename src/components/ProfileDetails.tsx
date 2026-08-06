"use client";

import { useEffect, useState, useTransition } from "react";
import { logout } from "@/app/actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Mail01Icon, Calendar01Icon, SmartPhone01Icon, InformationCircleIcon, Logout01Icon, CheckmarkCircle02Icon, Shield01Icon, LockIcon } from "@hugeicons/core-free-icons";
import { FluentEmoji } from "@lobehub/fluent-emoji";
import { updateProfileAvatar } from "@/app/profile/actions";

interface ProfileDetailsProps {
  user: {
    id: string;
    email?: string;
    created_at: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_emoji?: string;
    };
  };
}

const FIRST_ROW_EMOJIS = ["😊", "😎", "🤪", "🤠", "😇", "🤖"];

const ALL_EMOJIS = [
  // Smileys / Human Heads
  "😊", "😎", "🤪", "🤠", "😇", "🤖",
  "🤡", "👽", "👻", "🎃", "👿", "💀",
  "😀", "😃", "😄", "😆", "😅", "😂",
  "🤣", "😉", "😍", "🥰", "😘", "😋",
  "😜", "🥳", "🤩", "🧐", "🤓", "😏",
  "🥺", "😭", "😡", "🤯", "😱", "🤔",
  "🥵", "🥶", "🥱", "😴", "🤤", "🤢",
  "😈", "👹", "👺", "💩", "😷", "🤑",
  
  // Animals / Creature Heads
  "🐶", "🐱", "🦊", "🦁", "🐼", "🐨",
  "🐯", "🐰", "🐻", "🐷", "🐸", "🐵",
  "🐮", "🐹", "🐭", "🐻‍❄️", "🐧", "🐙",
  "🦉", "🐥", "🙈", "🐺", "🙉", "🙊"
];

export default function ProfileDetails({ user }: ProfileDetailsProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [activeEmoji, setActiveEmoji] = useState<string | null>(
    user.user_metadata?.avatar_emoji || null
  );
  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    setActiveEmoji(user.user_metadata?.avatar_emoji || null);
  }, [user.user_metadata?.avatar_emoji]);

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      startTransition(async () => {
        await logout();
      });
    }
  };

  const handleSelectEmoji = (emoji: string | null) => {
    setActiveEmoji(emoji);
    setSaveError(null);
    startSaving(async () => {
      const res = await updateProfileAvatar(emoji || "");
      if (res.error) {
        setSaveError(res.error);
        // Revert local state on error
        setActiveEmoji(user.user_metadata?.avatar_emoji || null);
      }
    });
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
          {activeEmoji ? (
            <div className="mx-auto w-24 h-24 bg-indigo-100 dark:bg-indigo-950/40 rounded-full flex items-center justify-center shadow-inner relative">
              {isSaving && (
                <div className="absolute inset-0 bg-card/60 backdrop-blur-[1px] rounded-full flex items-center justify-center z-10">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <FluentEmoji emoji={activeEmoji} type="3d" size={64} />
            </div>
          ) : (
            <div className="mx-auto w-24 h-24 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl font-sans font-black shadow-inner relative">
              {isSaving && (
                <div className="absolute inset-0 bg-card/60 backdrop-blur-[1px] rounded-full flex items-center justify-center z-10">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <span>{initials}</span>
            </div>
          )}
          
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

        {/* Card Pilih Avatar Emoji */}
        <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm space-y-4">
          <h4 className="font-sans text-xs font-bold tracking-widest text-body uppercase border-b border-hairline pb-3 flex items-center gap-1.5">
            <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={2} className="text-indigo-600" />
            <span>Pilih Avatar Emoji</span>
          </h4>
          
          <p className="font-sans text-[10px] text-body font-medium leading-relaxed">
            Pilih salah satu emoji 3D di bawah ini untuk digunakan sebagai foto profil utama Anda.
          </p>

          {saveError && (
            <div className="text-[10px] text-budget-red font-semibold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-6 gap-2">
            {FIRST_ROW_EMOJIS.map((emoji) => {
              const isSelected = activeEmoji === emoji;
              return (
                <button
                  key={emoji}
                  disabled={isSaving}
                  onClick={() => handleSelectEmoji(emoji)}
                  className={`aspect-square flex items-center justify-center p-1.5 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 dark:bg-indigo-950/40 dark:border-indigo-400 scale-105"
                      : "bg-canvas-soft border-hairline hover:bg-canvas-soft/80 hover:scale-105"
                  } disabled:opacity-50 disabled:pointer-events-none`}
                  title={`Pilih ${emoji}`}
                >
                  <FluentEmoji emoji={emoji} type="3d" size={24} />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2.5 px-4 bg-canvas-soft hover:bg-canvas-soft/80 border border-hairline rounded-2xl font-sans font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-150"
          >
            <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={2} className="text-indigo-600" />
            <span>Jelajahi Avatar</span>
          </button>

          {activeEmoji && (
            <button
              disabled={isSaving}
              onClick={() => handleSelectEmoji(null)}
              className="w-full text-center text-[10px] font-bold text-body hover:text-ink transition-colors pt-2 border-t border-hairline"
            >
              Hapus Avatar &amp; Gunakan Inisial
            </button>
          )}
        </div>

        {/* Modal Jelajahi Avatar */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)} 
            />
            {/* Modal Box */}
            <div className="bg-card w-full max-w-sm p-6 rounded-3xl border border-hairline shadow-xl relative z-10 space-y-4 max-h-[90vh] flex flex-col justify-between">
              <div>
                <h4 className="font-sans text-sm font-black text-ink uppercase border-b border-hairline pb-3">
                  Jelajahi Avatar Emoji 3D
                </h4>
                <p className="font-sans text-[10px] text-body font-medium leading-relaxed mt-2 mb-4">
                  Pilih salah satu karakter kepala 3D di bawah ini. Semua karakter menghadap langsung ke depan.
                </p>
                <div className="grid grid-cols-6 gap-2 overflow-y-auto max-h-[50vh] p-0.5">
                  {ALL_EMOJIS.map((emoji) => {
                    const isSelected = activeEmoji === emoji;
                    return (
                      <button
                        key={emoji}
                        disabled={isSaving}
                        onClick={() => {
                          handleSelectEmoji(emoji);
                          setIsModalOpen(false);
                        }}
                        className={`aspect-square flex items-center justify-center p-1.5 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-500 dark:bg-indigo-950/40 dark:border-indigo-400 scale-105"
                            : "bg-canvas-soft border-hairline hover:bg-canvas-soft/80 hover:scale-105"
                        } disabled:opacity-50 disabled:pointer-events-none`}
                        title={`Pilih ${emoji}`}
                      >
                        <FluentEmoji emoji={emoji} type="3d" size={24} />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 bg-canvas-soft hover:bg-canvas-soft/80 border border-hairline rounded-2xl font-sans font-bold text-[10px] tracking-wider uppercase transition-all duration-150 mt-4"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
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
