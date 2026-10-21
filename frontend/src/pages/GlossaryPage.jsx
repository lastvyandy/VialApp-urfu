import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Book, Search, ArrowLeft, Tag } from 'lucide-react';
import glosarioData from '../glosario-conduccion.json';

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const terminos = glosarioData?.terminos || [];

  const categorias = useMemo(() => {
    const unique = new Set(terminos.map((item) => item.categoria).filter(Boolean));
    return ['Todas', ...Array.from(unique)];
  }, [terminos]);

  const filteredTerminos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return terminos.filter((item) => {
      const matchesCat =
        selectedCategory === 'Todas' || item.categoria === selectedCategory;
      const matchesQuery =
        !q ||
        item.termino.toLowerCase().includes(q) ||
        item.definicion.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [terminos, search, selectedCategory]);

  return (
    <div className="mx-auto max-w-5xl space-y-5 pt-6">
      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Book className="h-6 w-6 text-[#2457D6]" />
            <h1 className="text-2xl font-black text-[#173B63]">Glosario Vial Oficial</h1>
          </div>
          <p className="mt-0.5 text-xs text-[#6C7B90]">
            {glosarioData?.meta?.fuente || 'Conceptos clave del Libro para la Conducción en Chile (CONASET)'}
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[#C7D8FA] bg-white px-3.5 py-2 text-xs font-black text-[#2457D6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>
      </div>

      {/* Buscador y Filtros por Categoría */}
      <div className="rounded-2xl border border-[#D7E4F6] bg-white p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className=" absolute left-3.5 top-3 h-4 w-4 text-[#6C7B90]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar término o concepto (ej. Aquaplaning, ABS, Distancia de frenado)..."
            className="w-full rounded-xl border border-[#C7D8FA] py-2.5 pl-10 pr-4 text-sm focus:border-[#2457D6] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categorias.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  active
                    ? 'bg-[#2457D6] text-white'
                    : 'bg-[#F4F7FB] text-[#516B88] hover:bg-[#EAF1FF] hover:text-[#2457D6]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contador de resultados */}
      <p className="text-xs font-bold text-[#6C7B90]">
        Mostrando {filteredTerminos.length} de {terminos.length} conceptos
      </p>

      {/* Tarjetas de Términos */}
      {filteredTerminos.length === 0 ? (
        <div className="rounded-2xl border border-[#D7E4F6] bg-white p-8 text-center text-sm font-bold text-[#6C7B90]">
          No se encontraron términos que coincidan con tu búsqueda.
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {filteredTerminos.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-[#DDE7F2] bg-white p-4 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-black text-[#173B63]">{item.termino}</h2>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#EAF1FF] px-2 py-0.5 text-[11px] font-bold text-[#2457D6]">
                    <Tag className="h-3 w-3" />
                    {item.categoria}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#516B88]">
                  {item.definicion}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}