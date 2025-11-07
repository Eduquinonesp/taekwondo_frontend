"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Colores del gráfico
const COLORS = ["#00B8FF", "#00C49F", "#FFBB28", "#FF8042", "#FF4C4C"];

// Tipos
type AlumnoDB = {
  id: number;
  fecha_nacimiento: string | null;
  fecha_ultimo_examen: string | null;
  sede_id: number | null;
};

type SedeDB = {
  id: number;
  nombre: string;
};

type InstructorDB = {
  id: number;
};

type DistribucionItem = {
  sede: string;
  cantidad: number;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const [totalInstructores, setTotalInstructores] = useState(0);
  const [promedioEdad, setPromedioEdad] = useState(0);
  const [examenesPendientes, setExamenesPendientes] = useState(0);
  const [distribucion, setDistribucion] = useState<DistribucionItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Alumnos
        const { data: alumnosData, error: alumnosError } = await supabase
          .from("alumnos")
          .select(
            "id, fecha_nacimiento, fecha_ultimo_examen, sede_id"
          );

        if (alumnosError) {
          console.error("Error cargando alumnos:", alumnosError.message);
        }

        const alumnos = (alumnosData || []) as AlumnoDB[];
        setTotalAlumnos(alumnos.length);

        // 2) Instructores
        const { data: instructoresData, error: instructoresError } =
          await supabase.from("instructores").select("id");

        if (instructoresError) {
          console.error(
            "Error cargando instructores:",
            instructoresError.message
          );
        }

        const instructores = (instructoresData || []) as InstructorDB[];
        setTotalInstructores(instructores.length);

        // 3) Sedes
        const { data: sedesData, error: sedesError } = await supabase
          .from("sedes")
          .select("id, nombre");

        if (sedesError) {
          console.error("Error cargando sedes:", sedesError.message);
        }

        const sedes = (sedesData || []) as SedeDB[];

        // 4) Promedio de edad (solo alumnos con fecha_nacimiento)
        if (alumnos.length > 0) {
          const hoy = new Date();
          const edades = alumnos
            .filter((a) => a.fecha_nacimiento)
            .map((a) => {
              const fn = new Date(a.fecha_nacimiento as string);
              let edad =
                hoy.getFullYear() - fn.getFullYear();
              const m = hoy.getMonth() - fn.getMonth();
              if (
                m < 0 ||
                (m === 0 && hoy.getDate() < fn.getDate())
              ) {
                edad--;
              }
              return edad;
            });

          if (edades.length > 0) {
            const promedio =
              edades.reduce((acc, e) => acc + e, 0) /
              edades.length;
            setPromedioEdad(Math.round(promedio));
          } else {
            setPromedioEdad(0);
          }
        } else {
          setPromedioEdad(0);
        }

        // 5) Exámenes pendientes
        // Regla simple:
        // - Sin fecha_ultimo_examen => pendiente
        // - Último examen hace más de 12 meses => pendiente
        const hoy = new Date();
        const pendientes = alumnos.filter((a) => {
          if (!a.fecha_ultimo_examen) return true;
          const fe = new Date(a.fecha_ultimo_examen);
          const diffMs = hoy.getTime() - fe.getTime();
          const diffDias = diffMs / (1000 * 60 * 60 * 24);
          return diffDias > 365;
        }).length;

        setExamenesPendientes(pendientes);

        // 6) Distribución por sede
        if (sedes.length > 0 && alumnos.length > 0) {
          const mapaSedes = new Map<number, string>();
          sedes.forEach((s) => mapaSedes.set(s.id, s.nombre));

          const conteo = new Map<string, number>();

          alumnos.forEach((a) => {
            if (!a.sede_id) return;
            const nombreSede = mapaSedes.get(a.sede_id);
            if (!nombreSede) return;
            conteo.set(
              nombreSede,
              (conteo.get(nombreSede) || 0) + 1
            );
          });

          const dist: DistribucionItem[] = Array.from(
            conteo.entries()
          ).map(([sede, cantidad]) => ({ sede, cantidad }));

          setDistribucion(dist);
        } else {
          setDistribucion([]);
        }
      } catch (err) {
        console.error("Error general en dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex-1 p-8 bg-slate-950 text-slate-50">
      <section className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">
            Dashboard Taekwon-Do Chile 🇨🇱
          </h1>
          <p className="text-slate-400 text-sm">
            Datos en tiempo real desde tu base de Supabase.
          </p>
        </header>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">
                Total Alumnos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {loading ? "—" : totalAlumnos}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">
                Instructores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {loading ? "—" : totalInstructores}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">
                Promedio Edad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {loading || !promedioEdad
                  ? "—"
                  : `${promedioEdad} años`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">
                Exámenes Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {loading ? "—" : examenesPendientes}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de distribución */}
        <Card className="bg-slate-900 border-slate-800 mt-4">
          <CardHeader>
            <CardTitle>
              Distribución de alumnos por sede
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                Cargando datos…
              </div>
            ) : distribucion.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                Aún no hay alumnos registrados con sede.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={distribucion}
                    dataKey="cantidad"
                    nameKey="sede"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    labelLine={false}
                    label={({
                      sede,
                      percent,
                    }: {
                      sede: string;
                      percent: number;
                    }) =>
                      `${sede} ${(
                        (percent || 0) * 100
                      ).toFixed(0)}%`
                    }
                  >
                    {distribucion.map(
                      (entry, index) => (
                        <Cell
                          key={entry.sede}
                          fill={
                            COLORS[
                              index % COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(
                      value: any,
                      _name: any,
                      props: any
                    ) => [
                      `${value} alumnos`,
                      props.payload.sede,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          {!loading && (
            <p className="px-6 pb-4 text-xs text-slate-500">
              * Los valores se calculan en base a los
              alumnos registrados en Supabase.
            </p>
          )}
        </Card>
      </section>
    </main>
  );
}