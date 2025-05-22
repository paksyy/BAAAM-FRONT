/* app/foro/page.tsx */
import Navbar          from '@/components/NavBar/Navbar';
import ForoFeedClient  from '@/components/forum/ForoFeedClient';

export default function ForoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <Navbar />

      <div className="pt-24 px-4 lg:px-8 max-w-5xl mx-auto space-y-8">
        <ForoFeedClient />
      </div>
    </div>
  );
}
