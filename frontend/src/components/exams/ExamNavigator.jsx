
export default function ExamNavigator({
  questions,
  answers,
  currentIndex,
  onSelectQuestion
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-1.5 rounded-2xl border border-[#D8E1EF] bg-white p-4 shadow-xs">
      {questions.map((q, idx) => {
        const hasAns = (answers[q.id] || []).length > 0;
        const isCurrent = idx === currentIndex;

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelectQuestion(idx)}
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
  );
}
