"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type Sede = { id: number; nombre: string };
type Instructor = { id: number; nombre: string; apellido: string; grado: string };

export default function AlumnosPage() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [sedeId, setSedeId] = useState<number | null>(null);
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [loadingInstructores, setLoadingInstructores] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // 1) Cargar sedes al entrar
  useEffect(() => {
    (async () => {
      setLastError(null);
      setLoadingSedes(true);
      const { data, error } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });

      if (error) {
        setLastError(`Error cargando sedes: ${error.message}`);
        setSedes([]);
      } else {
        setSedes((data ?? []) as Sede[]);
      }
      setLoadingSedes(false);
    })();
  }, []);

  // 2) Cuando cambia la sede, cargar instructores de esa sede
  useEffect(() => {
    if (!sedeId) {
      setInstructores([]);
      setInstructorId(null);
      return;
    }

    (async () => {
      setLastError(null);
      setLoadingInstructores(true);

      // IMPORTANTE:
      // Esta consulta usa la relación FK: instructores_sedes.instructor_id -> instructores.id
      // Si en Supabase ves el ícono de "eslabón" en esas columnas (como en tu captura), la relación está lista.
      // Usamos un join implícito con el nombre de la tabla relacionada.
      const { data, error } = await supabase
        .from("instructores_sedes")
        .select(
          `
          instructor_id,
          instructores (
            id,
            nombre,
            apellido,
            grado
          )
        `
        )
        .eq("sede_id", sedeId)
        .order("instructor_id", { ascending: true });

      if (error) {
        setLastError(`Error cargando instructores: ${error.message}`);
        setInstructores([]);
      } else {
        // Normalizamos a nuestro tipo Instructor[]
        const items =
          (data ?? [])
            .map((row: any) =>
              row?.instructores
                ? {
                    id: row.instructores.id,
                    nombre: row.instructores.nombre,
                    apellido: row.instructores.apellido,
                    grado: row.instructores.grado,
                  }
                : null
            )
            .filter(Boolean) as Instructor[];

        // Ordenamos por nombre completo
        items.sort((a, b) =>
          `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, "es")
        );

        setInstructores(items);
      }

      setLoadingInstructores(false);
    })();
  }, [sedeId]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-white mb-8">Registro de Alumnos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Combo Sede */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <label className="block text-sm text-white/80 mb-2">Sede</label>
          <select
            className="w-full rounded-md bg-white/10 text-white px-3 py-2 outline-none"
            value={sedeId ?? ""}
            onChange={(e) => setSedeId(e.target.value ? Number(e.target.value) : null)}
            disabled={loadingSedes}
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
          <p className="text-xs text-white/60 mt-2">
            {sedeId ? `Sede seleccionada: ${sedes.find(s => s.id === sedeId)?.nombre ?? "—"}` : "Seleccione una sede para continuar."}
          </p>
        </div>

        {/* Combo Instructor */}
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
              <option key={i.id} value={i.id} className="text-black">
                {`${i.nombre} ${i.apellido}`} {i.grado ? `— ${i.grado}` : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-white/60 mt-2">
            {instructorId
              ? `Instructor: ${
                  instructores.find((i) => i.id === instructorId)
                    ? `${instructores.find((i) => i.id === instructorId)!.nombre} ${
                        instructores.find((i) => i.id === instructorId)!.apellido
                      }`
                    : "—"
                }`
              : "Primero selecciona una sede."}
          </p>
        </div>
      </div>

      {/* Bloque de ayuda / debug */}
      <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-100 text-sm">
        <div className="font-semibold mb-1">Estado</div>
        <ul className="list-disc ml-5 space-y-1">
          <li>Sedes cargadas: {sedes.length}</li>
          <li>
            Instructores cargados: {instructores.length}{" "}
            {sedeId ? `(sede_id = ${sedeId})` : ""}
          </li>
          {lastError && <li className="text-red-300">⚠ {lastError}</li>}
        </ul>
      </div>
    </div>
  );
}