import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  FileText,
  History,
  BookOpen,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Exámenes', path: '/examenes', icon: FileText },
    { name: 'Glosario', path: '/glosario', icon: BookOpen },
    { name: 'Historial', path: '/historial', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#D7E4F6] bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2457D6] text-white shadow-xs">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base font-black text-[#173B63]">VialApp</span>
              <span className="rounded-md bg-[#EAF1FF] px-1.5 py-0.5 text-[10px] font-black text-[#2457D6]">
                PRO
              </span>
            </div>
            <p className="text-[10px] font-semibold text-[#6C7B90]">Simulador CONASET</p>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Links de navegación */}
            <nav className="flex items-center gap-1 sm:gap-1.5">
              {navLinks.map(({ name, path, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                      isActive
                        ? 'bg-[#2457D6] text-white shadow-xs'
                        : 'text-[#516B88] hover:bg-[#F4F7FF] hover:text-[#2457D6]'
                    }`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    <span>{name}</span>
                  </Link>
                );
              })}

              {user.is_admin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                    location.pathname === '/admin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Menú de Perfil & Salir */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4">
              <Link
                to="/perfil"
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                  location.pathname === '/perfil'
                    ? 'bg-[#EAF1FF] text-[#2457D6]'
                    : 'text-[#173B63] hover:bg-slate-100'
                }`}
                title="Mi Perfil"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2457D6] text-white text-[11px] font-black">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline font-black">{user.username}</span>
                {user.is_premium && (
                  <Crown className="h-3.5 w-3.5 text-amber-500" title="Cuenta Premium" />
                )}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-xl border border-slate-200 p-2 text-xs font-bold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                title="Cerrar sesión"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}