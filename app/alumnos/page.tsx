"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type Sede = { id: number; nombre: string };
type InstructorVista = { sede_id: number; instructor_id: number; nombre_completo: string; grado: string };

export default function AlumnosPage() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [instructores, setInstructores] = useState<InstructorVista[]>([]);
  const [sedeId, setSedeId] = useState<number | null>(null);
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [loadingInstructores, setLoadingInstructores] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // 1️⃣ Cargar sedes
  useEffect(() => {
    (async () => {
      setLoadingSedes(true);
      const { data, error } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });
      if (error) {
        console.error(error);
        setLastError(error.message);
      } else {
        setSedes(data || []);
      }
      setLoadingSedes(false);
    })();
  }, []);

  // 2️⃣ Cargar instructores de la vista pública
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
        console.error("Error cargando instructores:", error);
        setLastError(error.message);
        setInstructores([]);
      } else {
        setInstructores(data || []);
      }
      setLoadingInstructores(false);
    })();
  }, [sedeId]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-white mb-8">Registro de Alumnos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SEDE */}
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

        {/* INSTRUCTOR */}
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
                {`${i.nombre_completo}`} {i.grado ? `— ${i.grado}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DEBUG */}
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