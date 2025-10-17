"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage("⚠️ Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage("❌ Error al registrar el usuario: " + error.message);
    } else {
      setMessage("✅ Registro exitoso. Revisa tu correo para confirmar la cuenta.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
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
          <h1 className="text-2xl font-bold">Crear una cuenta</h1>
          <p className="text-gray-400 text-sm">
            Regístrate para acceder al sistema ATUCH 🥋
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Correo electrónico</label>
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
          <div>
            <label className="block text-sm mb-1">Confirmar contraseña</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-semibold transition duration-200"
          >
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm mt-4 text-gray-300">{message}</p>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/login"
            className="text-blue-400 hover:text-blue-500 font-medium"
          >
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}