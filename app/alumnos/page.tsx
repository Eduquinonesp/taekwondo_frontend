// app/alumnos/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type Sede = { id: number; nombre: string };
type InstructorVista = { sede_id: number; instructor_id: number; nombre_completo: string; grado: string };

export default function AlumnosPage() {
  // UI state
  const [loadingSedes, setLoadingSedes] = useState(true);
  const [loadingInstructores, setLoadingInstructores] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Data
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeId, setSedeId] = useState<number | "">("");

  const [instructores, setInstructores] = useState<InstructorVista[]>([]);
  const [instructorId, setInstructorId] = useState<number | "">("");

  // ───────────────────────────────────────────────────────────────────────────────
  // 1) Cargar SEDES al montar
  // ───────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingSedes(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("sedes")
        .select("id, nombre")
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error cargando sedes:", error);
        setErrorMsg("No se pudieron cargar las sedes.");
      } else {
        setSedes(data ?? []);
      }
      setLoadingSedes(false);
    })();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────────
  // 2) Cargar INSTRUCTORES cuando el usuario elige una sede
  //    OJO: se lee desde la VISTA v_instructores_por_sede
  // ───────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sedeId || typeof sedeId !== "number") {
      setInstructores([]);
      setInstructorId("");
      return;
    }

    (async () => {
      setLoadingInstructores(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("v_instructores_por_sede")
        .select("sede_id, instructor_id, nombre_completo, grado")
        .eq("sede_id", sedeId)
        .order("nombre_completo", { ascending: true });

      if (error) {
        console.error("Error cargando instructores:", error);
        setErrorMsg("No se pudieron cargar los instructores para la sede seleccionada.");
        setInstructores([]);
      } else {
        setInstructores(data ?? []);
      }
      setInstructorId("");
      setLoadingInstructores(false);
    })();
  }, [sedeId]);

  // Texto auxiliar
  const sedeSeleccionada = useMemo(
    () => sedes.find((s) => s.id === sedeId)?.nombre ?? "",
    [sedes, sedeId]
  );

  // ───────────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────────
  return (
    <main className="max-w-6xl mx-auto p-6 text-slate-200">
      <h1 className="text-3xl font-semibold mb-6">Registro de Alumnos</h1>

      {/* Aviso de error (si hubiera) */}
      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-900/20 p-3 text-red-200">
          {errorMsg}
        </div>
      )}

      {/* FILTROS: Sede + Instructor */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* SEDE */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <label htmlFor="sede" className="block text-sm text-slate-300 mb-2">
            Sede
          </label>
          <select
            id="sede"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 outline-none"
            value={sedeId}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : "";
              setSedeId(isNaN(v as number) ? "" : (v as number));
            }}
            disabled={loadingSedes}
          >
            <option value="">Seleccione una sede…</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
          {loadingSedes && <p className="mt-2 text-xs text-slate-400">Cargando sedes…</p>}
        </div>

        {/* INSTRUCTOR (depende de sede) */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <label htmlFor="instructor" className="block text-sm text-slate-300 mb-2">
            Instructor {sedeSeleccionada ? `— ${sedeSeleccionada}` : ""}
          </label>
          <select
            id="instructor"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 outline-none"
            value={instructorId}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : "";
              setInstructorId(isNaN(v as number) ? "" : (v as number));
            }}
            disabled={!sedeId || loadingInstructores}
          >
            <option value="">
              {sedeId ? "Seleccione un instructor…" : "Elija una sede primero…"}
            </option>
            {instructores.map((ins) => (
              <option key={ins.instructor_id} value={ins.instructor_id}>
                {ins.nombre_completo} ({ins.grado})
              </option>
            ))}
          </select>
          {!sedeId && <p className="mt-2 text-xs text-slate-400">Primero selecciona una sede.</p>}
          {sedeId && loadingInstructores && (
            <p className="mt-2 text-xs text-slate-400">Cargando instructores…</p>
          )}
          {sedeId && !loadingInstructores && instructores.length === 0 && (
            <p className="mt-2 text-xs text-amber-300">
              No hay instructores asociados a esta sede.
            </p>
          )}
        </div>
      </section>

      {/* Aquí debajo puedes seguir con tu formulario/lista de alumnos */}
      <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <p className="text-sm text-slate-400">
          (Demo) Sede seleccionada: <b>{sedeId || "—"}</b> · Instructor:{" "}
          <b>{instructorId || "—"}</b>
        </p>
      </section>
    </main>
  );
}