import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setSubmitting(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-[#D7E4F6] bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black text-[#173B63]">
        {tr('Iniciar Sesión', 'Sign In')}
      </h1>
      <p className="mt-1 text-sm text-[#6C7B90]">
        {tr(
          'Ingresa a VialApp para practicar tus exámenes teóricos.',
          'Sign in to VialApp to practice your driving theory exams.'
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
            {tr('Correo o Usuario', 'Email or Username')}
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@vialapp.cl"
            className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#173B63]">
            {tr('Contraseña', 'Password')}
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#2457D6] py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting
            ? tr('Ingresando...', 'Signing in...')
            : tr('Entrar', 'Sign In')}
        </button>
      </form>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => handleDemoLogin('demo@vialapp.cl', '12345678')}
          className="w-full rounded-xl border border-[#22B968] bg-[#E7F8EF] py-2.5 text-xs font-black text-[#148449] hover:bg-green-100"
        >
          {tr(
            '⚡ Entrar con Cuenta Alumno Demo (demo@vialapp.cl)',
            '⚡ Quick Login: Student Demo (demo@vialapp.cl)'
          )}
        </button>

        <button
          type="button"
          onClick={() => handleDemoLogin('admin@vialapp.cl', 'admin123')}
          className="w-full rounded-xl border border-purple-200 bg-purple-50 py-2.5 text-xs font-black text-purple-700 hover:bg-purple-100"
        >
          {tr(
            '👑 Entrar como Administrador (admin@vialapp.cl)',
            '👑 Quick Login: Administrator (admin@vialapp.cl)'
          )}
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-[#6C7B90]">
        {tr('¿No tienes cuenta?', "Don't have an account?")}{' '}
        <Link to="/register" className="font-bold text-[#2457D6] underline">
          {tr('Regístrate aquí', 'Sign up here')}
        </Link>
      </p>
    </div>
  );
}