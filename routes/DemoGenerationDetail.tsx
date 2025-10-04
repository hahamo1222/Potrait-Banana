import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppState } from '../store/AppContext';
import { useI18n } from '../utils/i18n';

export const DemoGenerationDetail: React.FC = () => {
  const { id } = useParams();
  const { generations, subscription } = useAppState();
  const { t } = useI18n();
  const item = generations.find(g => g.id === id);
  const thumbnails = Array.from({ length: item?.styleCount || 6 }).map((_, i) => ({
    src: `https://picsum.photos/seed/${id}-${i}/200/200`,
    isPremium: (i % 4) === 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{t('gen.detail.title')}</h1>
        <Link to="/demo/generations" className="text-sm underline">{t('gen.back')}</Link>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {thumbnails.map((img, i) => (
          <div key={i} className="relative border rounded-lg overflow-hidden">
            <img src={img.src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
            {img.isPremium && !subscription.isPro && (
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                <Link to="/demo/subscribe" className="text-xs text-white underline">{t('action.upgrade')}</Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


