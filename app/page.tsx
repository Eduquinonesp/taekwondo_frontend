"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

type Stats = {
  sedes: number;
  instructores: number;
};

type SedePublica = {
  id: number | string;
  nombre?: string | null;
  ciudad?: string | null;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ sedes: 0, instructores: 0 });
  const [sedes, setSedes] = useState<SedePublica[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSedes, setLoadingSedes] = useState(true);

  useEffect(() => {
    const cargarStats = async () => {
      try {
        setLoadingStats(true);

        // 👉 Contar sedes
        const { count: sedesCount, error: sedesError } = await supabase
          .from("sedes")
          .select("*", { count: "exact", head: true });

        if (sedesError) {
          console.error("Error al contar sedes:", sedesError);
        }

        // 👉 Contar instructores
        const {
          count: instructoresCount,
          error: instructoresError,
        } = await supabase
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
        setLoadingStats(false);
      }
    };

    const cargarSedes = async () => {
      try {
        setLoadingSedes(true);

        // 👉 Listado resumido de sedes (sin datos sensibles)
        const { data, error } = await supabase
          .from("sedes")
          .select("id, nombre, ciudad")
          .order("nombre", { ascending: true })
          .limit(8);

        if (error) {
          console.error("Error al cargar sedes públicas:", error);
          return;
        }

        const normalizadas: SedePublica[] =
          (data as any[])?.map((row: any) => ({
            id: row.id,
            nombre: row.nombre ?? "",
            ciudad: row.ciudad ?? "",
          })) ?? [];

        setSedes(normalizadas);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSedes(false);
      }
    };

    cargarStats();
    cargarSedes();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Barra superior */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[11px] font-bold tracking-tight">
              AT
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">
                ATUCH · Universal Taekwon-Do Chile
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                Asociación de Taekwon-Do Unión Chile
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#sedes" className="hover:text-sky-300 transition">
              Escuelas
            </a>
            <a href="#sobre-atuch" className="hover:text-sky-300 transition">
              Sobre ATUCH
            </a>
            <a href="#contacto" className="hover:text-sky-300 transition">
              Contacto
            </a>
            <Link
              href="/login"
              className="rounded-full border border-sky-500/70 bg-sky-500/10 px-4 py-1.5 text-[11px] font-semibold text-sky-300 hover:bg-sky-500/20 transition"
            >
              Acceso instructores
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero principal */}
      <section className="px-4 md:px-6 lg:px-8 py-10 lg:py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
          {/* Texto */}
          <div className="space-y-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-400 uppercase">
              Universal Taekwon-Do Chile
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              Una sola familia de Taekwon-Do
              <span className="block text-emerald-400">
                unida desde Chile para el mundo.
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl">
              ATUCH reúne a las escuelas de Universal Taekwon-Do en Chile:
              instructores, sedes y alumnos que comparten el legado del
              Taekwon-Do ITF, el trabajo en equipo y la formación de mejores
              personas a través del arte marcial.
            </p>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Esta página muestra información general y estadísticas públicas.
              El detalle de alumnos, pagos y gestión interna está protegido y
              sólo disponible para instructores autorizados.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#sedes"
                className="inline-flex items-center rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition"
              >
                Ver escuelas en Chile
              </a>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900/60 transition"
              >
                Acceso instructores
              </Link>
            </div>
          </div>

          {/* Tarjeta estadísticas */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 md:p-6 shadow-2xl shadow-black/60">
            <h2 className="text-sm font-semibold text-slate-100 mb-1">
              Vista rápida del sistema
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">
              Datos generales en tiempo real. Sólo mostramos cantidades para
              cuidar la privacidad de nuestros miembros.
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3">
                <p className="text-[11px] text-slate-400">Sedes activas</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {loadingStats ? "…" : stats.sedes}
                </p>
                <p className="text-[11px] text-slate-500">
                  Escuelas oficialmente integradas a ATUCH.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3">
                <p className="text-[11px] text-slate-400">
                  Instructores registrados
                </p>
                <p className="mt-1 text-2xl font-bold text-sky-400">
                  {loadingStats ? "…" : stats.instructores}
                </p>
                <p className="text-[11px] text-slate-500">
                  Profesores autorizados en el sistema.
                </p>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-500">
              Para acceder al panel interno de gestión, ingresa con tu cuenta
              de instructor.
            </p>
          </div>
        </div>
      </section>

      {/* Sección sedes */}
      <section
        id="sedes"
        className="px-4 md:px-6 lg:px-8 py-10 bg-slate-950 border-t border-slate-900/70"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Escuelas y sedes en Chile
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                A continuación se muestra un resumen de las sedes integradas al
                proyecto ATUCH. Esta es una vista pública; el detalle operativo
                se gestiona dentro del sistema interno.
              </p>
            </div>
          </div>

          {loadingSedes ? (
            <p className="text-sm text-slate-400">Cargando sedes…</p>
          ) : sedes.length === 0 ? (
            <p className="text-sm text-slate-400">
              Aún no hay sedes publicadas. Pronto verás aquí el mapa completo de
              escuelas afiliadas.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sedes.map((sede) => (
                <div
                  key={sede.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-500/60 hover:bg-slate-900 transition"
                >
                  <p className="text-sm font-semibold text-slate-50">
                    {sede.nombre || "Sede sin nombre"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {sede.ciudad || "Ciudad por confirmar"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-3">
                    Integrada a la red ATUCH, bajo el estándar técnico y
                    formativo de Universal Taekwon-Do Chile.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sobre ATUCH */}
      <section
        id="sobre-atuch"
        className="px-4 md:px-6 lg:px-8 py-10 bg-slate-950"
      >
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              ¿Qué es ATUCH como sistema?
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              ATUCH es una plataforma de gestión diseñada especialmente para
              nuestras escuelas de Taekwon-Do. Permite ordenar la información de
              sedes, instructores y alumnos, registrar pagos, llevar el
              seguimiento de exámenes y generar reportes cuando se necesiten.
            </p>
            <p className="text-sm text-slate-400">
              El foco es apoyar el trabajo de los instructores, simplificar las
              tareas administrativas y ofrecer una experiencia más clara para
              las familias que confían en nuestras escuelas.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 space-y-3 text-sm">
            <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-[0.15em]">
              Acceso restringido
            </p>
            <p className="text-sm text-slate-300">
              El acceso al sistema está limitado a instructores y responsables
              de sede autorizados. Cada usuario cuenta con credenciales
              personales.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 mt-1 list-disc list-inside">
              <li>Los datos de alumnos y apoderados no son públicos.</li>
              <li>Los pagos se gestionan de forma interna y segura.</li>
              <li>
                La información mostrada en esta página es sólo un resumen
                estadístico.
              </li>
            </ul>
            <Link
              href="/login"
              className="inline-flex mt-3 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 transition"
            >
              Ingresar al panel de instructores
            </Link>
          </div>
        </div>
      </section>

      {/* Contacto / Pie */}
      <section
        id="contacto"
        className="px-4 md:px-6 lg:px-8 py-8 bg-slate-950 border-t border-slate-900"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Contacto institucional
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Para coordinar actividades, integración de nuevas sedes o
              consultas generales, utiliza los canales oficiales de ATUCH.
            </p>
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <p>Correo genérico: contacto@atuch.cl (ejemplo)</p>
            <p>Redes sociales y enlaces se pueden agregar aquí más adelante.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900 py-4 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} ATUCH · Sistema de gestión de Universal
        Taekwon-Do Chile
      </footer>
    </main>
  );
}