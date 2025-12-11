// app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Barra superior */}
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo redondo (puedes cambiar el src cuando tengas tu logo en /public) */}
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold">
              ATUCH
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide">
                ATUCH · Universal Taekwon-Do Chile
              </span>
              <span className="text-xs text-neutral-400">
                Asociación de Taekwon-Do Unión Chile
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="#escuelas" className="hover:text-emerald-400 transition">
              Escuelas
            </Link>
            <Link href="#eventos" className="hover:text-emerald-400 transition">
              Eventos
            </Link>
            <Link href="#contacto" className="hover:text-emerald-400 transition">
              Contacto
            </Link>

            <Link
              href="/login"
              className="ml-4 rounded-full border border-emerald-500 px-4 py-1.5 text-sm font-medium hover:bg-emerald-500 hover:text-black transition"
            >
              Acceso instructores
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
          {/* Lado izquierdo: texto principal */}
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
              Universal Taekwon-Do Chile
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Una sola familia de Taekwon-Do
              <span className="block text-emerald-400">
                unida desde Chile para el mundo.
              </span>
            </h1>
            <p className="text-neutral-300 text-sm md:text-base max-w-xl">
              ATUCH reúne a las escuelas de Universal Taekwon-Do en Chile:
              instructores, sedes y alumnos que comparten el legado del Taekwon-Do
              ITF, el trabajo en equipo y la formación de mejores personas a través
              del arte marcial.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="#escuelas"
                className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition"
              >
                Ver escuelas y sedes
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-neutral-600 px-6 py-2.5 text-sm font-semibold hover:border-emerald-400 hover:text-emerald-400 transition"
              >
                Acceso instructores
              </Link>
            </div>

            <p className="text-xs text-neutral-500 pt-2">
              Plataforma interna de gestión de alumnos, sedes y exámenes integrada
              con nuestro sistema ATUCH.
            </p>
          </div>

          {/* Lado derecho: mini “tarjeta” estilo dashboard */}
          <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 shadow-xl">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-4">
              Vista rápida del sistema
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                <p className="text-xs text-neutral-400">Escuelas</p>
                <p className="text-2xl font-bold mt-1">4</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  La Reina · Ñuñoa · Vitacura · +
                </p>
              </div>
              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                <p className="text-xs text-neutral-400">Instructores</p>
                <p className="text-2xl font-bold mt-1">2</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Datos sincronizados desde ATUCH.
                </p>
              </div>
              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                <p className="text-xs text-neutral-400">Alumnos activos</p>
                <p className="text-2xl font-bold mt-1">31</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Seguimiento de exámenes y pagos.
                </p>
              </div>
              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                <p className="text-xs text-neutral-400">Próximos eventos</p>
                <p className="text-2xl font-bold mt-1">3</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Torneos y exámenes nacionales.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 mb-2">
              Si eres instructor o encargado de sede, puedes ingresar con tu cuenta
              para gestionar alumnos y actualizar información.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition"
            >
              Ir al sistema ATUCH
            </Link>
          </div>
        </div>
      </section>

      {/* Sección Escuelas (ancla simple por ahora) */}
      <section
        id="escuelas"
        className="border-t border-neutral-900 bg-neutral-950"
      >
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-lg font-semibold mb-3">Escuelas y sedes</h2>
          <p className="text-sm text-neutral-400 mb-4">
            Aquí podrás listar todas las sedes de Universal Taekwon-Do Chile,
            con dirección, horarios y nombre del instructor responsable.
            Más adelante conectamos esto directamente a la base de datos.
          </p>
          <ul className="text-sm text-neutral-300 space-y-1">
            <li>• Dojang La Reina – Sabumnim Eduardo Quiñones</li>
            <li>• Dojang Vitacura – Instructor asignado</li>
            <li>• Dojang Ñuñoa – Instructor asignado</li>
            <li>• Otras sedes en expansión…</li>
          </ul>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="border-t border-neutral-900 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-neutral-500">
          <span>© {new Date().getFullYear()} ATUCH · Universal Taekwon-Do Chile</span>
          <span>
            Inspirado en el legado del Taekwon-Do ITF y en el trabajo en equipo
            de instructores y alumnos.
          </span>
        </div>
      </footer>
    </main>
  );
}