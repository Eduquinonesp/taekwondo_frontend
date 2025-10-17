"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("❌ Credenciales incorrectas o correo no confirmado.");
    } else {
      setMessage("✅ Inicio de sesión exitoso. Redirigiendo...");
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <img
            src="/favicon.ico"
            alt="ATUCH Logo"
            className="mx-auto w-16 h-16 mb-3"
          />
          <h1 className="text-2xl font-bold">Acceso al Sistema ATUCH</h1>
          <p className="text-gray-400 text-sm">
            Ingresa tus credenciales para continuar 🥋
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="ejemplo@correo.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition duration-200"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm mt-4 text-gray-300">{message}</p>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes cuenta?{" "}
          <a
            href="/signup"
            className="text-blue-400 hover:text-blue-500 font-medium"
          >
            Crear una
          </a>
        </p>
      </div>
    </div>
  );
}