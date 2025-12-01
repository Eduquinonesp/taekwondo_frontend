"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

type Alumno = {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
};

type PagoListado = {
  id: number;
  alumno_id: number;
  mes: number;
  anio: number;
  monto: number;
  pagado: boolean;
  pagado_en: string | null;
  alumno?: {
    nombres: string;
    apellidos: string;
    rut: string;
  };
};

const MESES = [
  { valor: 1, nombre: "Enero" },
  { valor: 2, nombre: "Febrero" },
  { valor: 3, nombre: "Marzo" },
  { valor: 4, nombre: "Abril" },
  { valor: 5, nombre: "Mayo" },
  { valor: 6, nombre: "Junio" },
  { valor: 7, nombre: "Julio" },
  { valor: 8, nombre: "Agosto" },
  { valor: 9, nombre: "Septiembre" },
  { valor: 10, nombre: "Octubre" },
  { valor: 11, nombre: "Noviembre" },
  { valor: 12, nombre: "Diciembre" },
];

export default function PagosPage() {
  // ------- estado del formulario -------
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [alumnoId, setAlumnoId] = useState<number | "">("");
  const [mes, setMes] = useState<number | "">("");
  const [anio, setAnio] = useState<number>(
    new Date().getFullYear()
  );
  const [monto, setMonto] = useState<number | "">("");
  const [pagado, setPagado] = useState<boolean>(true);

  // ------- estado de la lista / UI -------
  const [pagos, setPagos] = useState<PagoListado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);

  // Cargar alumnos activos y pagos existentes
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError(null);

      try {
        // 1. Alumnos activos
        const { data: alumnosData, error: alumnosError } = await supabase
          .from("alumnos")
          .select("id, nombres, apellidos, rut")
          .eq("activo", true)
          .order("nombres", { ascending: true });

        if (alumnosError) throw alumnosError;
        setAlumnos(alumnosData || []);

        // 2. Pagos (con join a alumnos)
        const { data: pagosData, error: pagosError } = await supabase
          .from("pagos")
          .select(
            "id, alumno_id, mes, anio, monto, pagado, pagado_en, alumnos (nombres, apellidos, rut)"
          )
          .order("anio", { ascending: false })
          .order("mes", { ascending: false })
          .order("id", { ascending: false });

        if (pagosError) throw pagosError;

        const normalizados: PagoListado[] =
          (pagosData || []).map((p: any) => ({
            id: p.id,
            alumno_id: p.alumno_id,
            mes: p.mes,
            anio: p.anio,
            monto: p.monto,
            pagado: p.pagado,
            pagado_en: p.pagado_en,
            alumno: p.alumnos,
          })) ?? [];

        setPagos(normalizados);
      } catch (err: any) {
        console.error(err);
        setError("Error cargando alumnos o pagos.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const handleCrearPago = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeOk(null);

    if (!alumnoId || !mes || !anio || !monto) {
      setError("Faltan datos: alumno, mes, año o monto.");
      return;
    }

    try {
      setGuardando(true);

      const hoyISO = new Date().toISOString();

      const { data, error: insertError } = await supabase
        .from("pagos")
        .insert({
          alumno_id: alumnoId,
          mes: mes,
          anio: anio,
          monto: Number(monto),
          pagado: pagado,
          pagado_en: pagado ? hoyISO : null,
        })
        .select(
          "id, alumno_id, mes, anio, monto, pagado, pagado_en, alumnos (nombres, apellidos, rut)"
        )
        .single();

      if (insertError) throw insertError;

      const nuevo: PagoListado = {
        id: data.id,
        alumno_id: data.alumno_id,
        mes: data.mes,
        anio: data.anio,
        monto: data.monto,
        pagado: data.pagado,
        pagado_en: data.pagado_en,
        alumno: data.alumnos,
      };

      setPagos((prev) => [nuevo, ...prev]);
      setMensajeOk("Pago registrado correctamente.");

      // Opcional: limpiar solo algunos campos
      setMonto("");
      // Si quieres que el mes avance solo, se puede hacer después.
    } catch (err: any) {
      console.error(err);
      setError("No se pudo guardar el pago.");
    } finally {
      setGuardando(false);
    }
  };

  const togglePagado = async (pago: PagoListado) => {
    setError(null);
    setMensajeOk(null);

    try {
      const nuevoEstado = !pago.pagado;
      const nuevaFecha = nuevoEstado ? new Date().toISOString() : null;

      const { error: updateError } = await supabase
        .from("pagos")
        .update({
          pagado: nuevoEstado,
          pagado_en: nuevaFecha,
        })
        .eq("id", pago.id);

      if (updateError) throw updateError;

      setPagos((prev) =>
        prev.map((p) =>
          p.id === pago.id
            ? { ...p, pagado: nuevoEstado, pagado_en: nuevaFecha }
            : p
        )
      );
      setMensajeOk("Estado de pago actualizado.");
    } catch (err: any) {
      console.error(err);
      setError("No se pudo actualizar el estado del pago.");
    }
  };

  const formatearFecha = (iso: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL");
  };

  const obtenerNombreAlumno = (p: PagoListado) => {
    if (p.alumno) {
      return `${p.alumno.nombres} ${p.alumno.apellidos}`;
    }
    const al = alumnos.find((a) => a.id === p.alumno_id);
    if (al) return `${al.nombres} ${al.apellidos}`;
    return `ID ${p.alumno_id}`;
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold mb-2">Gestión de Pagos</h1>
      <p className="text-neutral-400 mb-4">
        Registra y controla los pagos mensuales de tus alumnos.
      </p>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ----- Formulario ----- */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>Registrar pago</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCrearPago} className="space-y-4">
              {/* Alumno */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-300">Alumno</label>
                <select
                  className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm"
                  value={alumnoId}
                  onChange={(e) =>
                    setAlumnoId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                >
                  <option value="">Seleccione un alumno...</option>
                  {alumnos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombres} {a.apellidos} — {a.rut}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mes y año */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-neutral-300">Mes</label>
                  <select
                    className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm"
                    value={mes}
                    onChange={(e) =>
                      setMes(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                  >
                    <option value="">Seleccione mes...</option>
                    {MESES.map((m) => (
                      <option key={m.valor} value={m.valor}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-neutral-300">Año</label>
                  <Input
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(Number(e.target.value))}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>

              {/* Monto */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-300">
                  Monto (CLP)
                </label>
                <Input
                  type="number"
                  value={monto}
                  onChange={(e) =>
                    setMonto(
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                    )
                  }
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              {/* Pagado sí/no */}
              <div className="flex items-center gap-2">
                <input
                  id="pagado"
                  type="checkbox"
                  checked={pagado}
                  onChange={(e) => setPagado(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <label htmlFor="pagado" className="text-sm text-neutral-300">
                  Pago realizado
                </label>
              </div>

              {/* Mensajes */}
              {error && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-700 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              {mensajeOk && (
                <p className="text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-700 rounded-md px-3 py-2">
                  {mensajeOk}
                </p>
              )}

              <Button
                type="submit"
                disabled={guardando || cargando}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {guardando ? "Guardando..." : "Guardar pago"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ----- Listado ----- */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>Pagos registrados</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {cargando ? (
              <p className="text-neutral-400">Cargando pagos...</p>
            ) : pagos.length === 0 ? (
              <p className="text-neutral-400">
                Aún no hay pagos registrados.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-400 border-b border-neutral-800">
                    <th className="py-2 pr-2">Alumno</th>
                    <th className="py-2 pr-2">Mes</th>
                    <th className="py-2 pr-2">Año</th>
                    <th className="py-2 pr-2">Monto</th>
                    <th className="py-2 pr-2">Estado</th>
                    <th className="py-2 pr-2">Pagado en</th>
                    <th className="py-2 pr-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-neutral-800/60"
                    >
                      <td className="py-2 pr-2">
                        {obtenerNombreAlumno(p)}
                      </td>
                      <td className="py-2 pr-2">
                        {
                          MESES.find((m) => m.valor === p.mes)?.nombre ??
                          p.mes
                        }
                      </td>
                      <td className="py-2 pr-2">{p.anio}</td>
                      <td className="py-2 pr-2">
                        {p.monto.toLocaleString("es-CL")}
                      </td>
                      <td className="py-2 pr-2">
                        {p.pagado ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-700">
                            Pagado
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-amber-900/40 text-amber-300 border border-amber-700">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {formatearFecha(p.pagado_en)}
                      </td>
                      <td className="py-2 pr-2 text-right">
                        <button
                          type="button"
                          onClick={() => togglePagado(p)}
                          className="px-3 py-1 rounded-md text-xs border border-neutral-700 hover:bg-neutral-800"
                        >
                          {p.pagado ? "Marcar como pendiente" : "Marcar pagado"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}