"use client";

import { useActionState, useState, useEffect, useTransition, useRef } from "react";
import { createTransaction } from "./actions";
import { extractTransactionFromVoice } from "./ai-actions";
import { Category } from "@/types/database";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Receipt, 
  ArrowDownLeft01Icon, 
  ArrowUpRight01Icon, 
  ArrowRight01Icon,
  Folder01Icon, 
  Coins01Icon, 
  Calendar01Icon, 
  NotebookIcon, 
  PlusSignIcon,
  Mic01Icon,
  MicOff01Icon
} from "@hugeicons/core-free-icons";

export default function TransactionForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createTransaction, null);
  // Get today's date in YYYY-MM-DD local format once on mount
  const [todayStr] = useState(() => new Date().toLocaleDateString("sv-SE"));

  const [selectedType, setSelectedType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const filtered = categories.filter((c) => c.type === "EXPENSE");
    return filtered.length > 0 ? filtered[0].id : "";
  });
  
  // Controlled form states
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(todayStr);
  const [note, setNote] = useState<string>("");

  // Voice & Text AI Input states
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, startProcessing] = useTransition();
  const [voiceError, setVoiceError] = useState("");
  const [typedText, setTypedText] = useState("");
  const recognitionRef = useRef<any>(null);

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSpeechSupported(true);
      }
    }
  }, []);

  const handleTypeChange = (type: "EXPENSE" | "INCOME") => {
    setSelectedType(type);
    const filtered = categories.filter((c) => c.type === type);
    if (filtered.length > 0) {
      setSelectedCategory(filtered[0].id);
    } else {
      setSelectedCategory("");
    }
  };

  // Reset controlled inputs when transaction is successfully created
  useEffect(() => {
    if (state?.success) {
      setAmount("");
      setNote("");
      setDate(todayStr);
    }
  }, [state, todayStr]);

  // Voice input handling
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setVoiceError("Izin mikrofon ditolak browser.");
      } else {
        setVoiceError("Gagal mengenali suara. Silakan coba lagi.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      processText(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Unified logic to process transcribed or typed text via Gemini API
  const processText = (textToProcess: string) => {
    const trimmed = textToProcess.trim();
    if (!trimmed) return;

    if (trimmed.length > 200) {
      setVoiceError("Teks terlalu panjang (maksimal 200 karakter).");
      return;
    }

    setVoiceError("");
    startProcessing(async () => {
      try {
        const result = await extractTransactionFromVoice(trimmed);
        if (result.success && result.data) {
          const { amount: extractedAmt, date: extractedDate, note: extractedNote, category_id, type } = result.data;
          
          // Set transaction type and category synchronously
          const targetType = type || selectedType;
          if (type) {
            setSelectedType(type);
          }
          if (extractedAmt) {
            setAmount(extractedAmt.toString());
          }
          if (extractedDate) {
            setDate(extractedDate);
          }
          if (extractedNote) {
            setNote(extractedNote);
          }
          if (category_id) {
            setSelectedCategory(category_id);
          } else {
            const filtered = categories.filter((c) => c.type === targetType);
            if (filtered.length > 0) {
              setSelectedCategory(filtered[0].id);
            } else {
              setSelectedCategory("");
            }
          }
          setTypedText(""); // Clear input on success
        } else {
          setVoiceError(result.error || "Gagal mengolah teks transaksi.");
        }
      } catch (err) {
        console.error("AI processing server action failed:", err);
        setVoiceError("Gagal memproses data ke server.");
      }
    });
  };

  const handleTextSubmit = () => {
    processText(typedText);
  };

  return (
    <div className="bg-card p-6 rounded-3xl border border-hairline shadow-sm space-y-6">
      <h3 className="font-sans font-black text-sm text-ink uppercase flex items-center gap-1.5 border-b border-hairline pb-4 justify-between">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={Receipt} size={14} strokeWidth={2.2} className="text-indigo-600" />
          <span>Record Transaction</span>
        </span>
      </h3>

      {/* AI Auto-Fill Assistant Widget */}
      <div className="p-4 rounded-2xl bg-canvas-soft/80 border border-hairline flex flex-col gap-2.5 transition-all duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              isListening 
                ? "bg-rose-500 animate-ping" 
                : isProcessing 
                ? "bg-indigo-500 animate-pulse" 
                : "bg-indigo-600"
            }`}></span>
            <span className="font-sans text-[10px] font-bold tracking-widest text-body uppercase">
              {isListening ? "Mendengarkan..." : isProcessing ? "Menganalisis..." : "Asisten AI Instan"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-sans font-bold text-body">
            <span>{typedText.length}/200</span>
          </div>
        </div>

        {/* Dual Input: Text Field & Voice Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={200}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTextSubmit();
                }
              }}
              disabled={isProcessing || isPending || isListening}
              placeholder="Tulis transaksi (cth: jajan bakso 25rb kemarin)..."
              className="w-full pl-3 pr-8 py-2.5 text-xs font-sans bg-card border border-hairline rounded-xl outline-none focus:border-indigo-500/50 transition-all text-ink placeholder:text-body/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleTextSubmit}
              disabled={isProcessing || isPending || isListening || !typedText.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-indigo-50 transition-all"
              title="Kirim ke AI"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} strokeWidth={2.5} />
            </button>
          </div>

          {isSpeechSupported && (
            <button
              type="button"
              disabled={isProcessing || isPending || !!typedText.trim()}
              onClick={toggleListening}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 shadow-sm disabled:opacity-40 ${
                isListening
                  ? "bg-rose-500 text-white border-rose-500 scale-105 shadow-rose-500/20"
                  : "bg-card text-indigo-600 border-hairline hover:border-indigo-500/30 hover:text-indigo-700"
              }`}
              title={isListening ? "Hentikan perekaman" : "Mulai merekam suara"}
            >
              <HugeiconsIcon 
                icon={isListening ? MicOff01Icon : Mic01Icon} 
                size={16} 
                strokeWidth={2.2} 
              />
            </button>
          )}
        </div>

        {voiceError && (
          <span className="text-[10px] font-sans font-bold text-budget-red leading-normal">
            Info: {voiceError}
          </span>
        )}
        
        <p className="text-[10px] text-body leading-relaxed font-sans">
          {isListening 
            ? "Bicaralah secara alami (contoh: 'beli bensin tiga puluh ribu tadi sore')." 
            : isProcessing 
            ? "Sistem AI sedang menganalisis detail transaksi Anda..." 
            : "Ketik transaksi lalu tekan Enter, atau klik mikrofon untuk berbicara."}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <div>
          <span className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Transaction Type
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTypeChange("EXPENSE")}
              className={`p-3 rounded-2xl font-sans text-xs font-bold tracking-wider uppercase border transition-all duration-150 flex items-center justify-center gap-1.5 ${
                selectedType === "EXPENSE"
                  ? "bg-rose-500/10 text-budget-red border-rose-500/20"
                  : "bg-canvas-soft text-body border-hairline hover:border-body"
              }`}
            >
              <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} strokeWidth={2.2} />
              <span>Expense</span>
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTypeChange("INCOME")}
              className={`p-3 rounded-2xl font-sans text-xs font-bold tracking-wider uppercase border transition-all duration-150 flex items-center justify-center gap-1.5 ${
                selectedType === "INCOME"
                  ? "bg-emerald-500/10 text-budget-green border-emerald-500/20"
                  : "bg-canvas-soft text-body border-hairline hover:border-body"
              }`}
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2.2} />
              <span>Income</span>
            </button>
          </div>
          <input type="hidden" name="type" value={selectedType} />
        </div>

        <div>
          <label htmlFor="category_id" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Category
          </label>
          {filteredCategories.length === 0 ? (
            <div className="text-xs text-body font-sans italic p-4 border border-dashed border-hairline bg-canvas-soft rounded-2xl">
              No categories found. Please create an {selectedType.toLowerCase()} category first.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <HugeiconsIcon icon={Folder01Icon} size={16} strokeWidth={1.8} />
              </div>
              <select
                id="category_id"
                name="category_id"
                required
                disabled={isPending}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-canvas-soft text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-sm focus:outline-none focus:bg-card focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50 appearance-none"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Amount (IDR)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <HugeiconsIcon icon={Coins01Icon} size={16} strokeWidth={1.8} />
            </div>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              disabled={isPending}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-canvas-soft text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-sm focus:outline-none focus:bg-card focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Transaction Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <HugeiconsIcon icon={Calendar01Icon} size={16} strokeWidth={1.8} />
            </div>
            <input
              id="date"
              name="date"
              type="date"
              required
              disabled={isPending}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-canvas-soft text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-sm focus:outline-none focus:bg-card focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50 appearance-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="note" className="block font-sans font-bold text-[10px] tracking-widest text-body uppercase mb-2">
            Note (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <HugeiconsIcon icon={NotebookIcon} size={16} strokeWidth={1.8} />
            </div>
            <input
              id="note"
              name="note"
              type="text"
              maxLength={50}
              disabled={isPending}
              placeholder="e.g. Weekly groceries"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-canvas-soft text-ink border border-hairline p-3 pl-10 rounded-2xl font-sans text-sm focus:outline-none focus:bg-card focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 disabled:opacity-50"
            />
          </div>
        </div>

        {state?.error && (
          <div className="bg-rose-500/10 text-budget-red border border-rose-500/20 p-3.5 rounded-2xl text-xs font-sans font-semibold">
            Error: {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || filteredCategories.length === 0}
          className="w-full bg-indigo-600 text-white p-3.5 rounded-full font-sans font-bold text-xs tracking-wider uppercase hover:bg-indigo-700 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2.2} />
          <span>{isPending ? "Recording..." : "Record Transaction"}</span>
        </button>
      </form>
    </div>
  );
}
