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

// Inicializa Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [counts, setCounts] = useState({
    alumnos: 0,
    instructores: 0,
    sedes: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Colores del gráfico
  const COLORS = ["#00C49F", "#FFBB28", "#0088FE", "#FF8042", "#AF19FF"];

  // Obtener conteos desde Supabase
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

  // Obtener alumnos por sede
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-gray-900 text-white p-10">
      {/* Título principal con animación */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl w-full"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-md">
          Bienvenido al Sistema Gestión Taekwon-Do 🥋
        </h1>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-10">
          Administra alumnos, instructores y sedes desde un solo lugar.
        </p>
      </motion.div>

      {/* Tarjetas con animación */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl w-full"
      >
        {/* Tarjeta Alumnos */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gray-800 rounded-xl p-6 text-center shadow-lg border border-gray-700 hover:bg-gray-700 transition"
        >
          <h2 className="text-2xl font-semibold mb-2 text-yellow-400">👦 Alumnos</h2>
          <p className="text-4xl font-bold text-white">
            {loading ? "…" : counts.alumnos}
          </p>
          <p className="text-gray-400 mt-2">Registrados</p>
        </motion.div>

        {/* Tarjeta Instructores */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gray-800 rounded-xl p-6 text-center shadow-lg border border-gray-700 hover:bg-gray-700 transition"
        >
          <h2 className="text-2xl font-semibold mb-2 text-green-400">👨‍🏫 Instructores</h2>
          <p className="text-4xl font-bold text-white">
            {loading ? "…" : counts.instructores}
          </p>
          <p className="text-gray-400 mt-2">Activos</p>
        </motion.div>

        {/* Tarjeta Sedes */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gray-800 rounded-xl p-6 text-center shadow-lg border border-gray-700 hover:bg-gray-700 transition"
        >
          <h2 className="text-2xl font-semibold mb-2 text-purple-400">🏫 Sedes</h2>
          <p className="text-4xl font-bold text-white">
            {loading ? "…" : counts.sedes}
          </p>
          <p className="text-gray-400 mt-2">Registradas</p>
        </motion.div>
      </motion.div>

      {/* Gráfico circular animado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700 mt-10 max-w-5xl w-full"
      >
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 text-center">
          📊 Distribución de Alumnos por Sede
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
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}