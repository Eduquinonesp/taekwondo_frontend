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
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

type Alumno = {
  id: number;
  fecha_nacimiento: string | null;
  fecha_ultimo_examen: string | null;
  sede_id: number | null;
};

type Sede = {
  id: number;
  nombre: string;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const [totalInstructores, setTotalInstructores] = useState(0);
  const [promedioEdad, setPromedioEdad] = useState<number | null>(null);
  const [examenesPendientes, setExamenesPendientes] = useState(0);
  const [distribucion, setDistribucion] = useState<
    { sede: string; cantidad: number }[]
  >([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // 🔹 Alumnos
        const { data: alumnos, error: alumnosError } = await supabase
          .from("alumnos")
          .select("id, fecha_nacimiento, fecha_ultimo_examen, sede_id");
        if (alumnosError) throw alumnosError;

        setTotalAlumnos(alumnos?.length || 0);

        // 🔹 Instructores
        const { data: instructores, error: instrError } = await supabase
          .from("instructores")
          .select("id");
        if (instrError) throw instrError;

        setTotalInstructores(instructores?.length || 0);

        // 🔹 Sedes
        const { data: sedes, error: sedesError } = await supabase
          .from("sedes")
          .select("id, nombre");
        if (sedesError) throw sedesError;

        const hoy = new Date();

        // 🔹 Promedio edad
        const edades =
          alumnos
            ?.filter((a) => a.fecha_nacimiento)
            .map((a) => {
              const f = new Date(a.fecha_nacimiento as string);
              let edad = hoy.getFullYear() - f.getFullYear();
              const m = hoy.getMonth() - f.getMonth();
              if (m < 0 || (m === 0 && hoy.getDate() < f.getDate())) edad--;
              return edad;
            }) || [];

        if (edades.length > 0) {
          const promedio =
            edades.reduce((sum, e) => sum + e, 0) / edades.length;
          setPromedioEdad(Math.round(promedio));
        } else {
          setPromedioEdad(null);
        }

        // 🔹 Exámenes pendientes:
        // sin fecha_ultimo_examen o más de 12 meses
        const pendientes =
          alumnos?.filter((a) => {
            if (!a.fecha_ultimo_examen) return true;
            const f = new Date(a.fecha_ultimo_examen);
            const diffDias =
              (hoy.getTime() - f.getTime()) / (1000 * 60 * 60 * 24);
            return diffDias > 365;
          }) || [];

        setExamenesPendientes(pendientes.length);

        // 🔹 Distribución por sede
        const conteo = new Map<string, number>();

        (alumnos || []).forEach((a) => {
          const sedeNombre =
            sedes?.find((s) => s.id === a.sede_id)?.nombre || "Sin sede";
          conteo.set(sedeNombre, (conteo.get(sedeNombre) || 0) + 1);
        });

        const dataDistribucion = Array.from(conteo.entries()).map(
          ([sede, cantidad]) => ({
            sede,
            cantidad,
          })
        );

        setDistribucion(dataDistribucion);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <main className="flex-1 p-8 bg-slate-950 text-slate-50">
      <section className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">
            Dashboard Taekwon-Do Chile 🇨🇱
          </h1>
          <p className="text-slate-400 text-sm">
            Mostrando información en base a los datos reales registrados.
          </p>
        </header>

        {/* Tarjetas de métricas */}
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
                {loading || promedioEdad === null
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

        {/* Gráfico de distribución por sede */}
        <Card className="bg-slate-900 border-slate-800 mt-4">
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
                No hay alumnos registrados.
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
                    outerRadius={110}
                    labelLine={false}
                    label={(props: any) =>
                      `${props.name} ${((props.percent || 0) * 100).toFixed(
                        0
                      )}%`
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