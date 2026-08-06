"use client";

import { useState } from "react";
import CategoryForm from "./CategoryForm";
import CategoryTable from "./CategoryTable";
import WalletList from "@/app/wallets/WalletList";
import { Category, Wallet } from "@/types/database";

interface WalletWithBalance extends Wallet {
  balance: number;
}

export default function CategoriesPageClient({
  categories,
  wallets
}: {
  categories: Category[];
  wallets: WalletWithBalance[];
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-1">
        <CategoryForm isFlipped={isFlipped} setIsFlipped={setIsFlipped} />
      </div>
      <div className="lg:col-span-2">
        {isFlipped ? (
          <WalletList wallets={wallets} />
        ) : (
          <CategoryTable categories={categories} />
        )}
      </div>
    </div>
  );
}
