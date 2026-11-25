import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#F5F8FD]">
      <Navbar />
      <main className="px-4 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
