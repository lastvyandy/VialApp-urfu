import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Flag,
  Lightbulb,
  RotateCcw,
  Clock,
  AlertTriangle,
  Repeat,
} from 'lucide-react';
import { apiFetch } from '../api';

export default function ExamPage() {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'study' ? 'study' : 'exam';
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});
  const [resultData, setResultData] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modo actual y práctica de errores
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [isErrorPractice, setIsErrorPractice] = useState(false);
  const originalQuestionsRef = useRef([]);

  // Temporizador regresivo
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/tests/${testId}`)
      .then((data) => {
        setExam(data);
        const qs = data.questions || [];
        setQuestions(qs);
        originalQuestionsRef.current = qs;
        // 15 min para tests express (<=15 preg), 45 min para exámenes oficiales
        const totalDuration = qs.length <= 15 ? 15 * 60 : 45 * 60;
        setTimeLeft(totalDuration);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [testId]);

  useEffect(() => {
    if (currentMode !== 'exam' || resultData || reviewMode || loading || isErrorPractice) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentMode, resultData, reviewMode, loading, isErrorPractice]);

  const handleTimeExpired = async () => {
    alert('⏱️ El tiempo ha finalizado. Tu examen se calificará con las respuestas marcadas.');
    await handleSubmitExam();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="p-10 text-center text-sm font-bold">Cargando simulación...</div>;
  }

  if (error || !exam || questions.length === 0) {
    return (
      <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-red-50 p-6 text-center text-sm font-bold text-red-600">
        {error || 'No se encontraron preguntas para este examen.'}
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selected = answers[currentQ.id] || [];
  const showImmediateFeedback =
    reviewMode || (currentMode === 'study' && checkedQuestions[currentQ.id]);

  const toggleOption = (letter) => {
    if (resultData && !reviewMode) return;
    if (reviewMode) return;
    if (currentMode === 'study' && checkedQuestions[currentQ.id]) return;

    setAnswers((prev) => {
      const current = prev[currentQ.id] || [];
      if (!currentQ.is_multiple) {
        return { ...prev, [currentQ.id]: [letter] };
      }
      const next = current.includes(letter)
        ? current.filter((l) => l !== letter)
        : [...current, letter];
      return { ...prev, [currentQ.id]: next };
    });
  };

  const handleSubmitExam = async () => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const payload = {
        mode: currentMode,
        answers: Object.entries(answers).map(([qId, resp]) => ({
          question_id: Number(qId),
          respuestas: resp,
        })),
      };
      const res = await apiFetch(`/tests/${testId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setResultData(res);
      setReviewMode(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setQuestions(originalQuestionsRef.current);
    setAnswers({});
    setCheckedQuestions({});
    setResultData(null);
    setReviewMode(false);
    setIsErrorPractice(false);
    setCurrentMode(initialMode);
    setCurrentIndex(0);
    const totalDuration = originalQuestionsRef.current.length <= 15 ? 15 * 60 : 45 * 60;
    setTimeLeft(totalDuration);
  };

  const startErrorPractice = () => {
    if (!resultData?.resultados) return;
    const failedIds = new Set(
      resultData.resultados.filter((r) => !r.is_correct).map((r) => r.question_id)
    );
    const failedQuestions = originalQuestionsRef.current.filter((q) => failedIds.has(q.id));

    if (failedQuestions.length === 0) return;

    setQuestions(failedQuestions);
    setAnswers({});
    setCheckedQuestions({});
    setResultData(null);
    setReviewMode(false);
    setIsErrorPractice(true);
    setCurrentMode('study');
    setCurrentIndex(0);
  };

  if (resultData && !reviewMode) {
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
            {exam.nombre} ({exam.clase_licencia})
          </p>
          <h1 className="mt-1 text-3xl font-black">
            {passed ? '¡Examen Aprobado! 🎉' : 'Examen Reprobado 📚'}
          </h1>
          <p className="mt-2 text-sm font-bold">
            {passed
              ? 'Has demostrado dominio para aprobar el examen teórico de CONASET.'
              : 'Superaste el límite de errores permitidos para aprobar.'}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-[#F4F7FB] p-4">
            <p className="text-xs font-bold text-[#647084]">Correctas</p>
            <p className="text-2xl font-black text-[#14966F]">{resultData.correctas}</p>
          </div>
          <div className="rounded-2xl bg-[#F4F7FB] p-4">
            <p className="text-xs font-bold text-[#647084]">Incorrectas</p>
            <p className="text-2xl font-black text-[#D92D20]">{totalErrors}</p>
          </div>
          <div className="rounded-2xl bg-[#F4F7FB] p-4">
            <p className="text-xs font-bold text-[#647084]">Puntaje Final</p>
            <p className="text-2xl font-black text-[#2457D6]">{resultData.puntaje}%</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          {totalErrors > 0 && (
            <button
              type="button"
              onClick={startErrorPractice}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#14966F] py-3.5 text-xs font-black text-white shadow-md hover:bg-[#0F6B50] transition"
            >
              <Repeat className="h-4 w-4" />
              <span>Practicar solo mis {totalErrors} fallos (Modo Refuerzo)</span>
            </button>
          )}

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setReviewMode(true);
              }}
              className="flex-1 rounded-xl bg-[#2457D6] py-3 text-xs font-black text-white hover:bg-blue-700 transition"
            >
              Revisar Corrección Detallada
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#C7D8FA] px-4 py-3 text-xs font-black text-[#2457D6] hover:bg-[#F4F7FF] transition"
            >
              <RotateCcw className="h-4 w-4" />
              Reintentar Todo
            </button>
            <button
              type="button"
              onClick={() => navigate('/examenes')}
              className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-[#516B88] hover:bg-slate-50 transition"
            >
              Lista de Exámenes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isTimerUrgent = currentMode === 'exam' && timeLeft <= 180;

  return (
    <div className="mx-auto max-w-4xl pt-6">
      {/* Modal de confirmación para salir */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-black text-base">
              <AlertTriangle className="h-5 w-5" />
              <span>¿Abandonar el examen?</span>
            </div>
            <p className="text-xs text-[#516B88] leading-relaxed">
              Si sales ahora se perderá el progreso de este intento. ¿Deseas salir al menú o continuar respondiendo?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-[#516B88] hover:bg-slate-50"
              >
                Continuar examen
              </button>
              <button
                type="button"
                onClick={() => navigate('/examenes')}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700"
              >
                Sí, abandonar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Práctica de Errores Activa */}
      {isErrorPractice && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-green-200 bg-[#EAF8F1] p-3 text-xs text-[#0F6B50]">
          <div className="flex items-center gap-2 font-black">
            <Repeat className="h-4 w-4" />
            <span>Modo Refuerzo Activo: Repasando únicamente preguntas en que te equivocaste</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-bold text-[#14966F] underline"
          >
            Restaurar examen completo
          </button>
        </div>
      )}

      {/* Cabecera del Examen */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            if (resultData || reviewMode || isErrorPractice) navigate('/examenes');
            else setShowExitConfirm(true);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-black text-[#2457D6] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Salir al menú
        </button>

        <div className="flex items-center gap-2">
          {currentMode === 'exam' && !reviewMode && (
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black transition ${
                isTimerUrgent
                  ? 'bg-red-100 text-red-700 animate-pulse'
                  : 'bg-[#EAF1FF] text-[#2457D6]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}

          <span className="rounded-full bg-[#EAF1FF] px-3 py-1 text-xs font-black text-[#2457D6]">
            {reviewMode
              ? 'Revisión Detallada'
              : isErrorPractice
                ? 'Práctica de Fallos'
                : currentMode === 'study'
                  ? 'Modo Estudio'
                  : 'Modo Examen'}
          </span>

          <span className="rounded-full border border-[#D8E1EF] bg-white px-3 py-1 text-xs font-bold text-[#647084]">
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
        </div>
      </div>

      {/* Tarjeta de Pregunta */}
      <div className="rounded-3xl border border-[#D8E1EF] bg-white p-6 sm:p-8 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-md bg-[#F4F7FB] px-2.5 py-1 text-[11px] font-bold text-[#647084]">
            {currentQ.categoria}
          </span>
          {currentQ.is_multiple && (
            <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              Selección Múltiple
            </span>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-black leading-snug text-[#172033]">
          {currentQ.texto}
        </h2>

        {/* Alternativas */}
        <div className="mt-6 space-y-3">
          {Object.entries(currentQ.alternativas).map(([letter, text]) => {
            const isSelected = selected.includes(letter);
            const isCorrectOption = (currentQ.correct_answers || []).includes(letter);

            let style = 'border-[#D8E1EF] bg-white hover:border-[#2457D6] hover:bg-[#F9FBFF]';
            if (showImmediateFeedback) {
              if (isCorrectOption) {
                style = 'border-[#14966F] bg-[#EAF8F1] text-[#0F6B50]';
              } else if (isSelected) {
                style = 'border-[#D92D20] bg-[#FFF1F0] text-[#B42318]';
              }
            } else if (isSelected) {
              style = 'border-[#2457D6] bg-[#EAF1FF] text-[#173B8F] shadow-xs';
            }

            return (
              <button
                key={letter}
                type="button"
                onClick={() => toggleOption(letter)}
                className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left text-sm transition ${style}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border font-black text-xs">
                  {letter}
                </span>
                <span className="flex-1 font-medium leading-relaxed">{text}</span>
                {showImmediateFeedback && isCorrectOption && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#14966F]" />
                )}
                {showImmediateFeedback && !isCorrectOption && isSelected && (
                  <XCircle className="h-5 w-5 shrink-0 text-[#D92D20]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explicación pedagógica */}
        {showImmediateFeedback && currentQ.explicacion && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-blue-200 bg-[#F4F7FF] p-4 text-xs text-[#173B63]">
            <Lightbulb className="h-5 w-5 shrink-0 text-[#2457D6]" />
            <div>
              <p className="font-black text-[#2457D6]">Explicación Oficial:</p>
              <p className="mt-0.5 leading-relaxed">{currentQ.explicacion}</p>
            </div>
          </div>
        )}

        {/* Controles de Navegación */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8E1EF] px-4 py-2.5 text-xs font-bold text-[#46566E] disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </button>

          <div className="flex items-center gap-2">
            {currentMode === 'study' && !reviewMode && !checkedQuestions[currentQ.id] && (
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() =>
                  setCheckedQuestions((prev) => ({ ...prev, [currentQ.id]: true }))
                }
                className="rounded-xl bg-[#14966F] px-4 py-2.5 text-xs font-black text-white hover:bg-[#0F6B50] disabled:opacity-40 transition"
              >
                Comprobar respuesta
              </button>
            )}

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2457D6] px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 transition"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : reviewMode ? (
              <button
                type="button"
                onClick={() => setReviewMode(false)}
                className="rounded-xl bg-[#173B63] px-5 py-2.5 text-xs font-black text-white"
              >
                Volver al Resumen
              </button>
            ) : isErrorPractice ? (
              <button
                type="button"
                onClick={() => {
                  alert('¡Felicitaciones! Has completado el repaso de tus preguntas erradas.');
                  handleReset();
                }}
                className="rounded-xl bg-[#14966F] px-5 py-2.5 text-xs font-black text-white"
              >
                Finalizar Práctica de Fallos
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitExam}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#22B968] px-5 py-2.5 text-xs font-black text-white hover:bg-[#148449] transition shadow-md"
              >
                <Flag className="h-4 w-4" />
                {submitting ? 'Calificando...' : 'Finalizar Examen'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grilla de Acceso Rápido */}
      <div className="mt-4 flex flex-wrap gap-1.5 rounded-2xl border border-[#D8E1EF] bg-white p-4 shadow-xs">
        {questions.map((q, idx) => {
          const hasAns = (answers[q.id] || []).length > 0;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-8 w-8 rounded-xl text-xs font-black transition ${
                isCurrent
                  ? 'bg-[#172033] text-white shadow-xs'
                  : hasAns
                    ? 'border border-[#2457D6] bg-[#EAF1FF] text-[#2457D6]'
                    : 'bg-[#F4F7FB] text-[#647084] hover:bg-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}