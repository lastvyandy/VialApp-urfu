import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Calendar, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../api';

export default function HistoryPage() {
  const { lang, tr, trLicense, trExamName } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/users/me/tests')
      .then((data) => setHistory(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-5 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#173B63]">
            {tr('Historial de Exámenes', 'Exam History')}
          </h1>
          <p className="text-xs text-[#6C7B90]">
            {tr(
              'Registro de todos tus ensayos realizados y sus calificaciones.',
              'Record of all your completed mock exams and scores.'
            )}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#C7D8FA] bg-white px-3.5 py-2 text-xs font-black text-[#2457D6]"
        >
          <ArrowLeft className="h-4 w-4" />
          {tr('Volver', 'Back')}
        </Link>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm font-bold text-[#6C7B90]">
          {tr('Cargando historial...', 'Loading history...')}
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border border-[#D7E4F6] bg-white p-8 text-center">
          <p className="text-sm font-bold text-[#173B63]">
            {tr('Aún no has completado ningún examen.', 'You have not completed any exams yet.')}
          </p>
          <Link
            to="/examenes"
            className="mt-3 inline-block rounded-xl bg-[#2457D6] px-4 py-2.5 text-xs font-black text-white"
          >
            {tr('Realizar mi primer examen', 'Take my first exam')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const maxErr = item.total_preguntas <= 15 ? 1 : 2;
            const passed = item.total_preguntas - item.correctas <= maxErr;
            const dateStr = new Date(item.fecha).toLocaleString(
              lang === 'en' ? 'en-US' : 'es-CL'
            );

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#EAF1FF] px-2 py-0.5 text-[11px] font-black text-[#2457D6]">
                      {trLicense(item.clase_licencia)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                        passed
                          ? 'bg-[#E7F8EF] text-[#148449]'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {passed ? tr('Aprobado', 'Passed') : tr('Reprobado', 'Failed')}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#173B63]">
                    {trExamName(item.nombre_test)}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-[#6C7B90]">
                    <Calendar className="h-3.5 w-3.5" />
                    {dateStr}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-black text-[#173B63]">{item.puntaje}%</p>
                    <p className="text-xs font-bold text-[#6C7B90]">
                      {item.correctas}/{item.total_preguntas}{' '}
                      {tr('correctas', 'correct')}
                    </p>
                  </div>

                  <Link
                    to={`/test/${item.test_id}?mode=exam`}
                    className="rounded-xl border border-[#C7D8FA] px-3.5 py-2 text-xs font-black text-[#2457D6] hover:bg-[#F4F7FF]"
                  >
                    {tr('Repetir', 'Retry')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}