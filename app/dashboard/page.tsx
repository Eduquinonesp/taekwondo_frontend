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

type DistribucionSede = {
  sede: string;
  total: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

export default function DashboardPage() {
  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const [totalInstructores, setTotalInstructores] = useState(0);
  const [promedioEdad, setPromedioEdad] = useState(0);
  const [examenesPendientes, setExamenesPendientes] = useState(0);
  const [distribucion, setDistribucion] = useState<DistribucionSede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Traer alumnos
        const { data: alumnos, error: alumnosError } = await supabase
          .from("alumnos")
          .select(
            `
              id,
              edad,
              sede_id,
              fecha_ultimo_examen
            `
          );

        if (alumnosError) throw alumnosError;

        // 2) Traer sedes
        const { data: sedes, error: sedesError } = await supabase
          .from("sedes")
          .select("id, nombre");

        if (sedesError) throw sedesError;

        // 3) Traer instructores
        const { data: instructores, error: instructoresError } =
          await supabase.from("instructores").select("id");

        if (instructoresError) throw instructoresError;

        // --- Cálculos ---

        // Total alumnos
        const totalAlu = alumnos?.length ?? 0;
        setTotalAlumnos(totalAlu);

        // Total instructores
        const totalInst = instructores?.length ?? 0;
        setTotalInstructores(totalInst);

        // Promedio edad (usa columna edad si existe)
        if (alumnos && alumnos.length > 0) {
          const edadesValidas = alumnos
            .map((a: any) => a.edad)
            .filter((e: any) => typeof e === "number" && !isNaN(e));

          const prom =
            edadesValidas.length > 0
              ? Math.round(
                  edadesValidas.reduce((acc: number, e: number) => acc + e, 0) /
                    edadesValidas.length
                )
              : 0;

          setPromedioEdad(prom);
        } else {
          setPromedioEdad(0);
        }

        // Exámenes pendientes = alumnos sin fecha_ultimo_examen
        if (alumnos && alumnos.length > 0) {
          const pendientes = alumnos.filter(
            (a: any) => !a.fecha_ultimo_examen
          ).length;
          setExamenesPendientes(pendientes);
        } else {
          setExamenesPendientes(0);
        }

        // Distribución por sede (usando nombres reales de sedes)
        if (alumnos && sedes) {
          const mapaSedes = new Map<number, string>();
          sedes.forEach((s: any) => {
            mapaSedes.set(s.id, s.nombre);
          });

          const conteo = new Map<string, number>();

          alumnos.forEach((a: any) => {
            const nombreSede =
              mapaSedes.get(a.sede_id) || "Sin sede asignada";
            conteo.set(nombreSede, (conteo.get(nombreSede) || 0) + 1);
          });

          const distribucionData: DistribucionSede[] = Array.from(
            conteo.entries()
          ).map(([sede, total]) => ({
            sede,
            total,
          }));

          setDistribucion(distribucionData);
        } else {
          setDistribucion([]);
        }
      } catch (err: any) {
        console.error("Error cargando dashboard:", err);
        setError("No se pudieron cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">
        Dashboard Taekwon-Do Chile 🇨🇱
      </h1>
      <p className="text-gray-400">
        Visualiza el estado real de alumnos, sedes e instructores desde la base ATUCH.
      </p>

      {/* Tarjetas superiores */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Alumnos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? "…" : totalAlumnos}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructores</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? "…" : totalInstructores}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promedio Edad</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? "…" : `${promedioEdad} años`}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exámenes Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? "…" : examenesPendientes}
          </CardContent>
        </Card>
      </section>

      {/* Gráfico */}
      <section className="bg-[#050816] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Distribución de alumnos por sede
        </h2>

        {error && (
          <p className="text-red-400 mb-2 text-sm">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-gray-400">Cargando datos reales…</p>
        ) : distribucion.length === 0 ? (
          <p className="text-gray-400">
            Aún no hay alumnos registrados en la base de datos.
          </p>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={distribucion}
                  dataKey="total"
                  nameKey="sede"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {distribucion.map((entry, index) => (
                    <Cell
                      key={entry.sede}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, _name: any, props: any) => [
                    `${value} alumnos`,
                    props.payload.sede,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </main>
  );
}