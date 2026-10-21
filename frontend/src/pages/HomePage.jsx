import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Play,
  Trophy,
  BarChart3,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  History,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

const LICENSE_CLASSES = ['Clase B', 'Clase C'];

export default function HomePage() {
  const { user, licenseClass, setLicenseClass } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      apiFetch('/users/me/stats/avanzadas'),
      apiFetch(`/tests/?clase_licencia=${encodeURIComponent(licenseClass)}`),
    ])
      .then(([statsData, examsData]) => {
        if (active) {
          setStats(statsData);
          setRecentExams(examsData.slice(0, 2));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [licenseClass]);

  const summary = stats?.summary;
  const categorias = stats?.categorias || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pt-6">
      {/* Banner Principal de Bienvenida */}
      <section className="relative overflow-hidden rounded-3xl border border-[#C9D9FF] bg-gradient-to-r from-[#EAF1FF] via-white to-[#F0F5FF] p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2457D6]/10 px-3 py-1 text-xs font-black text-[#2457D6]">
              <Sparkles className="h-3.5 w-3.5" />
              Preparación Oficial Licencias de Conducir
            </span>

            <h1 className="mt-3 text-3xl font-black text-[#173B63] sm:text-4xl leading-tight">
              ¡Hola, {user?.username}! 👋
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-[#516B88]">
              Practica con las preguntas oficiales de la prueba teórica CONASET[cite: 3]. Elige tu clase de licencia y realiza simulaciones cronometradas con corrección detallada.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/examenes"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2457D6] px-5 py-3 text-xs font-black text-white shadow-md hover:bg-blue-700 transition"
              >
                <Play className="h-4 w-4" />
                <span>Explorar Exámenes Disponibles</span>
              </Link>
              <Link
                to="/glosario"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#C7D8FA] bg-white px-5 py-3 text-xs font-black text-[#2457D6] hover:bg-[#F4F7FF] transition"
              >
                <BookOpen className="h-4 w-4" />
                <span>Glosario Oficial</span>
              </Link>
            </div>
          </div>

          {/* Selector de Licencia en Tarjeta Hero */}
          <div className="rounded-2xl border border-[#D7E4F6] bg-white/90 p-5 shadow-xs backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#6C7B90]">Tu Licencia Objetivo</span>
              <span className="rounded-md bg-[#EAF1FF] px-2 py-0.5 text-xs font-black text-[#2457D6]">
                {licenseClass}
              </span>
            </div>

            <p className="text-xs text-[#516B88] mb-4">
              Los ensayos se adaptarán automáticamente a los contenidos y exigencias de tu clase.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {LICENSE_CLASSES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLicenseClass(option)}
                  className={`rounded-xl border py-2.5 text-xs font-black transition ${
                    licenseClass === option
                      ? 'border-[#2457D6] bg-[#2457D6] text-white shadow-xs'
                      : 'border-[#C7D8FA] bg-white text-[#2457D6] hover:bg-[#F4F7FF]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Métricas del Estudiante */}
      {summary && summary.total_tests > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-black text-[#173B63]">
              <BarChart3 className="h-5 w-5 text-[#2457D6]" />
              <h2>Tu Rendimiento de Estudio</h2>
            </div>
            <Link
              to="/historial"
              className="inline-flex items-center gap-1 text-xs font-black text-[#2457D6] hover:underline"
            >
              <span>Ver historial completo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-[#647084]">Ensayos Completados</p>
              <p className="mt-2 text-3xl font-black text-[#173B63]">{summary.total_tests}</p>
              <p className="mt-1 text-[11px] text-[#6C7B90]">Simulaciones oficiales rendidas</p>
            </div>

            <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#148449]">
                <span>Aprobados (≥ 33 pts)[cite: 2]</span>
                <Trophy className="h-4 w-4" />
              </div>
              <p className="mt-2 text-3xl font-black text-[#148449]">{summary.aprobados}</p>
              <p className="mt-1 text-[11px] text-[#6C7B90]">
                {Math.round((summary.aprobados / summary.total_tests) * 100)}% de efectividad
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#2457D6]">
                <span>Promedio General</span>
                <Award className="h-4 w-4" />
              </div>
              <p className="mt-2 text-3xl font-black text-[#2457D6]">{summary.promedio_puntaje}%</p>
              <p className="mt-1 text-[11px] text-[#6C7B90]">Puntaje promedio obtenido</p>
            </div>
          </div>

          {summary.peor_categoria && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-black text-sm text-amber-950">Materia prioritaria para reforzar</p>
                <p className="mt-0.5">
                  Tus respuestas indican menor porcentaje de aciertos en <strong>{summary.peor_categoria}</strong>. Te sugerimos realizar un ensayo en Modo Estudio enfocado en este tema.
                </p>
              </div>
            </div>
          )}

          {categorias.length > 0 && (
            <div className="rounded-2xl border border-[#DDE7F2] bg-white p-5 shadow-xs space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-[#6C7B90]">
                Dominio por Categoría de Preguntas
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {categorias.map((cat) => (
                  <div key={cat.categoria} className="space-y-1 rounded-xl bg-[#F4F7FB] p-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#173B63] truncate pr-2">{cat.categoria}</span>
                      <span className="text-[#647084] shrink-0">
                        {cat.correctas}/{cat.total} ({cat.porcentaje}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7EDF7]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cat.porcentaje >= 85
                            ? 'bg-[#14966F]'
                            : cat.porcentaje >= 50
                              ? 'bg-amber-500'
                              : 'bg-[#D92D20]'
                        }`}
                        style={{ width: `${cat.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-[#D7E4F6] bg-white p-6 shadow-xs text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1FF] text-[#2457D6]">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-base font-black text-[#173B63]">Aún no has realizado simulacros</h2>
          <p className="mx-auto max-w-md text-xs text-[#6C7B90]">
            Comienza con tu primer ensayo oficial de 35 preguntas[cite: 3]. El sistema registrará tus resultados y te indicará automáticamente en qué materias debes mejorar.
          </p>
          <Link
            to="/examenes"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2457D6] px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 transition"
          >
            <span>Ver Exámenes Disponibles</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Ensayos Destacados Rápidos */}
      {recentExams.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#173B63]">Ensayos Destacados ({licenseClass})</h2>
            <Link to="/examenes" className="text-xs font-black text-[#2457D6] hover:underline">
              Ver todos los ensayos →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {recentExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs"
              >
                <div>
                  <span className="rounded-md bg-[#EAF1FF] px-2 py-0.5 text-[10px] font-black text-[#2457D6]">
                    {exam.clase_licencia}
                  </span>
                  <h3 className="mt-1 text-sm font-black text-[#173B63]">{exam.nombre}</h3>
                  <p className="text-xs text-[#6C7B90]">{exam.total_preguntas} preguntas[cite: 3] • 45 min[cite: 2]</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/test/${exam.id}?mode=exam`)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#2457D6] px-4 py-2 text-xs font-black text-white hover:bg-blue-700 transition"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Rendir</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}