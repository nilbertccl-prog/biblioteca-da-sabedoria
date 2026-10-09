import React, { useState } from 'react';
import { AppState } from '../types';
import {
  Heart,
  Copy,
  Check,
  Download,
  Upload,
  Coffee,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ApoioViewProps {
  appState: AppState;
  onRestoreState: (state: AppState) => void;
}

export const ApoioView: React.FC<ApoioViewProps> = ({ appState, onRestoreState }) => {
  const [copied, setCopied] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [backupStatus, setBackupStatus] = useState<string>('');

  const pixKey = '71991039652';
  const recipient = 'Nilberte Correia Lima';
  const creatorSocial = '@simplesmentenil';
  const creatorBio = 'professor e programador';

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixKey).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleGenerateBackup = () => {
    const jsonStr = JSON.stringify(appState, null, 2);
    setBackupText(jsonStr);
    setBackupStatus('Backup gerado com sucesso! Você pode copiar o texto ou baixá-lo.');
  };

  const handleDownloadBackupFile = () => {
    const jsonStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblioteca_sabedoria_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus('Arquivo de backup baixado para o seu dispositivo.');
  };

  const handleRestoreBackup = () => {
    try {
      if (!backupText.trim()) {
        setBackupStatus('Por favor, cole o texto de backup na caixa acima antes de restaurar.');
        return;
      }
      const parsed = JSON.parse(backupText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Formato inválido');
      }
      onRestoreState(parsed as AppState);
      setBackupStatus('Dados restaurados com sucesso na sua Biblioteca!');
    } catch {
      setBackupStatus('Erro: O texto fornecido não é um backup JSON válido.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Editorial Title */}
      <div className="border-b border-[var(--border-ln)] pb-4">
        <span className="text-xs uppercase tracking-widest text-[var(--brand-gold)] font-semibold block mb-1">
          Apoio & Reconhecimento
        </span>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--text-ink)] flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <span>Apoie este Painel Literário</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-mut)] font-serif italic mt-0.5">
          Este painel foi útil para a sua rotina de leitura? Considere retribuir com uma contribuição espontânea.
        </p>
      </div>

      {/* Main Pix Donation Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--brand-gold)]/50 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Coffee className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif-title text-lg sm:text-xl font-bold text-[var(--text-ink)]">
              Contribua com o Criador via Pix
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-mut)] leading-relaxed">
              O projeto foi concebido e programado com carinho por{' '}
              <strong className="text-[var(--text-ink)]">{recipient}</strong> ({creatorBio}), conhecido nas redes como{' '}
              <strong className="text-[var(--brand-ac)]">{creatorSocial}</strong>. Qualquer valor fortalece o desenvolvimento contínuo, a curadoria de novas obras e a infraestrutura do site.
            </p>
          </div>
        </div>

        {/* Pix Box */}
        <div className="p-4 sm:p-5 rounded-xl border border-[var(--border-ln)] bg-[var(--bg-page)]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-mut)] block">
              Chave Pix (Telefone / Celular):
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-[var(--text-ink)] tracking-wider">
              {pixKey}
            </span>
            <span className="text-xs text-[var(--text-mut)] block mt-0.5">
              Titular: {recipient}
            </span>
          </div>

          <button
            onClick={handleCopyPix}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-[var(--brand-ac)] hover:bg-[var(--brand-ac-hover)] text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Chave Copiada!' : 'Copiar Chave Pix'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-mut)]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Transferência segura e instantânea no aplicativo do seu banco favorito (Nubank, Inter, Itaú, Bradesco, etc.).
          </span>
        </div>
      </div>

      {/* Why Support Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 shadow-2xs">
          <Sparkles className="w-5 h-5 text-amber-500 mb-2" />
          <h4 className="font-serif-title font-semibold text-sm text-[var(--text-ink)] mb-1">
            Gratuito e sem Anúncios
          </h4>
          <p className="text-xs text-[var(--text-mut)] leading-relaxed">
            Navegação pura, limpa e serena focada 100% no seu aprendizado, sem banners invasivos ou rastreadores.
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 shadow-2xs">
          <Coffee className="w-5 h-5 text-blue-500 mb-2" />
          <h4 className="font-serif-title font-semibold text-sm text-[var(--text-ink)] mb-1">
            Apoio a Professores
          </h4>
          <p className="text-xs text-[var(--text-mut)] leading-relaxed">
            Incentiva educadores e desenvolvedores independentes que dedicam tempo para disseminar a filosofia e o saber.
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
          <h4 className="font-serif-title font-semibold text-sm text-[var(--text-ink)] mb-1">
            Seus Dados são Seus
          </h4>
          <p className="text-xs text-[var(--text-mut)] leading-relaxed">
            Todas as anotações e páginas ficam salvas no seu navegador com suporte a backup manual completo a qualquer momento.
          </p>
        </div>
      </div>

      {/* Backup and Restore Section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="border-b border-[var(--border-ln)]/60 pb-3">
          <h3 className="font-serif-title text-base sm:text-lg font-semibold text-[var(--text-ink)]">
            Segurança & Backup das suas Leituras
          </h3>
          <p className="text-xs text-[var(--text-mut)] mt-0.5">
            Exporte suas anotações, histórico diário e livros concluídos para guardar em segurança ou transferir para outro dispositivo.
          </p>
        </div>

        <textarea
          rows={4}
          value={backupText}
          onChange={(e) => setBackupText(e.target.value)}
          placeholder="Clique em 'Gerar Texto de Backup' para copiar seus dados ou cole aqui um JSON previamente salvo para restaurar..."
          className="w-full text-xs font-mono p-3 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
        />

        {backupStatus && (
          <p className="text-xs font-medium text-[var(--brand-ac)]">
            {backupStatus}
          </p>
        )}

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleGenerateBackup}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--brand-ac)] text-[var(--brand-ac)] hover:bg-[var(--brand-ac)] hover:text-white transition-colors"
          >
            Gerar Texto de Backup
          </button>

          <button
            onClick={handleDownloadBackupFile}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--brand-ac)] text-white hover:bg-[var(--brand-ac-hover)] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Arquivo JSON</span>
          </button>

          <button
            onClick={handleRestoreBackup}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--border-ln)] text-[var(--text-mut)] hover:text-[var(--text-ink)] hover:bg-[var(--border-ln)]/40 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
