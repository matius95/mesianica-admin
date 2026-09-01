"use client";

import { useEffect, useState } from "react";
import { Barrio, Person } from "@/types";

export default function BarrioPage() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarrio, setSelectedBarrio] = useState<Barrio | null>(null);

  // Form State for Barrio creation / update
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    assistantId: "",
  });

  const fetchBarrios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/barrio");
      const json = await res.json();
      if (json.success) {
        setBarrios(json.data);
      }
    } catch (err) {
      console.error("Error al cargar barrios:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersons = async () => {
    try {
      const res = await fetch("/api/v1/person");
      const json = await res.json();
      if (json.success) {
        setPersons(json.data);
      }
    } catch (err) {
      console.error("Error al cargar personas:", err);
    }
  };

  useEffect(() => {
    fetchBarrios();
    fetchPersons();
  }, []);

  const openCreateModal = () => {
    setSelectedBarrio(null);
    setFormData({ name: "", description: "", assistantId: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (barrio: Barrio) => {
    setSelectedBarrio(barrio);
    setFormData({
      name: barrio.name,
      description: barrio.description || "",
      assistantId: barrio.assistantId || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedBarrio ? `/api/v1/barrio/${selectedBarrio.id}` : "/api/v1/barrio";
      const method = selectedBarrio ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchBarrios();
      } else {
        alert(json.error || "Error al guardar el barrio.");
      }
    } catch (err) {
      console.error("Error saving barrio:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Gestión de Barrios</h1>
          <p className="text-xs text-slate-400">
            Administración de sectores territoriales y asignación de Asistentes de Familia
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Barrio
        </button>
      </div>

      {/* Barrios Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Cargando barrios...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {barrios.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 font-bold">
                    {b.name.charAt(0)}
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400">
                    {b._count?.members || 0} Integrantes
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{b.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {b.description || "Sin descripción asignada"}
                  </p>
                </div>

                {/* Assistant Info */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Asistente de Familia a Cargo:
                  </span>
                  {b.assistant ? (
                    <div className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                        {b.assistant.firstName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {b.assistant.firstName} {b.assistant.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{b.assistant.phone || b.assistant.email || "Sin contacto"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400/90 italic bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                      ⚠️ Sin Asistente de Familia asignado
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => openEditModal(b)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar / Asignar Asistente
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Barrio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {selectedBarrio ? "Editar Barrio y Asistente" : "Crear Nuevo Barrio"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Barrio *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Asistente de Familia A Cargo</label>
                <select
                  value={formData.assistantId}
                  onChange={(e) => setFormData({ ...formData, assistantId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Sin Asistente Asignado --</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} {p.isMember ? "(Miembro)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
                >
                  {selectedBarrio ? "Actualizar Barrio" : "Guardar Barrio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
