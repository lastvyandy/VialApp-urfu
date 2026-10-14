import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-sm font-bold">Cargando sesión...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function DashboardPlaceholder() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-2xl border border-[#C9D9FF] bg-[#EAF1FF] p-6">
        <h1 className="text-2xl font-black">¡Hola, {user?.username}! 👋</h1>
        <p className="mt-1 text-sm text-[#516B88]">
          Sesión conectada exitosamente con el Backend en Docker.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5F8FD]">
          <Navbar />
          <main className="px-4 pb-12">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <DashboardPlaceholder />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}