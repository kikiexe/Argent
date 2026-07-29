import Header from "@/components/Header";
import ProfileDetails from "@/components/ProfileDetails";
import { createClient } from "@/utils/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <Header />
      
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 pt-12 pb-32 sm:pb-12">
        <div className="space-y-8">
          <div>
            <h2 className="font-sans text-2xl font-black tracking-tight text-ink uppercase">
              Profil Pengguna
            </h2>
            <span className="font-sans text-[10px] text-body font-bold tracking-widest uppercase">
              Informasi sesi login dan spesifikasi PWA
            </span>
          </div>

          <ProfileDetails user={user} />
        </div>
      </main>
    </div>
  );
}
