// app/lib/supabaseClient.ts
"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// En cliente (browser) estas env deben existir.
// Si no existen, mostramos un error claro en consola para no romper el build.
if (!supabaseUrl || !supabaseKey) {
  // No tiramos Error aquí para no bloquear el bundle si el import sucede en build.
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_KEY");
}

export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");