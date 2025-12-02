import { createClient } from "@supabase/supabase-js";

// 👇 Pega AQUÍ tu URL de Supabase (la que empieza con https://wfstgiy...)
const supabaseUrl = "https://atuch.cl.supabase.co";

// 👇 Pega AQUÍ tu anon public key completa (la larga que empieza con eyJhbGci...)
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc3RnaW95cnRvbXBleXVraWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTc5NTksImV4cCI6MjA3NDY3Mzk1OX0.NRch38P_4lG68l5exLe_kMBoHsVtFZBXA2E34iOOBl0";

if (!supabaseUrl) {
  throw new Error("supabaseUrl está vacío");
}

if (!supabaseAnonKey) {
  throw new Error("supabaseAnonKey está vacío");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);