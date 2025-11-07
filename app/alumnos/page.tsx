"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

// ===== Tipos =====
type Sede = { id: number; nombre: string };
type InstructorVista = {
  sede_id: number;
  instructor_id: number;
  nombre_completo: string;
  grado: string | null;
};

// ===== Utilidades =====
function calcEdad(fechaISO: string | null): number | null {
  if (!fechaISO) return null;
  const hoy = new Date();
  const f = new Date(fechaISO);
  let edad = hoy.getFullYear() - f.getFullYear();
  const m = hoy.getMonth() - f.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < f.getDate())) edad--;
  return edad;
}

// Lista corta de grados (ajústala si quieres más)
const GRADOS = [
  "10º Kup (Blanco)",
  "9º Kup (Blanco Punta Amarilla)",
  "8º Kup (Amarillo)",
  "7º Kup (Amarillo Punta Verde)",
  "6º Kup (Verde)",
  "5º Kup (Verde Punta Azul)",
  "4º Kup (Azul)",
  "3º Kup (Azul Punta Roja)",
  "2º Kup (Rojo)",
  "1º Kup (Rojo Punta Negra)",
  "I Dan",
  "II Dan",
  "III Dan",
  "IV Dan",
  "V Dan",
];

export default function AlumnosPage() {
  // --- combos ---
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [instructores, setInstructores] = useState<InstructorVista[]>([]);
  const [sedeId, setSedeId] = useState<number | null>(null);
  const [instructorId, setInstructorId] = useState<number | null>(null);

  const [loadingSedes, setLoadingSedes] = useState(false);
  const [loadingInstructores, setLoadingInstructores] = useState(false);

  // --- formulario alumno ---
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [rut, setRut] = useState(""); // obligatorio por tu esquema
  const [fechaNacimiento, setFechaNacimiento] = useState<string>("");
  const edad = useMemo(() => calcEdad(fechaNacimiento || null), [fechaNacimiento]);

  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [grado, setGrado] = useState("I Dan"); // por defecto

  const [saving, setSaving] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // 1) Cargar sedes
  useEffect(() => {
    (async () => {
      setLoadingSedes(true);
      const { data, error } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });

      if (error) setLastError(error.message);
      setSedes(data || []);
      setLoadingSedes(false);
    })();
  }, []);

  // 2) Cargar instructores cuando hay sede
  useEffect(() => {
    if (!sedeId) {
      setInstructores([]);
      setInstructorId(null);
      return;
    }
    (async () => {
      setLoadingInstructores(true);
      const { data, error } = await supabase
        .from("v_instructores_por_sede")
        .select("sede_id, instructor_id, nombre_completo, grado")
        .eq("sede_id", sedeId)
        .order("nombre_completo", { ascending: true });

      if (error) {
        setLastError(error.message);
        setInstructores([]);
      } else {
        setInstructores(data || []);
      }
      setLoadingInstructores(false);
    })();
  }, [sedeId]);

  // 3) Guardar alumno
  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setOkMsg(null);
    setLastError(null);

    if (!sedeId) return setLastError("Selecciona una sede.");
    if (!instructorId) return setLastError("Selecciona un instructor.");
    if (!nombres.trim()) return setLastError("Ingresa los nombres.");
    if (!apellidos.trim()) return setLastError("Ingresa los apellidos.");
    if (!rut.trim()) return setLastError("Ingresa el RUT.");
    if (!fechaNacimiento) return setLastError("Ingresa la fecha de nacimiento.");

    const edadCalc = calcEdad(fechaNacimiento);
    setSaving(true);

    const { error } = await supabase.from("alumnos").insert([
      {
        nombres,
        apellidos,
        rut, // NOT NULL en tu tabla
        fecha_nacimiento: fechaNacimiento, // YYYY-MM-DD
        edad: edadCalc,
        instructor_id: instructorId,
        sede_id: sedeId,
        telefono_apoderado: telefono || null,
        correo_apoderado: email || null,
        direccion: direccion || null,
        grado: grado || null,
      },
    ]);

    setSaving(false);

    if (error) {
      setLastError(error.message);
    } else {
      setOkMsg("✅ Alumno guardado correctamente.");
      // limpiar formulario
      setNombres("");
      setApellidos("");
      setRut("");
      setFechaNacimiento("");
      setTelefono("");
      setEmail("");
      setDireccion("");
      setGrado("I Dan");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-white mb-8">Registro de Alumnos</h1>

      {/* COMBOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Sede */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <label className="block text-sm text-white/80 mb-2">Sede</label>
          <select
            className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
            value={sedeId ?? ""}
            onChange={(e) => setSedeId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="" className="text-black">
              {loadingSedes ? "Cargando sedes..." : "Seleccione una sede..."}
            </option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id} className="text-black">
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Instructor */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <label className="block text-sm text-white/80 mb-2">Instructor</label>
          <select
            className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none disabled:opacity-50"
            value={instructorId ?? ""}
            onChange={(e) => setInstructorId(e.target.value ? Number(e.target.value) : null)}
            disabled={!sedeId || loadingInstructores}
          >
            <option value="" className="text-black">
              {!sedeId
                ? "Elija una sede primero..."
                : loadingInstructores
                ? "Cargando instructores..."
                : instructores.length
                ? "Seleccione un instructor..."
                : "No hay instructores en esta sede"}
            </option>
            {instructores.map((i) => (
              <option key={i.instructor_id} value={i.instructor_id} className="text-black">
                {i.nombre_completo} {i.grado ? `— ${i.grado}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FORMULARIO — solo si ya hay sede e instructor */}
      {sedeId && instructorId ? (
        <form
          onSubmit={handleGuardar}
          className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5"
        >
          <h2 className="text-xl text-white font-medium">Datos del Alumno</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Nombres</label>
              <input
                className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej: Amanda Beatriz"
              />
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">Apellidos</label>
              <input
                className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej: Quiñones Delgado"
              />
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">RUT</label>
              <input
                className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="23838019-7"
              />
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">Fecha de nacimiento</label>
              <input
                type="date"
                className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
              />
              <p className="text-xs text-white/60 mt-1">
                {edad !== null ? `Edad: ${edad} años` : "—"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">Teléfono apoderado</label>
              <input
                className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+569..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">Correo apoderado</label>
              <input
                type="email"
                className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@dominio.cl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-white/80 mb-1">Dirección</label>
              <input
                className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle, número, comuna"
              />
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">Grado</label>
              <select
                className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
                value={grado}
                onChange={(e) => setGrado(e.target.value)}
              >
                {GRADOS.map((g) => (
                  <option key={g} value={g} className="text-black">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mensajes */}
          {lastError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-100 px-3 py-2">
              {lastError}
            </div>
          )}
          {okMsg && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-100 px-3 py-2">
              {okMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 transition px-4 py-2 text-white disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar Alumno"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-100 text-sm">
          Primero selecciona <b>Sede</b> y <b>Instructor</b> para mostrar el formulario.
        </div>
      )}

      {/* Panel de estado */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 text-sm">
        <div className="font-semibold mb-1">Estado</div>
        <ul className="list-disc ml-5 space-y-1">
          <li>Sedes cargadas: {sedes.length}</li>
          <li>
            Instructores cargados: {instructores.length}{" "}
            {sedeId ? `(sede_id = ${sedeId})` : ""}
          </li>
        </ul>
      </div>
    </div>
  );
}