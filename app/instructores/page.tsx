"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InstructoresPage() {
  const [instructores, setInstructores] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [grado, setGrado] = useState("");
  const [correo, setCorreo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("instructores").select("*");
      setInstructores(data || []);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from("instructores").insert([
      { nombre, apellido, grado, correo },
    ]);
    if (error) alert(error.message);
    else {
      alert("Instructor agregado correctamente 🎉");
      setNombre("");
      setApellido("");
      setGrado("");
      setCorreo("");
    }
  };

  return (
    <div className="w-full bg-gray-900/40 rounded-2xl p-10 shadow-xl text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        👨‍🏫 Gestión de Instructores
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />
        <input
          type="text"
          placeholder="Grado"
          value={grado}
          onChange={(e) => setGrado(e.target.value)}
        />
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 transition w-full py-3 rounded-lg font-semibold text-white"
          >
            Guardar Instructor
          </button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4 flex items-center">
        📋 Lista de Instructores
      </h2>

      {instructores.length === 0 ? (
        <p className="text-gray-400 text-center">No hay instructores registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 text-left rounded-lg overflow-hidden">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Apellido</th>
                <th className="p-3">Grado</th>
                <th className="p-3">Correo</th>
              </tr>
            </thead>
            <tbody>
              {instructores.map((inst) => (
                <tr key={inst.id} className="border-t border-gray-800 hover:bg-gray-800/70">
                  <td className="p-3">{inst.nombre}</td>
                  <td className="p-3">{inst.apellido}</td>
                  <td className="p-3">{inst.grado}</td>
                  <td className="p-3">{inst.correo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}