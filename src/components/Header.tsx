import React, { useState } from 'react';
import { TabType } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Clock,
  BarChart3,
  Heart,
  Sun,
  Moon,
  Library,
  LogOut,
  UserCheck,
  LogIn,
  Cloud,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeFocusMinutesToday: number;
  dailyGoalMinutes: number;
  onOpenLoginModal: () => void;
  isSyncing?: boolean;
  onSyncNow?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  activeFocusMinutesToday,
  dailyGoalMinutes,
  onOpenLoginModal,
  isSyncing,
  onSyncNow,
}) => {
  const { currentUser, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const goalProgress = Math.min(100, Math.round((activeFocusMinutesToday / dailyGoalMinutes) * 100));

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Início', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'books', label: 'Biblioteca', icon: <Library className="w-4 h-4" /> },
    { id: 'pomodoro', label: 'Pomodoro', icon: <Clock className="w-4 h-4" /> },
    { id: 'stats', label: 'Estatísticas', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'apoio', label: 'Apoie', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bg-page)]/90 border-b border-[var(--border-ln)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--brand-ac)] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <span className="font-serif-title text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-ink)] leading-none block">
              Biblioteca da Sabedoria
            </span>
            <span className="text-[11px] text-[var(--text-mut)] font-normal hidden sm:block">
              Leituras para o ano · um livro por vez
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--text-ink)] text-[var(--bg-page)] shadow-sm'
                    : 'text-[var(--text-mut)] hover:text-[var(--text-ink)] hover:bg-[var(--border-ln)]/30'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions, Auth & Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Daily Goal indicator */}
          <button
            onClick={() => onSelectTab('pomodoro')}
            title="Meta diária de 25 min de foco"
            className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--border-ln)] text-xs text-[var(--text-mut)] hover:border-[var(--brand-ac)] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Foco: <strong className="text-[var(--text-ink)] tabular-nums">{activeFocusMinutesToday}m</strong> / {dailyGoalMinutes}m ({goalProgress}%)
            </span>
          </button>

          {/* User Auth Section */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-[var(--border-ln)] hover:border-[var(--brand-ac)] bg-[var(--bg-card)] transition-colors focus:outline-none"
                title={`Conectado como ${currentUser.displayName || currentUser.email}`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuário'}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-ac)] text-white text-[10px] font-bold flex items-center justify-center">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs text-[var(--text-ink)] font-medium max-w-[90px] sm:max-w-[120px] truncate hidden sm:inline">
                  {currentUser.displayName || currentUser.email}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Sincronizado na nuvem"></span>
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--border-ln)] bg-[var(--bg-card)] shadow-lg p-3 z-50 animate-in fade-in duration-150">
                  <div className="border-b border-[var(--border-ln)] pb-2 mb-2">
                    <p className="text-xs font-semibold text-[var(--text-ink)] truncate">
                      {currentUser.displayName || 'Leitor'}
                    </p>
                    <p className="text-[11px] text-[var(--text-mut)] truncate">
                      {currentUser.email}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
                      <Cloud className="w-3.5 h-3.5" />
                      <span>{isSyncing ? 'Sincronizando no Firebase...' : 'Conectado ao Firebase Firestore'}</span>
                    </div>
                  </div>

                  {onSyncNow && (
                    <button
                      onClick={() => {
                        onSyncNow();
                        setShowUserDropdown(false);
                      }}
                      disabled={isSyncing}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-ink)] hover:bg-[var(--border-ln)]/40 transition-colors text-left mb-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Sincronizar dados agora</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da conta Google</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[var(--brand-ac)] hover:bg-[var(--brand-ac-hover)] text-white shadow-2xs transition-colors shrink-0"
              title="Faça login com o Google para proteger seus dados"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Alternar tema claro e escuro"
            className="p-2 rounded-lg border border-[var(--border-ln)] text-[var(--text-mut)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-card)] transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
