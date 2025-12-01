"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

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
} from "@/app/components/ui/card";

// Colores del gráfico
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// Tipos básicos
type AlumnoRow = {
  id: number;
  nombres: string;
  apellidos: string;
  sede_id: number | null;
  grado: string | null;
  fecha_nacimiento: string | null;
  fecha_ultimo_examen: string | null;
};

type SedeRow = {
  id: number;
  nombre: string;
};

type DistribucionItem = {
  sede: string;
  cantidad: number;
};

type DashboardStats = {
  totalAlumnos: number;
  totalInstructores: number;
  promedioEdad: number | null;
  examenesPendientes: number;
};

type AlumnoConSede = {
  id: number;
  nombreCompleto: string;
  sede: string;
  grado: string;
  fechaUltimoExamen: string | null;
  diasDesdeExamen: number | null;
};

// Label del gráfico (porcentaje por sede)
const renderPieLabel = (props: PieLabelRenderProps) => {
  const { payload, percent } = props;
  if (typeof percent !== "number" || !payload) return "";

  // @ts-expect-error: payload.sede viene desde los datos del gráfico
  const sede = payload.sede || payload.name || "";
  const value = (percent * 100).toFixed(0);

  return `${sede} ${value}%`;
};

// Calcula edad en años desde fecha_nacimiento
const calcularEdad = (fecha: string | null): number | null => {
  if (!fecha) return null;
  const nacimiento = new Date(fecha);
  if (isNaN(nacimiento.getTime())) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad >= 0 ? edad : null;
};

// Calcula días desde el último examen
const diasDesde = (fecha: string | null): number | null => {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return null;

  const hoy = new Date();
  const diffMs = hoy.getTime() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

// Determina color del estado del examen
const getEstadoExamen = (dias: number | null) => {
  if (dias === null) {
    return {
      texto: "Sin registro",
      color: "text-red-400",
      fondo: "bg-red-900/30",
    };
  }
  if (dias < 180) {
    return {
      texto: "Al día",
      color: "text-green-400",
      fondo: "bg-green-900/30",
    };
  }
  if (dias < 365) {
    return {
      texto: "Próximo",
      color: "text-yellow-400",
      fondo: "bg-yellow-900/30",
    };
  }
  return {
    texto: "Atrasado",
    color: "text-red-400",
    fondo: "bg-red-900/30",
  };
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAlumnos: 0,
    totalInstructores: 0,
    promedioEdad: null,
    examenesPendientes: 0,
  });

  const [distribucion, setDistribucion] = useState<DistribucionItem[]>([]);
  const [alumnosTabla, setAlumnosTabla] = useState<AlumnoConSede[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Traer datos
        const { data: alumnosData, error: alumnosError } = await supabase
          .from("alumnos")
          .select(
            "id, nombres, apellidos, sede_id, grado, fecha_nacimiento, fecha_ultimo_examen"
          );

        if (alumnosError) throw alumnosError;

        const { data: sedesData, error: sedesError } = await supabase
          .from("sedes")
          .select("id, nombre");

        if (sedesError) throw sedesError;

        const {
          data: instructoresData,
          error: instructoresError,
        } = await supabase.from("instructores").select("id");

        if (instructoresError) throw instructoresError;

        const alumnos = (alumnosData || []) as AlumnoRow[];
        const sedes = (sedesData || []) as SedeRow[];

        // 2) Totales básicos
        const totalAlumnos = alumnos.length;
        const totalInstructores = (instructoresData || []).length;

        // 3) Promedio edad
        const edades = alumnos
          .map((a) => calcularEdad(a.fecha_nacimiento))
          .filter((e): e is number => e !== null);

        const promedioEdad =
          edades.length > 0
            ? Math.round(
                edades.reduce((sum, e) => sum + e, 0) / edades.length
              )
            : null;

        // 4) Exámenes pendientes:
        //    - Sin fecha_ultimo_examen
        //    - O más de 365 días desde el último examen
        const examenesPendientes = alumnos.filter((a) => {
          const dias = diasDesde(a.fecha_ultimo_examen);
          return dias === null || dias >= 365;
        }).length;

        // 5) Distribución alumnos por sede
        const mapaSedeNombre = new Map<number, string>();
        sedes.forEach((s) => mapaSedeNombre.set(s.id, s.nombre));

        const conteoPorSede = new Map<string, number>();
        alumnos.forEach((a) => {
          const nombreSede =
            (a.sede_id && mapaSedeNombre.get(a.sede_id)) || "Sin sede";
          conteoPorSede.set(
            nombreSede,
            (conteoPorSede.get(nombreSede) || 0) + 1
          );
        });

        const distribucionArray: DistribucionItem[] = Array.from(
          conteoPorSede.entries()
        ).map(([sede, cantidad]) => ({ sede, cantidad }));

        // 6) Tabla detalle alumnos
        const alumnosTablaData: AlumnoConSede[] = alumnos.map((a) => {
          const sedeNombre =
            (a.sede_id && mapaSedeNombre.get(a.sede_id)) || "Sin sede";
          const dias = diasDesde(a.fecha_ultimo_examen);

          return {
            id: a.id,
            nombreCompleto: `${a.nombres} ${a.apellidos}`.trim(),
            sede: sedeNombre,
            grado: a.grado || "-",
            fechaUltimoExamen: a.fecha_ultimo_examen,
            diasDesdeExamen: dias,
          };
        });

        // 7) Actualizar estado
        setStats({
          totalAlumnos,
          totalInstructores,
          promedioEdad,
          examenesPendientes,
        });
        setDistribucion(distribucionArray);
        setAlumnosTabla(alumnosTablaData);
      } catch (err: any) {
        console.error(err);
        setError(
          "No se pudieron cargar los datos del dashboard. Revisa Supabase o la conexión."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 flex flex-col gap-8 items-center">
      <section className="w-full max-w-6xl space-y-2">
        <h1 className="text-4xl font-bold mb-2 text-center">
          Dashboard Taekwon-Do Chile 🇨🇱
        </h1>
        <p className="text-neutral-400 text-center">
          Visualiza el rendimiento y distribución de alumnos por sede.
        </p>
      </section>

      {/* Tarjetas KPI */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl">
        <Card className="bg-neutral-900 border-none">
          <CardHeader>
            <CardTitle>Total Alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.totalAlumnos ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-none">
          <CardHeader>
            <CardTitle>Instructores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.totalInstructores ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-none">
          <CardHeader>
            <CardTitle>Promedio Edad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.promedioEdad !== null
                ? `${stats.promedioEdad} años`
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-none">
          <CardHeader>
            <CardTitle>Exámenes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.examenesPendientes ?? 0}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Gráfico de distribución */}
      <section className="w-full max-w-6xl bg-neutral-900 rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-center">
          Distribución de alumnos por sede
        </h2>

        {loading ? (
          <p className="text-neutral-400 text-center">
            Cargando datos reales...
          </p>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : distribucion.length === 0 ? (
          <p className="text-neutral-400 text-center">
            Aún no hay alumnos registrados.
          </p>
        ) : (
          <div className="w-full h-80">
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
                  label={renderPieLabel}
                >
                  {distribucion.map((entry, index) => (
                    <Cell
                      key={entry.sede}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) =>
                    `${value as number} alumno${
                      (value as number) === 1 ? "" : "s"
                    }`
                  }
                  labelFormatter={(label: any) => `Sede: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Tabla detalle de alumnos */}
      <section className="w-full max-w-6xl bg-neutral-900 rounded-2xl p-6 mt-2">
        <h2 className="text-lg font-semibold mb-4">
          Detalle de alumnos (seguimiento de exámenes)
        </h2>

        {loading ? (
          <p className="text-neutral-400">Cargando alumnos...</p>
        ) : alumnosTabla.length === 0 ? (
          <p className="text-neutral-400">
            No hay alumnos registrados aún.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2 text-left">Alumno</th>
                  <th className="py-2 text-left">Sede</th>
                  <th className="py-2 text-left">Grado</th>
                  <th className="py-2 text-left">Último examen</th>
                  <th className="py-2 text-left">Días desde examen</th>
                  <th className="py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {alumnosTabla.map((a) => {
                  const estado = getEstadoExamen(a.diasDesdeExamen);
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-neutral-900/60 hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-2 pr-2">
                        {a.nombreCompleto}
                      </td>
                      <td className="py-2 pr-2">{a.sede}</td>
                      <td className="py-2 pr-2">{a.grado}</td>
                      <td className="py-2 pr-2">
                        {a.fechaUltimoExamen
                          ? new Date(
                              a.fechaUltimoExamen
                            ).toLocaleDateString("es-CL")
                          : "—"}
                      </td>
                      <td className="py-2 pr-2">
                        {a.diasDesdeExamen !== null
                          ? a.diasDesdeExamen
                          : "—"}
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estado.fondo} ${estado.color}`}
                        >
                          {estado.texto}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}