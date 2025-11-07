"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Building2,
  GraduationCap,
  CreditCard,
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

type DistribucionPorSede = {
  sede: string;
  cantidad: number;
};

type IngresoMensual = {
  mes: string;
  total: number;
};

const COLORS = ["#38bdf8", "#22c55e", "#f97316", "#a855f7", "#e11d48"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const [totalSedes, setTotalSedes] = useState(0);
  const [totalInstructores, setTotalInstructores] = useState(0);
  const [totalPagos, setTotalPagos] = useState(0);

  const [distribucion, setDistribucion] = useState<DistribucionPorSede[]>([]);
  const [ingresosMensuales, setIngresosMensuales] = useState<IngresoMensual[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 🔹 Total alumnos
        {
          const { count, error } = await supabase
            .from("alumnos")
            .select("id", { count: "exact", head: true });

          if (!error && count !== null) setTotalAlumnos(count);
        }

        // 🔹 Total sedes
        {
          const { count, error } = await supabase
            .from("sedes")
            .select("id", { count: "exact", head: true });

          if (!error && count !== null) setTotalSedes(count);
        }

        // 🔹 Total instructores
        {
          const { count, error } = await supabase
            .from("instructores")
            .select("id", { count: "exact", head: true });

          if (!error && count !== null) setTotalInstructores(count);
        }

        // 🔹 Pagos totales + ingresos mensuales
        {
          const { data, error } = await supabase
            .from("pagos")
            .select("monto, fecha_pago")
            .order("fecha_pago", { ascending: true });

          if (!error && data) {
            // Total $
            const total = data.reduce(
              (acc, p: any) => acc + (p.monto || 0),
              0
            );
            setTotalPagos(total);

            // Agrupado por mes
            const porMes: Record<string, number> = {};

            data.forEach((p: any) => {
              if (!p.fecha_pago) return;
              const fecha = new Date(p.fecha_pago);
              if (isNaN(fecha.getTime())) return;

              const key = `${fecha.getFullYear()}-${String(
                fecha.getMonth() + 1
              ).padStart(2, "0")}`;

              porMes[key] = (porMes[key] || 0) + (p.monto || 0);
            });

            const listaMeses: IngresoMensual[] = Object.entries(porMes).map(
              ([mes, total]) => ({
                mes,
                total,
              })
            );

            setIngresosMensuales(listaMeses);
          }
        }

        // 🔹 Distribución de alumnos por sede
        {
          const { data, error } = await supabase
            .from("alumnos")
            .select("sede_id, sedes(nombre)")
            .neq("sede_id", null);

          if (!error && data) {
            const mapa: Record<string, number> = {};

            (data as any[]).forEach((row) => {
              const nombreSede =
                row.sedes?.nombre || "Sin sede asignada";
              mapa[nombreSede] = (mapa[nombreSede] || 0) + 1;
            });

            const dist: DistribucionPorSede[] = Object.entries(mapa).map(
              ([sede, cantidad]) => ({
                sede,
                cantidad,
              })
            );

            setDistribucion(dist);
          }
        }
      } catch (e) {
        console.error("Error cargando dashboard:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      {/* Título */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Panel General ATUCH
        </h1>
        <p className="text-slate-400 mt-1">
          Resumen en tiempo real de tu organización: alumnos,
          sedes, instructores y pagos.
        </p>
      </header>

      {/* Métricas principales */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Alumnos activos
            </CardTitle>
            <Users className="w-5 h-5 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "…" : totalAlumnos}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total registrados en la base.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Sedes
            </CardTitle>
            <Building2 className="w-5 h-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "…" : totalSedes}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dojangs oficiales registrados.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Instructores
            </CardTitle>
            <GraduationCap className="w-5 h-5 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "…" : totalInstructores}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Incluye maestros e instructores.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pagos registrados
            </CardTitle>
            <CreditCard className="w-5 h-5 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading
                ? "…"
                : `$${totalPagos.toLocaleString("es-CL")}`}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Suma total histórica en el sistema.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Gráficos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Distribución alumnos por sede */}
        <Card className="bg-slate-900 border-slate-800">
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
              <div className="flex items-center justify-center h-full text-slate-500">
                Aún no hay alumnos asignados a sedes.
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
                    // 👇 Usamos props genéricos para evitar errores de tipo
                    label={(props: any) =>
                      `${props.name} ${(
                        (props.percent || 0) * 100
                      ).toFixed(0)}%`
                    }
                  >
                    {distribucion.map((entry, index) => (
                      <Cell
                        key={entry.sede}
                        fill={
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
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
              * Basado en los alumnos registrados con
              sede en Supabase.
            </p>
          )}
        </Card>

        {/* Ingresos mensuales */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>
              Ingresos mensuales (histórico)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                Cargando datos…
              </div>
            ) : ingresosMensuales.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                Aún no hay pagos registrados.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosMensuales}>
                  <XAxis
                    dataKey="mes"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                  />
                  <RechartsTooltip
                    formatter={(value: any) =>
                      `$${Number(
                        value
                      ).toLocaleString("es-CL")}`
                    }
                  />
                  <Bar
                    dataKey="total"
                    radius={[4, 4, 0, 0]}
                    fill="#38bdf8"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          {!loading && (
            <p className="px-6 pb-4 text-xs text-slate-500">
              * Montos calculados desde la tabla
              "pagos".
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}