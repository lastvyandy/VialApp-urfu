import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Award,
  Repeat,
  Car,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 pt-6 pb-12">
      {/* Hero Principal */}
      <section className="relative overflow-hidden rounded-3xl border border-[#C9D9FF] bg-gradient-to-br from-[#EAF1FF] via-white to-[#E7F8EF] p-8 sm:p-12 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2457D6]/10 px-3.5 py-1.5 text-xs font-black text-[#2457D6]">
              <Sparkles className="h-4 w-4" />
              Actualizado al Libro del Nuevo Conductor CONASET
            </span>

            <h1 className="text-3xl font-black tracking-tight text-[#173B63] sm:text-5xl leading-[1.12]">
              Aprueba tu examen teórico de conducir a la primera.
            </h1>

            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[#516B88]">
              Simula el examen municipal para <strong>Licencia Clase B y Clase C</strong> con 35 preguntas oficiales, cronómetro real de 45 minutos, explicaciones paso a paso y un motor inteligente que refuerza tus errores.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2457D6] px-6 py-3.5 text-sm font-black text-white shadow-md hover:bg-blue-700 transition"
              >
                <span>Comenzar Gratis Ahora</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#C7D8FA] bg-white px-6 py-3.5 text-sm font-black text-[#173B63] hover:bg-[#F4F7FF] transition"
              >
                <span>Ya tengo cuenta</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-[#516B88]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#14966F]" />
                35 preguntas por examen
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#14966F]" />
                Clases B (Autos) y C (Motos)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#14966F]" />
                Explicaciones pedagógicas
              </span>
            </div>
          </div>

          {/* Tarjeta Visual Derecha */}
          <div className="rounded-3xl border border-[#D7E4F6] bg-white p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#2457D6]">
                  <Car className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#173B63]">Simulador Oficial CONASET</p>
                  <p className="text-[10px] font-semibold text-[#6C7B90]">Licencia Clase B • Mixto</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF1FF] px-2.5 py-1 text-xs font-black text-[#2457D6]">
                <Clock className="h-3.5 w-3.5" />
                45:00
              </span>
            </div>

            <div className="rounded-2xl bg-[#F4F7FB] p-4 space-y-2.5">
              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-[#647084]">
                Pregunta 14 de 35 • Normas de Circulación
              </span>
              <p className="text-xs font-black text-[#172033]">
                ¿Cuál es la distancia mínima que debe mantener respecto a un grifo para incendios al estacionar?
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="rounded-xl border border-[#D8E1EF] bg-white px-3 py-2 text-xs text-[#647084]">
                  A) A menos de 2 metros
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#14966F] bg-[#EAF8F1] px-3 py-2 text-xs font-bold text-[#0F6B50]">
                  <span>B) A más de 5 metros de distancia</span>
                  <CheckCircle2 className="h-4 w-4 text-[#14966F]" />
                </div>
                <div className="rounded-xl border border-[#D8E1EF] bg-white px-3 py-2 text-xs text-[#647084]">
                  C) A 10 metros exactos
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="rounded-xl bg-[#F4F7FB] p-2.5">
                <p className="text-base font-black text-[#2457D6]">+1.700</p>
                <p className="text-[10px] font-bold text-[#647084]">Preguntas</p>
              </div>
              <div className="rounded-xl bg-[#F4F7FB] p-2.5">
                <p className="text-base font-black text-[#14966F]">94%</p>
                <p className="text-[10px] font-bold text-[#647084]">Aprobación</p>
              </div>
              <div className="rounded-xl bg-[#F4F7FB] p-2.5">
                <p className="text-base font-black text-[#173B63]">24/7</p>
                <p className="text-[10px] font-bold text-[#647084]">Disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pilares de la Aplicación */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-[#173B63] sm:text-3xl">
            Todo lo que necesitas para asegurar tu licencia
          </h2>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#6C7B90]">
            Diseñado específicamente con las métricas y reglas de evaluación exigidas por las direcciones de tránsito en Chile.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-5 shadow-xs space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#2457D6]">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-[#173B63]">Modo Examen Real</h3>
            <p className="text-xs leading-relaxed text-[#6C7B90]">
              35 preguntas con temporizador oficial de 45 minutos y envío automático al expirar el tiempo.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-5 shadow-xs space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F8EF] text-[#148449]">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-[#173B63]">Modo Estudio Guiado</h3>
            <p className="text-xs leading-relaxed text-[#6C7B90]">
              Comprueba cada respuesta al instante y lee la fundamentación legal del Libro para la Conducción.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-5 shadow-xs space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Repeat className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-[#173B63]">Práctica de Errores</h3>
            <p className="text-xs leading-relaxed text-[#6C7B90]">
              Al terminar un ensayo, filtra y repite únicamente las preguntas en que fallaste hasta dominarlas.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-5 shadow-xs space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-[#173B63]">Analítica por Categoría</h3>
            <p className="text-xs leading-relaxed text-[#6C7B90]">
              Detecta automáticamente tu materia más débil (Mecánica, Normas o Convivencia Vial).
            </p>
          </div>
        </div>
      </section>

      {/* Banner CTA Final */}
      <section className="rounded-3xl bg-[#173B63] p-8 text-center text-white space-y-4">
        <Award className="mx-auto h-10 w-10 text-amber-400" />
        <h2 className="text-2xl font-black">¿Listo para poner a prueba tus conocimientos?</h2>
        <p className="mx-auto max-w-lg text-xs sm:text-sm text-blue-100">
          Crea tu cuenta gratuita en segundos o ingresa con la cuenta de demostración para explorar todos los módulos.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="rounded-xl bg-[#22B968] px-6 py-3 text-xs font-black text-white hover:bg-[#148449] transition"
          >
            Registrarme Gratis
          </Link>
          <Link
            to="/login"
            className="rounded-xl bg-white/10 px-6 py-3 text-xs font-black text-white hover:bg-white/20 transition"
          >
            Entrar con Cuenta Demo
          </Link>
        </div>
      </section>
    </div>
  );
}