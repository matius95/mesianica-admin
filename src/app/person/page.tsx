"use client";

import { useEffect, useState, useCallback } from "react";
import { Person, Barrio } from "@/types";

export default function PersonPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBarrio, setSelectedBarrio] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    isMember: true,
    status: "ACTIVO",
    barrioId: "",
  });

  const fetchPersons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (selectedBarrio) params.append("barrioId", selectedBarrio);
      if (selectedStatus) params.append("status", selectedStatus);

      const res = await fetch(`/api/v1/person?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPersons(json.data);
      }
    } catch (err) {
      console.error("Error al cargar personas:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedBarrio, selectedStatus]);

  const fetchBarrios = async () => {
    try {
      const res = await fetch("/api/v1/barrio");
      const json = await res.json();
      if (json.success) {
        setBarrios(json.data);
      }
    } catch (err) {
      console.error("Error al cargar barrios:", err);
    }
  };

  useEffect(() => {
    fetchBarrios();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPersons();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPersons]);

  const openCreateModal = () => {
    setEditingPerson(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      isMember: true,
      status: "ACTIVO",
      barrioId: barrios[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email || "",
      phone: person.phone || "",
      address: person.address || "",
      isMember: person.isMember,
      status: person.status,
      barrioId: person.barrioId || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPerson ? `/api/v1/person/${editingPerson.id}` : "/api/v1/person";
      const method = editingPerson ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchPersons();
      } else {
        alert(json.error || "Error al guardar la persona.");
      }
    } catch (err) {
      console.error("Error saving person:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${name}? (Borrado lógico)`)) return;
    try {
      const res = await fetch(`/api/v1/person/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchPersons();
      } else {
        alert(json.error || "Error al eliminar.");
      }
    } catch (err) {
      console.error("Error deleting person:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Directorio de Personas</h1>
          <p className="text-xs text-slate-400">
            Administra el registro completo de la congregación y sus barrios asignados
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Persona
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        {/* Search input */}
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
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Barrio */}
        <select
          value={selectedBarrio}
          onChange={(e) => setSelectedBarrio(e.target.value)}
          className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Todos los Barrios</option>
          {barrios.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Filter Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Todos los Estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="VISITANTE">Visitante</option>
        </select>
      </div>

      {/* Persons Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-slate-400 bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Persona</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Barrio</th>
                <th className="py-3.5 px-4">Condición</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Cargando personas...
                  </td>
                </tr>
              ) : persons.length > 0 ? (
                persons.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {p.firstName} {p.lastName}
                      </div>
                      {p.address && <div className="text-xs text-slate-400">{p.address}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{p.email || "-"}</div>
                      <div className="text-xs text-slate-400">{p.phone || "-"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {p.barrio?.name ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {p.barrio.name}
                        </span>
                      ) : (
                        <span className="italic text-slate-400 text-xs">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.isMember ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Miembro
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                          No Miembro
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, `${p.firstName} ${p.lastName}`)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron personas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar/Editar Persona */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingPerson ? "Editar Persona" : "Registrar Nueva Persona"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Barrio</label>
                  <select
                    value={formData.barrioId}
                    onChange={(e) => setFormData({ ...formData, barrioId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Sin Asignar</option>
                    {barrios.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="VISITANTE">Visitante</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isMember"
                  checked={formData.isMember}
                  onChange={(e) => setFormData({ ...formData, isMember: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 bg-slate-800 border-slate-700"
                />
                <label htmlFor="isMember" className="text-xs text-slate-200 font-medium">
                  Es Miembro Oficial de la Iglesia
                </label>
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
                  {editingPerson ? "Actualizar" : "Guardar Persona"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
