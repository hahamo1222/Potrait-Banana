import React, { useEffect, useState } from 'react';
import { useI18n } from '../utils/i18n';

interface OrderItem {
  id: string;
  type: 'subscription' | 'oneoff';
  amount: number;
  currency: string;
  status: 'paid' | 'failed' | 'pending';
  provider: 'stripe' | 'wechat' | 'mock';
  createdAt: number;
}

export const DemoOrders: React.FC = () => {
  const { t } = useI18n();
  const [orders, setOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('pb.orders');
    const list = raw ? (JSON.parse(raw) as OrderItem[]) : [];
    setOrders(list.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">{t('orders.title')}</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">{t('orders.empty')}</p>
      ) : (
        <div className="overflow-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-3 py-2">{t('orders.th.id')}</th>
                <th className="text-left px-3 py-2">{t('orders.th.type')}</th>
                <th className="text-left px-3 py-2">{t('orders.th.amount')}</th>
                <th className="text-left px-3 py-2">{t('orders.th.status')}</th>
                <th className="text-left px-3 py-2">{t('orders.th.provider')}</th>
                <th className="text-left px-3 py-2">{t('orders.th.created')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                  <td className="px-3 py-2">{t(`orders.type.${o.type}`)}</td>
                  <td className="px-3 py-2">{o.currency} {o.amount.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${o.status === 'paid' ? 'bg-green-100 text-green-800' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{t(`orders.status.${o.status}`)}</span>
                  </td>
                  <td className="px-3 py-2">{o.provider}</td>
                  <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


