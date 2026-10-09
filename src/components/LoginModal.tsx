import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, authError, clearAuthError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    clearAuthError();
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-2xl shadow-xl overflow-hidden text-[var(--text-ink)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-mut)] hover:text-[var(--text-ink)] hover:bg-[var(--border-ln)]/30 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[var(--brand-ac)] text-white flex items-center justify-center mx-auto shadow-sm">
              <BookOpen className="w-6 h-6 text-amber-200" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-gold)] block">
              Biblioteca da Sabedoria
            </span>
            <h3 className="font-serif-title text-2xl font-bold tracking-tight text-[var(--text-ink)]">
              Proteja Seus Dados de Leitura
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-mut)] leading-relaxed max-w-xs mx-auto">
              Conecte sua conta com o Google para salvar seu progresso, anotações e sessões Pomodoro com segurança no Firebase.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-2.5 bg-[var(--bg-page)]/80 border border-[var(--border-ln)]/80 rounded-xl p-4 text-xs text-[var(--text-ink)]">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dados 100% isolados e protegidos por regras do Firebase</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-[var(--brand-ac)] shrink-0" />
              <span>Sincronização em tempo real entre celular, tablet e PC</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Histórico de páginas lidas, avaliações e tempo de foco salvos</span>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400">
              {authError}
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-850 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSubmitting ? 'Conectando ao Google...' : 'Sign in with Google'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-[var(--text-mut)] hover:text-[var(--text-ink)] transition-colors"
            >
              Continuar em modo local / visitante
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[var(--bg-page)]/50 border-t border-[var(--border-ln)]/60 px-6 py-3 text-center text-[11px] text-[var(--text-mut)] flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" />
          <span>Autenticação oficial via Firebase Auth com criptografia SSL</span>
        </div>
      </div>
    </div>
  );
};
