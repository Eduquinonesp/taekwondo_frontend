"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import SignOutButton from "@/app/components/SignOutButton";

type UserRole = "admin" | "instructor" | null;

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // 1) Verifica sesión y escucha cambios de auth
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setAuthenticated(false);
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        setChecking(false);
        return;
      }

      setAuthenticated(true);
      setUserEmail(data.session.user.email ?? null);
      setChecking(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthenticated(false);
        setUserRole(null);
        setUserEmail(null);
        router.replace("/login");
      } else {
        setAuthenticated(true);
        setUserEmail(session.user.email ?? null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  // 2) Carga el rol desde la vista v_users_roles cuando hay sesión
  useEffect(() => {
    const loadRole = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;

      const { data, error } = await supabase
        .from("v_users_roles")
        .select("role")
        .eq("user_id", uid)
        .single();

      if (!error && data) {
        // role esperado: 'admin' | 'instructor'
        setUserRole((data.role as UserRole) ?? null);
      } else {
        setUserRole(null);
      }
    };

    if (authenticated) loadRole();
  }, [authenticated]);

  // 3) UI de carga / bloqueo
  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center text-neutral-300">
        Verificando sesión...
      </main>
    );
  }

  if (!authenticated) {
    // Mientras redirige, no renderizamos nada del área protegida
    return null;
  }

  // 4) Sidebar + contenido
  const NavLink = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => {
    const active =
      pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`block px-4 py-2 rounded-md transition ${
          active
            ? "bg-neutral-700 text-white"
            : "text-neutral-300 hover:text-white hover:bg-neutral-800"
        }`}
      >
        {label}
      </Link>
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 p-4 flex flex-col gap-4">
        {/* Logo / encabezado */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ATUCH" className="h-10 w-10 rounded-full" />
          <div className="font-semibold">ATUCH</div>
        </div>

        {/* Navegación */}
        <nav className="mt-6 flex flex-col gap-1">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/alumnos" label="Alumnos" />
          <NavLink href="/instructores" label="Instructores" />
          <NavLink href="/sedes" label="Sedes" />

          {/* Solo visible para administradores */}
          {userRole === "admin" && (
            <>
              <div className="mt-4 text-xs uppercase tracking-wide text-neutral-400">
                Administración
              </div>
              <NavLink href="/admin/roles" label="Usuarios / Roles" />
            </>
          )}
        </nav>

        {/* Pie de sidebar */}
        <div className="mt-auto pt-4 border-t border-neutral-800 text-xs text-neutral-400">
          <div className="mb-2">
            {userEmail ? (
              <>
                Sesión: <span className="text-neutral-200">{userEmail}</span>
              </>
            ) : (
              "Sesión activa"
            )}
            {userRole ? (
              <>
                {" "}
                · Rol: <span className="text-neutral-200">{userRole}</span>
              </>
            ) : null}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}