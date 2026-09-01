"use client";

import { useEffect, useState } from "react";
import { Role, Action } from "@/types";

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State for editing role actions
  const [editingActionIds, setEditingActionIds] = useState<string[]>([]);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  // State for creating new role
  const [newRoleData, setNewRoleData] = useState({
    name: "",
    description: "",
    selectedActionIds: [] as string[],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRoles, resActions] = await Promise.all([
        fetch("/api/v1/role"),
        fetch("/api/v1/actions"),
      ]);

      const jsonRoles = await resRoles.json();
      const jsonActions = await resActions.json();

      if (jsonRoles.success) setRoles(jsonRoles.data);
      if (jsonActions.success) setActions(jsonActions.data);
    } catch (err) {
      console.error("Error al cargar roles y acciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = Array.from(new Set(actions.map((a) => a.category)));

  // Open modal to view/edit an existing role
  const openEditRoleModal = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description || "");
    setEditingActionIds(role.actions?.map((a) => a.action.id) || []);
    setIsEditModalOpen(true);
  };

  // Open modal to create a new role
  const openCreateRoleModal = () => {
    setNewRoleData({
      name: "",
      description: "",
      selectedActionIds: [],
    });
    setIsCreateModalOpen(true);
  };

  const toggleEditAction = (actionId: string) => {
    setEditingActionIds((prev) =>
      prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]
    );
  };

  const toggleNewRoleAction = (actionId: string) => {
    setNewRoleData((prev) => ({
      ...prev,
      selectedActionIds: prev.selectedActionIds.includes(actionId)
        ? prev.selectedActionIds.filter((id) => id !== actionId)
        : [...prev.selectedActionIds, actionId],
    }));
  };

  // Save changes for an existing role
  const handleSaveEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      const res = await fetch(`/api/v1/role/${selectedRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roleName,
          description: roleDesc,
          actionIds: editingActionIds,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsEditModalOpen(false);
        fetchData();
      } else {
        alert(json.error || "Error al actualizar el rol.");
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  // Create a new role
  const handleSaveCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/v1/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleData.name,
          description: newRoleData.description,
          actionIds: newRoleData.selectedActionIds,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsCreateModalOpen(false);
        fetchData();
      } else {
        alert(json.error || "Error al crear el rol.");
      }
    } catch (err) {
      console.error("Error creating role:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Mantenimiento de Roles</h1>
          <p className="text-xs text-slate-400">
            Administración de los roles del sistema y asignación de sus acciones contenidas
          </p>
        </div>

        <button
          onClick={openCreateRoleModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Rol
        </button>
      </div>

      {/* Roles Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Cargando roles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r.id}
              onClick={() => openEditRoleModal(r)}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-indigo-500/50 cursor-pointer transition-all shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Rol de Sistema
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                    {r.actions?.length || 0} Acciones
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {r.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {r.description || "Sin descripción asignada"}
                  </p>
                </div>

                {/* Badges preview of contained actions */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Acciones Contenidas:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-hidden">
                    {r.actions && r.actions.length > 0 ? (
                      r.actions.slice(0, 6).map((a) => (
                        <span
                          key={a.action.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {a.action.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Sin acciones asignadas</span>
                    )}
                    {r.actions && r.actions.length > 6 && (
                      <span className="text-xs text-indigo-400 font-semibold pt-0.5">
                        +{r.actions.length - 6} más
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                  Editar Acciones del Rol →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Editar Rol Existente y sus Acciones */}
      {isEditModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Detalles del Rol: {selectedRole.name}</h3>
                <p className="text-xs text-slate-400">Modifica la información y selecciona las acciones que contiene este rol</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditRole} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Rol *</label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
                <input
                  type="text"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Actions Selector grouped by category */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Acciones Asignadas a este Rol ({editingActionIds.length})
                </label>

                {categories.map((cat) => {
                  const catActions = actions.filter((a) => a.category === cat);
                  return (
                    <div key={cat} className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">📁 {cat}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catActions.map((act) => {
                          const isChecked = editingActionIds.includes(act.id);
                          return (
                            <label
                              key={act.id}
                              onClick={() => toggleEditAction(act.id)}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-indigo-600/15 border-indigo-500/40 text-white"
                                  : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 mt-0.5"
                              />
                              <div className="min-w-0">
                                <span className="font-mono text-xs font-bold block truncate">
                                  {act.name}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {act.description || "Sin descripción"}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Guardar Cambios del Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Nuevo Rol */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Crear Nuevo Rol del Sistema</h3>
                <p className="text-xs text-slate-400">Define el nombre del rol y selecciona las acciones que incluirá</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCreateRole} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Rol *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: COORDINADOR_JOVENES"
                  value={newRoleData.name}
                  onChange={(e) => setNewRoleData({ ...newRoleData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Descripción del alcance y propósito del rol..."
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Actions Selector */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Seleccionar Acciones para este Rol ({newRoleData.selectedActionIds.length})
                </label>

                {categories.map((cat) => {
                  const catActions = actions.filter((a) => a.category === cat);
                  return (
                    <div key={cat} className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">📁 {cat}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catActions.map((act) => {
                          const isChecked = newRoleData.selectedActionIds.includes(act.id);
                          return (
                            <label
                              key={act.id}
                              onClick={() => toggleNewRoleAction(act.id)}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-indigo-600/15 border-indigo-500/40 text-white"
                                  : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 mt-0.5"
                              />
                              <div className="min-w-0">
                                <span className="font-mono text-xs font-bold block truncate">
                                  {act.name}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {act.description || "Sin descripción"}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Crear Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
