import { Repeat, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ExamResult({
  exam,
  resultData,
  onPracticeMistakes,
  onReview,
  onRetry,
  onBackToExams
}) {
  const { tr, trLicense, trExamName } = useLanguage();

  const passed = resultData.aprobado;
  const totalErrors = resultData.total_preguntas - resultData.correctas;

  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-[#D7E4F6] bg-white p-6 sm:p-8 shadow-xs">
      <div
        className={`rounded-2xl p-6 text-center ${
          passed ? 'bg-[#E7F8EF] text-[#148449]' : 'bg-amber-50 text-amber-800'
        }`}
      >
        <p className="text-xs font-black uppercase tracking-wider">
          {trExamName(exam.nombre)} ({trLicense(exam.clase_licencia)})
        </p>
        <h1 className="mt-1 text-3xl font-black">
          {passed
            ? tr('¡Examen Aprobado! 🎉', 'Exam Passed! 🎉')
            : tr('Examen Reprobado 📚', 'Exam Failed 📚')}
        </h1>
        <p className="mt-2 text-sm font-bold">
          {passed
            ? tr(
                'Has demostrado dominio para aprobar el examen teórico de CONASET.',
                'You have demonstrated sufficient mastery to pass the CONASET theory exam.'
              )
            : tr(
                'Superaste el límite de errores permitidos para aprobar.',
                'You exceeded the maximum number of errors allowed to pass.'
              )}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-[#F4F7FB] p-4">
          <p className="text-xs font-bold text-[#647084]">{tr('Correctas', 'Correct')}</p>
          <p className="text-2xl font-black text-[#14966F]">{resultData.correctas}</p>
        </div>
        <div className="rounded-2xl bg-[#F4F7FB] p-4">
          <p className="text-xs font-bold text-[#647084]">{tr('Incorrectas', 'Incorrect')}</p>
          <p className="text-2xl font-black text-[#D92D20]">{totalErrors}</p>
        </div>
        <div className="rounded-2xl bg-[#F4F7FB] p-4">
          <p className="text-xs font-bold text-[#647084]">{tr('Puntaje Final', 'Final Score')}</p>
          <p className="text-2xl font-black text-[#2457D6]">{resultData.puntaje}%</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {totalErrors > 0 && (
          <button
            type="button"
            onClick={onPracticeMistakes}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#14966F] py-3.5 text-xs font-black text-white shadow-md hover:bg-[#0F6B50] transition"
          >
            <Repeat className="h-4 w-4" />
            <span>
              {tr(
                `Practicar solo mis ${totalErrors} fallos (Modo Refuerzo)`,
                `Practice only my ${totalErrors} mistakes (Reinforcement Mode)`
              )}
            </span>
          </button>
        )}

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onReview}
            className="flex-1 rounded-xl bg-[#2457D6] py-3 text-xs font-black text-white hover:bg-blue-700 transition"
          >
            {tr('Revisar Corrección Detallada', 'Review Detailed Correction')}
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#C7D8FA] px-4 py-3 text-xs font-black text-[#2457D6] hover:bg-[#F4F7FF] transition"
          >
            <RotateCcw className="h-4 w-4" />
            {tr('Reintentar Todo', 'Retry Full Exam')}
          </button>
          <button
            type="button"
            onClick={onBackToExams}
            className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-[#516B88] hover:bg-slate-50 transition"
          >
            {tr('Lista de Exámenes', 'Back to Exams')}
          </button>
        </div>
      </div>
    </div>
  );
}
