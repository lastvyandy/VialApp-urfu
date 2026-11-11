
import { useId } from 'react';

export default function TextInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  minLength
}) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-bold text-[#173B63]"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
      />
    </div>
  );
}
