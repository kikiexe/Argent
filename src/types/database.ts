export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: "CASH" | "BANK" | "E_WALLET" | "CREDIT";
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "EXPENSE" | "INCOME";
  amount: number;
  category_id: string;
  wallet_id: string | null;
  date: string;
  note: string | null;
  created_at: string;
}

export interface MonthlyBudget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_limit: number;
}

export interface CategoryBudget {
  id: string;
  user_id: string;
  category_id: string;
  month: number;
  year: number;
  limit_amount: number;
}

export interface CategoryBudgetUsage {
  category_id: string;
  category_name: string;
  limit_amount: number;
  spent_amount: number;
}

export interface WalletBalance {
  wallet_id: string;
  wallet_name: string;
  wallet_type: "CASH" | "BANK" | "E_WALLET" | "CREDIT";
  balance: number;
}


