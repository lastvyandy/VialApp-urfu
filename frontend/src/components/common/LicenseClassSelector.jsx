
import { useLanguage } from '../../context/LanguageContext';

const LICENSE_OPTIONS = ['Clase B', 'Clase C'];

export default function LicenseClassSelector({
  value,
  onChange,
  variant = 'inline'
}) {
  const { tr, trLicense } = useLanguage();

  if (variant === 'card') {
    return (
      <div className="rounded-2xl border border-[#D7E4F6] bg-white/90 p-5 shadow-xs backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#6C7B90]">
            {tr('Tu Licencia Objetivo', 'Target License Class')}
          </span>

          <span className="rounded-md bg-[#EAF1FF] px-2 py-0.5 text-xs font-black text-[#2457D6]">
            {trLicense(value)}
          </span>
        </div>

        <p className="mb-4 text-xs text-[#516B88]">
          {tr(
            'Los ensayos se adaptarán automáticamente a los contenidos y exigencias de tu clase.',
            'Mock exams automatically adapt to the curriculum and requirements of your selected class.'
          )}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {LICENSE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-xl border py-2.5 text-xs font-black transition ${
                value === option
                  ? 'border-[#2457D6] bg-[#2457D6] text-white shadow-xs'
                  : 'border-[#C7D8FA] bg-white text-[#2457D6] hover:bg-[#F4F7FF]'
              }`}
            >
              {trLicense(option)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-[#C7D8FA] bg-white p-1.5 shadow-xs">
      <span className="pl-2 text-xs font-extrabold text-[#6C7B90]">
        {tr('Clase:', 'Class:')}
      </span>

      {LICENSE_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
            value === option
              ? 'bg-[#2457D6] text-white shadow-xs'
              : 'text-[#2457D6] hover:bg-[#F4F7FF]'
          }`}
        >
          {trLicense(option)}
        </button>
      ))}
    </div>
  );
}
