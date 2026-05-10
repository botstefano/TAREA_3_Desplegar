import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/Sidebar";

/** Evita pre-render estático del shell con tRPC + React Query en el servidor */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "UNT - Gestión de Prácticas y Tesis",
  description: "Sistema de gestión para la Universidad Nacional de Trujillo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans">
        <Providers>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen bg-gray-50">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
