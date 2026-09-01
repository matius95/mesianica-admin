"use client";

import { usePathname, useRouter } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith("/auth/")) {
    return null; // Hide Header on Auth pages
  }

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/":
        return "Dashboard General";
      case "/person":
        return "Gestión de Personas";
      case "/barrio":
        return "Gestión de Barrios";
      case "/users":
        return "Gestión de Usuarios del Sistema";
      case "/role":
        return "Mantenimiento de Roles";
      case "/actions":
        return "Catálogo de Acciones del Sistema";
      case "/settings":
        return "Configuraciones del Sistema";
      default:
        return "Mesiánica Admin";
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {getPageTitle(pathname)}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* System Online Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Sistema Online
        </div>

        {/* User Account & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/30">
              A
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
              admin@mesianica.org
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors border border-rose-500/20 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
