"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Wallet01Icon,
  Analytics01Icon,
  Folder01Icon,
  Receipt,
  ArrowRight01Icon,
  MenuIcon,
  Cancel01Icon,
  SmartPhone01Icon,
  CheckmarkCircle02Icon
} from "@hugeicons/core-free-icons";

/* Image links from Supabase Storage assets.txt */
const IMAGES = {
  home: "https://ifyrxutgoacbitxuistd.supabase.co/storage/v1/object/sign/main-web/home.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZDllYzE1NC0yNDIxLTQzMTktODQxZC1iMWI5NTk2NzYyZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWluLXdlYi9ob21lLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODUxNjMyMzksImV4cCI6MTgxNjY5OTIzOX0.LaIzpmRWBosv2WjVaR7SyEJvkqzu5WKwKt4O0WvoFJo",
  homeChart: "https://ifyrxutgoacbitxuistd.supabase.co/storage/v1/object/sign/main-web/home-chart.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZDllYzE1NC0yNDIxLTQzMTktODQxZC1iMWI5NTk2NzYyZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWluLXdlYi9ob21lLWNoYXJ0LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODUxNjMyMTksImV4cCI6MTgxNjY5OTIxOX0.wUUgfnFLH5FRESF7OOk5IzV_RIE6wGoc59WODeiGg-k",
  categoryList: "https://ifyrxutgoacbitxuistd.supabase.co/storage/v1/object/sign/main-web/category-list.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZDllYzE1NC0yNDIxLTQzMTktODQxZC1iMWI5NTk2NzYyZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWluLXdlYi9jYXRlZ29yeS1saXN0LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODUxNjMxMTQsImV4cCI6MTgxNjY5OTExNH0.Ja6u1XNx2rqKp_3fhRS1l0RtzO52cFZyc5Xc9qgOBOo",
  transactionsList: "https://ifyrxutgoacbitxuistd.supabase.co/storage/v1/object/sign/main-web/transactions-list.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZDllYzE1NC0yNDIxLTQzMTktODQxZC1iMWI5NTk2NzYyZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWluLXdlYi90cmFuc2FjdGlvbnMtbGlzdC5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg1MTYzMjk4LCJleHAiOjE4MTY2OTkyOTh9.gnE3XlhB_osXQXlfIf5IsPZlU85i4qPvm0n9ow3wtHQ",
  step1Android: "https://ifyrxutgoacbitxuistd.supabase.co/storage/v1/object/sign/main-web/step1-android.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZDllYzE1NC0yNDIxLTQzMTktODQxZC1iMWI5NTk2NzYyZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWluLXdlYi9zdGVwMS1hbmRyb2lkLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODUxNjMyNDgsImV4cCI6MTgxNjY5OTI0OH0.ZfVlODVoDauGcf5QvZ_LT7_DUmsk4hrrMuz6TrBY8MU",
  step2Android: "https://ifyrxutgoacbitxuistd.supabase.co/storage/v1/object/sign/main-web/step2-android.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZDllYzE1NC0yNDIxLTQzMTktODQxZC1iMWI5NTk2NzYyZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWluLXdlYi9zdGVwMi1hbmRyb2lkLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODUxNjMyNjEsImV4cCI6MTgxNjY5OTI2MX0.-8MpItpeJxbswvsB2SF1JW5jjiiMIglbD8F6u4jsmdk",
  step1Ios: "https://ifyrxutgoacbitxuistd.supabase.co/storage/v1/object/sign/main-web/step1-ios.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZDllYzE1NC0yNDIxLTQzMTktODQxZC1iMWI5NTk2NzYyZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWluLXdlYi9zdGVwMS1pb3MucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NTE2MzI3MSwiZXhwIjoxODE2Njk5MjcxfQ.RVgkVRmw2i71ddFBtt4MuymjfPHsr0_WZ5NjMF2EljY",
  step2Ios: "https://ifyrxutgoacbitxuistd.supabase.co/storage/v1/object/sign/main-web/step2-ios.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZDllYzE1NC0yNDIxLTQzMTktODQxZC1iMWI5NTk2NzYyZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWluLXdlYi9zdGVwMi1pb3MucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NTE2MzI4MCwiZXhwIjoxODE2Njk5MjgwfQ.pRdnJXKbhQsxsn20AoxNAcRX6AHk31jXM-y9O8gsaRc"
};

/*
  Sistem token disamakan dengan DESIGN.md aplikasi utama:
  Canvas #ffffff, Canvas Soft #f5f5f5, Ink #000000,
  Body Gray #757575, Hairline #e0e0e0.
  Satu aksen dipakai: hijau anggaran (#16a34a), karena warna itu
  sudah punya makna fungsional di aplikasi (status anggaran sehat),
  bukan warna dekoratif yang ditempel sembarangan.
*/

const sampleLedger = [
  { note: "Tambal Ban", amount: "-15.000", type: "expense" as const },
  { note: "Kopi Susu Abang Kantin", amount: "-12.000", type: "expense" as const },
  { note: "Token Listrik", amount: "-100.000", type: "expense" as const },
  { note: "Gaji Freelance", amount: "+750.000", type: "income" as const },
  { note: "Warteg Bu Ida", amount: "-18.000", type: "expense" as const }
];

const features = [
  {
    title: "Ledger Terisolasi Penuh",
    desc: "Setiap akun punya ruang pembukuan sendiri lewat Row Level Security di database. Punyamu tidak akan pernah tercampur atau terlihat oleh akun lain",
    icon: Wallet01Icon,
    img: IMAGES.home
  },
  {
    title: "Sisa Anggaran, Bukan Sekadar Angka",
    desc: "Satu angka besar menunjukkan sisa jatah bulan ini, dengan indikator warna yang berubah begitu kamu mendekati batas",
    icon: Analytics01Icon,
    img: IMAGES.homeChart
  },
  {
    title: "Kategori Milikmu Sendiri",
    desc: "Bukan daftar kategori generik. Tambahkan kategori sesuai hidupmu sendiri, sekecil apa pun, sekonyol apa pun",
    icon: Folder01Icon,
    img: IMAGES.categoryList
  },
  {
    title: "Catat Secepat Nulis Struk",
    desc: "Form singkat untuk transaksi harian, dirancang supaya tidak menghalangi kamu buru-buru ke kelas atau kerjaan",
    icon: Receipt,
    img: IMAGES.transactionsList
  }
];

const faqs = [
  {
    q: "Siapa saja yang bisa pakai Pecune?",
    a: "Hanya akun yang sudah didaftarkan langsung oleh pengelola. Tidak ada pendaftaran umum, supaya lingkaran penggunanya tetap kecil dan tepercaya."
  },
  {
    q: "Apakah data saya bisa dilihat orang lain?",
    a: "Tidak. Setiap catatan, kategori, dan anggaran terkunci di tingkat database untuk masing-masing akun."
  },
  {
    q: "Bisa dipasang di HP?",
    a: "Bisa, lewat menu \"Tambahkan ke Layar Utama\" di browser HP kamu, tanpa perlu unduh dari toko aplikasi."
  }
];

export default function LandingPage() {
  const [platform, setPlatform] = useState<"android" | "ios">("android");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-serif-body selection:bg-black selection:text-white">
      <style>{`
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-serif-body { font-family: 'Lora', Georgia, serif; }
        .font-label { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* Masthead */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e0e0e0]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-2xl font-bold tracking-tight">Pecune</span>

          <nav className="hidden md:flex items-center gap-8 font-label text-[11px] font-bold uppercase tracking-widest text-[#757575]">
            <a href="#fitur" className="hover:text-black transition-colors">Fitur</a>
            <a href="#instalasi" className="hover:text-black transition-colors">Instalasi</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </nav>

          <Link
            href="/login"
            className="hidden md:flex items-center gap-2 bg-black text-white font-label text-[11px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-none hover:bg-[#1a1a1a] transition-colors"
          >
            <span>Masuk Ledger</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2.2} />
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-black"
            aria-label="Buka menu"
          >
            <HugeiconsIcon icon={menuOpen ? Cancel01Icon : MenuIcon} size={22} strokeWidth={1.8} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#e0e0e0] px-6 py-6 space-y-4 font-label">
            <nav className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-widest text-[#757575]">
              <a href="#fitur" onClick={() => setMenuOpen(false)}>Fitur</a>
              <a href="#instalasi" onClick={() => setMenuOpen(false)}>Instalasi</a>
              <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            </nav>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-black text-white text-[11px] font-bold uppercase tracking-widest py-3"
            >
              Masuk Ledger
            </Link>
          </div>
        )}
      </header>

      {/* Hero: signature element = struk ledger robek */}
      <section className="min-h-[calc(100vh-4rem)] flex items-center border-b border-[#e0e0e0] py-12 md:py-0">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-6">
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.25em] text-[#757575]">
              Pembukuan Pribadi, Bukan Bisnis
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight">
              Setiap tambal ban, kopi susu, dan gaji mu tercatat rapi
            </h1>
            <p className="text-base text-[#757575] leading-relaxed max-w-md">
              Pecune adalah ledger pribadi yang percaya pada satu prinsip:
              kalau tidak dicatat, uang itu terasa hilang begitu saja padahal jelas ke mana perginya
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-black text-white font-label text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#1a1a1a] transition-colors"
              >
                <span>Buka Aplikasi</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2.2} />
              </Link>
              <a
                href="#fitur"
                className="inline-flex items-center justify-center border border-black font-label text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#f5f5f5] transition-colors"
              >
                Pelajari Fitur
              </a>
            </div>
          </div>

          {/* Struk ledger, elemen signature */}
          <div className="relative mx-auto w-full max-w-sm">
            <div
              className="bg-[#f5f5f5] border border-[#e0e0e0] px-6 py-8 shadow-none"
              style={{
                clipPath:
                  "polygon(0% 2%,4% 0%,8% 2%,12% 0%,16% 2%,20% 0%,24% 2%,28% 0%,32% 2%,36% 0%,40% 2%,44% 0%,48% 2%,52% 0%,56% 2%,60% 0%,64% 2%,68% 0%,72% 2%,76% 0%,80% 2%,84% 0%,88% 2%,92% 0%,96% 2%,100% 0%,100% 98%,96% 100%,92% 98%,88% 100%,84% 98%,80% 100%,76% 98%,72% 100%,68% 98%,64% 100%,60% 98%,56% 100%,52% 98%,48% 100%,44% 98%,40% 100%,36% 98%,32% 100%,28% 98%,24% 100%,20% 98%,16% 100%,12% 98%,8% 100%,4% 98%,0% 100%)"
              }}
            >
              <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-center text-[#757575] mb-1">
                Pecune Ledger
              </p>
              <p className="font-label text-[10px] text-center text-[#757575] mb-5">
                Juli 2026 &middot; Bulan Berjalan
              </p>
              <div className="space-y-3">
                {sampleLedger.map((row, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-dashed border-[#e0e0e0] pb-3">
                    <span className="font-serif-body text-sm">{row.note}</span>
                    <span
                      className={`font-label text-sm font-bold ${
                        row.type === "income" ? "text-[#16a34a]" : "text-black"
                      }`}
                    >
                      {row.amount}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-black flex items-center justify-between">
                <span className="font-label text-[11px] font-bold uppercase tracking-widest">Sisa Anggaran</span>
                <span className="font-display text-xl font-bold text-[#16a34a]">Rp 605.000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Mockup Billboard */}
      <section className="py-16 md:py-24 border-b border-[#e0e0e0]">
        <div className="max-w-5xl mx-auto px-6">
          <Image 
            src={IMAGES.home} 
            alt="Pecune Dashboard App Mockup" 
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="py-20 md:py-28 border-b border-[#e0e0e0]">
        <div className="max-w-5xl mx-auto px-6 space-y-14">
          <div className="max-w-xl">
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.25em] text-[#757575]">
              Mengapa Pecune
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight mt-3">
              Sederhana, terisolasi, dan sepenuhnya terkendali
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-[#e0e0e0]">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <HugeiconsIcon icon={f.icon} size={22} strokeWidth={1.6} />
                  <h3 className="font-display text-lg font-bold tracking-tight">{f.title}</h3>
                  <p className="text-sm text-[#757575] leading-relaxed">{f.desc}</p>
                </div>
                {f.img && (
                  <Image 
                    src={f.img} 
                    alt={f.title} 
                    width={800}
                    height={500}
                    className="w-full h-auto object-contain mt-2" 
                    loading="lazy" 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instalasi PWA */}
      <section id="instalasi" className="py-20 md:py-28 border-b border-[#e0e0e0] bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          <div className="max-w-xl">
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.25em] text-[#757575]">
              Panduan Instalasi
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight mt-3">
              Pasang di HP, tanpa toko aplikasi
            </h2>
          </div>

          <div className="flex gap-2">
            {(["android", "ios"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest px-5 py-2.5 border ${
                  platform === p
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-[#e0e0e0] hover:border-black"
                }`}
              >
                <HugeiconsIcon icon={SmartPhone01Icon} size={13} strokeWidth={2} />
                {p === "android" ? "Android · Chrome" : "iOS · Safari"}
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#e0e0e0] p-8 max-w-3xl space-y-8">
            <ol className="space-y-4">
              {(platform === "android"
                ? [
                    "Buka halaman login Pecune di Chrome, lalu ketuk menu tiga titik di pojok kanan atas",
                    "Pilih \"Install dan buat pintasan\"",
                    "Lalu konfirmasi"
                  ]
                : [
                    "Buka halaman login Pecune di Safari, lalu ketuk ikon Share di menu bar bawah",
                    "Gulir ke bawah, pilih \"Tambahkan ke Layar Utama\", lalu ketuk Tambah"
                  ]
              ).map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="shrink-0 mt-0.5 text-[#16a34a]" />
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#e0e0e0]">
              {platform === "android" ? (
                <>
                  <div className="space-y-2">
                    <span className="block font-label text-[10px] font-bold text-[#757575] uppercase tracking-wider">Langkah 1</span>
                    <Image src={IMAGES.step1Android} alt="Android Step 1" width={400} height={300} className="w-full h-auto object-contain" />
                  </div>
                  <div className="space-y-2">
                    <span className="block font-label text-[10px] font-bold text-[#757575] uppercase tracking-wider">Langkah 2</span>
                    <Image src={IMAGES.step2Android} alt="Android Step 2" width={400} height={300} className="w-full h-auto object-contain" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <span className="block font-label text-[10px] font-bold text-[#757575] uppercase tracking-wider">Langkah 1</span>
                    <Image src={IMAGES.step1Ios} alt="iOS Step 1" width={400} height={300} className="w-full h-auto object-contain" />
                  </div>
                  <div className="space-y-2">
                    <span className="block font-label text-[10px] font-bold text-[#757575] uppercase tracking-wider">Langkah 2</span>
                    <Image src={IMAGES.step2Ios} alt="iOS Step 2" width={400} height={300} className="w-full h-auto object-contain" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 border-b border-[#e0e0e0]">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <h2 className="font-display text-3xl font-bold tracking-tight">Pertanyaan Umum</h2>
          <div className="divide-y divide-[#e0e0e0]">
            {faqs.map((f, i) => (
              <div key={i} className="py-6 space-y-2">
                <h3 className="font-display text-base font-bold">{f.q}</h3>
                <p className="text-sm text-[#757575] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA penutup */}
      <section className="py-20 md:py-28 text-center">
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Mulai catat sebelum lupa lagi
          </h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-black text-white font-label text-xs font-bold uppercase tracking-widest px-10 py-4 hover:bg-[#1a1a1a] transition-colors"
          >
            <span>Buka Aplikasi Pecune</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2.2} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e0e0e0] py-8 text-center font-label text-[10px] font-bold uppercase tracking-widest text-[#757575]">
        &copy; {new Date().getFullYear()} Pecune Ledger
      </footer>
    </div>
  );
}