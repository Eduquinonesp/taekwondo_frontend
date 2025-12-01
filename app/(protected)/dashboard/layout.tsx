"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  School,
  Building,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white relative">
      {/* Sidebar (desktop y tablet grande) */}
      <aside className="hidden md:flex w-64 bg-gray-800 border-r border-gray-700 flex-col justify-between fixed h-screen">
        <div>
          <div className="p-6 text-center border-b border-gray-700">
            <h1 className="text-2xl font-bold text-blue-400">🥋 Taekwondo Panel</h1>
          </div>

          <nav className="mt-6">
            <ul className="space-y-2 px-4">
              <li>
                <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition">
                  <Home size={20} /> <span>Inicio</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/alumnos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition">
                  <Users size={20} /> <span>Alumnos</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/instructores" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition">
                  <School size={20} /> <span>Instructores</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/sedes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition">
                  <Building size={20} /> <span>Sedes</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/pagos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition">
                  <CreditCard size={20} /> <span>Pagos</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700 text-center">
          <button className="flex items-center justify-center gap-2 w-full p-2 bg-red-600 rounded-lg hover:bg-red-700 transition">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Header móvil */}
      <header className="md:hidden w-full bg-gray-800 border-b border-gray-700 flex items-center justify-between p-4 fixed top-0 left-0 z-50">
        <h1 className="text-lg font-bold text-blue-400">🥋 Taekwondo Panel</h1>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Menú lateral móvil (animado) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-64 h-screen bg-gray-800 border-r border-gray-700 z-40 flex flex-col justify-between"
          >
            <div>
              <div className="p-6 text-center border-b border-gray-700">
                <h1 className="text-2xl font-bold text-blue-400">ATUCH</h1>
              </div>

              <nav className="mt-6">
                <ul className="space-y-2 px-4">
                  <li>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition"
                    >
                      <Home size={20} /> <span>Inicio</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/alumnos"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition"
                    >
                      <Users size={20} /> <span>Alumnos</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/instructores"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition"
                    >
                      <School size={20} /> <span>Instructores</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/sedes"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition"
                    >
                      <Building size={20} /> <span>Sedes</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/pagos"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition"
                    >
                      <CreditCard size={20} /> <span>Pagos</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="p-4 border-t border-gray-700 text-center">
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full p-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <motion.main
        className="flex-1 md:ml-64 p-6 md:p-10 overflow-y-auto mt-16 md:mt-0"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
    </div>
  );
}