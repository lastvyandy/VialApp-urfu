import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../api';
import useQuickExam from '../hooks/useQuickExam';
import ExamCard from '../components/exams/ExamCard';
import LicenseClassSelector from '../components/common/LicenseClassSelector';


const CATEGORY_FILTERS = [
  { id: 'Todas', es: 'Todas las áreas', en: 'All Areas' },
  { id: 'Mixto', es: 'Mixto', en: 'Mixed' },
  { id: 'Normas y Señalización del Tránsito', es: 'Normas de Tránsito', en: 'Traffic Rules' },
  { id: 'Funcionamiento y Mantenimiento del Vehículo', es: 'Mecánica', en: 'Mechanics' },
  { id: 'La Persona en el Tránsito y Convivencia Vial', es: 'Convivencia Vial', en: 'Road Coexistence' },
];

export default function ExamsListPage() {
  const { user, licenseClass, setLicenseClass } = useAuth();
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('all');
  const { startingExpress, handleStartExpress } = useQuickExam(licenseClass);

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
              <h1 className="text-2xl font-black text-[#173B63]">
                {tr('Simulador de Exámenes', 'Mock Exam Simulator')}
              </h1>
              <p className="text-xs font-semibold text-[#516B88]">
                {tr(
                  'Ensayos oficiales de 35 preguntas con formato real y retroalimentación CONASET.',
                  'Official 35-question mock exams with real timing and CONASET explanations.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleStartExpress}
            disabled={startingExpress}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#E67E22] px-4 py-2.5 text-xs font-black text-white shadow-xs hover:bg-[#D35400] transition disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {startingExpress
                ? tr('Generando...', 'Generating...')
                : tr('⚡ Ensayo Express (10 Preg.)', '⚡ Express Exam (10 Qs)')}
            </span>
          </button>

          
            <LicenseClassSelector
              value={licenseClass}
              onChange={setLicenseClass}
              variant="inline"
            />

        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D7E4F6] bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-4 w-4 text-[#6C7B90] ml-1 mr-2" />
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-[#2457D6] text-white'
                  : 'bg-[#F4F7FB] text-[#516B88] hover:bg-[#EAF1FF] hover:text-[#2457D6]'
              }`}
            >
              {tr(cat.es, cat.en)}
            </button>
          ))}
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-[#C7D8FA] px-3 py-1.5 text-xs font-bold text-[#173B63] focus:outline-none"
        >
          <option value="all">{tr('Todos los estados', 'All statuses')}</option>
          <option value="completed">{tr('Ya completados', 'Completed')}</option>
          <option value="pending">{tr('Sin rendir', 'Not taken yet')}</option>
        </select>
      </div>

      {/* Grid de Exámenes */}
      {loading ? (
        <div className="rounded-2xl border border-[#D7E4F6] bg-white p-12 text-center text-sm font-bold text-[#6C7B90]">
          {tr('Cargando simulaciones oficiales...', 'Loading official mock exams...')}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-600">
          {error}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="rounded-2xl border border-[#D7E4F6] bg-white p-12 text-center text-sm font-bold text-[#6C7B90]">
          {tr(
            'No hay exámenes que coincidan con los filtros seleccionados.',
            'No exams match the selected filters.'
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam, index) => {
            const isFreeExam =
              index === 0 ||
              exam.nombre.includes('Express') ||
              exam.nombre.includes('#1 ');

            const isLocked =
              !user?.is_premium &&
              !user?.is_admin &&
              !isFreeExam;

            return (
              <ExamCard
                key={exam.id}
                exam={exam}
                isLocked={isLocked}
                onStartExam={(mode) =>
                  navigate(`/test/${exam.id}?mode=${mode}`)
                }
                onUnlock={() => navigate('/planes')}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}