import dynamic from 'next/dynamic';

const MapSection = dynamic(
  () => import('../../components/MapSection'),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 flex items-center justify-center">
        Cargando mapa…
      </div>
    )
  }
);

export default function MapWrapper() {
  return <MapSection />;
}