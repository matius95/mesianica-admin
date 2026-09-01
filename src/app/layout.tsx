import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mesiánica Admin | Sistema de Gestión de Iglesia",
  description: "Sistema web moderno para la gestión de personas, barrios y roles en la iglesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full">
      <body className={`${inter.className} min-h-full bg-slate-950 text-slate-100 flex antialiased`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Header />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
