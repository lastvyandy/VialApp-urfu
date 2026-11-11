
import {
  FileText,
  Play,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Clock,
  Lock,
  Crown
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

export default function ExamCard({
  exam,
  isLocked,
  onStartExam,
  onUnlock
}) {
  const { tr, trCategory, trLicense, trExamName } = useLanguage();

  const hasScore = exam.completado && exam.ultimo_puntaje !== null;
  const passed = hasScore && exam.ultimo_puntaje >= 85;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#DDE7F2] bg-white p-5 shadow-xs transition-all hover:border-[#2457D6]/40 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-[#EAF1FF] px-2.5 py-0.5 text-[11px] font-black text-[#2457D6]">
            {trLicense(exam.clase_licencia)}
          </span>

          {isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-black text-amber-700">
              <Crown className="h-3 w-3" />
              Premium
            </span>
          ) : exam.completado ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                passed
                  ? 'bg-[#E7F8EF] text-[#148449]'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {passed ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <HelpCircle className="h-3 w-3" />
              )}
              {tr('Nota:', 'Score:')} {exam.ultimo_puntaje}%
            </span>
          ) : (
            <span className="rounded-full bg-[#E7F8EF] px-2 py-0.5 text-[10px] font-bold text-[#148449]">
              {tr('Gratis', 'Free')}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-base font-black text-[#173B63]">
          {trExamName(exam.nombre)}
        </h3>

        <p className="mt-0.5 text-xs font-semibold text-[#6C7B90]">
          {trCategory(exam.categoria)}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs font-bold text-[#516B88]">
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-[#2457D6]" />
            {exam.total_preguntas} {tr('preguntas', 'questions')}
          </span>

          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#2457D6]" />
            {exam.total_preguntas <= 15
              ? tr('15 minutos', '15 mins')
              : tr('45 minutos', '45 mins')}
          </span>
        </div>
      </div>

      {isLocked ? (
        <button
          type="button"
          onClick={onUnlock}
          className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-black text-white shadow-xs hover:opacity-95 transition"
        >
          <Lock className="h-3.5 w-3.5" />
          <span>
            {tr('Desbloquear con Premium', 'Unlock with Premium')}
          </span>
        </button>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onStartExam('exam')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2457D6] py-2.5 text-xs font-black text-white transition hover:bg-blue-700"
          >
            <Play className="h-3.5 w-3.5" />
            {tr('Examen', 'Exam Mode')}
          </button>

          <button
            type="button"
            onClick={() => onStartExam('study')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#14966F] bg-[#EAF8F1] py-2.5 text-xs font-black text-[#14966F] transition hover:bg-green-100"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {tr('Estudio', 'Study Mode')}
          </button>
        </div>
      )}
    </div>
  );
}
