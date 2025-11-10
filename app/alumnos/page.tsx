"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2, PlusCircle } from "lucide-react";

type Sede = {
  id: number;
  nombre: string;
};

type Instructor = {
  id: number;
  nombres: string;
  apellidos: string;
};

type Alumno = {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
  fecha_nacimiento: string | null;
  edad: number | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  grado: string | null;
  fecha_ultimo_examen: string | null;
  sede_id: number | null;
  instructor_id: number | null;
  activo: boolean;
  sedes?: { nombre: string } | null;
  instructores?: { nombres: string; apellidos: string } | null;
};

export default function AlumnosPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<number | "">("");
  const [instructorSeleccionado, setInstructorSeleccionado] = useState<number | "">("");

  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombres: "",
    apellidos: "",
    rut: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    grado: "",
    fecha_ultimo_examen: "",
    sede_id: "",
    instructor_id: "",
    activo: true,
  });

  // Cargar sedes, instructores y alumnos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: sedesData } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });

      const { data: instructoresData } = await supabase
        .from("v_instructores_por_sede")
        .select("id, nombres, apellidos, sede_id")
        .order("nombres", { ascending: true });

      const { data: alumnosData } = await supabase
        .from("alumnos")
        .select(
          `
          id,
          nombres,
          apellidos,
          rut,
          fecha_nacimiento,
          edad,
          telefono,
          email,
          direccion,
          grado,
          fecha_ultimo_examen,
          sede_id,
          instructor_id,
          activo,
          sedes ( nombre ),
          instructores ( nombres, apellidos )
        `
        )
        .order("nombres", { ascending: true });

      setSedes(sedesData || []);
      setInstructores((instructoresData as any) || []);
      setAlumnos((alumnosData as any) || []);
      setLoading(false);
    };

    loadData();
  }, []);

  // Filtrar instructores según sede elegida en el formulario
  const instructoresFiltrados = sedeSeleccionada
    ? instructores.filter((i: any) => i.sede_id === sedeSeleccionada)
    : [];

  // Manejar cambio de campos del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;

    setNuevoAlumno((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Guardar nuevo alumno
  const handleGuardarAlumno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAlumno.nombres || !nuevoAlumno.apellidos || !nuevoAlumno.rut) {
      alert("Por favor completa al menos nombres, apellidos y RUT.");
      return;
    }
    if (!sedeSeleccionada || !instructorSeleccionado) {
      alert("Debes seleccionar sede e instructor.");
      return;
    }

    setSaving(true);

    const { error, data } = await supabase
      .from("alumnos")
      .insert({
        nombres: nuevoAlumno.nombres,
        apellidos: nuevoAlumno.apellidos,
        rut: nuevoAlumno.rut,
        fecha_nacimiento: nuevoAlumno.fecha_nacimiento || null,
        telefono: nuevoAlumno.telefono || null,
        email: nuevoAlumno.email || null,
        direccion: nuevoAlumno.direccion || null,
        grado: nuevoAlumno.grado || null,
        fecha_ultimo_examen:
          nuevoAlumno.fecha_ultimo_examen || null,
        sede_id: sedeSeleccionada,
        instructor_id: instructorSeleccionado,
        activo: nuevoAlumno.activo ?? true,
      })
      .select(
        `
        id,
        nombres,
        apellidos,
        rut,
        fecha_nacimiento,
        edad,
        telefono,
        email,
        direccion,
        grado,
        fecha_ultimo_examen,
        sede_id,
        instructor_id,
        activo,
        sedes ( nombre ),
        instructores ( nombres, apellidos )
      `
      )
      .single();

    if (error) {
      console.error(error);
      alert("Error al guardar alumno: " + error.message);
    } else if (data) {
      setAlumnos((prev) => [...prev, data as any]);
      // limpiar formulario
      setNuevoAlumno({
        nombres: "",
        apellidos: "",
        rut: "",
        fecha_nacimiento: "",
        telefono: "",
        email: "",
        direccion: "",
        grado: "",
        fecha_ultimo_examen: "",
        sede_id: "",
        instructor_id: "",
        activo: true,
      });
      setSedeSeleccionada("");
      setInstructorSeleccionado("");
    }

    setSaving(false);
  };

  // Toggle activo/inactivo
  const handleToggleActivo = async (alumno: Alumno) => {
    const nuevoEstado = !alumno.activo;

    const { error } = await supabase
      .from("alumnos")
      .update({ activo: nuevoEstado })
      .eq("id", alumno.id);

    if (error) {
      console.error(error);
      alert("No se pudo cambiar el estado del alumno.");
      return;
    }

    setAlumnos((prev) =>
      prev.map((a) =>
        a.id === alumno.id ? { ...a, activo: nuevoEstado } : a
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando alumnos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Alumnos</h1>

      {/* Formulario nuevo alumno */}
      <form
        onSubmit={handleGuardarAlumno}
        className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"
      >
        <div>
          <label className="block mb-1 text-slate-400">
            Nombres
          </label>
          <input
            name="nombres"
            value={nuevoAlumno.nombres}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-400">
            Apellidos
          </label>
          <input
            name="apellidos"
            value={nuevoAlumno.apellidos}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-400">RUT</label>
          <input
            name="rut"
            value={nuevoAlumno.rut}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-400">
            Fecha nacimiento
          </label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={nuevoAlumno.fecha_nacimiento}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-400">
            Teléfono
          </label>
          <input
            name="telefono"
            value={nuevoAlumno.telefono}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-400">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={nuevoAlumno.email}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block mb-1 text-slate-400">
            Dirección
          </label>
          <input
            name="direccion"
            value={nuevoAlumno.direccion}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-400">Grado</label>
          <input
            name="grado"
            value={nuevoAlumno.grado}
            onChange={handleChange}
            placeholder="Ej: 10º Kup, 1er Dan..."
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-400">
            Fecha último examen
          </label>
          <input
            type="date"
            name="fecha_ultimo_examen"
            value={nuevoAlumno.fecha_ultimo_examen}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
          />
        </div>

        {/* Sede */}
        <div>
          <label className="block mb-1 text-slate-400">Sede</label>
          <select
            value={sedeSeleccionada}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : "";
              setSedeSeleccionada(val);
              setInstructorSeleccionado("");
            }}
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
            required
          >
            <option value="">Selecciona sede</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Instructor */}
        <div>
          <label className="block mb-1 text-slate-400">
            Instructor
          </label>
          <select
            value={instructorSeleccionado}
            onChange={(e) =>
              setInstructorSeleccionado(
                e.target.value ? Number(e.target.value) : ""
              )
            }
            className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-1 text-xs"
            required
            disabled={!sedeSeleccionada}
          >
            <option value="">
              {sedeSeleccionada
                ? "Selecciona instructor"
                : "Primero elige la sede"}
            </option>
            {instructoresFiltrados.map((i: any) => (
              <option key={i.id} value={i.id}>
                {i.nombres} {i.apellidos}
              </option>
            ))}
          </select>
        </div>

        {/* Activo */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            name="activo"
            checked={nuevoAlumno.activo}
            onChange={handleChange}
          />
          <span className="text-slate-300 text-xs">
            Alumno activo
          </span>
        </div>

        <div className="md:col-span-3 flex justify-end mt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <PlusCircle className="w-3 h-3" />
                Guardar alumno
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tabla de alumnos */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold mb-3">
          Lista de alumnos (activos e inactivos)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2">Nombre</th>
                <th className="py-2">RUT</th>
                <th className="py-2">Sede</th>
                <th className="py-2">Instructor</th>
                <th className="py-2">Grado</th>
                <th className="py-2">Últ. examen</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id} className="border-b border-slate-900">
                  <td className="py-2">
                    {a.nombres} {a.apellidos}
                  </td>
                  <td className="py-2">{a.rut}</td>
                  <td className="py-2">
                    {a.sedes?.nombre || "-"}
                  </td>
                  <td className="py-2">
                    {a.instructores
                      ? `${a.instructores.nombres} ${a.instructores.apellidos}`
                      : "-"}
                  </td>
                  <td className="py-2">{a.grado || "-"}</td>
                  <td className="py-2">
                    {a.fecha_ultimo_examen || "-"}
                  </td>
                  <td className="py-2">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={a.activo}
                        onChange={() => handleToggleActivo(a)}
                      />
                      <span
                        className={
                          a.activo
                            ? "text-emerald-400"
                            : "text-slate-500"
                        }
                      >
                        {a.activo ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
              {alumnos.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-slate-500"
                  >
                    No hay alumnos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}