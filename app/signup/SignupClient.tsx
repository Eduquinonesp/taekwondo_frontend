"use client";

import dynamic from "next/dynamic";

// ✅ Deshabilita renderizado en servidor para esta página
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cargamos el cliente de registro dinámicamente (solo en cliente)
const SignupClient = dynamic(() => import("./SignupClient"), {
  ssr: false,
  loading: () => <p style={{ textAlign: "center", marginTop: "20px" }}>Cargando...</p>,
});

export default function SignupPage() {
  return <SignupClient />;
}