import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ExamsListPage from './pages/ExamsListPage';
import ExamPage from './pages/ExamPage';
import HistoryPage from './pages/HistoryPage';
import GlossaryPage from './pages/GlossaryPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminPage from './pages/AdminPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const { tr } = useLanguage();
  if (loading) {
    return (
      <div className="p-8 text-center text-sm font-bold">
        {tr('Cargando sesión...', 'Loading session...')}
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function HomeOrLanding() {
  const { user, loading } = useAuth();
  const { tr } = useLanguage();
  if (loading) {
    return (
      <div className="p-8 text-center text-sm font-bold">
        {tr('Cargando...', 'Loading...')}
      </div>
    );
  }
  return user ? <HomePage /> : <LandingPage />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#F5F8FD]">
            <Navbar />
            <main className="px-4 pb-12">
              <Routes>
                <Route path="/" element={<HomeOrLanding />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/glosario" element={<GlossaryPage />} />
                <Route
                  path="/examenes"
                  element={
                    <PrivateRoute>
                      <ExamsListPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/test/:testId"
                  element={
                    <PrivateRoute>
                      <ExamPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/historial"
                  element={
                    <PrivateRoute>
                      <HistoryPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/planes"
                  element={
                    <PrivateRoute>
                      <SubscriptionPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <AdminPage />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}