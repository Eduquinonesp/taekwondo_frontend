"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type Sede = { id: number; nombre: string };
type Instructor = {
  id: number;
  nombre: string;
  apellido: string;
  grado: string;
  correo: string;
  created_at: string | null;
};

const GRADOS = [
  "I Dan",
  "II Dan",
  "III Dan",
  "IV Dan",
  "V Dan",
  "VI Dan",
  "VII Dan",
  "VIII Dan",
  "IX Dan",
];

export default function InstructoresPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [grado, setGrado] = useState(GRADOS[0]);
  const [correo, setCorreo] = useState("");
  const [sedeId, setSedeId] = useState<number | "">("");
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [guardando, setGuardando] = useState(false);

  // Cargar sedes e instructores
  useEffect(() => {
    const cargarDatos = async () => {
      const { data: sedesData } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });
      setSedes(sedesData || []);

      const { data: instData } = await supabase
        .from("instructores")
        .select("*")
        .order("created_at", { ascending: false });
      setInstructores(instData || []);
    };
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setApellido("");
    setGrado(GRADOS[0]);
    setCorreo("");
    setSedeId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !correo.trim() || sedeId === "") {
      alert("Por favor completa todos los campos y elige una sede.");
      return;
    }

    setGuardando(true);

    try {
      // PASO 1: Insertar instructor SIN sede_id
      const { data: nuevoInstructor, error: errorInstructor } = await supabase
        .from("instructores")
        .insert([{ nombre, apellido, grado, correo }])
        .select("id")
        .single();

      if (errorInstructor) throw errorInstructor;

      // PASO 2: Insertar relación en instructores_sedes
      const { error: errorRelacion } = await supabase
        .from("instructores_sedes")
        .insert([
          {
            instructor_id: nuevoInstructor.id,
            sede_id: sedeId,
            rol_en_sede: "Instructor",
          },
        ]);

      if (errorRelacion) throw errorRelacion;

      // Actualizar lista
      const { data: instData } = await supabase
        .from("instructores")
        .select("*")
        .order("created_at", { ascending: false });

      setInstructores(instData || []);
      limpiarFormulario();
      alert("✅ Instructor guardado correctamente");
    } catch (err: any) {
      console.error(err);
      alert("❌ Ocurrió un error al guardar: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-4">👨‍🏫 Gestión de Instructores</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl"
      >
        <input
          className="px-3 py-2 rounded border border-slate-700 bg-slate-800 outline-none"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          className="px-3 py-2 rounded border border-slate-700 bg-slate-800 outline-none"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded border border-slate-700 bg-slate-800 outline-none"
          value={grado}
          onChange={(e) => setGrado(e.target.value)}
        >
          {GRADOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input
          className="px-3 py-2 rounded border border-slate-700 bg-slate-800 outline-none"
          placeholder="Correo"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded border border-slate-700 bg-slate-800 outline-none md:col-span-2"
          value={sedeId === "" ? "" : String(sedeId)}
          onChange={(e) => setSedeId(Number(e.target.value))}
        >
          <option value="">— Elegir sede —</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={guardando}
          className="md:col-span-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 px-4 py-2 rounded font-semibold"
        >
          {guardando ? "Guardando..." : "Guardar Instructor"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-8 mb-3">📋 Lista de Instructores</h2>
      {instructores.length === 0 ? (
        <p className="text-slate-400">No hay instructores registrados.</p>
      ) : (
        <ul className="space-y-2">
          {instructores.map((i) => (
            <li
              key={i.id}
              className="bg-slate-900/40 border border-slate-800 rounded px-3 py-2"
            >
              <div className="font-medium">
                {i.nombre} {i.apellido} — {i.grado}
              </div>
              <div className="text-slate-400 text-sm">{i.correo}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}