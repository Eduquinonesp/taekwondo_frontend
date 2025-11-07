"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Colores del gráfico
const COLORS = ["#3882F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

type DashboardStats = {
  totalAlumnos: number;
  totalInstructores: number;
  promedioEdad: number | null;
  examenesPendientes: number | null;
};

type DistribucionSede = {
  sede: string;
  cantidad: number;
};

// Label seguro para el gráfico
const renderLabel = (props: any) => {
  const { name, percent } = props;
  const pct =
    typeof percent === "number" && !Number.isNaN(percent)
      ? percent * 100
      : 0;
  return `${name ?? ""} ${pct.toFixed(0)}%`;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAlumnos: 0,
    totalInstructores: 0,
    promedioEdad: null,
    examenesPendientes: null,
  });

  const [distribucion, setDistribucion] = useState<DistribucionSede[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // === ALUMNOS ===
        const {
          data: alumnosData,
          count: alumnosCount,
          error: alumnosError,
        } = await supabase
          .from("alumnos")
          .select(
            "id, edad, fecha_ultimo_examen, sede_id, sedes ( nombre )",
            { count: "exact" }
          );

        if (alumnosError) throw alumnosError;

        const totalAlumnos = alumnosCount ?? 0;

        // === INSTRUCTORES ===
        const {
          count: instructoresCount,
          error: instructoresError,
        } = await supabase
          .from("instructores")
          .select("id", { count: "exact", head: true });

        if (instructoresError) throw instructoresError;

        // === PROMEDIO EDAD ===
        let promedioEdad: number | null = null;
        if (alumnosData && alumnosData.length > 0) {
          const sum = alumnosData.reduce(
            (acc: number, a: any) =>
              acc + (typeof a.edad === "number" ? a.edad : 0),
            0
          );
          promedioEdad = +(sum / alumnosData.length).toFixed(1);
        }

        // === EXÁMENES PENDIENTES ===
        let examenesPendientes: number | null = null;
        if (alumnosData) {
          examenesPendientes = alumnosData.filter(
            (a: any) => !a.fecha_ultimo_examen
          ).length;
        }

        // === DISTRIBUCIÓN POR SEDE ===
        const mapaSedes: Record<string, number> = {};
        if (alumnosData) {
          alumnosData.forEach((a: any) => {
            const sedeNombre = a.sedes?.nombre || "Sin sede";
            mapaSedes[sedeNombre] = (mapaSedes[sedeNombre] || 0) + 1;
          });
        }

        const distribucionArray: DistribucionSede[] = Object.entries(
          mapaSedes
        ).map(([sede, cantidad]) => ({ sede, cantidad }));

        setStats({
          totalAlumnos,
          totalInstructores: instructoresCount ?? 0,
          promedioEdad,
          examenesPendientes,
        });
        setDistribucion(distribucionArray);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10 flex flex-col gap-10 items-center">
      <h1 className="text-4xl font-bold mb-2 text-center">
        Dashboard Taekwon-Do Chile 🇨🇱
      </h1>
      <p className="text-neutral-400 text-center mb-6">
        Visualiza el rendimiento y distribución de alumnos por sede.
      </p>

      {/* Tarjetas de métricas */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-5xl">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>Total Alumnos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {loading ? "..." : stats.totalAlumnos}
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>Instructores</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {loading ? "..." : stats.totalInstructores}
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>Promedio Edad</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {loading
              ? "..."
              : stats.promedioEdad !== null
              ? `${stats.promedioEdad} años`
              : "—"}
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>Exámenes Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {loading
              ? "..."
              : stats.examenesPendientes !== null
              ? stats.examenesPendientes
              : "—"}
          </CardContent>
        </Card>
      </section>

      {/* Gráfico de distribución */}
      <section className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-center mb-4">
          Distribución de alumnos por sede
        </h2>

        {loading ? (
          <p className="text-center text-neutral-500">Cargando datos...</p>
        ) : distribucion.length === 0 ? (
          <p className="text-center text-neutral-500">
            Aún no hay alumnos registrados.
          </p>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={distribucion.map((d) => ({
                    name: d.sede,
                    value: d.cantidad,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  labelLine={false}
                  label={renderLabel}
                >
                  {distribucion.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, _name, props: any) => [
                    `${value} alumnos`,
                    props.payload.name,
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