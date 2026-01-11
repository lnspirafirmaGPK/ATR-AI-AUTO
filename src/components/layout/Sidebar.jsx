// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, FileText, Settings, ShieldAlert, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';
import { t } from '../../utils/i18n';
import { useUser } from '../../context/UserContext';

export function Sidebar({ isOpen, closeSidebar, lang }) {
    const { isPro } = useUser();

  const links = [
    { to: '/', icon: LayoutDashboard, label: t('dashboard', lang) },
    { to: '/live', icon: Activity, label: t('liveMonitor', lang) },
    { to: '/dtc', icon: ShieldAlert, label: t('dtcScanner', lang) },
    { to: '/reports', icon: FileText, label: t('reports', lang) },
    { to: '/subscription', icon: Zap, label: "Subscription" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-20 w-64 transform border-r bg-white transition-transform duration-200 ease-in-out dark:bg-gray-950 dark:border-gray-800 md:translate-x-0 md:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center border-b px-6 font-bold text-xl dark:border-gray-800">
           Menu
        </div>
        <nav className="space-y-1 p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => isOpen && closeSidebar()}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                isActive ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {!isPro && (
            <div className="p-4 mt-auto">
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Upgrade to Pro</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">Unlock deep diagnostics.</p>
                 </div>
            </div>
        )}
      </aside>
    </>
  );
}
