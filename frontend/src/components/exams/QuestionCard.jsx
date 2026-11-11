
import {
  CheckCircle2,
  XCircle,
  Lightbulb
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

export default function QuestionCard({
  question,
  selected,
  showImmediateFeedback,
  onSelectOption
}) {
  const { tr, trCategory } = useLanguage();

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-[#F4F7FB] px-2.5 py-1 text-[11px] font-bold text-[#647084]">
          {trCategory(question.categoria)}
        </span>

        {question.is_multiple && (
          <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            {tr('Selección Múltiple', 'Multiple Choice')}
          </span>
        )}
      </div>

      <h2 className="text-lg sm:text-xl font-black leading-snug text-[#172033]">
        {question.texto}
      </h2>

      {/* Alternativas */}
      <div className="mt-6 space-y-3">
        {Object.entries(question.alternativas).map(([letter, text]) => {
          const isSelected = selected.includes(letter);
          const isCorrectOption =
            (question.correct_answers || []).includes(letter);

          let style =
            'border-[#D8E1EF] bg-white hover:border-[#2457D6] hover:bg-[#F9FBFF]';

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
              onClick={() => onSelectOption(letter)}
              className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left text-sm transition ${style}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border font-black text-xs">
                {letter}
              </span>

              <span className="flex-1 font-medium leading-relaxed">
                {text}
              </span>

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

      {/* Explicación de la respuesta */}
      {showImmediateFeedback && question.explicacion && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-blue-200 bg-[#F4F7FF] p-4 text-xs text-[#173B63]">
          <Lightbulb className="h-5 w-5 shrink-0 text-[#2457D6]" />

          <div>
            <p className="font-black text-[#2457D6]">
              {tr('Explicación Oficial:', 'Official Explanation:')}
            </p>

            <p className="mt-0.5 leading-relaxed">
              {question.explicacion}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
