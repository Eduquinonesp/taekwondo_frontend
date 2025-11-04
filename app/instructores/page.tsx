"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient"; // ajusta la ruta si tu client está en otro lugar

// Opciones visibles para el usuario y valor numérico que se guarda en BD
const GRADOS = [
  { label: "I Dan", value: 1 },
  { label: "II Dan", value: 2 },
  { label: "III Dan", value: 3 },
  { label: "IV Dan", value: 4 },
  { label: "V Dan", value: 5 },
  { label: "VI Dan", value: 6 },
  { label: "VII Dan", value: 7 },
  { label: "VIII Dan", value: 8 },
  { label: "IX Dan", value: 9 },
];

type Instructor = {
  id: number;
  nombre: string;
  apellido: string;
  grado: number;
  correo: string;
  sede_id?: number | null;
};

type Sede = {
  id: number;
  nombre: string;
};

export default function InstructoresPage() {
  // Form
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [grado, setGrado] = useState<string>(""); // guardamos como string del <select>, luego convertimos a número
  const [correo, setCorreo] = useState("");
  const [sedeId, setSedeId] = useState<string>(""); // opcional

  // Datos
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [cargando, setCargando] = useState(false);

  // Cargar listado al entrar
  useEffect(() => {
    const fetchData = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from("instructores")
        .select("*")
        .order("apellido", { ascending: true });

      if (!error && data) setInstructores(data as Instructor[]);
      setCargando(false);
    };

    const fetchSedes = async () => {
      const { data, error } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre");

      if (!error && data) setSedes(data as Sede[]);
    };

    fetchData();
    fetchSedes();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setApellido("");
    setGrado("");
    setCorreo("");
    setSedeId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) return alert("Falta el NOMBRE");
    if (!apellido.trim()) return alert("Falta el APELLIDO");
    if (!grado) return alert("Selecciona el GRADO");
    if (!correo.trim()) return alert("Falta el CORREO");

    const gradoNumero = Number(grado);
    const payload: any = {
      nombre,
      apellido,
      grado: gradoNumero,
      correo,
    };

    // incluir sede si el usuario seleccionó una
    if (sedeId) payload.sede_id = Number(sedeId);

    const { error } = await supabase.from("instructores").insert([payload]);

    if (error) {
      alert("Ocurrió un problema al guardar: " + error.message);
      return;
    }

    alert("✅ Instructor agregado correctamente ✨");
    limpiarFormulario();

    // refrescar grilla
    const { data, error: err2 } = await supabase
      .from("instructores")
      .select("*")
      .order("apellido", { ascending: true });
    if (!err2 && data) setInstructores(data as Instructor[]);
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">👨‍🏫 Gestión de Instructores</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl"
      >
        <input
          className="bg-gray-800 border border-gray-700 p-3 rounded"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          className="bg-gray-800 border border-gray-700 p-3 rounded"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />

        {/* GRADO como SELECT */}
        <select
          className="bg-gray-800 border border-gray-700 p-3 rounded"
          value={grado}
          onChange={(e) => setGrado(e.target.value)}
        >
          <option value="">Selecciona grado</option>
          {GRADOS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>

        <input
          className="bg-gray-800 border border-gray-700 p-3 rounded"
          placeholder="Correo"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        {/* SEDE opcional */}
        <select
          className="bg-gray-800 border border-gray-700 p-3 rounded md:col-span-2"
          value={sedeId}
          onChange={(e) => setSedeId(e.target.value)}
        >
          <option value="">Selecciona sede (opcional)</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="mt-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded md:col-span-2"
        >
          Guardar Instructor
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-8 mb-3">📋 Lista de Instructores</h3>

      {cargando ? (
        <p className="text-gray-300">Cargando…</p>
      ) : instructores.length === 0 ? (
        <p className="text-gray-300">No hay instructores registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 border border-gray-700 rounded">
            <thead>
              <tr className="bg-gray-800">
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Apellido</th>
                <th className="text-left p-3">Grado</th>
                <th className="text-left p-3">Correo</th>
                <th className="text-left p-3">Sede</th>
              </tr>
            </thead>
            <tbody>
              {instructores.map((i) => {
                const gradoLabel =
                  GRADOS.find((g) => g.value === i.grado)?.label ?? i.grado;
                const sedeNombre =
                  sedes.find((s) => s.id === (i.sede_id ?? -1))?.nombre ?? "-";
                return (
                  <tr key={i.id} className="border-t border-gray-700">
                    <td className="p-3">{i.nombre}</td>
                    <td className="p-3">{i.apellido}</td>
                    <td className="p-3">{gradoLabel}</td>
                    <td className="p-3">{i.correo}</td>
                    <td className="p-3">{sedeNombre}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}