import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Sistema de Gestión ATUCH",
  description: "Gestión de alumnos, instructores y sedes de Taekwon-Do",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen flex flex-col">
        {/* Barra lateral fija */}
        <aside className="bg-gray-800/90 backdrop-blur-md border-r border-gray-700 w-full md:w-64 p-6 fixed md:h-screen top-0 left-0 flex flex-col items-center md:items-start">
          <img
            src="/logo.png"
            alt="ATUCH"
            className="w-20 mx-auto md:mx-0 mb-6 rounded-full shadow-lg"
          />
          <h1 className="text-xl font-bold mb-4 text-center md:text-left">ATUCH</h1>
          <nav className="flex flex-col space-y-3 w-full text-center md:text-left">
            <Link href="/" className="hover:text-blue-400 transition">
              Dashboard
            </Link>
            <Link href="/alumnos" className="hover:text-blue-400 transition">
              Alumnos
            </Link>
            <Link href="/instructores" className="hover:text-blue-400 transition">
              Instructores
            </Link>
            <Link href="/sedes" className="hover:text-blue-400 transition">
              Sedes
            </Link>
          </nav>
          <footer className="mt-auto text-xs text-gray-400 pt-4 text-center md:text-left">
            © 2025 ATUCH
          </footer>
        </aside>

        {/* Contenido principal expandido */}
        <main className="flex-1 md:ml-64 p-6 md:p-10 flex flex-col items-center justify-start">
          <div className="w-full max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  );
}