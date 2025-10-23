export const dynamic = "force-dynamic";
export const revalidate = 0;

import React, { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      setMessage("✅ Registro exitoso. Revisa tu correo para confirmar.");
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#0f172a",
      }}
    >
      <form
        onSubmit={handleSignup}
        style={{
          background: "#1e293b",
          padding: "2rem",
          borderRadius: "1rem",
          width: "100%",
          maxWidth: "400px",
          color: "white",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Crear Cuenta
        </h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "none",
              marginTop: "0.3rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "none",
              marginTop: "0.3rem",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "none",
            borderRadius: "0.5rem",
            backgroundColor: "#3b82f6",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Registrarme
        </button>

        {message && (
          <p
            style={{
              marginTop: "1rem",
              textAlign: "center",
              color: message.startsWith("✅") ? "#22c55e" : "#ef4444",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}