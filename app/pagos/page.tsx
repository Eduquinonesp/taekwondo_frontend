"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabaseClient"

export default function PagosPage() {
  const [pagos, setPagos] = useState<any[]>([])
  const [alumnos, setAlumnos] = useState<any[]>([])

  const [nuevoPago, setNuevoPago] = useState({
    alumno_id: "",
    mes: "",
    anio: "",
    monto: "",
    pagado: false,
    pagado_en: "",
  })

  // Cargar pagos
  const fetchPagos = async () => {
    const { data, error } = await supabase
      .from("pagos")
      .select("*, alumnos(nombre, apellido)")
      .order("created_at", { ascending: false })
    if (!error && data) setPagos(data)
  }

  // Cargar alumnos
  const fetchAlumnos = async () => {
    const { data, error } = await supabase.from("alumnos").select("*")
    if (!error && data) setAlumnos(data)
  }

  useEffect(() => {
    fetchPagos()
    fetchAlumnos()
  }, [])

  // Guardar pago
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from("pagos").insert([nuevoPago])
    if (!error) {
      setNuevoPago({
        alumno_id: "",
        mes: "",
        anio: "",
        monto: "",
        pagado: false,
        pagado_en: "",
      })
      fetchPagos()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">💳 Gestión de Pagos</h1>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Alumno */}
          <select
            value={nuevoPago.alumno_id}
            onChange={(e) => setNuevoPago({ ...nuevoPago, alumno_id: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="">Seleccionar Alumno</option>
            {alumnos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} {a.apellido}
              </option>
            ))}
          </select>

          {/* Mes */}
          <input
            type="text"
            placeholder="Mes"
            value={nuevoPago.mes}
            onChange={(e) => setNuevoPago({ ...nuevoPago, mes: e.target.value })}
            className="border p-2 rounded"
            required
          />

          {/* Año */}
          <input
            type="number"
            placeholder="Año"
            value={nuevoPago.anio}
            onChange={(e) => setNuevoPago({ ...nuevoPago, anio: e.target.value })}
            className="border p-2 rounded"
            required
          />

          {/* Monto */}
          <input
            type="number"
            placeholder="Monto"
            value={nuevoPago.monto}
            onChange={(e) => setNuevoPago({ ...nuevoPago, monto: e.target.value })}
            className="border p-2 rounded"
            required
          />

          {/* Estado */}
          <select
            value={nuevoPago.pagado ? "true" : "false"}
            onChange={(e) => setNuevoPago({ ...nuevoPago, pagado: e.target.value === "true" })}
            className="border p-2 rounded"
          >
            <option value="true">Pagado</option>
            <option value="false">Pendiente</option>
          </select>

          {/* Fecha de pago */}
          <input
            type="date"
            value={nuevoPago.pagado_en}
            onChange={(e) => setNuevoPago({ ...nuevoPago, pagado_en: e.target.value })}
            className="border p-2 rounded"
          />

          <button
            type="submit"
            className="col-span-1 md:col-span-3 bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
          >
            Registrar Pago
          </button>
        </form>

        {/* Tabla */}
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Alumno</th>
              <th className="p-3 text-left">Mes</th>
              <th className="p-3 text-left">Año</th>
              <th className="p-3 text-left">Monto</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Fecha Pago</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length > 0 ? (
              pagos.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{p.alumnos?.nombre} {p.alumnos?.apellido}</td>
                  <td className="p-3">{p.mes}</td>
                  <td className="p-3">{p.anio}</td>
                  <td className="p-3">${p.monto}</td>
                  <td className={`p-3 font-semibold ${p.pagado ? "text-green-600" : "text-red-600"}`}>
                    {p.pagado ? "Pagado" : "Pendiente"}
                  </td>
                  <td className="p-3">{p.pagado_en || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-3 text-gray-500">
                  No hay pagos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}