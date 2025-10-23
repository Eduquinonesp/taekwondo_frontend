"use client";

import React, { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

// ✅ evita el prerender en el servidor
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SignupClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMessage("✅ Registro exitoso. Revisa tu correo para confirmar la cuenta.");
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
}