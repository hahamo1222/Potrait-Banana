import React, { useState } from 'react';
import { useI18n } from '../utils/i18n';

export const DemoContact: React.FC = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [ok, setOk] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const listRaw = localStorage.getItem('pb.tickets');
    const list = listRaw ? JSON.parse(listRaw) as any[] : [];
    list.push({ email, content, createdAt: Date.now() });
    localStorage.setItem('pb.tickets', JSON.stringify(list));
    setOk(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">{t('contact.title')}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3 text-sm text-gray-700">
          <p>{t('contact.email')}: support@pb.local</p>
          <p>Discord: pb-community</p>
          <p>{t('contact.wechat')}: <span className="underline">PB_OFFICIAL</span></p>
          <div className="border rounded-lg p-3">
            <p className="text-gray-600">{t('contact.qrTip')}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder={t('contact.input.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
          <textarea className="w-full border rounded px-3 py-2 h-28" placeholder={t('contact.input.content')} value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-black text-white rounded" type="submit">{t('contact.submit')}</button>
          </div>
          {ok && <p className="text-sm text-green-700">{t('contact.success')}</p>}
        </form>
      </div>
    </div>
  );
};


