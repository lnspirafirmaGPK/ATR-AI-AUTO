// src/components/layout/Navbar.jsx
import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { Button } from '../common/Button';
import { useUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';

export function Navbar({ toggleSidebar, lang, setLang }) {
  const { isPro } = useUser();

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'th' : 'en');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 dark:bg-gray-950 dark:border-gray-800">
      <Button variant="ghost" size="sm" className="md:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 font-bold text-xl flex items-center gap-2">
        <span className="text-blue-600">ATR</span> Auto AI
        {isPro && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-100">PRO</span>}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={toggleLang}>
          {lang === 'en' ? '🇺🇸 EN' : '🇹🇭 TH'}
        </Button>
        <Link to="/subscription">
           <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
           </Button>
        </Link>
      </div>
    </header>
  );
}
