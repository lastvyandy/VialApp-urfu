import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function NotFoundPage() {
  const { tr } = useLanguage();

  return (
    <section className="mx-auto max-w-lg pt-20 text-center">
      <h1 className="text-6xl font-black text-[#2457D6]">404</h1>
      <h2 className="mt-4 text-2xl font-black text-[#173B63]">
        {tr('Página no encontrada', 'Page not found')}
      </h2>
      <p className="mt-2 text-sm text-[#516B88]">
        {tr('La página que buscas no existe.', 'The page you are looking for does not exist.')}
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-xl bg-[#2457D6] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
      >
        {tr('Volver al inicio', 'Back to home')}
      </Link>
    </section>
  );
}
