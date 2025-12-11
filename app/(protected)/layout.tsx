"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error al obtener la sesión:", error);
        router.push("/login");
        return;
      }

      if (!data.session) {
        router.push("/login");
        return;
      }

      setUserEmail(data.session.user.email ?? null);
      setChecking(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setUserEmail(session.user.email ?? null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      router.push("/login");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Cargando panel Atuch…</p>
          <p className="text-sm text-slate-400">Por favor espera un momento.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/alumnos", label: "Alumnos" },
    { href: "/pagos", label: "Pagos" },
    { href: "/reportes", label: "Reportes" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800 bg-slate-900/60">
        <div className="px-6 py-4 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">
            Atuch<span className="text-sky-400">.app</span>
          </h1>
          <p className="text-xs text-slate-400">
            Gestión de alumnos y pagos
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-sky-500/20 text-sky-300"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          {userEmail && (
            <p className="truncate">
              Sesión:{" "}
              <span className="font-medium text-slate-200">{userEmail}</span>
            </p>
          )}
          <button
            onClick={handleSignOut}
            className="w-full mt-1 rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Topbar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold">
              Atuch<span className="text-sky-400">.app</span>
            </h1>
            <p className="text-[11px] text-slate-400">Panel de administración</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-slate-700 px-3 py-1 text-[11px] font-medium hover:bg-slate-800"
          >
            Salir
          </button>
        </header>

        {/* Área de páginas */}
        <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}