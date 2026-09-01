"use client";

import { useEffect, useState } from "react";
import { User, Role, Person } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // State for creating user
  const [createFormData, setCreateFormData] = useState({
    email: "",
    password: "",
    personId: "",
    selectedRoleIds: [] as string[],
  });

  // State for editing user
  const [editFormData, setEditFormData] = useState({
    status: "ACTIVO",
    personId: "",
    password: "",
    selectedRoleIds: [] as string[],
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users");
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [resRoles, resPersons] = await Promise.all([
        fetch("/api/v1/role"),
        fetch("/api/v1/person"),
      ]);
      const jsonRoles = await resRoles.json();
      const jsonPersons = await resPersons.json();

      if (jsonRoles.success) setRoles(jsonRoles.data);
      if (jsonPersons.success) setPersons(jsonPersons.data);
    } catch (err) {
      console.error("Error al cargar metadata de usuarios:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMetadata();
  }, []);

  const openCreateModal = () => {
    const defaultRole = roles.find((r) => r.name === "ADMIN") || roles[0];
    setCreateFormData({
      email: "",
      password: generateRandomPassword(),
      personId: "",
      selectedRoleIds: defaultRole ? [defaultRole.id] : [],
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      status: user.status,
      personId: user.personId || "",
      password: "",
      selectedRoleIds: user.roles.map((r) => r.role.id),
    });
    setIsEditModalOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const toggleCreateRoleSelection = (roleId: string) => {
    setCreateFormData((prev) => {
      const exists = prev.selectedRoleIds.includes(roleId);
      return {
        ...prev,
        selectedRoleIds: exists
          ? prev.selectedRoleIds.filter((id) => id !== roleId)
          : [...prev.selectedRoleIds, roleId],
      };
    });
  };

  const toggleEditRoleSelection = (roleId: string) => {
    setEditFormData((prev) => {
      const exists = prev.selectedRoleIds.includes(roleId);
      return {
        ...prev,
        selectedRoleIds: exists
          ? prev.selectedRoleIds.filter((id) => id !== roleId)
          : [...prev.selectedRoleIds, roleId],
      };
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createFormData.email,
          password: createFormData.password,
          personId: createFormData.personId || null,
          roleIds: createFormData.selectedRoleIds,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsCreateModalOpen(false);
        fetchUsers();
        copyCredentialsToClipboard(createFormData.email, createFormData.password);
      } else {
        alert(json.error || "Error al crear usuario.");
      }
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editFormData.status,
          personId: editFormData.personId || null,
          password: editFormData.password || undefined,
          roleIds: editFormData.selectedRoleIds,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        alert(json.error || "Error al actualizar el usuario.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const copyCredentialsToClipboard = (email: string, pass: string) => {
    const text = `🙌 *Acceso a Mesiánica Admin*\n\nHola, tus credenciales para ingresar son:\n*Usuario:* ${email}\n*Contraseña:* ${pass}\n*Enlace:* http://localhost:3000/auth/login`;
    navigator.clipboard.writeText(text);
    setCopiedNotice(`¡Credenciales de ${email} copiadas al portapapeles!`);
    setTimeout(() => setCopiedNotice(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Gestión de Usuarios</h1>
          <p className="text-xs text-slate-400">
            Administración de usuarios y asignación de sus roles correspondientes
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Crear Nuevo Usuario
        </button>
      </div>

      {/* Copy Notice Alert */}
      {copiedNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center justify-between shadow-lg">
          <span>{copiedNotice}</span>
          <span className="text-xs text-emerald-300">¡Listo para pegar en WhatsApp!</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-slate-400 bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Usuario / Email</th>
                <th className="py-3.5 px-4">Persona Vinculada</th>
                <th className="py-3.5 px-4">Roles Asignados</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => openEditModal(u)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {u.person ? (
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                            {u.person.firstName.charAt(0)}
                          </span>
                          {u.person.firstName} {u.person.lastName}
                        </div>
                      ) : (
                        <span className="italic text-slate-400 text-xs">Sin vincular</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map((r) => (
                          <span
                            key={r.role.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          >
                            {r.role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.status === "ACTIVO" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(u);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors"
                      >
                        Editar Roles y Permisos →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Editar Usuario (Asignación de Roles) */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Editar Usuario</h3>
                <p className="text-xs font-mono text-indigo-400">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Estado de la Cuenta</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo (Desactivado)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Persona Vinculada</label>
                <select
                  value={editFormData.personId}
                  onChange={(e) => setEditFormData({ ...editFormData, personId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Sin Vincular --</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Roles Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                  Roles Asignados ({editFormData.selectedRoleIds.length})
                </label>
                <div className="space-y-2">
                  {roles.map((r) => {
                    const isSelected = editFormData.selectedRoleIds.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        onClick={() => toggleEditRoleSelection(r.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-indigo-600/15 border-indigo-500/40 text-white"
                            : "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-xs text-slate-200 block">{r.name}</span>
                          <span className="text-[11px] text-slate-400">{r.description}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Restablecer Contraseña (Opcional)
                </label>
                <input
                  type="password"
                  placeholder="Dejar en blanco para mantener la contraseña actual"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
                  Guardar Cambios del Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Usuario Directo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Crear Nuevo Usuario</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@iglesia.org"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">Contraseña Inicial *</label>
                  <button
                    type="button"
                    onClick={() => setCreateFormData({ ...createFormData, password: generateRandomPassword() })}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    🎲 Generar Aleatoria
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Persona Vinculada (Opcional)</label>
                <select
                  value={createFormData.personId}
                  onChange={(e) => setCreateFormData({ ...createFormData, personId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Sin Vincular --</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                  Roles Asignados
                </label>
                <div className="space-y-2">
                  {roles.map((r) => {
                    const isSelected = createFormData.selectedRoleIds.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        onClick={() => toggleCreateRoleSelection(r.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-indigo-600/15 border-indigo-500/40 text-white"
                            : "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-xs text-slate-200 block">{r.name}</span>
                          <span className="text-[11px] text-slate-400">{r.description}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
                  Crear Usuario y Copiar Credenciales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
