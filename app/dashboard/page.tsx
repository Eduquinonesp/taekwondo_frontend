"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardHome() {
  const [counts, setCounts] = useState({
    alumnos: 0,
    instructores: 0,
    sedes: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#00C49F", "#FFBB28", "#0088FE", "#FF8042", "#AF19FF"];

  const fetchCounts = async () => {
    try {
      const [{ count: alumnosCount }, { count: instructoresCount }, { count: sedesCount }] =
        await Promise.all([
          supabase.from("alumnos").select("*", { count: "exact", head: true }),
          supabase.from("instructores").select("*", { count: "exact", head: true }),
          supabase.from("sedes").select("*", { count: "exact", head: true }),
        ]);

      setCounts({
        alumnos: alumnosCount || 0,
        instructores: instructoresCount || 0,
        sedes: sedesCount || 0,
      });
    } catch (error) {
      console.error("Error al obtener conteos:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const { data: alumnos, error } = await supabase
        .from("alumnos")
        .select("sede_id, sedes(nombre)");

      if (error) throw error;

      const conteo = alumnos.reduce((acc: any, alumno: any) => {
        const sede = alumno.sedes?.nombre || "Sin Sede";
        acc[sede] = (acc[sede] || 0) + 1;
        return acc;
      }, {});

      const datos = Object.entries(conteo).map(([name, value]) => ({
        name,
        value,
      }));

      setChartData(datos);
    } catch (error) {
      console.error("Error al obtener datos del gráfico:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchChartData();
  }, []);

  return (
    <div className="text-white">
      <motion.h1
        className="text-4xl font-bold mb-4 text-blue-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Panel de Control 🥋
      </motion.h1>
      <p className="text-gray-300 mb-10">
        Visualiza el estado general del sistema de gestión Taekwondo.
      </p>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center border border-gray-700 hover:bg-gray-700 transition">
          <h2 className="text-2xl font-semibold text-yellow-400">👦 Alumnos</h2>
          <p className="text-4xl font-bold mt-2">{counts.alumnos}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center border border-gray-700 hover:bg-gray-700 transition">
          <h2 className="text-2xl font-semibold text-green-400">👨‍🏫 Instructores</h2>
          <p className="text-4xl font-bold mt-2">{counts.instructores}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center border border-gray-700 hover:bg-gray-700 transition">
          <h2 className="text-2xl font-semibold text-purple-400">🏫 Sedes</h2>
          <p className="text-4xl font-bold mt-2">{counts.sedes}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 text-center">
          📊 Alumnos por Sede
        </h2>
        {chartData.length === 0 ? (
          <p className="text-gray-400 text-center">
            No hay datos suficientes para mostrar.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) =>
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
        )}
      </div>
    </div>
  );
}