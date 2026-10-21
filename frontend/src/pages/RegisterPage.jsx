import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseClass, setLicenseClass] = useState('Clase B');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ username, email, password, license_class: licenseClass });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-[#D7E4F6] bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black text-[#173B63]">
        {tr('Crear Cuenta', 'Create Account')}
      </h1>
      <p className="mt-1 text-sm text-[#6C7B90]">
        {tr(
          'Regístrate para guardar tu progreso e historial de ensayos.',
          'Sign up to save your progress and mock exam history.'
        )}
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#173B63]">
            {tr('Nombre de usuario', 'Username')}
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="jorge_urfu"
            className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#173B63]">
            {tr('Correo electrónico', 'Email address')}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@urfu.ru"
            className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#173B63]">
            {tr('Clase de Licencia', 'License Class')}
          </label>
          <select
            value={licenseClass}
            onChange={(e) => setLicenseClass(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
          >
            <option value="Clase B">{tr('Clase B (Automóviles)', 'Class B (Cars)')}</option>
            <option value="Clase C">{tr('Clase C (Motocicletas)', 'Class C (Motorcycles)')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#173B63]">
            {tr('Contraseña', 'Password')}
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={tr('Mínimo 6 caracteres', 'At least 6 characters')}
            className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#22B968] py-3 text-sm font-black text-white hover:bg-[#148449] disabled:opacity-50"
        >
          {submitting
            ? tr('Registrando...', 'Creating account...')
            : tr('Crear cuenta', 'Create account')}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-[#6C7B90]">
        {tr('¿Ya tienes cuenta?', 'Already have an account?')}{' '}
        <Link to="/login" className="font-bold text-[#2457D6] underline">
          {tr('Inicia sesión', 'Sign in')}
        </Link>
      </p>
    </div>
  );
}