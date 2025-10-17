"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SedesPage() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    const fetchSedes = async () => {
      const { data } = await supabase.from("sedes").select("*");
      setSedes(data || []);
    };
    fetchSedes();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase
      .from("sedes")
      .insert([{ nombre, direccion, telefono }]);
    if (error) alert(error.message);
    else {
      alert("Sede guardada correctamente 🏠");
      setNombre("");
      setDireccion("");
      setTelefono("");
    }
  };

  return (
    <div className="w-full bg-gray-900/40 rounded-2xl p-10 shadow-xl text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        🏫 Gestión de Sedes
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <input
          type="text"
          placeholder="Nombre de la sede"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <div className="md:col-span-3">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 transition w-full py-3 rounded-lg font-semibold text-white"
          >
            Guardar Sede
          </button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4 flex items-center">
        📋 Lista de Sedes
      </h2>

      {sedes.length === 0 ? (
        <p className="text-gray-400 text-center">No hay sedes registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 text-left rounded-lg overflow-hidden">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Dirección</th>
                <th className="p-3">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {sedes.map((sede) => (
                <tr key={sede.id} className="border-t border-gray-800 hover:bg-gray-800/70">
                  <td className="p-3">{sede.nombre}</td>
                  <td className="p-3">{sede.direccion}</td>
                  <td className="p-3">{sede.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}