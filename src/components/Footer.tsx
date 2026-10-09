import React from 'react';
import { TabType } from '../types';
import { Heart, BookOpen, Sun, Moon } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: TabType) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, isDark, onToggleTheme }) => {
  return (
    <footer className="border-t border-[var(--border-ln)] bg-[var(--bg-card)]/50 mt-16 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="text-xs sm:text-sm text-[var(--text-ink)] font-medium">
            Biblioteca da Sabedoria · Painel de Leituras do Ano
          </p>
          <p className="text-xs text-[var(--text-mut)] mt-1">
            Criado por <strong className="text-[var(--text-ink)]">@simplesmentenil</strong> · professor e programador Nilberte Lima
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-mut)]">
          <button onClick={() => onSelectTab('home')} className="hover:text-[var(--text-ink)] transition-colors">
            Início
          </button>
          <button onClick={() => onSelectTab('books')} className="hover:text-[var(--text-ink)] transition-colors">
            Livros
          </button>
          <button onClick={() => onSelectTab('pomodoro')} className="hover:text-[var(--text-ink)] transition-colors">
            Pomodoro (25m)
          </button>
          <button onClick={() => onSelectTab('stats')} className="hover:text-[var(--text-ink)] transition-colors">
            Estatísticas
          </button>
          <button
            onClick={() => onSelectTab('apoio')}
            className="hover:text-rose-600 font-medium transition-colors flex items-center gap-1"
          >
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>Apoiar via Pix</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded border border-[var(--border-ln)] text-[var(--text-mut)] hover:text-[var(--text-ink)] transition-colors"
            title="Alternar tema"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </footer>
  );
};
