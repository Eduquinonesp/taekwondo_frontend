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
  Legend,
  ResponsiveContainer,
} from "recharts";

// Colores para el gráfico
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

type DistribucionSede = {
  sede: string;
  cantidad: number;
};

export default function DashboardPage() {
  const [totalAlumnos, setTotalAlumnos] = useState<number>(0);
  const [totalInstructores, setTotalInstructores] = useState<number>(0);
  const [promedioEdad, setPromedioEdad] = useState<number>(0);
  const [distribucion, setDistribucion] = useState<DistribucionSede[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Traer alumnos con su sede
        const { data: alumnos, error: alumnosError } = await supabase
          .from("alumnos")
          .select("id, fecha_nacimiento, sede_id, sedes(nombre)")
          .order("id", { ascending: true });

        if (alumnosError) throw alumnosError;

        // 2) Contar instructores
        const { count: countInstructores, error: instError } = await supabase
          .from("instructores")
          .select("id", { count: "exact", head: true });

        if (instError) throw instError;

        // Total alumnos
        const totalA = alumnos?.length ?? 0;
        setTotalAlumnos(totalA);

        // Total instructores
        setTotalInstructores(countInstructores ?? 0);

        // Promedio de edad (en años)
        if (alumnos && alumnos.length > 0) {
          const hoy = new Date();
          const sumEdades = alumnos.reduce((suma: number, a: any) => {
            if (!a.fecha_nacimiento) return suma;
            const fn = new Date(a.fecha_nacimiento);
            let edad =
              hoy.getFullYear() - fn.getFullYear();
            const m = hoy.getMonth() - fn.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) {
              edad--;
            }
            return suma + edad;
          }, 0);

          const promedio = Math.round(sumEdades / alumnos.length);
          setPromedioEdad(promedio);
        } else {
          setPromedioEdad(0);
        }

        // Distribución por sede
        const conteo: Record<string, number> = {};
        if (alumnos) {
          alumnos.forEach((a: any) => {
            const sedeNombre =
              (a.sedes && a.sedes.nombre) || "Sin sede";
            conteo[sedeNombre] = (conteo[sedeNombre] || 0) + 1;
          });
        }

        const distribucionData = Object.entries(conteo).map(
          ([sede, cantidad]) => ({ sede, cantidad })
        );

        setDistribucion(distribucionData);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error al cargar datos del dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="flex-1 p-8 bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
      <h1 className="text-3xl font-bold mb-2 text-center">
        Dashboard Taekwon-Do Chile 🇨🇱
      </h1>
      <p className="text-slate-400 text-center mb-8">
        Visualiza los datos reales de tus alumnos, instructores y sedes.
      </p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-900/40 border border-red-500 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Tarjetas resumen */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">
              Total Alumnos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {loading ? "…" : totalAlumnos}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">
              Instructores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {loading ? "…" : totalInstructores}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">
              Promedio Edad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {loading ? "…" : `${promedioEdad} años`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">
              Exámenes Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {loading ? "…" : 0}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              (Por ahora fijo; luego lo conectamos a tu lógica de exámenes.)
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Gráfico de distribución */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Distribución de alumnos por sede
        </h2>

        {loading ? (
          <p className="text-slate-400 text-sm">Cargando datos…</p>
        ) : distribucion.length === 0 ? (
          <p className="text-slate-500 text-sm">
            Aún no hay alumnos registrados en el sistema.
          </p>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={distribucion}
                  dataKey="cantidad"
                  nameKey="sede"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  labelLine={false}
                  label={(entry) =>
                    `${entry.sede} (${entry.cantidad})`
                  }
                >
                  {distribucion.map((entry, index) => (
                    <Cell
                      key={entry.sede}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, props) => [
                    `${value} alumnos`,
                    props?.payload?.sede,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </main>
  );
}