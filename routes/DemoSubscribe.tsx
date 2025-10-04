import React, { useState } from 'react';
import { useAppState } from '../store/AppContext';
import { useI18n } from '../utils/i18n';

export const DemoSubscribe: React.FC = () => {
  const { subscription, setSubscription } = useAppState();
  const { t } = useI18n();
  const [paying, setPaying] = useState(false);

  const activatePro = () => {
    setPaying(true);
    setTimeout(() => {
      const expireAt = Date.now() + 7 * 24 * 3600_000;
      setSubscription({ isPro: true, expireAt });
      // write mock order
      const ordersRaw = localStorage.getItem('pb.orders');
      const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
      orders.push({
        id: `ord-${Date.now()}`,
        type: 'subscription',
        amount: 9.99,
        currency: 'USD',
        status: 'paid',
        provider: 'mock',
        createdAt: Date.now(),
      });
      localStorage.setItem('pb.orders', JSON.stringify(orders));
      setPaying(false);
      alert(t('sub.activated'));
    }, 1200);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">{t('sub.title')}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <ul className="mt-3 text-sm text-gray-600 list-disc list-inside">
            <li>{t('sub.free.item1')}</li>
            <li>{t('sub.free.item2')}</li>
          </ul>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold">Pro</h2>
          <ul className="mt-3 text-sm text-gray-600 list-disc list-inside">
            <li>{t('sub.pro.item1')}</li>
            <li>{t('sub.pro.item2')}</li>
          </ul>
          <button
            onClick={activatePro}
            disabled={subscription.isPro || paying}
            className="mt-4 px-4 py-2 bg-black text-white rounded disabled:opacity-60"
          >
            {subscription.isPro ? t('status.pro') : (paying ? t('sub.paying') : t('sub.payNow'))}
          </button>
          {subscription.isPro && subscription.expireAt && (
            <p className="text-sm text-gray-600 mt-2">{t('sub.expire', new Date(subscription.expireAt).toLocaleString())}</p>
          )}
        </div>
      </div>
    </div>
  );
};


