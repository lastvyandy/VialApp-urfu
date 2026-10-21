import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Play,
  Trophy,
  BarChart3,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

const LICENSE_CLASSES = ['Clase B', 'Clase C'];

export default function HomePage() {
  const { user, licenseClass, setLicenseClass } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      apiFetch(`/tests/?clase_licencia=${encodeURIComponent(licenseClass)}`),
      apiFetch('/users/me/stats/avanzadas'),
    ])
      .then(([examsData, statsData]) => {
        if (active) {
          setExams(examsData);
          setStats(statsData);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
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
    <div className="mx-auto max-w-5xl space-y-6 pt-6">
      {/* Banner superior y selector de clase */}
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-[#C9D9FF] bg-[#EAF1FF] p-6 shadow-xs">
          <p className="text-xs font-black uppercase tracking-wider text-[#2457D6]">
            Preparación Teórica CONASET
          </p>
          <h1 className="mt-1 text-2xl font-black text-[#173B63]">
            ¡Hola, {user?.username}! 👋
          </h1>
          <p className="mt-1 text-sm text-[#516B88]">
            Selecciona tu clase de licencia y realiza un ensayo en modo Examen o modo Estudio con corrección explicada.
          </p>
        </section>

        <section className="flex flex-col justify-center rounded-2xl border border-[#D7E4F6] bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#6C7B90]">Licencia activa</span>
            <span className="rounded-full bg-[#EAF1FF] px-2.5 py-0.5 text-xs font-black text-[#2457D6]">
              {licenseClass}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {LICENSE_CLASSES.map((option) => {
              const isSelected = licenseClass === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLicenseClass(option)}
                  className={`rounded-xl border py-2.5 text-xs font-black transition ${
                    isSelected
                      ? 'border-[#2457D6] bg-[#2457D6] text-white shadow-xs'
                      : 'border-[#C7D8FA] bg-white text-[#2457D6] hover:bg-[#F4F7FF]'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Resumen de Estadísticas */}
      {summary && summary.total_tests > 0 && (
        <section className="rounded-2xl border border-[#DDE7F2] bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2457D6]" />
            <h2 className="text-base font-black text-[#173B63]">Tu Rendimiento Acumulado</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#F4F7FB] p-3.5">
              <p className="text-xs font-bold text-[#647084]">Ensayos Realizados</p>
              <p className="mt-1 text-2xl font-black text-[#173B63]">{summary.total_tests}</p>
            </div>

            <div className="rounded-xl bg-[#E7F8EF] p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#148449]">Exámenes Aprobados</p>
                <Trophy className="h-4 w-4 text-[#148449]" />
              </div>
              <p className="mt-1 text-2xl font-black text-[#148449]">{summary.aprobados}</p>
            </div>

            <div className="rounded-xl bg-[#EAF1FF] p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#2457D6]">Promedio de Acierto</p>
                <Award className="h-4 w-4 text-[#2457D6]" />
              </div>
              <p className="mt-1 text-2xl font-black text-[#2457D6]">{summary.promedio_puntaje}%</p>
            </div>
          </div>

          {summary.peor_categoria && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-black">Tema recomendado para repasar: </span>
                <span>{summary.peor_categoria}</span>
              </div>
            </div>
          )}

          {categorias.length > 0 && (
            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
              <p className="text-xs font-black uppercase tracking-wider text-[#6C7B90]">
                Dominio por Categoría
              </p>
              {categorias.map((cat) => (
                <div key={cat.categoria} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#173B63]">{cat.categoria}</span>
                    <span className="text-[#647084]">
                      {cat.correctas}/{cat.total} ({cat.porcentaje}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7EDF7]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cat.porcentaje >= 80
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
          )}
        </section>
      )}

      {/* Listado de Exámenes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#173B63]">
            Exámenes disponibles ({licenseClass})
          </h2>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#D7E4F6] bg-white p-8 text-center text-sm font-bold text-[#6C7B90]">
            Cargando exámenes...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-600">
            {error}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-col justify-between rounded-2xl border border-[#DDE7F2] bg-white p-5 shadow-xs transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-lg bg-[#EAF1FF] px-2.5 py-1 text-xs font-black text-[#2457D6]">
                      {exam.clase_licencia} • {exam.categoria}
                    </span>
                    {exam.completado && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F8EF] px-2.5 py-1 text-xs font-black text-[#148449]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Último: {exam.ultimo_puntaje}%
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-base font-black text-[#173B63]">{exam.nombre}</h3>
                  <p className="mt-1 text-xs font-medium text-[#6C7B90]">
                    {exam.total_preguntas} preguntas oficiales con retroalimentación
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/test/${exam.id}?mode=exam`)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2457D6] py-2.5 text-xs font-black text-white hover:bg-blue-700"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Modo Examen
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/test/${exam.id}?mode=study`)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#14966F] bg-[#EAF8F1] py-2.5 text-xs font-black text-[#14966F] hover:bg-green-100"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Modo Estudio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}