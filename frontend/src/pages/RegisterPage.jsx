import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
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
      <h1 className="text-2xl font-black text-[#173B63]">Crear Cuenta</h1>
      <p className="mt-1 text-sm text-[#6C7B90]">
        Regístrate para guardar tu progreso e historial de ensayos.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#173B63]">Nombre de usuario</label>
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
          <label className="block text-xs font-bold text-[#173B63]">Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.cl"
            className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#173B63]">Clase de Licencia</label>
          <select
            value={licenseClass}
            onChange={(e) => setLicenseClass(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
          >
            <option value="Clase B">Clase B (Automóviles)</option>
            <option value="Clase C">Clase C (Motocicletas)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#173B63]">Contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-sm focus:border-[#2457D6] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#22B968] py-3 text-sm font-black text-white hover:bg-[#148449] disabled:opacity-50"
        >
          {submitting ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-[#6C7B90]">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-bold text-[#2457D6] underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}