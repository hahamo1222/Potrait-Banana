import React from 'react';
import { SparkleIcon } from './icons/SparkleIcon';
import { Link } from 'react-router-dom';
import { useAppState } from '../store/AppContext';
import { LoginModal } from './LoginModal';
import { useI18n } from '../utils/i18n';

interface HeaderProps {
  onUpgrade: () => void;
  isSubscribed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onUpgrade, isSubscribed }) => {
  const { language, setLanguage, user, setUser } = useAppState();
  const [open, setOpen] = React.useState(false);
  const { t } = useI18n();
  return (
    <header className="py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="font-serif font-medium text-2xl tracking-tighter text-gray-900 dark:text-gray-100">{t('brand')}</Link>
        <nav className="flex items-center gap-4">
          <Link className="text-sm hover:underline" to="/demo/generations">{t('nav.generations')}</Link>
          <Link className="text-sm hover:underline" to="/demo/subscribe">{t('nav.subscribe')}</Link>
          <Link className="text-sm hover:underline" to="/demo/orders">{t('nav.orders')}</Link>
          <Link className="text-sm hover:underline" to="/demo/contact">{t('nav.contact')}</Link>
          <select
            className="text-sm border rounded px-2 py-1 bg-transparent"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
          {user ? (
            <div className="flex items-center gap-2">
              {user.avatarUrl && <img src={user.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full" />}
              <span className="text-sm">{user.displayName}</span>
              <button onClick={() => setUser(null)} className="text-sm underline">登出</button>
            </div>
          ) : (
            <button onClick={() => setOpen(true)} className="text-sm underline">登录</button>
          )}
          <button 
            onClick={onUpgrade}
            disabled={isSubscribed}
            className="bg-gray-800 text-white dark:bg-white dark:text-black flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-default"
          >
            {isSubscribed ? (
              t('status.pro')
            ) : (
              <>
                <SparkleIcon className="w-4 h-4" />
                {t('action.upgrade')}
              </>
            )}
          </button>
        </nav>
      </div>
      <LoginModal isOpen={open} onClose={() => setOpen(false)} />
    </header>
  );
};