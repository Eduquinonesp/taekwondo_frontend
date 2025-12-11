import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-neutral-200 p-6 flex flex-col justify-between">
        <nav className="space-y-4">
          <a href="/dashboard" className="block hover:text-white">Dashboard</a>
          <a href="/alumnos" className="block hover:text-white">Alumnos</a>
          <a href="/instructores" className="block hover:text-white">Instructores</a>
          <a href="/sedes" className="block hover:text-white">Sedes</a>
          <a href="/pagos" className="block hover:text-white">Pagos</a>
        </nav>

        {/* 🔻 BOTÓN SIGN OUT */}
        <button
          onClick={handleSignOut}
          className="mt-8 w-full py-2 px-4 rounded bg-red-600 hover:bg-red-700 text-white"
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-neutral-950 text-neutral-100 p-8">
        {children}
      </main>
    </div>
  );
}