import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  CheckCircle2,
  CreditCard,
  Lock,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../api';

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const { tr } = useLanguage();
  const navigate = useNavigate();

  const PLANS = [
    {
      id: 'daily',
      name: tr('Pase Diario Express', 'Daily Express Pass'),
      days: 1,
      price: '$1.000',
      description: tr(
        'Ideal para repasar el día antes de tu examen municipal.',
        'Ideal for last-minute cramming the day before your municipal test.'
      ),
      features: [
        tr('Acceso a todos los ensayos B y C', 'Access to all Class B & C mock exams'),
        tr('Modo Estudio con explicaciones', 'Study Mode with full explanations'),
        tr('24 horas de acceso ilimitado', '24 hours of unlimited access'),
      ],
    },
    {
      id: 'biweekly',
      name: tr('Plan Quincenal', '15-Day Biweekly Plan'),
      days: 15,
      price: '$5.990',
      popular: true,
      description: tr(
        'El favorito para preparar tu examen en 2 semanas.',
        'Our most popular choice to prepare your exam in 2 weeks.'
      ),
      features: [
        tr('Todos los simulacros oficiales', 'All official 35-question mock exams'),
        tr('Modo Práctica de Errores', 'Smart Error Practice mode'),
        tr('Estadísticas avanzadas por tema', 'Advanced category analytics'),
        tr('15 días de vigencia', '15 days of active access'),
      ],
    },
    {
      id: 'monthly',
      name: tr('Plan Mensual Pro', '30-Day Monthly Pro'),
      days: 30,
      price: '$9.990',
      description: tr(
        'Preparación completa a tu ritmo sin restricciones.',
        'Complete preparation at your own pace without restrictions.'
      ),
      features: [
        tr('Acceso total Clases B y C', 'Full access to Class B & C'),
        tr('Generación ilimitada de ensayos', 'Unlimited mock exam attempts'),
        tr('Soporte y seguimiento completo', 'Full progress tracking & analytics'),
        tr('30 días de vigencia', '30 days of active access'),
      ],
    },
  ];

  const [selectedPlanId, setSelectedPlanId] = useState('biweekly');
  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];

  const [cardHolder, setCardHolder] = useState(user?.username?.toUpperCase() || 'JORGE MANRIQUEZ');
  const [cardNumber, setCardNumber] = useState('4532 8910 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    setTimeout(async () => {
      try {
        await apiFetch('/users/me/checkout', {
          method: 'POST',
          body: JSON.stringify({
            plan_type: selectedPlan.id,
            card_holder: cardHolder,
            card_number: cardNumber,
          }),
        });
        await refreshUser();
        setPaymentSuccess(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setProcessing(false);
      }
    }, 1200);
  };

  if (paymentSuccess) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-[#A9DEC9] bg-white p-8 text-center shadow-md space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F8EF] text-[#148449]">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <span className="rounded-full bg-[#E7F8EF] px-3 py-1 text-xs font-black text-[#148449]">
            {tr('PAGO APROBADO • SANDBOX DEMO', 'PAYMENT APPROVED • SANDBOX DEMO')}
          </span>
          <h1 className="text-2xl font-black text-[#173B63] pt-2">
            {tr('¡Bienvenido a VialApp Premium! 🎉', 'Welcome to VialApp Premium! 🎉')}
          </h1>
          <p className="text-xs text-[#516B88]">
            {tr('Se ha activado el ', 'Activated: ')}
            <strong>{selectedPlan.name}</strong> (+{selectedPlan.days}{' '}
            {tr('días', 'days')}).
          </p>
        </div>

        <div className="rounded-2xl bg-[#F4F7FB] p-4 text-left text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#647084]">{tr('Plan contratado:', 'Selected Plan:')}</span>
            <span className="font-black text-[#173B63]">{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#647084]">{tr('Monto pagado:', 'Amount Paid:')}</span>
            <span className="font-black text-[#148449]">{selectedPlan.price} CLP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#647084]">{tr('Tarjeta utilizada:', 'Card Used:')}</span>
            <span className="font-bold text-[#173B63]">•••• {cardNumber.slice(-4)}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/examenes')}
            className="flex-1 rounded-xl bg-[#2457D6] py-3 text-xs font-black text-white hover:bg-blue-700 transition"
          >
            {tr('Ir a los Exámenes Premium', 'Go to Premium Exams')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/perfil')}
            className="rounded-xl border border-[#C7D8FA] px-4 py-3 text-xs font-black text-[#2457D6] hover:bg-[#F4F7FF] transition"
          >
            {tr('Ver Mi Perfil', 'View Profile')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-black text-[#173B63]">
              {tr('Planes y Suscripción Premium', 'Premium Plans & Checkout')}
            </h1>
          </div>
          <p className="text-xs text-[#6C7B90]">
            {tr(
              'Desbloquea todos los ensayos oficiales de 35 preguntas, el Modo Estudio y el refuerzo de errores.',
              'Unlock all 35-question official mock exams, Study Mode, and smart mistake reinforcement.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#C7D8FA] bg-white px-3.5 py-2 text-xs font-black text-[#2457D6]"
        >
          <ArrowLeft className="h-4 w-4" />
          {tr('Volver', 'Back')}
        </button>
      </div>

      {/* Tarjetas de Planes */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`cursor-pointer rounded-3xl border p-6 transition-all ${
                isSelected
                  ? 'border-[#2457D6] bg-[#EAF1FF]/60 ring-2 ring-[#2457D6]'
                  : 'border-[#DDE7F2] bg-white hover:border-[#C7D8FA]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#2457D6]">
                  {plan.name}
                </span>
                {plan.popular && (
                  <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white">
                    {tr('MÁS ELEGIDO', 'MOST POPULAR')}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#173B63]">{plan.price}</span>
                <span className="text-xs font-bold text-[#6C7B90]">
                  CLP / {plan.days} {tr('día(s)', 'day(s)')}
                </span>
              </div>

              <p className="mt-2 text-xs text-[#516B88]">{plan.description}</p>

              <ul className="mt-4 space-y-2 border-t border-slate-200/70 pt-4">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs font-medium text-[#173B63]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#14966F]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Pasarela Simulada */}
      <div className="grid gap-6 rounded-3xl border border-[#D7E4F6] bg-white p-6 sm:p-8 shadow-xs lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#173B63] via-[#1E4B85] to-[#2457D6] p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest uppercase opacity-80">
                VialApp Bank • Sandbox
              </span>
              <CreditCard className="h-6 w-6 opacity-90" />
            </div>

            <div className="my-6">
              <p className="font-mono text-lg sm:text-xl font-bold tracking-widest">
                {cardNumber || '•••• •••• •••• ••••'}
              </p>
            </div>

            <div className="flex items-end justify-between text-xs">
              <div>
                <p className="text-[10px] uppercase opacity-70">
                  {tr('Titular de la Tarjeta', 'Card Holder')}
                </p>
                <p className="font-black tracking-wider uppercase">
                  {cardHolder || 'CARD HOLDER'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase opacity-70">{tr('Vence', 'Expires')}</p>
                <p className="font-black">{cardExpiry || 'MM/YY'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-[#F4F7FB] p-3.5 text-xs text-[#516B88]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#14966F]" />
            <span>
              <strong>{tr('Modo Simulación Académica:', 'Academic Sandbox Mode:')}</strong>{' '}
              {tr(
                'Acepta cualquier número de tarjeta ficticio para demostrar la activación instantánea del plan.',
                'Accepts any mock card number to demonstrate instant Premium plan activation.'
              )}
            </span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-[#173B63]">
                {tr('Simulador de Pago con Tarjeta', 'Simulated Card Checkout')}
              </h2>
              <p className="text-xs text-[#6C7B90]">
                {tr('Seleccionado:', 'Selected:')}{' '}
                <strong>
                  {selectedPlan.name} ({selectedPlan.price} CLP)
                </strong>
              </p>
            </div>
            <Lock className="h-5 w-5 text-[#14966F]" />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#173B63]">
              {tr('Nombre del Titular', 'Cardholder Name')}
            </label>
            <input
              type="text"
              required
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm font-bold focus:border-[#2457D6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#173B63]">
              {tr(
                'Número de Tarjeta (Acepta cualquier número ficticio)',
                'Card Number (Any mock card number accepted)'
              )}
            </label>
            <input
              type="text"
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 font-mono text-sm font-bold focus:border-[#2457D6] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#173B63]">
                {tr('Vencimiento (MM/AA)', 'Expiration (MM/YY)')}
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm font-bold focus:border-[#2457D6] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#173B63]">
                {tr('Código CVV', 'CVV Code')}
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm font-bold focus:border-[#2457D6] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22B968] py-3.5 text-sm font-black text-white shadow-md hover:bg-[#148449] transition disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {processing
                ? tr('Procesando pago con el banco...', 'Processing bank authorization...')
                : tr(
                    `Pagar ${selectedPlan.price} CLP y Activar Premium`,
                    `Pay ${selectedPlan.price} CLP & Activate Premium`
                  )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}