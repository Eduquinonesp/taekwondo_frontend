"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient"; // conexión Supabase
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card"; // ✅ Ruta corregida

// 🎨 Colores del gráfico
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF4C4C"];

// ✅ Tipo de datos del alumno
type Alumno = {
  id: number;
  nombre: string;
  apellido: string;
  edad: number;
  sede: string;
  instructor: string;
};

// ✅ Tipo de datos agrupados para el gráfico
type DataChart = {
  name: string;
  value: number;
};

// ✅ Función para mostrar etiquetas en el gráfico
const renderLabel = (props: PieLabelRenderProps): string => {
  const { name, value } = props as unknown as { name: string; value: number };
  return `${name} (${value})`;
};

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [dataChart, setDataChart] = useState<DataChart[]>([]);

  // ✅ Cargar alumnos desde Supabase
  useEffect(() => {
    const fetchAlumnos = async () => {
      const { data, error } = await supabase
        .from("alumnos")
        .select("id, nombre, apellido, edad, sede, instructor");

      if (error) {
        console.error("Error al cargar alumnos:", error);
      } else {
        setAlumnos(data as Alumno[]);

        // 🔢 Agrupar por sede para el gráfico
        const agrupado: Record<string, number> = {};
        data.forEach((a) => {
          agrupado[a.sede] = (agrupado[a.sede] || 0) + 1;
        });

        const resultado = Object.keys(agrupado).map((key) => ({
          name: key,
          value: agrupado[key],
        }));

        setDataChart(resultado);
      }
    };

    fetchAlumnos();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Registro de Alumnos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🧾 Tabla de alumnos */}
        <Card className="bg-[#1E1E1E] border border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Lista de Alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="p-2">Nombre</th>
                  <th className="p-2">Apellido</th>
                  <th className="p-2">Edad</th>
                  <th className="p-2">Sede</th>
                  <th className="p-2">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr
                    key={alumno.id}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="p-2">{alumno.nombre}</td>
                    <td className="p-2">{alumno.apellido}</td>
                    <td className="p-2 text-center">{alumno.edad}</td>
                    <td className="p-2">{alumno.sede}</td>
                    <td className="p-2">{alumno.instructor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* 🥧 Gráfico por sede */}
        <Card className="bg-[#1E1E1E] border border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Distribución por Sede</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[400px]">
            {dataChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={150}
                    dataKey="value"
                  >
                    {dataChart.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "1px solid #444",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">Cargando datos...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}