import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../store/AppContext';
import { useI18n } from '../utils/i18n';

export const DemoGenerations: React.FC = () => {
  const { generations, setGenerations } = useAppState();
  const { t } = useI18n();

  useEffect(() => {
    if (generations.length === 0) {
      const now = Date.now();
      const mock = Array.from({ length: 5 }).map((_, i) => ({
        id: `gen-${now}-${i}`,
        createdAt: now - i * 3600_000,
        styleCount: 4 + (i % 3),
        status: (i % 4 === 0 ? 'failed' : i % 3 === 0 ? 'running' : 'success') as const,
      }));
      setGenerations(mock);
    }
  }, [generations.length, setGenerations]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">{t('gen.list.title')}</h1>
      {generations.length === 0 ? (
        <div className="text-gray-600">
          <p>{t('gen.list.empty')}</p>
          <button
            className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            onClick={() => setGenerations([{ id: `gen-${Date.now()}`, createdAt: Date.now(), styleCount: 5, status: 'queued' }])}
          >
            {t('gen.seed')}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {generations.map(item => {
            const thumbs = Array.from({ length: 3 }).map((_, i) => ({
              src: `https://picsum.photos/seed/${item.id}-memo-${i}/240/160`,
              isPremium: (i % 3) === 0,
            }));
            return (
              <Link key={item.id} to={`/demo/generations/${item.id}`} className="block border rounded-xl p-4 bg-white shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{new Date(item.createdAt).toLocaleString()}</h2>
                  <span className={`text-xs px-2 py-1 rounded ${item.status === 'success' ? 'bg-green-100 text-green-800' : item.status === 'running' ? 'bg-yellow-100 text-yellow-800' : item.status === 'queued' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{t(`gen.status.${item.status}`)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{t('gen.list.styles', String(item.styleCount))}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {thumbs.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border">
                      <img src={img.src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                      {img.isPremium && (
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          <span className="text-[10px] text-white px-2 py-0.5 bg-black/50 rounded">PRO</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};


