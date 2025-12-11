"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type PagoAlumno = {
  nombres: string;
  apellidos: string;
  rut: string;
};

type Pago = {
  id: number | string;
  mes: string;
  anio: number;
  monto: number;
  metodo_pago: string;
  pagado: boolean;
  pagado_en: string | null;
  alumno?: PagoAlumno;
};

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  useEffect(() => {
    const cargarPagos = async () => {
      try {
        setLoading(true);
        setErrorMensaje(null);

        // 👇 Ajusta esto según el nombre real de tu tabla y relación en Supabase
        const { data, error } = await supabase
          .from("pagos")
          .select(
            `
            id,
            mes,
            anio,
            monto,
            metodo_pago,
            pagado,
            pagado_en,
            alumnos (
              nombres,
              apellidos,
              rut
            )
          `
          )
          .order("pagado_en", { ascending: false });

        if (error) {
          console.error("Error al cargar pagos:", error);
          setErrorMensaje("No se pudieron cargar los pagos.");
          return;
        }

        const pagosNormalizados: Pago[] =
          (data as any[])?.map((row: any) => {
            // Supabase a veces devuelve la relación como objeto o como array
            const alumnoRaw = Array.isArray(row.alumnos)
              ? row.alumnos[0]
              : row.alumnos;

            const alumno: PagoAlumno | undefined = alumnoRaw
              ? {
                  nombres: alumnoRaw.nombres ?? "",
                  apellidos: alumnoRaw.apellidos ?? "",
                  rut: alumnoRaw.rut ?? "",
                }
              : undefined;

            return {
              id: row.id,
              mes: row.mes ?? "",
              anio: row.anio ?? 0,
              monto: row.monto ?? 0,
              metodo_pago: row.metodo_pago ?? "",
              pagado: row.pagado ?? false,
              pagado_en: row.pagado_en ?? null,
              alumno,
            };
          }) ?? [];

        setPagos(pagosNormalizados);
      } catch (err) {
        console.error(err);
        setErrorMensaje("Ocurrió un error inesperado al cargar los pagos.");
      } finally {
        setLoading(false);
      }
    };

    cargarPagos();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">
          Pagos
        </h2>
        <p className="text-sm text-slate-400">
          Aquí puedes revisar los pagos registrados para tus alumnos.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6 shadow-lg shadow-slate-950/40">
        {loading ? (
          <div className="py-10 text-center text-slate-300">
            Cargando pagos…
          </div>
        ) : errorMensaje ? (
          <div className="py-6 text-center text-sm text-red-400">
            {errorMensaje}
          </div>
        ) : pagos.length === 0 ? (
          <div className="py-10 text-center text-slate-300 text-sm">
            No hay pagos registrados todavía.  
            Puedes comenzar a registrar pagos directamente en Supabase y luego
            aparecerán aquí.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-3 py-2 font-medium text-slate-300">
                    Alumno
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-300">RUT</th>
                  <th className="px-3 py-2 font-medium text-slate-300">Mes</th>
                  <th className="px-3 py-2 font-medium text-slate-300">Año</th>
                  <th className="px-3 py-2 font-medium text-slate-300">
                    Monto
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-300">
                    Método
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-300">
                    Estado
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-300">
                    Fecha pago
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => {
                  const nombreAlumno = pago.alumno
                    ? `${pago.alumno.nombres} ${pago.alumno.apellidos}`
                    : "Sin datos";

                  return (
                    <tr
                      key={pago.id}
                      className="border-b border-slate-850/40 hover:bg-slate-900/80 transition"
                    >
                      <td className="px-3 py-2 text-slate-100 whitespace-nowrap">
                        {nombreAlumno}
                      </td>
                      <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                        {pago.alumno?.rut ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {pago.mes || "-"}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {pago.anio || "-"}
                      </td>
                      <td className="px-3 py-2 text-slate-100">
                        {pago.monto
                          ? `$ ${pago.monto.toLocaleString("es-CL")}`
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {pago.metodo_pago || "-"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
                            pago.pagado
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                              : "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {pago.pagado ? "Pagado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                        {pago.pagado_en
                          ? new Date(pago.pagado_en).toLocaleString("es-CL", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}