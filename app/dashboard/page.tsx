"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { createClient } from "@supabase/supabase-js";

// 🎨 Colores de los gráficos
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00C49F"];

// 🌎 Conexión a Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  sede_id: number;
}

interface Instructor {
  id: number;
  nombre: string;
}

interface Sede {
  id: number;
  nombre: string;
}

export default function DashboardPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: alumnosData } = await supabase.from("alumnos").select("*");
      const { data: instructoresData } = await supabase.from("instructores").select("*");
      const { data: sedesData } = await supabase.from("sedes").select("*");

      if (alumnosData && instructoresData && sedesData) {
        setAlumnos(alumnosData);
        setInstructores(instructoresData);
        setSedes(sedesData);

        // 📊 Agrupar alumnos por sede
        const conteoPorSede = sedesData.map((sede) => ({
          name: sede.nombre,
          value: alumnosData.filter((a) => a.sede_id === sede.id).length,
        }));

        setChartData(conteoPorSede);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Panel de Control 🥋
      </h1>

      <p className="text-center text-gray-300 mb-10">
        Visualiza el estado general del sistema de gestión Taekwondo.
      </p>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardHeader>
            <CardTitle>👦 Alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-400">{alumnos.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardHeader>
            <CardTitle>🧑‍🏫 Instructores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-400">{instructores.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardHeader>
            <CardTitle>🏫 Sedes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-400">{sedes.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="bg-gray-800 border border-gray-700 shadow-md max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>📊 Alumnos por Sede</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  label={({ name, percent }: any) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No hay datos suficientes para mostrar.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}