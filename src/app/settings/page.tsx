"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(30);
  const [churchName, setChurchName] = useState("Iglesia Mesiánica");
  const [contactEmail, setContactEmail] = useState("admin@mesianica.org");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/settings");
      const json = await res.json();
      if (json.success && json.data.map) {
        const map = json.data.map;
        if (map.session_duration_minutes) {
          setSessionDurationMinutes(parseInt(map.session_duration_minutes, 10) || 30);
        }
        if (map.church_name) {
          setChurchName(map.church_name);
        }
        if (map.contact_email) {
          setContactEmail(map.contact_email);
        }
      }
    } catch (err) {
      console.error("Error al cargar configuraciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessNotice(null);

    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionDurationMinutes,
          churchName,
          contactEmail,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessNotice("¡Parámetros del sistema y caducidad de sesión guardados exitosamente!");
        setTimeout(() => setSuccessNotice(null), 4000);
      } else {
        alert(json.error || "Error al guardar configuraciones.");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Configuraciones del Sistema</h1>
        <p className="text-xs text-slate-400">
          Ajusta los parámetros globales de funcionamiento, expiración de sesión y datos institucionales
        </p>
      </div>

      {/* Golden Rule Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <span>🌟 REGLA DE ORO DEL SISTEMA DE PERMISOS:</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Cada vez que se desarrolla e integra una nueva funcionalidad o módulo en el sistema, es <strong className="text-amber-300">obligatorio registrar sus acciones correspondientes</strong> en el catálogo de la base de datos (ejemplo para este módulo: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">ver-configuraciones</code> y <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">editar-configuraciones</code>).
        </p>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium shadow-md">
          {successNotice}
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md">
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Cargando parámetros...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
                🔒 Control de Sesión y Expiración Activa
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Duración de la Sesión Activa (en Minutos) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    required
                    value={sessionDurationMinutes}
                    onChange={(e) => setSessionDurationMinutes(parseInt(e.target.value, 10) || 30)}
                    className="w-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400">
                    Minutos por defecto: <strong>30 minutos</strong>. Al transcurrir este tiempo sin actividad, la sesión caduca automáticamente.
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
                ⛪ Datos Institucionales de la Iglesia
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Nombre Oficial de la Iglesia / Congregación *
                </label>
                <input
                  type="text"
                  required
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Correo Electrónico de Contacto y Soporte *
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20"
              >
                {saving ? "Guardando..." : "Guardar Configuraciones"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
