import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Flag,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { apiFetch } from '../api';

export default function ExamPage() {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'study' ? 'study' : 'exam';
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

  useEffect(() => {
    setLoading(true);
    apiFetch(`/tests/${testId}`)
      .then((data) => {
        setExam(data);
        setQuestions(data.questions || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) {
    return <div className="p-10 text-center text-sm font-bold">Cargando examen...</div>;
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
    reviewMode || (mode === 'study' && checkedQuestions[currentQ.id]);

  const toggleOption = (letter) => {
    if (resultData && !reviewMode) return;
    if (reviewMode) return;
    if (mode === 'study' && checkedQuestions[currentQ.id]) return;

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
    try {
      const payload = {
        mode,
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
    setAnswers({});
    setCheckedQuestions({});
    setResultData(null);
    setReviewMode(false);
    setCurrentIndex(0);
  };

  // Vista Resumen de Resultados
  if (resultData && !reviewMode) {
    const passed = resultData.aprobado;
    return (
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[#D7E4F6] bg-white p-6 shadow-sm">
        <div
          className={`rounded-2xl p-6 text-center ${
            passed ? 'bg-[#E7F8EF] text-[#148449]' : 'bg-amber-50 text-amber-800'
          }`}
        >
          <p className="text-xs font-black uppercase tracking-wider">
            {exam.nombre} ({exam.clase_licencia})
          </p>
          <h1 className="mt-1 text-3xl font-black">
            {passed ? '¡Examen Aprobado! 🎉' : 'Necesitas Reforzar 📚'}
          </h1>
          <p className="mt-2 text-sm font-bold">
            Obtuviste {resultData.correctas} de {resultData.total_preguntas} correctas ({resultData.puntaje}%)
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-[#F4F7FB] p-3">
            <p className="text-xs text-[#647084]">Correctas</p>
            <p className="text-xl font-black text-[#14966F]">{resultData.correctas}</p>
          </div>
          <div className="rounded-xl bg-[#F4F7FB] p-3">
            <p className="text-xs text-[#647084]">Incorrectas</p>
            <p className="text-xl font-black text-[#D92D20]">
              {resultData.total_preguntas - resultData.correctas}
            </p>
          </div>
          <div className="rounded-xl bg-[#F4F7FB] p-3">
            <p className="text-xs text-[#647084]">Puntaje</p>
            <p className="text-xl font-black text-[#2457D6]">{resultData.puntaje}%</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setReviewMode(true);
            }}
            className="flex-1 rounded-xl bg-[#2457D6] py-3 text-xs font-black text-white hover:bg-blue-700"
          >
            Revisar Corrección Detallada
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#C7D8FA] px-4 py-3 text-xs font-black text-[#2457D6] hover:bg-[#F4F7FF]"
          >
            <RotateCcw className="h-4 w-4" />
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-[#516B88] hover:bg-slate-50"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pt-6">
      {/* Cabecera del Examen */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-black text-[#2457D6] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Salir al menú
        </button>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#EAF1FF] px-3 py-1 text-xs font-black text-[#2457D6]">
            {reviewMode ? 'Revisión de Corrección' : mode === 'study' ? 'Modo Estudio' : 'Modo Examen'}
          </span>
          <span className="rounded-full border border-[#D8E1EF] bg-white px-3 py-1 text-xs font-bold text-[#647084]">
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
        </div>
      </div>

      {/* Tarjeta de Pregunta */}
      <div className="rounded-2xl border border-[#D8E1EF] bg-white p-6 shadow-xs">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-[#F4F7FB] px-2.5 py-1 text-[11px] font-bold text-[#647084]">
            {currentQ.categoria}
          </span>
          {currentQ.is_multiple && (
            <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              Selección Múltiple
            </span>
          )}
        </div>

        <h2 className="text-lg font-black leading-snug text-[#172033]">{currentQ.texto}</h2>

        {/* Alternativas */}
        <div className="mt-5 space-y-2.5">
          {Object.entries(currentQ.alternativas).map(([letter, text]) => {
            const isSelected = selected.includes(letter);
            const isCorrectOption = (currentQ.correct_answers || []).includes(letter);

            let style = 'border-[#D8E1EF] bg-white hover:border-[#2457D6]';
            if (showImmediateFeedback) {
              if (isCorrectOption) {
                style = 'border-[#14966F] bg-[#EAF8F1] text-[#0F6B50]';
              } else if (isSelected) {
                style = 'border-[#D92D20] bg-[#FFF1F0] text-[#B42318]';
              }
            } else if (isSelected) {
              style = 'border-[#2457D6] bg-[#EAF1FF] text-[#173B8F]';
            }

            return (
              <button
                key={letter}
                type="button"
                onClick={() => toggleOption(letter)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition ${style}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border font-black text-xs">
                  {letter}
                </span>
                <span className="flex-1 font-medium">{text}</span>
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

        {/* Explicación pedagógica en Modo Estudio o Revisión */}
        {showImmediateFeedback && currentQ.explicacion && (
          <div className="mt-5 flex gap-3 rounded-xl border border-blue-200 bg-[#F4F7FF] p-4 text-xs text-[#173B63]">
            <Lightbulb className="h-5 w-5 shrink-0 text-[#2457D6]" />
            <div>
              <p className="font-black text-[#2457D6]">Explicación Oficial:</p>
              <p className="mt-0.5 leading-relaxed">{currentQ.explicacion}</p>
            </div>
          </div>
        )}

        {/* Controles de Navegación */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
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
            {mode === 'study' && !reviewMode && !checkedQuestions[currentQ.id] && (
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() =>
                  setCheckedQuestions((prev) => ({ ...prev, [currentQ.id]: true }))
                }
                className="rounded-xl bg-[#14966F] px-4 py-2.5 text-xs font-black text-white disabled:opacity-40"
              >
                Comprobar respuesta
              </button>
            )}

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2457D6] px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700"
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
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitExam}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#22B968] px-5 py-2.5 text-xs font-black text-white hover:bg-[#148449]"
              >
                <Flag className="h-4 w-4" />
                {submitting ? 'Enviando...' : 'Finalizar Examen'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grilla rápida de preguntas */}
      <div className="mt-4 flex flex-wrap gap-1.5 rounded-2xl border border-[#D8E1EF] bg-white p-4">
        {questions.map((q, idx) => {
          const hasAns = (answers[q.id] || []).length > 0;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-8 w-8 rounded-lg text-xs font-black transition ${
                isCurrent
                  ? 'bg-[#172033] text-white'
                  : hasAns
                    ? 'bg-[#EAF1FF] text-[#2457D6] border border-[#2457D6]'
                    : 'bg-[#F4F7FB] text-[#647084]'
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