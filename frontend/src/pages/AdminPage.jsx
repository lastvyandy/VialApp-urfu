import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  FileQuestion,
  GraduationCap,
  Award,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
  KeyRound,
  Trash2,
  Crown,
  Search,
  BookOpen,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../api';

export default function AdminPage() {
  const { tr, trCategory, trLicense } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [summary, setSummary] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const [claseLicencia, setClaseLicencia] = useState('Clase B');
  const [categoria, setCategoria] = useState('Mixto');
  const [numQuestions, setNumQuestions] = useState(35);
  const [cantidad, setCantidad] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');
  const [genError, setGenError] = useState('');

  const [questionSearch, setQuestionSearch] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Todas');

  const loadAll = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [sumData, usersData] = await Promise.all([
        apiFetch('/admin/summary'),
        apiFetch('/admin/users'),
      ]);
      setSummary(sumData);
      setUsersList(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setLoadError(err.message || 'Error loading admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadQuestions = async () => {
    try {
      const qs = await apiFetch(
        `/admin/questions?categoria=${encodeURIComponent(questionCategory)}&search=${encodeURIComponent(questionSearch)}&limit=60`
      );
      setQuestionsList(Array.isArray(qs) ? qs : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') {
      loadQuestions();
    }
  }, [activeTab, questionCategory, questionSearch]);

  const handleUserUpdate = async (userId, payload, message) => {
    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await loadAll();
      if (message) alert(message);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (
      !window.confirm(
        tr(
          `¿Estás seguro de eliminar permanentemente a "${username}"?`,
          `Are you sure you want to permanently delete "${username}"?`
        )
      )
    )
      return;
    try {
      await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
      await loadAll();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    setGenMessage('');
    setGenError('');
    setGenerating(true);

    try {
      const res = await apiFetch(
        `/admin/tests/generate?clase_licencia=${encodeURIComponent(
          claseLicencia
        )}&categoria=${encodeURIComponent(categoria)}&num_questions=${numQuestions}&cantidad=${cantidad}`,
        { method: 'POST' }
      );
      setGenMessage(res.message);
      await loadAll();
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = userSearch.toLowerCase().trim();
      const matchQuery =
        !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole =
        roleFilter === 'all' || (roleFilter === 'admin' ? u.is_admin : !u.is_admin);
      const matchPlan =
        planFilter === 'all' || (planFilter === 'premium' ? u.is_premium : !u.is_premium);
      return matchQuery && matchRole && matchPlan;
    });
  }, [usersList, userSearch, roleFilter, planFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pt-6">
      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#C9D9FF] bg-gradient-to-r from-[#EAF1FF] via-white to-[#F0F5FF] p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2457D6] text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#173B63]">
                {tr('Panel de Control Ejecutivo', 'Executive Admin Dashboard')}
              </h1>
              <p className="text-xs font-semibold text-[#516B88]">
                {tr(
                  'Gestión avanzada de simuladores, banco CONASET y cuentas de estudiantes.',
                  'Advanced management of mock exams, CONASET question bank, and student accounts.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#C7D8FA] bg-white px-3 py-2 text-xs font-bold text-[#2457D6] hover:bg-[#F4F7FF]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{tr('Actualizar', 'Refresh')}</span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2457D6] px-4 py-2 text-xs font-black text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{tr('Volver a la App', 'Back to App')}</span>
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Métricas */}
      {summary && (
        <div className="grid gap-3.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#647084]">
              <span>{tr('Alumnos Registrados', 'Registered Users')}</span>
              <Users className="h-4 w-4 text-[#2457D6]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#173B63]">{summary.total_users}</span>
              <span className="rounded-md bg-[#E7F8EF] px-1.5 py-0.5 text-[11px] font-black text-[#148449]">
                {summary.premium_users} Premium
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#647084]">
              <span>{tr('Ensayos Disponibles', 'Available Exams')}</span>
              <GraduationCap className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#173B63]">{summary.total_exams}</span>
              <span className="text-[11px] font-bold text-[#647084]">
                {tr('35 preg/ensayo', '35 Qs/exam')}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#647084]">
              <span>{tr('Preguntas Oficiales', 'Question Bank')}</span>
              <FileQuestion className="h-4 w-4 text-[#148449]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#173B63]">{summary.total_questions}</span>
              <span className="text-[11px] font-bold text-[#647084]">CONASET</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#647084]">
              <span>{tr('Tasa Aprobación', 'Global Pass Rate')}</span>
              <Award className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#173B63]">{summary.tasa_aprobacion}%</span>
              <span className="text-[11px] font-bold text-[#647084]">
                {summary.total_results} {tr('rendidos', 'attempts')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex gap-2 border-b border-[#D7E4F6] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
            activeTab === 'users'
              ? 'bg-[#2457D6] text-white shadow-xs'
              : 'bg-white text-[#516B88] hover:bg-[#F4F7FF]'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>
            {tr('Gestión de Alumnos', 'Student Management')} ({usersList.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
            activeTab === 'generator'
              ? 'bg-[#2457D6] text-white shadow-xs'
              : 'bg-white text-[#516B88] hover:bg-[#F4F7FF]'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{tr('Generador Masivo de Ensayos', 'Bulk Exam Generator')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
            activeTab === 'questions'
              ? 'bg-[#2457D6] text-white shadow-xs'
              : 'bg-white text-[#516B88] hover:bg-[#F4F7FF]'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{tr('Banco de Preguntas', 'Question Bank Explorer')}</span>
        </button>
      </div>

      {/* PESTAÑA 1: USUARIOS */}
      {activeTab === 'users' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D7E4F6] bg-white p-3.5 shadow-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6C7B90]" />
              <input
                type="text"
                placeholder={tr('Buscar por usuario o correo...', 'Search by username or email...')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl border border-[#C7D8FA] py-2 pl-9 pr-3 text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="rounded-xl border border-[#C7D8FA] px-3 py-2 text-xs font-bold text-[#173B63] focus:outline-none"
              >
                <option value="all">{tr('Todos los planes', 'All plans')}</option>
                <option value="premium">{tr('Solo Premium', 'Premium Only')}</option>
                <option value="free">{tr('Solo Gratuitos', 'Free Only')}</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-[#C7D8FA] px-3 py-2 text-xs font-bold text-[#173B63] focus:outline-none"
              >
                <option value="all">{tr('Todos los roles', 'All roles')}</option>
                <option value="admin">{tr('Administradores', 'Administrators')}</option>
                <option value="student">{tr('Alumnos', 'Students')}</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#DDE7F2] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-[#F4F7FB] font-black text-[#647084]">
                  <tr>
                    <th className="p-3.5">{tr('Estudiante', 'Student')}</th>
                    <th className="p-3.5">{tr('Licencia', 'License')}</th>
                    <th className="p-3.5">{tr('Estado Premium', 'Premium Status')}</th>
                    <th className="p-3.5">{tr('Vencimiento', 'Expiration')}</th>
                    <th className="p-3.5">{tr('Rol', 'Role')}</th>
                    <th className="p-3.5 text-center">
                      {tr('Acciones Rápidas (1-Clic)', 'Quick Actions (1-Click)')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isPremium = u.is_premium;
                    const dateInput = u.premium_until ? u.premium_until.split('T')[0] : '';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-[#173B63]">{u.username}</p>
                          <p className="text-[11px] text-[#6C7B90]">{u.email}</p>
                        </td>

                        <td className="p-3.5">
                          <select
                            value={u.license_class || 'Clase B'}
                            onChange={(e) =>
                              handleUserUpdate(u.id, { license_class: e.target.value })
                            }
                            className="rounded-lg border border-[#C7D8FA] bg-white px-2 py-1 font-bold text-[#173B63]"
                          >
                            <option value="Clase B">{tr('Clase B (Autos)', 'Class B (Cars)')}</option>
                            <option value="Clase C">
                              {tr('Clase C (Motos)', 'Class C (Motorcycles)')}
                            </option>
                          </select>
                        </td>

                        <td className="p-3.5">
                          {isPremium ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F8EF] px-2.5 py-1 font-black text-[#148449]">
                              <Crown className="h-3 w-3" />
                              {tr('Premium Activo', 'Active Premium')} ({u.dias_restantes}d)
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-500">
                              {tr('Gratuito', 'Free')}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[#6C7B90]" />
                            <input
                              type="date"
                              value={dateInput}
                              onChange={(e) => {
                                handleUserUpdate(u.id, {
                                  premium_until: e.target.value ? `${e.target.value}T23:59:59` : '',
                                  is_premium: Boolean(e.target.value),
                                });
                              }}
                              className="rounded-lg border border-[#C7D8FA] px-2 py-1 text-[11px] font-bold text-[#173B63]"
                            />
                          </div>
                        </td>

                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUserUpdate(u.id, { is_admin: !u.is_admin })
                            }
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                              u.is_admin
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {u.is_admin
                              ? tr('👑 Administrador', '👑 Admin')
                              : tr('Alumno', 'Student')}
                          </button>
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleUserUpdate(
                                  u.id,
                                  { add_days: 30 },
                                  tr(
                                    `Se añadieron 30 días a ${u.username}`,
                                    `Added 30 Premium days to ${u.username}`
                                  )
                                )
                              }
                              className="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-black text-green-700 hover:bg-green-100"
                            >
                              +30d
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUserUpdate(
                                  u.id,
                                  { add_days: 365 },
                                  tr(
                                    `Se añadió 1 año Premium a ${u.username}`,
                                    `Added 1 Year Premium to ${u.username}`
                                  )
                                )
                              }
                              className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-black text-blue-700 hover:bg-blue-100"
                            >
                              {tr('+1 año', '+1 yr')}
                            </button>

                            {isPremium && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleUserUpdate(
                                    u.id,
                                    { is_premium: false },
                                    tr(
                                      `Se revocó el plan a ${u.username}`,
                                      `Revoked Premium from ${u.username}`
                                    )
                                  )
                                }
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-black text-amber-700 hover:bg-amber-100"
                              >
                                {tr('Revocar', 'Revoke')}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleUserUpdate(
                                  u.id,
                                  { reset_password: true },
                                  tr(
                                    `Contraseña de ${u.username} reseteada a: 12345678`,
                                    `Password for ${u.username} reset to: 12345678`
                                  )
                                )
                              }
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100"
                              title={tr('Resetear clave a 12345678', 'Reset password to 12345678')}
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="rounded-lg border border-red-200 p-1 text-red-600 hover:bg-red-50"
                              title={tr('Eliminar usuario', 'Delete user')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* PESTAÑA 2: GENERADOR MASIVO */}
      {activeTab === 'generator' && (
        <section className="rounded-3xl border border-[#D7E4F6] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5 text-base font-black text-[#173B63]">
            <Sparkles className="h-5 w-5 text-[#2457D6]" />
            <h2>
              {tr(
                'Generador Masivo de Simulacros Oficiales CONASET (35 Preguntas)',
                'Bulk Official CONASET Mock Exam Generator (35 Questions)'
              )}
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#6C7B90]">
            {tr(
              'Crea ensayos en lote mezclando aleatoriamente preguntas desde la base de datos sin límites restrictivos.',
              'Batch-generate randomized official mock exams directly from the database.'
            )}
          </p>

          {genMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#E7F8EF] p-4 text-xs font-bold text-[#148449]">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{genMessage}</span>
            </div>
          )}

          {genError && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600">
              {genError}
            </div>
          )}

          <form onSubmit={handleBulkGenerate} className="mt-6 grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-black text-[#173B63]">
                {tr('Clase de Licencia', 'License Class')}
              </label>
              <select
                value={claseLicencia}
                onChange={(e) => setClaseLicencia(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-xs font-bold focus:outline-none"
              >
                <option value="Clase B">{tr('Clase B (Automóviles)', 'Class B (Cars)')}</option>
                <option value="Clase C">
                  {tr('Clase C (Motocicletas)', 'Class C (Motorcycles)')}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#173B63]">
                {tr('Enfoque Temático', 'Topic Focus')}
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-xs font-bold focus:outline-none"
              >
                <option value="Mixto">
                  {tr('Mixto (Examen Oficial CONASET)', 'Mixed (Full CONASET Exam)')}
                </option>
                <option value="Normas y Señalización del Tránsito">
                  {tr('Normas y Señalización', 'Traffic Rules & Signs')}
                </option>
                <option value="Funcionamiento y Mantenimiento del Vehículo">
                  {tr('Mecánica del Vehículo', 'Vehicle Mechanics')}
                </option>
                <option value="La Persona en el Tránsito y Convivencia Vial">
                  {tr('Convivencia Vial', 'Road Safety & Coexistence')}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#173B63]">
                {tr('Preguntas por Ensayo', 'Questions per Exam')}
              </label>
              <input
                type="number"
                min={10}
                max={35}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-xs font-bold focus:outline-none"
              />
              <span className="text-[10px] text-[#6C7B90]">
                {tr('35 preguntas es el estándar chileno.', '35 questions is the Chilean standard.')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-black text-[#173B63]">
                {tr('Cantidad de Ensayos', 'Batch Size')}
              </label>
              <select
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-xs font-bold focus:outline-none"
              >
                <option value={1}>{tr('1 Ensayo', '1 Exam')}</option>
                <option value={3}>{tr('3 Ensayos', '3 Exams')}</option>
                <option value={5}>{tr('5 Ensayos', '5 Exams')}</option>
                <option value={10}>{tr('10 Ensayos en Lote', '10 Exams Batch')}</option>
                <option value={20}>{tr('20 Ensayos en Lote', '20 Exams Batch')}</option>
              </select>
            </div>

            <div className="sm:col-span-4 mt-2">
              <button
                type="submit"
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2457D6] px-6 py-3.5 text-xs font-black text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {generating
                  ? tr('Generando en SQLite...', 'Generating in SQLite...')
                  : tr(
                      `Generar ${cantidad} examen(es) de ${numQuestions} preguntas ahora`,
                      `Generate ${cantidad} exam(s) of ${numQuestions} questions now`
                    )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* PESTAÑA 3: BANCO DE PREGUNTAS */}
      {activeTab === 'questions' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D7E4F6] bg-white p-3.5 shadow-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6C7B90]" />
              <input
                type="text"
                placeholder={tr('Buscar por texto de la pregunta...', 'Search question text...')}
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full rounded-xl border border-[#C7D8FA] py-2 pl-9 pr-3 text-xs font-medium focus:outline-none"
              />
            </div>

            <select
              value={questionCategory}
              onChange={(e) => setQuestionCategory(e.target.value)}
              className="rounded-xl border border-[#C7D8FA] px-3 py-2 text-xs font-bold text-[#173B63] focus:outline-none"
            >
              <option value="Todas">{tr('Todas las categorías', 'All categories')}</option>
              <option value="Normas y Señalización del Tránsito">
                {tr('Normas de Tránsito', 'Traffic Rules')}
              </option>
              <option value="Funcionamiento y Mantenimiento del Vehículo">
                {tr('Mecánica', 'Mechanics')}
              </option>
              <option value="La Persona en el Tránsito y Convivencia Vial">
                {tr('Convivencia Vial', 'Road Coexistence')}
              </option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {questionsList.map((q) => (
              <div
                key={q.id}
                className="flex flex-col justify-between rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#EAF1FF] px-2 py-0.5 text-[10px] font-black text-[#2457D6]">
                      #{q.nro} • {trLicense(q.clase_licencia)}
                    </span>
                    <span className="text-[10px] font-bold text-[#6C7B90]">
                      {trCategory(q.categoria)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xs font-black text-[#173B63] leading-relaxed">
                    {q.texto}
                  </h3>

                  <div className="mt-3 space-y-1">
                    {Object.entries(q.alternativas || {}).map(([letra, alt]) => {
                      const isCorrect = (q.respuestas_correctas || []).includes(letra);
                      return (
                        <div
                          key={letra}
                          className={`rounded-lg px-2.5 py-1 text-[11px] ${
                            isCorrect
                              ? 'bg-[#E7F8EF] font-bold text-[#148449]'
                              : 'text-[#647084]'
                          }`}
                        >
                          <span className="font-black">{letra})</span> {alt}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {q.explicacion && (
                  <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] italic text-[#516B88]">
                    💡 {q.explicacion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}