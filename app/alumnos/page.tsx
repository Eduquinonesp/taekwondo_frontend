"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rut, setRut] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [sedeId, setSedeId] = useState("");
  const [instructores, setInstructores] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: alumnosData } = await supabase.from("alumnos").select("*");
      setAlumnos(alumnosData || []);

      const { data: instructoresData } = await supabase.from("instructores").select("*");
      setInstructores(instructoresData || []);

      const { data: sedesData } = await supabase.from("sedes").select("*");
      setSedes(sedesData || []);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from("alumnos").insert([
      {
        nombre,
        apellido,
        rut,
        fecha_nacimiento: fechaNacimiento,
        instructor_id: instructorId,
        sede_id: sedeId,
      },
    ]);

    if (error) alert(error.message);
    else {
      alert("Alumno agregado correctamente 🎉");
      setNombre("");
      setApellido("");
      setRut("");
      setFechaNacimiento("");
      setInstructorId("");
      setSedeId("");
    }
  };

  return (
    <div className="w-full bg-gray-900/40 rounded-2xl p-10 shadow-xl text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        🥋 Registro de Alumnos
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
          placeholder="RUT"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
        />
        <input
          type="date"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
        />
        <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)}>
          <option value="">Seleccionar Instructor</option>
          {instructores.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.nombre} {inst.apellido}
            </option>
          ))}
        </select>
        <select value={sedeId} onChange={(e) => setSedeId(e.target.value)}>
          <option value="">Seleccionar Sede</option>
          {sedes.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre}
            </option>
          ))}
        </select>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition w-full py-3 rounded-lg font-semibold text-white"
          >
            Guardar Alumno
          </button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4 flex items-center">
        📋 Lista de Alumnos
      </h2>

      {alumnos.length === 0 ? (
        <p className="text-gray-400 text-center">No hay alumnos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 text-left rounded-lg overflow-hidden">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Apellido</th>
                <th className="p-3">RUT</th>
                <th className="p-3">Fecha Nac.</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((al) => (
                <tr key={al.id} className="border-t border-gray-800 hover:bg-gray-800/70">
                  <td className="p-3">{al.nombre}</td>
                  <td className="p-3">{al.apellido}</td>
                  <td className="p-3">{al.rut}</td>
                  <td className="p-3">{al.fecha_nacimiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}