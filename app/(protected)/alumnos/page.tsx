"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type Sede = {
  id: number;
  nombre: string;
};

type InstructorPorSede = {
  sede_id: number;
  instructor_id: number;
  nombre_completo: string;
};

type Alumno = {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  grado: string | null;
  fecha_ultimo_examen: string | null;
  sede_id: number | null;
  instructor_id: number | null;
  activo: boolean;
};

export default function AlumnosPage() {
  // --- estado base ---
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [instructoresPorSede, setInstructoresPorSede] = useState<InstructorPorSede[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [selectedSedeId, setSelectedSedeId] = useState<number | "">("");
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- formulario alumno nuevo ---
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    rut: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    grado: "",
    fecha_ultimo_examen: "",
    activo: true, // por defecto activo
  });

  // ==========================
  // Cargar datos iniciales
  // ==========================
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      // 1) Sedes
      const { data: sedesData, error: sedesError } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });

      if (sedesError) {
        setError("No se pudieron cargar las sedes.");
        console.error(sedesError);
      } else if (sedesData) {
        setSedes(sedesData as Sede[]);
      }

      // 2) Vista de instructores por sede
      const { data: instrData, error: instrError } = await supabase
        .from("v_instructores_por_sede")
        .select("sede_id, instructor_id, nombre_completo");

      if (instrError) {
        console.error(instrError);
        // Si falla la vista, igual seguimos; solo no habrá lista filtrada
      } else if (instrData) {
        setInstructoresPorSede(instrData as InstructorPorSede[]);
      }

      // 3) Alumnos
      const { data: alumnosData, error: alumnosError } = await supabase
        .from("alumnos")
        .select(
          "id, nombres, apellidos, rut, fecha_nacimiento, telefono_apoderado, correo_apoderado, direccion, grado, fecha_ultimo_examen, sede_id, instructor_id, activo"
        )
        .order("nombres", { ascending: true });

      if (alumnosError) {
        setError("No se pudieron cargar los alumnos.");
        console.error(alumnosError);
      } else if (alumnosData) {
        // adaptamos nombres de columnas a nuestro tipo
        const adaptados: Alumno[] = (alumnosData as any[]).map((a) => ({
          id: a.id,
          nombres: a.nombres,
          apellidos: a.apellidos,
          rut: a.rut,
          fecha_nacimiento: a.fecha_nacimiento,
          telefono: a.telefono_apoderado ?? null,
          email: a.correo_apoderado ?? null,
          direccion: a.direccion ?? null,
          grado: a.grado ?? null,
          fecha_ultimo_examen: a.fecha_ultimo_examen ?? null,
          sede_id: a.sede_id,
          instructor_id: a.instructor_id,
          activo: a.activo ?? true,
        }));
        setAlumnos(adaptados);
      }

      setLoading(false);
    })();
  }, []);

  // ==========================
  // Helpers
  // ==========================

  const instructoresFiltrados = selectedSedeId
    ? instructoresPorSede.filter((i) => i.sede_id === selectedSedeId)
    : [];

  const getSedeNombre = (sedeId: number | null) => {
    if (!sedeId) return "-";
    const sede = sedes.find((s) => s.id === sedeId);
    return sede ? sede.nombre : "-";
  };

  const getInstructorNombre = (instructorId: number | null) => {
    if (!instructorId) return "-";
    const instr = instructoresPorSede.find((i) => i.instructor_id === instructorId);
    return instr ? instr.nombre_completo : "-";
  };

  const formatFecha = (value: string | null) => {
    if (!value) return "-";
    // value viene como "YYYY-MM-DD"
    try {
      const [y, m, d] = value.split("-");
      return `${d}/${m}/${y}`;
    } catch {
      return value;
    }
  };

  // ==========================
  // Manejo de formulario
  // ==========================

  const handleFormChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGuardarAlumno = async () => {
    setError(null);

    if (!form.nombres || !form.apellidos || !form.rut) {
      setError("Por favor completa al menos Nombres, Apellidos y RUT.");
      return;
    }

    if (!selectedSedeId || !selectedInstructorId) {
      setError("Debes seleccionar sede e instructor.");
      return;
    }

    setSaving(true);

    const { error: insertError, data } = await supabase
      .from("alumnos")
      .insert({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        rut: form.rut.trim(),
        fecha_nacimiento: form.fecha_nacimiento || null,
        telefono_apoderado: form.telefono || null,
        correo_apoderado: form.email || null,
        direccion: form.direccion || null,
        grado: form.grado || null,
        fecha_ultimo_examen: form.fecha_ultimo_examen || null,
        sede_id: selectedSedeId,
        instructor_id: selectedInstructorId,
        activo: form.activo,
      })
      .select("id");

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "Ya existe un alumno con ese RUT."
          : "Error al guardar el alumno."
      );
      console.error(insertError);
      setSaving(false);
      return;
    }

    const newId = data?.[0]?.id as number | undefined;

    // recargamos lista (simple y seguro)
    const { data: alumnosData, error: alumnosError } = await supabase
      .from("alumnos")
      .select(
        "id, nombres, apellidos, rut, fecha_nacimiento, telefono_apoderado, correo_apoderado, direccion, grado, fecha_ultimo_examen, sede_id, instructor_id, activo"
      )
      .order("nombres", { ascending: true });

    if (!alumnosError && alumnosData) {
      const adaptados: Alumno[] = (alumnosData as any[]).map((a) => ({
        id: a.id,
        nombres: a.nombres,
        apellidos: a.apellidos,
        rut: a.rut,
        fecha_nacimiento: a.fecha_nacimiento,
        telefono: a.telefono_apoderado ?? null,
        email: a.correo_apoderado ?? null,
        direccion: a.direccion ?? null,
        grado: a.grado ?? null,
        fecha_ultimo_examen: a.fecha_ultimo_examen ?? null,
        sede_id: a.sede_id,
        instructor_id: a.instructor_id,
        activo: a.activo ?? true,
      }));
      setAlumnos(adaptados);
    }

    // limpiamos formulario
    setForm({
      nombres: "",
      apellidos: "",
      rut: "",
      fecha_nacimiento: "",
      telefono: "",
      email: "",
      direccion: "",
      grado: "",
      fecha_ultimo_examen: "",
      activo: true,
    });
    setSelectedSedeId("");
    setSelectedInstructorId("");
    setSaving(false);
  };

  // ==========================
  // Toggle activo en la tabla
  // ==========================

  const handleToggleActivo = async (alumno: Alumno) => {
    const nuevoEstado = !alumno.activo;

    const { error } = await supabase
      .from("alumnos")
      .update({ activo: nuevoEstado })
      .eq("id", alumno.id);

    if (error) {
      console.error(error);
      setError("No se pudo actualizar el estado del alumno.");
      return;
    }

    setAlumnos((prev) =>
      prev.map((a) =>
        a.id === alumno.id ? { ...a, activo: nuevoEstado } : a
      )
    );
  };

  // ==========================
  // Render
  // ==========================

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-8 py-10 flex flex-col gap-8">
      <section className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Gestión de Alumnos</h1>

        {/* FORMULARIO */}
        <div className="bg-neutral-900 rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm text-neutral-400">Nombres</label>
              <input
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={form.nombres}
                onChange={(e) => handleFormChange("nombres", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400">Apellidos</label>
              <input
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={form.apellidos}
                onChange={(e) => handleFormChange("apellidos", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400">RUT</label>
              <input
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={form.rut}
                onChange={(e) => handleFormChange("rut", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm text-neutral-400">Fecha nacimiento</label>
              <input
                type="date"
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={form.fecha_nacimiento}
                onChange={(e) => handleFormChange("fecha_nacimiento", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400">Teléfono apoderado</label>
              <input
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={form.telefono}
                onChange={(e) => handleFormChange("telefono", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400">Email apoderado</label>
              <input
                type="email"
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-sm text-neutral-400">Dirección</label>
              <input
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={form.direccion}
                onChange={(e) => handleFormChange("direccion", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400">Grado</label>
              <input
                placeholder="Ej: 10º Kup, 1er Dan..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={form.grado}
                onChange={(e) => handleFormChange("grado", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm text-neutral-400">Fecha último examen</label>
              <input
                type="date"
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={form.fecha_ultimo_examen}
                onChange={(e) => handleFormChange("fecha_ultimo_examen", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400">Sede</label>
              <select
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={selectedSedeId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : "";
                  setSelectedSedeId(val as any);
                  setSelectedInstructorId("");
                }}
              >
                <option value="">Selecciona sede</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-neutral-400">Instructor</label>
              <select
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={selectedInstructorId}
                onChange={(e) =>
                  setSelectedInstructorId(e.target.value ? Number(e.target.value) : ("") as any)
                }
                disabled={!selectedSedeId || instructoresFiltrados.length === 0}
              >
                <option value="">
                  {selectedSedeId
                    ? instructoresFiltrados.length
                      ? "Selecciona instructor"
                      : "No hay instructores para esta sede"
                    : "Primero elige la sede"}
                </option>
                {instructoresFiltrados.map((i) => (
                  <option key={i.instructor_id} value={i.instructor_id}>
                    {i.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Switch Alumno activo */}
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm text-neutral-400">Alumno activo</label>
            <button
              type="button"
              onClick={() => handleFormChange("activo", !form.activo)}
              className={`w-11 h-6 flex items-center rounded-full px-1 transition ${
                form.activo ? "bg-emerald-500" : "bg-neutral-600"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
                  form.activo ? "translate-x-4" : ""
                }`}
              />
            </button>
            <span className="text-xs text-neutral-400">
              {form.activo ? "Se considera en los reportes" : "Queda inactivo (no aparece en dashboard)"}
            </span>
          </div>

          {error && (
            <div className="mb-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGuardarAlumno}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 rounded-lg transition disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar alumno"}
          </button>
        </div>

        {/* LISTA DE ALUMNOS */}
        <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">
            Lista de alumnos (activos e inactivos)
          </h2>

          {loading ? (
            <p className="text-neutral-400 text-sm">Cargando alumnos...</p>
          ) : alumnos.length === 0 ? (
            <p className="text-neutral-500 text-sm">No hay alumnos registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500 border-b border-neutral-800">
                    <th className="py-2">Nombre</th>
                    <th className="py-2">RUT</th>
                    <th className="py-2">Sede</th>
                    <th className="py-2">Instructor</th>
                    <th className="py-2">Grado</th>
                    <th className="py-2">Últ. examen</th>
                    <th className="py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((a) => (
                    <tr key={a.id} className="border-b border-neutral-900">
                      <td className="py-2">
                        {a.nombres} {a.apellidos}
                      </td>
                      <td className="py-2">{a.rut}</td>
                      <td className="py-2">{getSedeNombre(a.sede_id)}</td>
                      <td className="py-2">{getInstructorNombre(a.instructor_id)}</td>
                      <td className="py-2">{a.grado || "-"}</td>
                      <td className="py-2">{formatFecha(a.fecha_ultimo_examen)}</td>
                      <td className="py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActivo(a)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            a.activo
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-neutral-700 text-neutral-300 border border-neutral-500/40"
                          }`}
                        >
                          {a.activo ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}