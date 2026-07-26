import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";
import CategoryForm from "./CategoryForm";
import CategoryTable from "./CategoryTable";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <Header />
      
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <CategoryForm />
          </div>
          <div className="lg:col-span-2">
            <CategoryTable categories={categories || []} />
          </div>
        </div>
      </main>
      
      <footer className="border-t border-hairline py-6 px-6 text-center bg-canvas">
        <p className="font-sans text-[10px] tracking-widest text-body uppercase">
          Argent &copy; 2026. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
