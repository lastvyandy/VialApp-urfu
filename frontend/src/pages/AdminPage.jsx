import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  FileQuestion,
  GraduationCap,
  Award,
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
  KeyRound,
  Trash2,
  Crown,
  Search,
  Filter,
  BarChart3,
  BookOpen,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import { apiFetch } from '../api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'generator' | 'analytics' | 'questions'
  const [summary, setSummary] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de usuarios
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'student'
  const [planFilter, setPlanFilter] = useState('all'); // 'all' | 'premium' | 'free'

  // Generador de exámenes
  const [claseLicencia, setClaseLicencia] = useState('Clase B');
  const [categoria, setCategoria] = useState('Mixto');
  const [numQuestions, setNumQuestions] = useState(35);
  const [cantidad, setCantidad] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');
  const [genError, setGenError] = useState('');

  // Explorador de preguntas
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Todas');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sumData, usersData] = await Promise.all([
        apiFetch('/admin/summary'),
        apiFetch('/admin/users'),
      ]);
      setSummary(sumData);
      setUsersList(usersData);
    } catch (err) {
      console.error(err);
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
      setQuestionsList(qs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') {
      loadQuestions();
    }
  }, [activeTab, questionCategory, questionSearch]);

  // Acciones sobre usuarios
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
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente a "${username}"?`)) return;
    try {
      await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
      await loadAll();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Generación de exámenes
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

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = userSearch.toLowerCase().trim();
      const matchQuery = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole =
        roleFilter === 'all' || (roleFilter === 'admin' ? u.is_admin : !u.is_admin);
      const matchPlan =
        planFilter === 'all' || (planFilter === 'premium' ? u.is_premium : !u.is_premium);
      return matchQuery && matchRole && matchPlan;
    });
  }, [usersList, userSearch, roleFilter, planFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pt-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#C9D9FF] bg-gradient-to-r from-[#EAF1FF] via-white to-[#F0F5FF] p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2457D6] text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#173B63]">Panel de Control Ejecutivo</h1>
              <p className="text-xs font-semibold text-[#516B88]">
                Gestión avanzada de simuladores, banco CONASET y cuentas de estudiantes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#C7D8FA] bg-white px-3 py-2 text-xs font-bold text-[#2457D6] hover:bg-[#F4F7FF]"
            title="Refrescar datos"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2457D6] px-4 py-2 text-xs font-black text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a la App</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid gap-3.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#647084]">
              <span>Alumnos Registrados</span>
              <Users className="h-4 w-4 text-[#2457D6]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#173B63]">{summary.total_users}</span>
              <span className="rounded-md bg-[#E7F8EF] px-1.5 py-0.5 text-[11px] font-black text-[#148449]">
                {summary.premium_users} Premium[cite: 3]
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#647084]">
              <span>Ensayos Disponibles</span>
              <GraduationCap className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#173B63]">{summary.total_exams}</span>
              <span className="text-[11px] font-bold text-[#647084]">35 preg/ensayo[cite: 3]</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#647084]">
              <span>Preguntas Oficiales</span>
              <FileQuestion className="h-4 w-4 text-[#148449]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#173B63]">{summary.total_questions}</span>
              <span className="text-[11px] font-bold text-[#647084]">CONASET[cite: 3]</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#647084]">
              <span>Tasa Aprobación</span>
              <Award className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#173B63]">{summary.tasa_aprobacion}%</span>
              <span className="text-[11px] font-bold text-[#647084]">
                {summary.total_results} rendidos[cite: 3]
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
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
          <span>Gestión de Alumnos ({usersList.length})</span>
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
          <span>Generador Masivo de Ensayos</span>
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
          <span>Banco de Preguntas</span>
        </button>
      </div>

      {/* TAB 1: GESTIÓN DE ALUMNOS */}
      {activeTab === 'users' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D7E4F6] bg-white p-3.5 shadow-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6C7B90]" />
              <input
                type="text"
                placeholder="Buscar por usuario o correo..."
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
                <option value="all">Todos los planes</option>
                <option value="premium">Solo Premium[cite: 3]</option>
                <option value="free">Solo Gratuitos[cite: 3]</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-[#C7D8FA] px-3 py-2 text-xs font-bold text-[#173B63] focus:outline-none"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores[cite: 3]</option>
                <option value="student">Alumnos[cite: 3]</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#DDE7F2] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-[#F4F7FB] font-black text-[#647084]">
                  <tr>
                    <th className="p-3.5">Estudiante</th>
                    <th className="p-3.5">Licencia</th>
                    <th className="p-3.5">Estado Premium</th>
                    <th className="p-3.5">Vencimiento</th>
                    <th className="p-3.5">Rol</th>
                    <th className="p-3.5 text-center">Acciones Rápidas (1-Clic)</th>
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

                        {/* Cambiar Licencia */}
                        <td className="p-3.5">
                          <select
                            value={u.license_class || 'Clase B'}
                            onChange={(e) =>
                              handleUserUpdate(u.id, { license_class: e.target.value })
                            }
                            className="rounded-lg border border-[#C7D8FA] bg-white px-2 py-1 font-bold text-[#173B63]"
                          >
                            <option value="Clase B">Clase B (Autos)</option>
                            <option value="Clase C">Clase C (Motos)</option>
                          </select>
                        </td>

                        {/* Estado Premium Badge */}
                        <td className="p-3.5">
                          {isPremium ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F8EF] px-2.5 py-1 font-black text-[#148449]">
                              <Crown className="h-3 w-3" />
                              Premium Activo ({u.dias_restantes}d)
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-500">
                              Gratuito[cite: 3]
                            </span>
                          )}
                        </td>

                        {/* Selector de Fecha */}
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

                        {/* Rol */}
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
                            {u.is_admin ? '👑 Administrador' : 'Alumno'}
                          </button>
                        </td>

                        {/* Botones de acción rápida */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleUserUpdate(u.id, { add_days: 30 }, `Se añadieron 30 días a ${u.username}`)
                              }
                              className="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-black text-green-700 hover:bg-green-100"
                              title="Extender 30 días Premium"
                            >
                              +30d
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUserUpdate(u.id, { add_days: 365 }, `Se añadió 1 año Premium a ${u.username}`)
                              }
                              className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-black text-blue-700 hover:bg-blue-100"
                              title="Extender 1 año Premium"
                            >
                              +1 año
                            </button>

                            {isPremium && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleUserUpdate(u.id, { is_premium: false }, `Se revocó el plan a ${u.username}`)
                                }
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-black text-amber-700 hover:bg-amber-100"
                                title="Revocar Premium"
                              >
                                Revocar
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleUserUpdate(
                                  u.id,
                                  { reset_password: true },
                                  `Contraseña de ${u.username} reseteada a: 12345678`
                                )
                              }
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100"
                              title="Resetear contraseña a 12345678"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="rounded-lg border border-red-200 p-1 text-red-600 hover:bg-red-50"
                              title="Eliminar usuario"
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

      {/* TAB 2: GENERADOR MASIVO DE ENSAYOS */}
      {activeTab === 'generator' && (
        <section className="rounded-3xl border border-[#D7E4F6] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5 text-base font-black text-[#173B63]">
            <Sparkles className="h-5 w-5 text-[#2457D6]" />
            <h2>Generador Masivo de Simulacros Oficiales CONASET (35 Preguntas)[cite: 3]</h2>
          </div>
          <p className="mt-1 text-xs text-[#6C7B90]">
            Crea ensayos en lote mezclando aleatoriamente preguntas desde la base de datos sin límites restrictivos[cite: 3].
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
              <label className="block text-xs font-black text-[#173B63]">Clase de Licencia</label>
              <select
                value={claseLicencia}
                onChange={(e) => setClaseLicencia(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-xs font-bold focus:outline-none"
              >
                <option value="Clase B">Clase B (Automóviles)</option>
                <option value="Clase C">Clase C (Motocicletas)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#173B63]">Enfoque Temático</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-xs font-bold focus:outline-none"
              >
                <option value="Mixto">Mixto (Examen Oficial CONASET)</option>
                <option value="Normas y Señalización del Tránsito">Normas y Señalización</option>
                <option value="Funcionamiento y Mantenimiento del Vehículo">Mecánica del Vehículo</option>
                <option value="La Persona en el Tránsito y Convivencia Vial">Convivencia Vial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#173B63]">Preguntas por Ensayo</label>
              <input
                type="number"
                min={10}
                max={35}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-xs font-bold focus:outline-none"
              />
              <span className="text-[10px] text-[#6C7B90]">35 preguntas es el estándar chileno[cite: 3].</span>
            </div>

            <div>
              <label className="block text-xs font-black text-[#173B63]">Cantidad de Ensayos</label>
              <select
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[#C7D8FA] px-3.5 py-2.5 text-xs font-bold focus:outline-none"
              >
                <option value={1}>1 Ensayo</option>
                <option value={3}>3 Ensayos</option>
                <option value={5}>5 Ensayos</option>
                <option value={10}>10 Ensayos en Lote</option>
                <option value={20}>20 Ensayos en Lote</option>
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
                  ? 'Generando y vinculando preguntas en SQLite...'
                  : `Generar ${cantidad} examen(es) de ${numQuestions} preguntas ahora`}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 3: EXPLORADOR DEL BANCO DE PREGUNTAS */}
      {activeTab === 'questions' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D7E4F6] bg-white p-3.5 shadow-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6C7B90]" />
              <input
                type="text"
                placeholder="Buscar por texto de la pregunta..."
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
              <option value="Todas">Todas las categorías</option>
              <option value="Normas y Señalización del Tránsito">Normas de Tránsito</option>
              <option value="Funcionamiento y Mantenimiento del Vehículo">Mecánica</option>
              <option value="La Persona en el Tránsito y Convivencia Vial">Convivencia Vial</option>
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
                      #{q.nro} • {q.clase_licencia}
                    </span>
                    <span className="text-[10px] font-bold text-[#6C7B90]">{q.categoria}</span>
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