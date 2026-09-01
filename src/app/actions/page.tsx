"use client";

import { useEffect, useState } from "react";
import { Action } from "@/types";

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for creating action
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Usuarios",
    customCategory: "",
  });

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/actions");
      const json = await res.json();
      if (json.success) {
        setActions(json.data);
      }
    } catch (err) {
      console.error("Error al cargar acciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const existingCategories = Array.from(new Set(actions.map((a) => a.category)));

  const openCreateModal = () => {
    setFormData({
      name: "",
      description: "",
      category: existingCategories[0] || "General",
      customCategory: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory =
      formData.category === "__NEW__" ? formData.customCategory : formData.category;

    if (!finalCategory || finalCategory.trim() === "") {
      alert("Por favor especifica una categoría válida.");
      return;
    }

    try {
      const res = await fetch("/api/v1/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: finalCategory,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchActions();
      } else {
        alert(json.error || "Error al crear la acción.");
      }
    } catch (err) {
      console.error("Error saving action:", err);
    }
  };

  const filteredActions = actions.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory ? a.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Catálogo de Acciones del Sistema</h1>
          <p className="text-xs text-slate-400">
            Registro y mantenimiento de facultades específicas asignables a los roles
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Acción
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar acción por slug o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Todas las Categorías</option>
          {existingCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Actions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-slate-400 bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Acción (Slug)</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Descripción / Propósito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    Cargando acciones...
                  </td>
                </tr>
              ) : filteredActions.length > 0 ? (
                filteredActions.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        {a.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        📁 {a.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      {a.description || "Sin descripción"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    No se encontraron acciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Nueva Acción */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Registrar Nueva Acción del Sistema</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre de la Acción (Slug) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: exportar-reporte, crear-persona"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Se formateará automáticamente en minúsculas con guiones.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 mb-2"
                >
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      Categoría: {cat}
                    </option>
                  ))}
                  <option value="__NEW__">➕ Escribir Nueva Categoría...</option>
                </select>

                {formData.category === "__NEW__" && (
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nombre de la nueva categoría..."
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-indigo-500/50 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Describe qué facultad otorga esta acción..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
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
                  Guardar Acción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
