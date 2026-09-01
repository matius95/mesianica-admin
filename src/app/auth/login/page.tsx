"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@mesianica.org");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expiredMsg, setExpiredMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      setExpiredMsg("⚠️ Tu sesión ha caducado por inactividad (30 min). Por favor, inicia sesión nuevamente.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`¡Bienvenido de nuevo, ${json.data.email}! Redirigiendo...`);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      } else {
        setError(json.error || "Credenciales inválidas.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Error de conexión al intentar iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
      {/* Brand Logo */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-lg shadow-indigo-500/30">
          M
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Mesiánica Admin</h1>
        <p className="text-xs text-slate-400">Ingreso al Sistema de Administración de Iglesia</p>
      </div>

      {/* Expiration Alert */}
      {expiredMsg && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-400 text-center shadow-md">
          {expiredMsg}
        </div>
      )}

      {/* Demo Credentials Hint */}
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
        <p className="font-semibold text-indigo-200">💡 Credenciales de Prueba por Defecto:</p>
        <p className="font-mono">Usuario: admin@mesianica.org</p>
        <p className="font-mono">Clave: admin123</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400 text-center">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-400 text-center">
          {successMsg}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Correo Electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="admin@mesianica.org"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
        >
          {loading ? "Verificando..." : "Iniciar Sesión"}
        </button>
      </form>

      <div className="text-center pt-2">
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
          ← Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-slate-400 text-sm">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
