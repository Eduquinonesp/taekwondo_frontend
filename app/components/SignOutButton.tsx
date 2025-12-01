"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
      aria-label="Cerrar sesión"
    >
      Cerrar sesión
    </button>
  );
}