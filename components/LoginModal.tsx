import React, { useMemo, useState } from 'react';
import { useAppState } from '../store/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function randomId() {
  return Math.random().toString(36).slice(2);
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { setUser } = useAppState();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const providers = useMemo(() => [
    { key: 'google', label: 'Google' },
    { key: 'wechat', label: 'WeChat' },
    { key: 'apple', label: 'Apple' },
    { key: 'x', label: 'X' },
  ], []);

  if (!isOpen) return null;

  const handleProvider = (provider: string) => {
    setUser({
      id: `${provider}-${randomId()}`,
      displayName: `${provider.toUpperCase()} User`,
      avatarUrl: `https://api.dicebear.com/8.x/thumbs/svg?seed=${provider}-${Date.now()}`,
    });
    onClose();
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /.+@.+\..+/.test(email);
    if (!ok) {
      setError('邮箱格式不正确');
      return;
    }
    setUser({
      id: `email-${randomId()}`,
      displayName: email.split('@')[0],
      avatarUrl: `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(email)}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">登录</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {providers.map(p => (
            <button
              key={p.key}
              onClick={() => handleProvider(p.key)}
              className="border rounded px-3 py-2 hover:bg-gray-50"
            >{p.label}</button>
          ))}
        </div>
        <form onSubmit={handleEmailLogin} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            className="w-full border rounded px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">取消</button>
            <button type="submit" className="px-3 py-2 bg-black text-white rounded">使用邮箱登录</button>
          </div>
        </form>
      </div>
    </div>
  );
};


