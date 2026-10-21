import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Crown,
  Calendar,
  Shield,
  Car,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProfilePage() {
  const { user, licenseClass, setLicenseClass } = useAuth();
  const { lang, tr } = useLanguage();
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleClassChange = (e) => {
    setLicenseClass(e.target.value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const locale = lang === 'en' ? 'en-US' : 'es-CL';

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const premiumUntilStr = user.premium_until
    ? new Date(user.premium_until).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 rounded-3xl border border-[#D7E4F6] bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#2457D6] text-3xl font-black text-white shadow-md">
            {user.username.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-[#173B63]">{user.username}</h1>
              {user.is_admin && (
                <span className="rounded-lg bg-purple-100 px-2.5 py-0.5 text-xs font-black text-purple-700">
                  {tr('Administrador', 'Administrator')}
                </span>
              )}
              {user.is_premium ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-[#E7F8EF] px-2.5 py-0.5 text-xs font-black text-[#148449]">
                  <Crown className="h-3 w-3" />
                  {tr('Plan Premium', 'Premium Plan')}
                </span>
              ) : (
                <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                  {tr('Plan Gratuito', 'Free Plan')}
                </span>
              )}
            </div>

            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#6C7B90]">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>

            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-[#6C7B90]">
              <Calendar className="h-3.5 w-3.5" />
              {tr('Miembro desde el', 'Member since')} {formattedDate}
            </p>
          </div>
        </div>

        <Link
          to="/planes"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-xs hover:opacity-95 transition"
        >
          <CreditCard className="h-4 w-4" />
          <span>
            {user.is_premium
              ? tr('Extender Suscripción', 'Extend Subscription')
              : tr('Actualizar a Premium', 'Upgrade to Premium')}
          </span>
        </Link>
      </div>

      <section className="rounded-2xl border border-[#D7E4F6] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-black text-[#173B63]">
            <Car className="h-5 w-5 text-[#2457D6]" />
            <h2>{tr('Preferencia de Licencia de Conducir', 'Driver License Preference')}</h2>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#148449]">
              <CheckCircle2 className="h-4 w-4" />
              {tr('Guardado', 'Saved')}
            </span>
          )}
        </div>

        <p className="text-xs text-[#6C7B90]">
          {tr(
            'Define qué clase de examen prepararás principalmente. Podrás cambiarla en cualquier momento.',
            'Choose which license class you are primarily preparing for. You can switch it anytime.'
          )}
        </p>

        <div className="max-w-xs">
          <select
            value={licenseClass}
            onChange={handleClassChange}
            className="w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm font-bold text-[#173B63] focus:border-[#2457D6] focus:outline-none"
          >
            <option value="Clase B">
              {tr('Licencia Clase B (Automóviles particulares)', 'Class B License (Passenger Cars)')}
            </option>
            <option value="Clase C">
              {tr('Licencia Clase C (Motocicletas)', 'Class C License (Motorcycles)')}
            </option>
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-[#D7E4F6] bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-base font-black text-[#173B63]">
          <Shield className="h-5 w-5 text-[#2457D6]" />
          <h2>{tr('Estado de tu Cuenta', 'Account Status')}</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[#F4F7FB] p-4">
            <p className="text-xs font-bold text-[#647084]">
              {tr('Tipo de Acceso', 'Access Tier')}
            </p>
            <p className="mt-1 text-base font-black text-[#173B63]">
              {user.is_premium
                ? tr('Acceso Premium Total', 'Full Premium Access')
                : tr('Acceso Básico Gratuito', 'Free Basic Access')}
            </p>
            <p className="mt-1 text-[11px] text-[#6C7B90]">
              {user.is_premium
                ? tr(
                    'Todos los ensayos, simulacros y revisiones pedagógicas habilitadas.',
                    'All official mock exams, study modes, and explanations unlocked.'
                  )
                : tr(
                    'Incluye el Ensayo #1 y Demo Express. Actualiza a Premium para desbloquear todo.',
                    'Includes Mock Exam #1 and Express Demo. Upgrade to Premium to unlock all exams.'
                  )}
            </p>
          </div>

          <div className="rounded-xl bg-[#F4F7FB] p-4">
            <p className="text-xs font-bold text-[#647084]">
              {tr('Vigencia de Membresía', 'Membership Validity')}
            </p>
            <p className="mt-1 text-base font-black text-[#2457D6]">
              {user.is_premium
                ? premiumUntilStr
                  ? `${tr('Activa hasta el', 'Active until')} ${premiumUntilStr}`
                  : tr('Vigencia permanente', 'Permanent validity')
                : tr('Sin suscripción activa', 'No active subscription')}
            </p>
            <p className="mt-1 text-[11px] text-[#6C7B90]">
              {user.is_admin
                ? tr('Cuenta con privilegios de Administrador', 'Administrator privileges enabled')
                : tr('Renovable desde la sección Planes', 'Renewable from the Plans section')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}