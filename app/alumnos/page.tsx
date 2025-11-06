"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

// -------------------- Tipos --------------------
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
  sede_id: number | null;
  instructor_id: number | null;

  // Supabase nos está devolviendo arrays para las relaciones
  sedes?: { nombre: string }[] | { nombre: string } | null;
  instructores?:
    | { nombres: string; apellidos: string }[]
    | { nombres: string; apellidos: string }
    | null;
};

// Para el selector de grado
const GRADOS = [
  "10° Kup",
  "9° Kup",
  "8° Kup",
  "7° Kup",
  "6° Kup",
  "5° Kup",
  "4° Kup",
  "3° Kup",
  "2° Kup",
  "1° Kup",
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

function getSedeNombre(sedes: Alumno["sedes"]): string | undefined {
  if (!sedes) return undefined;
  if (Array.isArray(sedes)) return sedes[0]?.nombre;
  return sedes.nombre;
}

function getInstructorNombre(inst: Alumno["instructores"]): string | undefined {
  if (!inst) return undefined;
  if (Array.isArray(inst)) return inst[0] ? `${inst[0].nombres} ${inst[0].apellidos}` : undefined;
  return `${inst.nombres} ${inst.apellidos}`;
}

// -------------------- Página --------------------
export default function AlumnosPage() {
  // Datos
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros / búsqueda
  const [q, setQ] = useState("");
  const [filtroSede, setFiltroSede] = useState<string>("todos");
  const [filtroInstructor, setFiltroInstructor] = useState<string>("todos");

  // Formulario para crear alumno
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    rut: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    grado: "",
    sede_id: "",
    instructor_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // -------------------- Cargar datos --------------------
  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: sedesData } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });
      if (sedesData) setSedes(sedesData);

      const { data: instData } = await supabase
        .from("instructores")
        .select("id, nombres, apellidos")
        .order("nombres", { ascending: true });
      if (instData) setInstructores(instData);

      const { data: alumnosData, error: alumnosErr } = await supabase
        .from("alumnos")
        .select(
          "id, nombres, apellidos, rut, fecha_nacimiento, edad, telefono, email, direccion, grado, sede_id, instructor_id, sedes(nombre), instructores(nombres, apellidos)"
        )
        .order("apellidos", { ascending: true })
        .order("nombres", { ascending: true });

      if (alumnosErr) {
        console.error(alumnosErr);
      }
      if (alumnosData) {
        // Tipar de forma segura por la diferencia de arrays/objeto que puede devolver Supabase
        setAlumnos(alumnosData as unknown as Alumno[]);
      }

      setLoading(false);
    })();
  }, []);

  // -------------------- Crear alumno --------------------
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombres.trim() || !form.apellidos.trim()) {
      alert("Por favor completa Nombres y Apellidos.");
      return;
    }
    if (!form.rut.trim()) {
      alert("El RUT es obligatorio.");
      return;
    }
    if (!form.sede_id || !form.instructor_id) {
      alert("Selecciona Sede e Instructor.");
      return;
    }

    setSubmitting(true);
    const payload: Record<string, any> = {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      rut: form.rut.trim(),
      grado: form.grado || null,
      sede_id: Number(form.sede_id),
      instructor_id: Number(form.instructor_id),
      telefono: form.telefono || null,
      email: form.email || null,
      direccion: form.direccion || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
    };

    const { data, error } = await supabase
      .from("alumnos")
      .insert(payload)
      .select(
        "id, nombres, apellidos, rut, fecha_nacimiento, edad, telefono, email, direccion, grado, sede_id, instructor_id, sedes(nombre), instructores(nombres, apellidos)"
      );

    setSubmitting(false);
    if (error) {
      console.error(error);
      alert(`No se pudo crear el alumno: ${error.message}`);
      return;
    }

    if (data && data.length > 0) {
      setAlumnos((prev) => [data[0] as unknown as Alumno, ...prev]);
      setForm({
        nombres: "",
        apellidos: "",
        rut: "",
        fecha_nacimiento: "",
        telefono: "",
        email: "",
        direccion: "",
        grado: "",
        sede_id: "",
        instructor_id: "",
      });
      alert("✅ Alumno creado correctamente.");
    }
  }

  // -------------------- Filtro / búsqueda --------------------
  const alumnosFiltrados = useMemo(() => {
    let base = [...alumnos];

    if (q.trim()) {
      const term = q.toLowerCase();
      base = base.filter(
        (a) =>
          a.nombres.toLowerCase().includes(term) ||
          a.apellidos.toLowerCase().includes(term) ||
          (a.rut || "").toLowerCase().includes(term) ||
          (a.email || "").toLowerCase().includes(term)
      );
    }
    if (filtroSede !== "todos") {
      const idS = Number(filtroSede);
      base = base.filter((a) => a.sede_id === idS);
    }
    if (filtroInstructor !== "todos") {
      const idI = Number(filtroInstructor);
      base = base.filter((a) => a.instructor_id === idI);
    }
    return base;
  }, [alumnos, q, filtroSede, filtroInstructor]);

  // -------------------- UI --------------------
  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8">
      {/* Título */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Alumnos</h1>
        <p className="text-sm text-gray-500">
          Administra tu nómina: crear, buscar y filtrar por sede e instructor.
        </p>
      </div>

      {/* Filtros / búsqueda */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Buscar</label>
            <Input
              placeholder="Nombre, apellido, RUT o email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Sede</label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
            >
              <option value="todos">Todas</option>
              {sedes.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Instructor</label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filtroInstructor}
              onChange={(e) => setFiltroInstructor(e.target.value)}
            >
              <option value="todos">Todos</option>
              {instructores.map((i) => (
                <option key={i.id} value={String(i.id)}>
                  {i.nombres} {i.apellidos}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Formulario crear alumno */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Nuevo alumno</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nombres</label>
              <Input
                value={form.nombres}
                onChange={(e) => setForm((f) => ({ ...f, nombres: e.target.value }))}
                placeholder="Ej: Amanda Beatriz"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Apellidos</label>
              <Input
                value={form.apellidos}
                onChange={(e) => setForm((f) => ({ ...f, apellidos: e.target.value }))}
                placeholder="Ej: Quiñones Delgado"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">RUT</label>
              <Input
                value={form.rut}
                onChange={(e) => setForm((f) => ({ ...f, rut: e.target.value }))}
                placeholder="Ej: 23838019-7"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Fecha de nacimiento</label>
              <Input
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha_nacimiento: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                placeholder="Ej: +569..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="correo@dominio.com"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-sm font-medium">Dirección</label>
              <Input
                value={form.direccion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, direccion: e.target.value }))
                }
                placeholder="Calle, número, comuna"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Grado</label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.grado}
                onChange={(e) => setForm((f) => ({ ...f, grado: e.target.value }))}
              >
                <option value="">Selecciona grado</option>
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Sede</label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.sede_id}
                onChange={(e) => setForm((f) => ({ ...f, sede_id: e.target.value }))}
              >
                <option value="">Selecciona sede</option>
                {sedes.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Instructor</label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.instructor_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instructor_id: e.target.value }))
                }
              >
                <option value="">Selecciona instructor</option>
                {instructores.map((i) => (
                  <option key={i.id} value={String(i.id)}>
                    {i.nombres} {i.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar alumno"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabla de alumnos */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Cargando…</div>
          ) : alumnosFiltrados.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No hay alumnos para mostrar.
            </div>
          ) : (
            <div className="overflow-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Nombre</th>
                    <th className="px-3 py-2 text-left font-medium">RUT</th>
                    <th className="px-3 py-2 text-left font-medium">Grado</th>
                    <th className="px-3 py-2 text-left font-medium">Edad</th>
                    <th className="px-3 py-2 text-left font-medium">Sede</th>
                    <th className="px-3 py-2 text-left font-medium">Instructor</th>
                    <th className="px-3 py-2 text-left font-medium">Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosFiltrados.map((a) => {
                    const sedeNombre = getSedeNombre(a.sedes);
                    const instructorNombre = getInstructorNombre(a.instructores);
                    return (
                      <tr key={a.id} className="border-t">
                        <td className="px-3 py-2">
                          {a.nombres} {a.apellidos}
                        </td>
                        <td className="px-3 py-2">{a.rut}</td>
                        <td className="px-3 py-2">{a.grado || "-"}</td>
                        <td className="px-3 py-2">{a.edad ?? "-"}</td>
                        <td className="px-3 py-2">{sedeNombre || "-"}</td>
                        <td className="px-3 py-2">{instructorNombre || "-"}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span>{a.telefono || "-"}</span>
                            <span className="text-gray-500">{a.email || "-"}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}