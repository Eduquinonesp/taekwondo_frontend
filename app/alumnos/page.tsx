"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function DashboardPage() {
  const [chartData, setChartData] = useState<
    { name: string; value: number }[]
  >([]);

  useEffect(() => {
    // Simulación de datos de ejemplo
    setChartData([
      { name: "Dojang Ñuñoa", value: 45 },
      { name: "Dojang La Reina", value: 30 },
      { name: "Dojang Vitacura", value: 15 },
      { name: "Dojang Peñalolén", value: 10 },
    ]);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 flex flex-col gap-8 items-center">
      <h1 className="text-4xl font-bold mb-2 text-center text-blue-400">
        Dashboard Taekwon-Do Chile 🇨🇱
      </h1>
      <p className="text-neutral-400 text-center max-w-2xl mb-6">
        Visualiza el rendimiento y distribución de alumnos por sede.
      </p>

      {/* Tarjetas de resumen */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Total Alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">4</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promedio Edad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">15 años</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exámenes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">8</p>
          </CardContent>
        </Card>
      </section>

      {/* Gráfico circular */}
      <section className="bg-neutral-900 p-6 rounded-2xl shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-300">
          Distribución de alumnos por sede
        </h2>

        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label={({ name, percent }: any) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={[
                      "#0088FE",
                      "#00C49F",
                      "#FFBB28",
                      "#FF8042",
                    ][index % 4]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => `${value}`}
                contentStyle={{
                  backgroundColor: "#222",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}