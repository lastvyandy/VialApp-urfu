import { Link, useNavigate } from 'react-router-dom';
import { Car, History, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-[#D7E4F6] bg-white shadow-xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-black text-[#173B63]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2457D6] text-white">
            <Car className="h-5 w-5" />
          </div>
          <span>VialApp <span className="text-xs font-bold text-[#2457D6]">MVP</span></span>
        </Link>

        {user && (
          <nav className="flex items-center gap-4">
            <Link
              to="/historial"
              className="flex items-center gap-1.5 text-sm font-bold text-[#516B88] hover:text-[#2457D6]"
            >
              <History className="h-4 w-4" />
              <span>Historial</span>
            </Link>

            <div className="flex items-center gap-1.5 rounded-full bg-[#EAF1FF] px-3 py-1 text-xs font-bold text-[#2457D6]">
              <UserIcon className="h-3.5 w-3.5" />
              <span>{user.username}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Salir</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}