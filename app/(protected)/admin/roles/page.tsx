"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";

type VUserRole = {
  user_id: string;
  email: string;
  role: "admin" | "instructor" | null;
  instructor_id: number | null;
  sede_id: number | null;
  instructor_nombre: string | null;
  sede_nombre: string | null;
  role_created_at: string | null;
};

type Opcion = { id: number; nombre: string };

export default function RolesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [rows, setRows] = useState<VUserRole[]>([]);
  const [instructores, setInstructores] = useState<Opcion[]>([]);
  const [sedes, setSedes] = useState<Opcion[]>([]);
  const [q, setQ] = useState("");

  // Carga inicial
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [{ data: users, error: e1 }, { data: inst, error: e2 }, { data: sd, error: e3 }] =
          await Promise.all([
            supabase.from("v_users_roles").select("*").order("email", { ascending: true }),
            supabase.from("instructores").select("id, nombre, apellido").order("nombre"),
            supabase.from("sedes").select("id, nombre").order("nombre"),
          ]);

        if (e1) throw e1;
        if (e2) throw e2;
        if (e3) throw e3;

        setRows((users ?? []).map((u) => ({ ...u, role: (u.role as any) ?? null })));
        setInstructores(
          (inst ?? []).map((i) => ({ id: i.id, nombre: `${i.nombre} ${i.apellido}`.trim() }))
        );
        setSedes((sd ?? []).map((s) => ({ id: s.id, nombre: s.nombre })));
      } catch (err) {
        console.error(err);
        alert("Error cargando datos de usuarios/roles.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.email?.toLowerCase().includes(s) ||
        r.instructor_nombre?.toLowerCase().includes(s) ||
        r.sede_nombre?.toLowerCase().includes(s) ||
        (r.role ?? "").toString().toLowerCase().includes(s)
    );
  }, [rows, q]);

  // Handlers
  const updateLocal = (user_id: string, patch: Partial<VUserRole>) => {
    setRows((prev) => prev.map((r) => (r.user_id === user_id ? { ...r, ...patch } : r)));
  };

  const onSave = async (row: VUserRole) => {
    try {
      setSaving(row.user_id);

      const role = row.role ?? null;
      const instructor_id = row.instructor_id ?? null;
      const sede_id = row.sede_id ?? null;

      if (!role) {
        alert("Selecciona un rol para guardar.");
        return;
      }
      const { error } = await supabase.rpc("upsert_user_role", {
        p_user_id: row.user_id,
        p_role: role,
        p_instructor_id: instructor_id,
        p_sede_id: sede_id,
      });
      if (error) throw error;
      alert("Rol actualizado ✔");
    } catch (err: any) {
      console.error(err);
      alert(`Error guardando rol: ${err.message ?? err}`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mantenedor de Usuarios / Roles</h1>
          <Link
            href="/dashboard"
            className="text-sm underline decoration-dotted hover:opacity-80"
          >
            ← Volver al Dashboard
          </Link>
        </header>

        <div className="bg-neutral-900 rounded-2xl p-4 shadow">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <p className="text-neutral-300">
              Administra qué usuarios son <b>admin</b> o <b>instructor</b> y asocia su sede/instructor.
            </p>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por email, sede o rol…"
              className="w-full md:w-72 rounded-xl bg-neutral-800 px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl overflow-hidden shadow">
          <table className="w-full text-sm">
            <thead className="bg-neutral-800 text-neutral-300">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Rol</th>
                <th className="text-left p-3">Instructor</th>
                <th className="text-left p-3">Sede</th>
                <th className="text-right p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-400">
                    Cargando…
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-400">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                filtrados.map((r) => (
                  <tr key={r.user_id} className="border-t border-neutral-800">
                    <td className="p-3">{r.email}</td>

                    {/* Rol */}
                    <td className="p-3">
                      <select
                        value={r.role ?? ""}
                        onChange={(e) =>
                          updateLocal(r.user_id, {
                            role: (e.target.value as any) || null,
                            // Si pasa a admin, limpiamos asociaciones
                            instructor_id:
                              e.target.value === "admin" ? null : r.instructor_id,
                            sede_id: e.target.value === "admin" ? null : r.sede_id,
                          })
                        }
                        className="bg-neutral-800 rounded-md px-2 py-1"
                      >
                        <option value="">—</option>
                        <option value="admin">admin</option>
                        <option value="instructor">instructor</option>
                      </select>
                    </td>

                    {/* Instructor */}
                    <td className="p-3">
                      <select
                        disabled={r.role !== "instructor"}
                        value={r.instructor_id ?? ""}
                        onChange={(e) =>
                          updateLocal(r.user_id, {
                            instructor_id: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className="bg-neutral-800 rounded-md px-2 py-1 disabled:opacity-40"
                      >
                        <option value="">—</option>
                        {instructores.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.nombre}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Sede */}
                    <td className="p-3">
                      <select
                        disabled={r.role !== "instructor"}
                        value={r.sede_id ?? ""}
                        onChange={(e) =>
                          updateLocal(r.user_id, {
                            sede_id: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className="bg-neutral-800 rounded-md px-2 py-1 disabled:opacity-40"
                      >
                        <option value="">—</option>
                        {sedes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Guardar */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSave(r)}
                        disabled={saving === r.user_id}
                        className="rounded-lg px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
                      >
                        {saving === r.user_id ? "Guardando…" : "Guardar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-neutral-500">
          Tip: el listado se alimenta de <code>auth.users</code>. Para sumar gente nueva,
          primero deben registrarse / iniciar sesión; luego aquí les asignas el rol.
        </p>
      </div>
    </main>
  );
}