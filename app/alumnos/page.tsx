"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { Loader2, PlusCircle } from "lucide-react";

// Tipo de datos
type Alumno = {
  id: number;
  nombres: string;
  apellidos: string;
  edad: number;
  grado: string;
  sede: string;
  instructor: string;
};

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombres: "",
    apellidos: "",
    rut: "",
    fecha_nacimiento: "",
    apoderado: "",
    telefono_apoderado: "",
    correo_apoderado: "",
    grado: "",
    sede_id: "",
    instructor_id: "",
  });
  const [sedes, setSedes] = useState<any[]>([]);
  const [instructores, setInstructores] = useState<any[]>([]);

  // Cargar alumnos
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("alumnos")
        .select("id, nombres, apellidos, edad, grado, sedes(nombre), instructores(nombre)");
      if (!error && data) setAlumnos(data as any);
      setLoading(false);
    };

    const fetchSedes = async () => {
      const { data } = await supabase.from("sedes").select("id, nombre");
      if (data) setSedes(data);
    };

    const fetchInstructores = async () => {
      const { data } = await supabase.from("instructores").select("id, nombre");
      if (data) setInstructores(data);
    };

    fetchData();
    fetchSedes();
    fetchInstructores();
  }, []);

  const handleChange = (e: any) => {
    setNuevoAlumno({ ...nuevoAlumno, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from("alumnos").insert([nuevoAlumno]);
    if (error) alert(error.message);
    else {
      alert("Alumno agregado correctamente 🎉");
      setNuevoAlumno({
        nombres: "",
        apellidos: "",
        rut: "",
        fecha_nacimiento: "",
        apoderado: "",
        telefono_apoderado: "",
        correo_apoderado: "",
        grado: "",
        sede_id: "",
        instructor_id: "",
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center text-white">
        🥋 Registro de Alumnos
      </h1>

      {/* FORMULARIO */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Agregar Alumno</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              name="nombres"
              placeholder="Nombres"
              value={nuevoAlumno.nombres}
              onChange={handleChange}
              className="bg-gray-800 text-white border-gray-600"
            />
            <Input
              name="apellidos"
              placeholder="Apellidos"
              value={nuevoAlumno.apellidos}
              onChange={handleChange}
              className="bg-gray-800 text-white border-gray-600"
            />
            <Input
              name="rut"
              placeholder="RUT"
              value={nuevoAlumno.rut}
              onChange={handleChange}
              className="bg-gray-800 text-white border-gray-600"
            />
            <Input
              type="date"
              name="fecha_nacimiento"
              value={nuevoAlumno.fecha_nacimiento}
              onChange={handleChange}
              className="bg-gray-800 text-white border-gray-600"
            />
            <Input
              name="grado"
              placeholder="Grado"
              value={nuevoAlumno.grado}
              onChange={handleChange}
              className="bg-gray-800 text-white border-gray-600"
            />
            <Select
              onValueChange={(val) => setNuevoAlumno({ ...nuevoAlumno, sede_id: val })}
            >
              <SelectTrigger className="bg-gray-800 text-white border-gray-600">
                <SelectValue placeholder="Seleccionar sede" />
              </SelectTrigger>
              <SelectContent>
                {sedes.map((sede) => (
                  <SelectItem key={sede.id} value={sede.id.toString()}>
                    {sede.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(val) => setNuevoAlumno({ ...nuevoAlumno, instructor_id: val })}
            >
              <SelectTrigger className="bg-gray-800 text-white border-gray-600">
                <SelectValue placeholder="Seleccionar instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructores.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id.toString()}>
                    {inst.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white col-span-2 md:col-span-3 mt-2"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Guardar Alumno
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* LISTA */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Lista de Alumnos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400">Cargando alumnos...</p>
          ) : alumnos.length === 0 ? (
            <p className="text-gray-400">No hay alumnos registrados aún.</p>
          ) : (
            <table className="w-full text-left text-gray-300 border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-2">Nombre</th>
                  <th className="p-2">Edad</th>
                  <th className="p-2">Grado</th>
                  <th className="p-2">Sede</th>
                  <th className="p-2">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-800">
                    <td className="p-2">{a.nombres} {a.apellidos}</td>
                    <td className="p-2">{a.edad}</td>
                    <td className="p-2">{a.grado}</td>
                    <td className="p-2">{(a as any).sedes?.nombre || "—"}</td>
                    <td className="p-2">{(a as any).instructores?.nombre || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}