import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, Play, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

const LICENSE_CLASSES = ['Clase B', 'Clase C'];

export default function HomePage() {
  const { user, licenseClass, setLicenseClass } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    apiFetch(`/tests/?clase_licencia=${encodeURIComponent(licenseClass)}`)
      .then((data) => {
        if (active) setExams(data);
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