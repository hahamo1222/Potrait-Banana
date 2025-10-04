import React from 'react';
import { SparkleIcon } from './icons/SparkleIcon';

interface HeaderProps {
  onUpgrade: () => void;
  isSubscribed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onUpgrade, isSubscribed }) => {
  return (
    <header className="py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <span className="font-serif font-medium text-2xl tracking-tighter text-gray-900 dark:text-gray-100">
          Portrait Banana 肖像香蕉
        </span>
        <button 
          onClick={onUpgrade}
          disabled={isSubscribed}
          className="bg-gray-800 text-white dark:bg-white dark:text-black flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-default"
        >
          {isSubscribed ? (
            'Pro Account'
          ) : (
            <>
              <SparkleIcon className="w-4 h-4" />
              Upgrade to Pro
            </>
          )}
        </button>
      </div>
    </header>
  );
};