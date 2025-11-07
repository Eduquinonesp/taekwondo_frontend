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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

type Alumno = {
  id: number;
  fecha_nacimiento: string | null;
  sede_id: number | null;
};

type Sede = {
  id: number;
  nombre: string;
};

type Instructor = {
  id: number;
};

type DistribucionSede = {
  sede: string;
  cantidad: number;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const [totalInstructores, setTotalInstructores] = useState(0);
  const [promedioEdad, setPromedioEdad] = useState<number | null>(null);
  const [examenesPendientes, setExamenesPendientes] = useState<number | null>(
    null
  ); // si luego tienes esa info, la calculamos

  const [distribucion, setDistribucion] = useState<DistribucionSede[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1) Traer alumnos
      const { data: alumnos, error: alumnosError } = await supabase
        .from("alumnos")
        .select("id, fecha_nacimiento, sede_id");

      if (alumnosError) {
        console.error("Error cargando alumnos:", alumnosError);
      }

      // 2) Traer instructores
      const { data: instructores, error: instructoresError } = await supabase
        .from("instructores")
        .select("id");

      if (instructoresError) {
        console.error("Error cargando instructores:", instructoresError);
      }

      // 3) Traer sedes
      const { data: sedes, error: sedesError } = await supabase
        .from("sedes")
        .select("id, nombre");

      if (sedesError) {
        console.error("Error cargando sedes:", sedesError);
      }

      // --- Calcular métricas solo si tenemos datos ---
      const alumnosList: Alumno[] = alumnos || [];
      const instructoresList: Instructor[] = instructores || [];
      const sedesList: Sede[] = sedes || [];

      // Total alumnos
      setTotalAlumnos(alumnosList.length);

      // Total instructores
      setTotalInstructores(instructoresList.length);

      // Promedio edad (en años) basado en fecha_nacimiento
      if (alumnosList.length > 0) {
        const hoy = new Date();
        const edades = alumnosList
          .map((a) => {
            if (!a.fecha_nacimiento) return null;
            const fn = new Date(a.fecha_nacimiento);
            if (isNaN(fn.getTime())) return null;
            let edad = hoy.getFullYear() - fn.getFullYear();
            const m = hoy.getMonth() - fn.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) {
              edad--;
            }
            return edad;
          })
          .filter((e): e is number => e !== null);

        if (edades.length > 0) {
          const suma = edades.reduce((acc, e) => acc + e, 0);
          setPromedioEdad(Math.round(suma / edades.length));
        } else {
          setPromedioEdad(null);
        }
      } else {
        setPromedioEdad(null);
      }

      // Exámenes pendientes (POR AHORA: null o 0 hasta que exista lógica real)
      setExamenesPendientes(null); // o 0 si prefieres mostrar algo

      // Distribución por sede (usando sede_id de alumnos)
      const conteoPorSede: Record<number, number> = {};

      alumnosList.forEach((a) => {
        if (!a.sede_id) return;
        conteoPorSede[a.sede_id] = (conteoPorSede[a.sede_id] || 0) + 1;
      });

      const distribucionReal: DistribucionSede[] = Object.entries(
        conteoPorSede
      ).map(([sedeId, cantidad]) => {
        const sede = sedesList.find((s) => s.id === Number(sedeId));
        return {
          sede: sede ? sede.nombre : `Sede ${sedeId}`,
          cantidad,
        };
      });

      setDistribucion(distribucionReal);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-8 py-10">
      <section className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold text-center mb-2">
          Dashboard Taekwon-Do Chile 🇨🇱
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Métricas en base a los datos reales de tu sistema (Supabase).
        </p>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Total Alumnos</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {loading ? "…" : totalAlumnos}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Instructores</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {loading ? "…" : totalInstructores}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Promedio Edad</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {loading
                ? "…"
                : promedioEdad !== null
                ? `${promedioEdad} años`
                : "Sin datos"}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Exámenes Pendientes</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {loading
                ? "…"
                : examenesPendientes !== null
                ? examenesPendientes
                : "—"}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de distribución */}
        <Card className="bg-slate-900 border-slate-800 mt-8">
          <CardHeader>
            <CardTitle>Distribución de alumnos por sede</CardTitle>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribucion}
                    dataKey="cantidad"
                    nameKey="sede"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={({ sede, percent }) =>
                      `${sede} ${(percent * 100).toFixed(0)}%`
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
                    formatter={(value: any, _name: any, props: any) => [
                      `${value} alumnos`,
                      props.payload.sede,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}