"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// 👇 Rutas relativas (evitan el error en Render)
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

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
  // Relaciones (si están definidas en FK de Supabase)
  sedes?: { nombre: string } | null;
  instructores?: { nombres: string; apellidos: string } | null;
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

      // Sedes
      const { data: sedesData, error: sedesErr } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });
      if (!sedesErr && sedesData) setSedes(sedesData);

      // Instructores
      const { data: instData, error: instErr } = await supabase
        .from("instructores")
        .select("id, nombres, apellidos")
        .order("nombres", { ascending: true });
      if (!instErr && instData) setInstructores(instData);

      // Alumnos (con relaciones si existen FK)
      const { data: alumnosData, error: alumnosErr } = await supabase
        .from("alumnos")
        .select(
          "id, nombres, apellidos, rut, fecha_nacimiento, edad, telefono, email, direccion, grado, sede_id, instructor_id, sedes(nombre), instructores(nombres, apellidos)"
        )
        .order("apellidos", { ascending: true })
        .order("nombres", { ascending: true });

      if (!alumnosErr && alumnosData) setAlumnos(alumnosData as Alumno[]);
      setLoading(false);
    })();
  }, []);

  // -------------------- Crear alumno --------------------
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    // Validaciones mínimas
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

    const { data, error } = await supabase.from("alumnos").insert(payload).select(
      "id, nombres, apellidos, rut, fecha_nacimiento, edad, telefono, email, direccion, grado, sede_id, instructor_id, sedes(nombre), instructores(nombres, apellidos)"
    );

    setSubmitting(false);
    if (error) {
      console.error(error);
      alert(`No se pudo crear el alumno: ${error.message}`);
      return;
    }

    if (data && data.length > 0) {
      setAlumnos((prev) => [data[0] as Alumno, ...prev]);
      // Reset del formulario
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
            <Select
              value={filtroSede}
              onValueChange={(v) => setFiltroSede(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona sede" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {sedes.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Instructor</label>
            <Select
              value={filtroInstructor}
              onValueChange={(v) => setFiltroInstructor(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona instructor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {instructores.map((i) => (
                  <SelectItem key={i.id} value={String(i.id)}>
                    {i.nombres} {i.apellidos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

            <div className="flex flex-col gap-2">
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
              <Select
                value={form.grado}
                onValueChange={(v) => setForm((f) => ({ ...f, grado: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona grado" />
                </SelectTrigger>
                <SelectContent>
                  {GRADOS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Sede</label>
              <Select
                value={form.sede_id}
                onValueChange={(v) => setForm((f) => ({ ...f, sede_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sede" />
                </SelectTrigger>
                <SelectContent>
                  {sedes.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Instructor</label>
              <Select
                value={form.instructor_id}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, instructor_id: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructores.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.nombres} {i.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {alumnosFiltrados.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-3 py-2">
                        {a.nombres} {a.apellidos}
                      </td>
                      <td className="px-3 py-2">{a.rut}</td>
                      <td className="px-3 py-2">{a.grado || "-"}</td>
                      <td className="px-3 py-2">{a.edad ?? "-"}</td>
                      <td className="px-3 py-2">
                        {a.sedes?.nombre || "-"}
                      </td>
                      <td className="px-3 py-2">
                        {a.instructores
                          ? `${a.instructores.nombres} ${a.instructores.apellidos}`
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span>{a.telefono || "-"}</span>
                          <span className="text-gray-500">{a.email || "-"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}