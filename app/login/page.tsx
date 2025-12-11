"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setErrorMensaje(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error al iniciar sesión:", error);
        setErrorMensaje("Correo o contraseña incorrectos.");
        return;
      }

      // Si todo sale bien, lo mandamos al dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMensaje("Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md px-6 py-8 rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/60">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            Atuch<span className="text-sky-400">.app</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Inicia sesión para gestionar alumnos y pagos
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-200">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-500"
              placeholder="tu_correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-200">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {errorMensaje && (
            <p className="text-xs text-red-400 mt-1">{errorMensaje}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:hover:bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition"
          >
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-[11px] text-center text-slate-500">
          Sistema interno para administración de alumnos y pagos.
        </p>
      </div>
    </div>
  );
}