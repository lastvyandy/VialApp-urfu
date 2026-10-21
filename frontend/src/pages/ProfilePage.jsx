import { useState } from 'react';
import {
  User,
  Mail,
  Crown,
  Calendar,
  Shield,
  Car,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, licenseClass, setLicenseClass } = useAuth();
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleClassChange = (e) => {
    setLicenseClass(e.target.value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'No registrada';

  const premiumUntilStr = user.premium_until
    ? new Date(user.premium_until).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-6">
      {/* Cabecera de Perfil */}
      <div className="flex flex-col sm:flex-row items-center gap-5 rounded-3xl border border-[#D7E4F6] bg-white p-6 shadow-xs">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#2457D6] text-3xl font-black text-white shadow-md">
          {user.username.charAt(0).toUpperCase()}
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-[#173B63]">{user.username}</h1>
            {user.is_admin && (
              <span className="rounded-lg bg-purple-100 px-2.5 py-0.5 text-xs font-black text-purple-700">
                Administrador[cite: 3]
              </span>
            )}
            {user.is_premium ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#E7F8EF] px-2.5 py-0.5 text-xs font-black text-[#148449]">
                <Crown className="h-3 w-3" />
                Plan Premium[cite: 3]
              </span>
            ) : (
              <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                Plan Gratuito[cite: 3]
              </span>
            )}
          </div>

          <p className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#6C7B90]">
            <Mail className="h-3.5 w-3.5" />
            {user.email}
          </p>

          <p className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-[#6C7B90]">
            <Calendar className="h-3 w-3" />
            Miembro desde el {formattedDate}
          </p>
        </div>
      </div>

      {/* Ajustes de Licencia Objetivo */}
      <section className="rounded-2xl border border-[#D7E4F6] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-black text-[#173B63]">
            <Car className="h-5 w-5 text-[#2457D6]" />
            <h2>Preferencia de Licencia de Conducir</h2>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#148449]">
              <CheckCircle2 className="h-4 w-4" />
              Guardado
            </span>
          )}
        </div>

        <p className="text-xs text-[#6C7B90]">
          Define qué clase de examen prepararás principalmente. Podrás cambiarla en cualquier momento.
        </p>

        <div className="max-w-xs">
          <select
            value={licenseClass}
            onChange={handleClassChange}
            className="w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm font-bold text-[#173B63] focus:border-[#2457D6] focus:outline-none"
          >
            <option value="Clase B">Licencia Clase B (Automóviles particulares)</option>
            <option value="Clase C">Licencia Clase C (Motocicletas)</option>
          </select>
        </div>
      </section>

      {/* Estado de Membresía */}
      <section className="rounded-2xl border border-[#D7E4F6] bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-base font-black text-[#173B63]">
          <Shield className="h-5 w-5 text-[#2457D6]" />
          <h2>Estado de tu Cuenta</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[#F4F7FB] p-4">
            <p className="text-xs font-bold text-[#647084]">Tipo de Acceso</p>
            <p className="mt-1 text-base font-black text-[#173B63]">
              {user.is_premium ? 'Acceso Premium Total' : 'Acceso Básico Gratuito[cite: 3]'}
            </p>
            <p className="mt-1 text-[11px] text-[#6C7B90]">
              {user.is_premium
                ? 'Todos los ensayos, simulacros y revisiones pedagógicas habilitadas.'
                : 'Acceso a ensayos de prueba.'}
            </p>
          </div>

          <div className="rounded-xl bg-[#F4F7FB] p-4">
            <p className="text-xs font-bold text-[#647084]">Vigencia de Membresía</p>
            <p className="mt-1 text-base font-black text-[#2457D6]">
              {premiumUntilStr ? `Hasta el ${premiumUntilStr}` : 'Vigencia activa'}
            </p>
            <p className="mt-1 text-[11px] text-[#6C7B90]">
              {user.is_admin ? 'Cuenta con privilegios de Administrador' : 'Gestionado por el sistema'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}