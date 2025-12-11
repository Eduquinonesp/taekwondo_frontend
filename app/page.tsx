"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

type Stats = {
  sedes: number;
  instructores: number;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ sedes: 0, instructores: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarStats = async () => {
      try {
        setLoading(true);

        // 👇 Contar sedes
        const { count: sedesCount, error: sedesError } = await supabase
          .from("sedes")
          .select("*", { count: "exact", head: true });

        if (sedesError) {
          console.error("Error al contar sedes:", sedesError);
        }

        // 👇 Contar instructores
        const { count: instructoresCount, error: instructoresError } =
          await supabase
            .from("instructores")
            .select("*", { count: "exact", head: true });

        if (instructoresError) {
          console.error("Error al contar instructores:", instructoresError);
        }

        setStats({
          sedes: sedesCount ?? 0,
          instructores: instructoresCount ?? 0,
        });
      } catch (err) {
        console.error("Error al cargar estadísticas públicas:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarStats();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Sección Hero */}
      <section className="px-4 md:px-10 lg:px-16 py-10 lg:py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-5">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              ATUCH
              <span className="text-sky-400"> · Sistema de gestión</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              ATUCH es una plataforma creada para organizar y profesionalizar
              la gestión de nuestras escuelas de Taekwon-Do. Un solo sistema
              para administrar sedes, instructores, alumnos y pagos, manteniendo
              siempre el foco en lo importante: las personas y la comunidad.
            </p>
            <p className="text-xs md:text-sm text-slate-400">
              Este sitio muestra información general de la organización. El
              acceso a datos detallados de alumnos y pagos está reservado
              únicamente a instructores autorizados.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition"
              >
                Acceso instructores
              </Link>
              <a
                href="#estadisticas"
                className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900/60 transition"
              >
                Ver estadísticas públicas
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 md:p-6 shadow-2xl shadow-black/60">
            <h2 className="text-sm font-semibold text-sky-300 uppercase tracking-wide mb-2">
              Vista rápida del sistema
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Datos generales en tiempo real. La información detallada de cada
              sede, instructor y alumno está protegida dentro del sistema.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3">
                <p className="text-xs text-slate-400">Sedes registradas</p>
                <p className="mt-1 text-2xl font-bold text-sky-400">
                  {loading ? "…" : stats.sedes}
                </p>
                <p className="text-[11px] text-slate-500">
                  Escuelas oficialmente integradas a ATUCH.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3">
                <p className="text-xs text-slate-400">Instructores activos</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {loading ? "…" : stats.instructores}
                </p>
                <p className="text-[11px] text-slate-500">
                  Profesores autorizados dentro del sistema.
                </p>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-slate-500">
              Esta información es pública y solo muestra cantidades, sin
              nombres ni datos personales.
            </p>
          </div>
        </div>
      </section>

      {/* Sección institucional simple */}
      <section
        id="estadisticas"
        className="px-4 md:px-10 lg:px-16 py-10 bg-slate-950"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Una sola familia de Taekwon-Do
          </h2>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            ATUCH busca potenciar el trabajo en equipo entre sedes e
            instructores, entregando herramientas modernas para la gestión
            diaria: control de alumnos, seguimiento de pagos, reportes y más.
          </p>
          <p className="text-sm text-slate-400">
            El detalle de la información (datos de contacto, historial de
            exámenes, pagos individuales, etc.) es visible únicamente para
            usuarios con acceso al sistema interno.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-4 text-center text-[11px] text-slate-500">
        ATUCH · Sistema de gestión de Taekwon-Do · {new Date().getFullYear()}
      </footer>
    </main>
  );
}