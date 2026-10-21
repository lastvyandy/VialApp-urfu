import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Play,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

const LICENSE_OPTIONS = ['Clase B', 'Clase C'];
const CATEGORY_FILTERS = [
  'Todas',
  'Mixto',
  'Normas y Señalización del Tránsito',
  'Funcionamiento y Mantenimiento del Vehículo',
  'La Persona en el Tránsito y Convivencia Vial',
];

export default function ExamsListPage() {
  const { licenseClass, setLicenseClass } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'completed' | 'pending'

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    apiFetch(`/tests/?clase_licencia=${encodeURIComponent(licenseClass)}`)
      .then((data) => {
        if (active) setExams(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [licenseClass]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchCat =
        selectedCategory === 'Todas' || exam.categoria === selectedCategory;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'completed' ? exam.completado : !exam.completado);
      return matchCat && matchStatus;
    });
  }, [exams, selectedCategory, filterStatus]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pt-6">
      {/* Banner Principal */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#C9D9FF] bg-gradient-to-r from-[#EAF1FF] via-white to-[#F0F5FF] p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2457D6] text-white shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#173B63]">Simulador de Exámenes</h1>
              <p className="text-xs font-semibold text-[#516B88]">
                Ensayos oficiales de 35 preguntas con formato real y retroalimentación CONASET.
              </p>
            </div>
          </div>
        </div>

        {/* Selector de licencia en la barra */}
        <div className="flex items-center gap-2 rounded-2xl border border-[#C7D8FA] bg-white p-1.5 shadow-xs">
          <span className="pl-2 text-xs font-extrabold text-[#6C7B90]">Clase:</span>
          {LICENSE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setLicenseClass(opt)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                licenseClass === opt
                  ? 'bg-[#2457D6] text-white shadow-xs'
                  : 'text-[#2457D6] hover:bg-[#F4F7FF]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D7E4F6] bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-4 w-4 text-[#6C7B90] ml-1 mr-2" />
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[#2457D6] text-white'
                  : 'bg-[#F4F7FB] text-[#516B88] hover:bg-[#EAF1FF] hover:text-[#2457D6]'
              }`}
            >
              {cat === 'Todas' ? 'Todas las áreas' : cat.split(' ')[0]}
            </button>
          ))}
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-[#C7D8FA] px-3 py-1.5 text-xs font-bold text-[#173B63] focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="completed">Ya completados</option>
          <option value="pending">Sin rendir</option>
        </select>
      </div>

      {/* Grid de Exámenes */}
      {loading ? (
        <div className="rounded-2xl border border-[#D7E4F6] bg-white p-12 text-center text-sm font-bold text-[#6C7B90]">
          Cargando simulaciones oficiales...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-600">
          {error}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="rounded-2xl border border-[#D7E4F6] bg-white p-12 text-center text-sm font-bold text-[#6C7B90]">
          No hay exámenes que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => {
            const hasScore = exam.completado && exam.ultimo_puntaje !== null;
            const passed = hasScore && exam.ultimo_puntaje >= 85;

            return (
              <div
                key={exam.id}
                className="flex flex-col justify-between rounded-2xl border border-[#DDE7F2] bg-white p-5 shadow-xs transition-all hover:border-[#2457D6]/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#EAF1FF] px-2.5 py-0.5 text-[11px] font-black text-[#2457D6]">
                      {exam.clase_licencia}
                    </span>

                    {exam.completado ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                          passed
                            ? 'bg-[#E7F8EF] text-[#148449]'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {passed ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <HelpCircle className="h-3 w-3" />
                        )}
                        Nota: {exam.ultimo_puntaje}%
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        Nuevo
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-base font-black text-[#173B63]">{exam.nombre}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#6C7B90]">
                    {exam.categoria}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs font-bold text-[#516B88]">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-[#2457D6]" />
                      {exam.total_preguntas} preguntas[cite: 3]
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#2457D6]" />
                      45 minutos[cite: 2]
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/test/${exam.id}?mode=exam`)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2457D6] py-2.5 text-xs font-black text-white transition hover:bg-blue-700"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Examen
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/test/${exam.id}?mode=study`)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#14966F] bg-[#EAF8F1] py-2.5 text-xs font-black text-[#14966F] transition hover:bg-green-100"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Estudio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}