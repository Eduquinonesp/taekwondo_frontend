"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Alumno {
  id: number;
  nombre: string;
  edad: number;
  sede: string | null;
  instructor: string | null;
}

export default function DashboardPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);

  // 🎯 Colores para los gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // 🧩 Cargar datos desde Supabase
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const { data, error } = await supabase
          .from("alumnos")
          .select("id, nombre, edad, sede, instructor");

        if (error) throw error;
        setAlumnos(data || []);
      } catch (err) {
        console.error("❌ Error al cargar alumnos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnos();
  }, []);

  // 📊 Agrupar por sede para el gráfico
  const alumnosPorSede = Object.values(
    alumnos.reduce((acc: Record<string, any>, alumno) => {
      const sede = alumno.sede || "Sin sede";
      if (!acc[sede]) acc[sede] = { name: sede, value: 0 };
      acc[sede].value += 1;
      return acc;
    }, {})
  );

  // 🧮 Total de alumnos
  const totalAlumnos = alumnos.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Cargando información...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">
        Panel de Control - Taekwon-Do Universal Chile
      </h1>

      {/* Tarjetas con métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border border-gray-700 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-100">Total de alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-400">{totalAlumnos}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border border-gray-700 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-100">Sedes activas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-400">
              {alumnosPorSede.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border border-gray-700 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-100">Promedio de edad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-400">
              {alumnos.length > 0
                ? Math.round(
                    alumnos.reduce((acc, a) => acc + a.edad, 0) / alumnos.length
                  )
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 📊 Gráfico */}
      <Card className="bg-gray-900 border border-gray-700 shadow-lg rounded-2xl mt-8">
        <CardHeader>
          <CardTitle className="text-gray-100">Distribución por Sede</CardTitle>
        </CardHeader>
        <CardContent>
          {alumnosPorSede.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={alumnosPorSede}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  label
                >
                  {alumnosPorSede.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-8">
              No hay datos disponibles para mostrar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}