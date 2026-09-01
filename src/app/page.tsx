import Link from "next/link";
import { db } from "@/lib/db";

export const revalidate = 0; // Dynamic fetch

export default async function DashboardPage() {
  let totalPersons = 0;
  let totalMembers = 0;
  let totalBarrios = 0;
  let totalAssistants = 0;
  let recentPersons: any[] = [];
  let barriosSummary: any[] = [];

  try {
    totalPersons = await db.person.count({ where: { deletedAt: null } });
    totalMembers = await db.person.count({ where: { isMember: true, deletedAt: null } });
    totalBarrios = await db.barrio.count();
    
    // Count barrios with assigned assistant
    const barriosWithAssistant = await db.barrio.findMany({
      where: { assistantId: { not: null } },
      select: { assistantId: true },
    });
    totalAssistants = barriosWithAssistant.length;

    recentPersons = await db.person.findMany({
      where: { deletedAt: null },
      include: { barrio: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    barriosSummary = await db.barrio.findMany({
      include: {
        _count: {
          select: { members: { where: { deletedAt: null } } },
        },
      },
      take: 4,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 rounded-2xl p-6 md:p-8 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Panel de Control Mesiánica Admin
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Bienvenido al Sistema de Gestión de Iglesia
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl">
            Supervisa en tiempo real la congregación, administra el registro de personas, la asignación de Asistentes de Familia y la distribución por barrios.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Personas */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Total Registrados
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white">{totalPersons}</div>
            <p className="text-xs text-slate-400 mt-1">Personas en la base de datos</p>
          </div>
        </div>

        {/* Miembros Activos */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Miembros Oficiales
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-400">{totalMembers}</div>
            <p className="text-xs text-slate-400 mt-1">Miembros de la congregación</p>
          </div>
        </div>

        {/* Barrios Registrados */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Barrios
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white">{totalBarrios}</div>
            <p className="text-xs text-slate-400 mt-1">Sectores / Distritos urbanos</p>
          </div>
        </div>

        {/* Asistentes de Familia */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Asistentes Asignados
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-purple-400">{totalAssistants}</div>
            <p className="text-xs text-slate-400 mt-1">Barrios con Asistente a cargo</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Persons Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Persons (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Últimas Personas Registradas</h3>
              <p className="text-xs text-slate-400">Integrantes agregados recientemente al sistema</p>
            </div>
            <Link
              href="/person"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Nombre</th>
                  <th className="py-3 px-3">Barrio</th>
                  <th className="py-3 px-3">Condición</th>
                  <th className="py-3 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentPersons.length > 0 ? (
                  recentPersons.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-200">
                        {p.firstName} {p.lastName}
                        {p.email && <div className="text-xs text-slate-400">{p.email}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {p.barrio?.name || <span className="italic text-slate-400">Sin asignar</span>}
                      </td>
                      <td className="py-3 px-3">
                        {p.isMember ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Miembro
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            No miembro
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
                      No hay registros aún en el sistema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Barrios Summary Sidebar (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Resumen por Barrio</h3>
            <Link href="/barrio" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              Gestionar
            </Link>
          </div>

          <div className="space-y-3">
            {barriosSummary.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">{b.name}</h4>
                  <p className="text-xs text-slate-400">
                    {b.description || "Sector registrado"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-indigo-400">{b._count.members}</span>
                  <span className="text-xs text-slate-400 block">personas</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/person"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Registrar Nueva Persona
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
