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
};

export default function InstructoresPage() {
  // Formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [grado, setGrado] = useState("IV Dan");
  const [correo, setCorreo] = useState("");

  // Sedes
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedesSeleccionadas, setSedesSeleccionadas] = useState<number[]>([]);

  // Listado para mostrar abajo (opcional)
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [cargando, setCargando] = useState(false);

  // Cargar sedes e instructores al abrir
  useEffect(() => {
    const fetchData = async () => {
      setCargando(true);

      // 1) Traer sedes
      const { data: sedesData, error: sedesErr } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });

      if (sedesErr) {
        alert("Error cargando sedes: " + sedesErr.message);
      } else {
        setSedes(sedesData || []);
      }

      // 2) (Opcional) Traer instructores existentes para mostrar
      const { data: instData, error: instErr } = await supabase
        .from("instructores")
        .select("id, nombre, apellido, grado, correo")
        .order("id", { ascending: false });

      if (!instErr && instData) setInstructores(instData);

      setCargando(false);
    };

    fetchData();
  }, []);

  // Manejar checkboxes de sedes
  const toggleSede = (sedeId: number) => {
    setSedesSeleccionadas((prev) =>
      prev.includes(sedeId)
        ? prev.filter((id) => id !== sedeId)
        : [...prev, sedeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      alert("Completa nombre, apellido y correo.");
      return;
    }

    if (sedesSeleccionadas.length === 0) {
      alert("Selecciona al menos una sede.");
      return;
    }

    setCargando(true);

    try {
      // 1) Insertar instructor y obtener su id
      const { data: inserted, error: insertErr } = await supabase
        .from("instructores")
        .insert([{ nombre, apellido, grado, correo }])
        .select("id")
        .single();

      if (insertErr) {
        throw new Error("Error guardando instructor: " + insertErr.message);
      }

      const instructorId = inserted!.id;

      // 2) Crear los vínculos en la tabla puente (uno por cada sede seleccionada)
      const filas = sedesSeleccionadas.map((sedeId) => ({
        instructor_id: instructorId,
        sede_id: sedeId,
        rol_en_sede: "Instructor", // puedes ajustar si quieres guardar “Maestro” u otro
      }));

      const { error: linksErr } = await supabase
        .from("instructores_sedes")
        .insert(filas);

      if (linksErr) {
        throw new Error("Error vinculando sedes: " + linksErr.message);
      }

      alert("✅ Instructor guardado y asociado a sus sedes.");

      // Limpiar form
      setNombre("");
      setApellido("");
      setCorreo("");
      setGrado("IV Dan");
      setSedesSeleccionadas([]);

      // Refrescar listado
      const { data: instData } = await supabase
        .from("instructores")
        .select("id, nombre, apellido, grado, correo")
        .order("id", { ascending: false });
      setInstructores(instData || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCargando(false);
    }
  };

  /* ------------- MODO EDICIÓN (opcional) -------------
     Si más adelante quieres editar un instructor existente,
     antes de insertar los nuevos vínculos, borra los anteriores:

     await supabase
       .from("instructores_sedes")
       .delete()
       .eq("instructor_id", instructorId);

     Y luego haces el insert de 'filas' como arriba.
  ---------------------------------------------------- */

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">👨‍🏫 Gestión de Instructores</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/60 rounded-xl p-4 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="px-3 py-2 rounded bg-slate-900 outline-none"
          />
          <input
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Apellido"
            className="px-3 py-2 rounded bg-slate-900 outline-none"
          />
          <select
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            className="px-3 py-2 rounded bg-slate-900 outline-none"
          >
            {[
              "I Dan",
              "II Dan",
              "III Dan",
              "IV Dan",
              "V Dan",
              "VI Dan",
              "VII Dan",
              "VIII Dan",
              "IX Dan",
            ].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Correo"
            className="px-3 py-2 rounded bg-slate-900 outline-none"
          />
        </div>

        {/* Sedes como checkboxes */}
        <div className="mt-4">
          <p className="mb-2 font-medium">Sedes donde enseña:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {sedes.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 bg-slate-900 rounded px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={sedesSeleccionadas.includes(s.id)}
                  onChange={() => toggleSede(s.id)}
                />
                <span>{s.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 rounded px-4 py-2 font-semibold disabled:opacity-60"
        >
          {cargando ? "Guardando..." : "Guardar Instructor"}
        </button>
      </form>

      {/* Lista (opcional) */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">📋 Lista de Instructores</h2>
        {instructores.length === 0 ? (
          <p className="text-slate-300">No hay instructores registrados.</p>
        ) : (
          <ul className="space-y-2">
            {instructores.map((i) => (
              <li
                key={i.id}
                className="bg-slate-800/60 rounded px-3 py-2 flex justify-between"
              >
                <span>
                  {i.nombre} {i.apellido} — {i.grado}
                </span>
                <span className="text-slate-300">{i.correo}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}