import React, { useState } from 'react';
import { Book, BookProgress } from '../types';
import { COVERS } from '../data/covers';
import { formatDateBr } from '../utils/stats';
import {
  ExternalLink,
  CheckCircle,
  RotateCcw,
  Star,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Headphones,
  FileText,
  ZoomIn,
  X,
} from 'lucide-react';

interface BookCardProps {
  book: Book;
  progress: BookProgress;
  totalUnits: number;
  onUpdateProgress: (bookId: string, newUnit: number) => void;
  onComplete: (bookId: string) => void;
  onReopen: (bookId: string) => void;
  onUpdateMetadata: (bookId: string, updates: Partial<BookProgress>) => void;
  onUpdateTotalUnits: (bookId: string, newTotal: number) => void;
  onStartPomodoroForBook?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  progress,
  totalUnits,
  onUpdateProgress,
  onComplete,
  onReopen,
  onUpdateMetadata,
  onUpdateTotalUnits,
  onStartPomodoroForBook,
}) => {
  const [inputVal, setInputVal] = useState<number>(progress.currentUnit);
  const [totalVal, setTotalVal] = useState<number>(totalUnits);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isCoverZoomed, setIsCoverZoomed] = useState(false);

  const coverSrc = (book.coverKey && COVERS[book.coverKey]) || book.customCover;
  const percentage = Math.min(100, Math.round((progress.currentUnit / totalUnits) * 100));
  const isAudio = book.type === 'audio';
  const unitLabel = isAudio ? 'min' : 'pág.';
  const fullUnitLabel = isAudio ? 'minutos' : 'páginas';

  const handleSaveProgress = (val: number) => {
    const clamped = Math.max(0, Math.min(totalUnits, val));
    setInputVal(clamped);
    onUpdateProgress(book.id, clamped);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1500);
  };

  const handleStep = (step: number) => {
    const next = Math.max(0, Math.min(totalUnits, inputVal + step));
    setInputVal(next);
    handleSaveProgress(next);
  };

  const handleSaveTotal = () => {
    const valid = Math.max(1, totalVal);
    setTotalVal(valid);
    onUpdateTotalUnits(book.id, valid);
    setIsEditingTotal(false);
  };

  return (
    <article
      id={`book-${book.id}`}
      className={`rounded-xl border transition-all duration-200 bg-[var(--bg-card)] ${
        progress.isCompleted
          ? 'border-emerald-300 dark:border-emerald-800/60 shadow-xs'
          : progress.currentUnit > 0
          ? 'border-[var(--brand-ac)]/50 shadow-sm'
          : 'border-[var(--border-ln)] shadow-2xs hover:shadow-xs'
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5">
        {/* Cover Column */}
        <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:w-28">
          <div
            onClick={() => coverSrc && setIsCoverZoomed(true)}
            className={`relative w-20 sm:w-28 aspect-[3/4.4] rounded-md overflow-hidden bg-[var(--border-ln)]/30 border border-[var(--border-ln)] shadow-sm group/cover ${
              coverSrc ? 'cursor-pointer hover:border-[var(--brand-gold)] hover:shadow-md transition-all' : ''
            }`}
            title={coverSrc ? 'Clique para ampliar a capa e ler a sinopse detalhada' : undefined}
          >
            {coverSrc ? (
              <>
                <img
                  src={coverSrc}
                  alt={`Capa de ${book.title}`}
                  className="w-full h-full object-cover object-center group-hover/cover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[var(--brand-ac)]/10">
                {isAudio ? (
                  <Headphones className="w-6 h-6 text-[var(--brand-ac)] mb-1" />
                ) : (
                  <FileText className="w-6 h-6 text-[var(--brand-ac)] mb-1" />
                )}
                <span className="text-[10px] font-serif-title font-medium line-clamp-3">
                  {book.title}
                </span>
              </div>
            )}
          </div>

          {/* Quick link button for mobile */}
          <a
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--brand-ac)] text-[var(--brand-ac)] hover:bg-[var(--brand-ac)] hover:text-white transition-colors"
          >
            {isAudio ? <Headphones className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            <span>{isAudio ? 'Ouvir' : 'Ler'}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header: Title, Author, Tags */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
              <div>
                <h3 className="font-serif-title text-lg sm:text-xl font-bold text-[var(--text-ink)] leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-mut)] font-normal mt-0.5">
                  {book.author}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 self-start text-xs shrink-0">
                <span className="text-[var(--text-mut)] inline-flex items-center gap-1">
                  {isAudio ? <Headphones className="w-3.5 h-3.5 text-amber-600" /> : <FileText className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{isAudio ? 'Audiobook' : 'Livro / PDF'}</span>
                </span>
                <span aria-hidden="true" className="text-[var(--text-mut)]">·</span>
                {progress.isCompleted ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Concluído {progress.completedDate ? `(${formatDateBr(progress.completedDate)})` : ''}</span>
                  </span>
                ) : progress.currentUnit > 0 ? (
                  <span className="text-[var(--brand-ac)] font-medium">
                    Lendo ({percentage}%)
                  </span>
                ) : (
                  <span className="text-[var(--text-mut)]">Na fila</span>
                )}
              </div>
            </div>

            {/* Brief Summary */}
            <p className="text-xs sm:text-sm text-[var(--text-ink)]/90 leading-relaxed my-2.5 font-normal">
              {book.summary}
            </p>

            {/* Tags (Zero-Pill discipline: unboxed subtle text with bullets) */}
            {book.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-mut)] mb-3">
                {book.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span>#{tag}</span>
                    {idx < book.tags!.length - 1 && <span aria-hidden="true">·</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="pt-2 border-t border-[var(--border-ln)]/60">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs text-[var(--text-mut)] mb-1">
              <span className="tabular-nums">
                Progresso: <strong className="text-[var(--text-ink)]">{progress.currentUnit}</strong> de{' '}
                {isEditingTotal ? (
                  <span className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      value={totalVal}
                      onChange={(e) => setTotalVal(Number(e.target.value))}
                      className="w-16 px-1.5 py-0.5 text-xs rounded border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)]"
                    />
                    <button
                      onClick={handleSaveTotal}
                      className="text-[11px] font-medium text-[var(--brand-ac)] hover:underline"
                    >
                      Ok
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setIsEditingTotal(true)}
                    title="Clique para ajustar o total desta edição"
                    className="hover:underline text-[var(--text-mut)]"
                  >
                    {totalUnits} {unitLabel}
                  </button>
                )}
              </span>
              <span className="font-semibold text-[var(--text-ink)] tabular-nums">{percentage}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-[var(--border-ln)]/60 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progress.isCompleted ? 'bg-emerald-600' : 'bg-[var(--brand-ac)]'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Quick Controllers & Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mt-3">
              {/* Stepper Inputs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[var(--text-mut)] hidden sm:inline">
                    {isAudio ? 'Minuto:' : 'Página:'}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={totalUnits}
                    value={inputVal}
                    onChange={(e) => setInputVal(Number(e.target.value))}
                    onBlur={() => handleSaveProgress(inputVal)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveProgress(inputVal)}
                    className="w-16 sm:w-20 px-2 py-1 text-xs sm:text-sm font-medium rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] text-center tabular-nums focus:outline-none focus:border-[var(--brand-ac)]"
                  />
                  <button
                    onClick={() => handleSaveProgress(inputVal)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--brand-ac)] text-white hover:bg-[var(--brand-ac-hover)] transition-colors"
                  >
                    Salvar
                  </button>
                  {savedFeedback && (
                    <span className="text-xs text-emerald-600 font-medium animate-pulse">Salvo!</span>
                  )}
                </div>

                {/* Quick Step Buttons */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => handleStep(-10)}
                    disabled={inputVal <= 0}
                    className="px-1.5 py-0.5 rounded border border-[var(--border-ln)] hover:bg-[var(--border-ln)]/40 text-[var(--text-mut)] disabled:opacity-30"
                    title={`Voltar 10 ${fullUnitLabel}`}
                  >
                    -10
                  </button>
                  <button
                    onClick={() => handleStep(-1)}
                    disabled={inputVal <= 0}
                    className="px-1.5 py-0.5 rounded border border-[var(--border-ln)] hover:bg-[var(--border-ln)]/40 text-[var(--text-mut)] disabled:opacity-30"
                    title={`Voltar 1 ${unitLabel}`}
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleStep(1)}
                    disabled={inputVal >= totalUnits}
                    className="px-1.5 py-0.5 rounded border border-[var(--border-ln)] hover:bg-[var(--border-ln)]/40 text-[var(--text-mut)] disabled:opacity-30"
                    title={`Avançar 1 ${unitLabel}`}
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleStep(5)}
                    disabled={inputVal >= totalUnits}
                    className="px-1.5 py-0.5 rounded border border-[var(--border-ln)] hover:bg-[var(--border-ln)]/40 text-[var(--text-mut)] disabled:opacity-30"
                    title={`Avançar 5 ${fullUnitLabel}`}
                  >
                    +5
                  </button>
                  <button
                    onClick={() => handleStep(10)}
                    disabled={inputVal >= totalUnits}
                    className="px-1.5 py-0.5 rounded border border-[var(--border-ln)] hover:bg-[var(--border-ln)]/40 text-[var(--text-mut)] disabled:opacity-30"
                    title={`Avançar 10 ${fullUnitLabel}`}
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* Action Buttons: Open Link & Finish/Reopen */}
              <div className="flex items-center gap-2">
                {onStartPomodoroForBook && !progress.isCompleted && (
                  <button
                    onClick={() => onStartPomodoroForBook(book)}
                    className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-[var(--brand-gold)] text-[var(--brand-gold)] hover:bg-[var(--brand-gold)] hover:text-white transition-colors"
                    title="Iniciar timer Pomodoro para focar neste livro"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Focar 25m</span>
                  </button>
                )}

                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border border-[var(--brand-ac)] text-[var(--brand-ac)] hover:bg-[var(--brand-ac)] hover:text-white transition-colors"
                >
                  <span>{isAudio ? 'Ouvir' : 'Ler no Drive'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {progress.isCompleted ? (
                  <button
                    onClick={() => onReopen(book.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg border border-[var(--border-ln)] text-[var(--text-mut)] hover:text-[var(--text-ink)] hover:bg-[var(--border-ln)]/30 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reabrir</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onComplete(book.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-2xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Concluir</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Toggle for Notes & Review */}
      <div className="border-t border-[var(--border-ln)]/60 px-4 sm:px-5 py-2 flex items-center justify-between bg-[var(--bg-page)]/40 rounded-b-xl">
        <div className="flex items-center gap-2 text-xs text-[var(--text-mut)]">
          {progress.rating > 0 ? (
            <span className="flex items-center text-amber-500 font-semibold gap-0.5">
              <span>{'★'.repeat(progress.rating)}</span>
              <span className="text-[var(--text-mut)] ml-1">({progress.rating}/5)</span>
            </span>
          ) : (
            <span>Sem avaliação</span>
          )}
          {progress.readingType && (
            <>
              <span aria-hidden="true">·</span>
              <span>{progress.readingType}</span>
            </>
          )}
          {progress.recommendation && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[140px] sm:max-w-none">{progress.recommendation}</span>
            </>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-medium text-[var(--brand-ac)] hover:underline"
        >
          <span>{isExpanded ? 'Ocultar reflexões' : 'Avaliação & anotações'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Review & Reflection Section */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-[var(--border-ln)] bg-[var(--bg-page)]/70 rounded-b-xl space-y-3.5">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
              Sua Avaliação (1 a 5 estrelas)
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    onUpdateMetadata(book.id, {
                      rating: progress.rating === star ? 0 : star,
                    })
                  }
                  className="p-1 text-xl sm:text-2xl transition-transform hover:scale-120 focus:outline-none"
                  aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      progress.rating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-[var(--border-ln)] hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              {progress.rating > 0 && (
                <span className="text-xs text-[var(--text-mut)] ml-2">
                  {progress.rating === 5
                    ? 'Extraordinário'
                    : progress.rating === 4
                    ? 'Muito bom'
                    : progress.rating === 3
                    ? 'Bom'
                    : progress.rating === 2
                    ? 'Regular'
                    : 'Fraco'}
                </span>
              )}
            </div>
          </div>

          {/* Type of Reading & Recommendation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
                Tipo da Leitura
              </label>
              <select
                value={progress.readingType || ''}
                onChange={(e) => onUpdateMetadata(book.id, { readingType: e.target.value })}
                className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-card)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
              >
                <option value="">Selecione o tipo...</option>
                <option value="Estudo profundo">Estudo profundo</option>
                <option value="Filosofia prática">Filosofia prática</option>
                <option value="Reflexiva">Reflexiva e meditativa</option>
                <option value="Leitura leve">Leitura leve</option>
                <option value="Releitura">Releitura</option>
                <option value="Ouvido em deslocamento">Ouvido em deslocamento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
                Recomendação
              </label>
              <select
                value={progress.recommendation || ''}
                onChange={(e) => onUpdateMetadata(book.id, { recommendation: e.target.value })}
                className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-card)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
              >
                <option value="">Selecione a recomendação...</option>
                <option value="Recomendo fortemente">Recomendo fortemente (Leitura essencial)</option>
                <option value="Recomendo com ressalvas">Recomendo com ressalvas</option>
                <option value="Neutro">Neutro / Razoável</option>
                <option value="Não recomendo">Não recomendo</option>
              </select>
            </div>
          </div>

          {/* Notes & Takeaways */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
              Anotações, Citações e Aprendizados
            </label>
            <textarea
              rows={3}
              value={progress.notes || ''}
              onChange={(e) => onUpdateMetadata(book.id, { notes: e.target.value })}
              placeholder="O que este livro ensinou para a sua vida? Registre passagens marcantes ou reflexões..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-card)] text-[var(--text-ink)] placeholder-[var(--text-mut)]/60 focus:outline-none focus:border-[var(--brand-ac)]"
            />
          </div>
        </div>
      )}

      {/* Lightbox: Capa em Alta Resolução e Sinopse Completa */}
      {isCoverZoomed && coverSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsCoverZoomed(false)}
        >
          <div
            className="relative bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col sm:flex-row gap-5 sm:gap-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCoverZoomed(false)}
              className="absolute top-3.5 right-3.5 p-2 rounded-full text-[var(--text-mut)] hover:text-[var(--text-ink)] hover:bg-[var(--border-ln)]/40 transition-colors z-10"
              aria-label="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="shrink-0 w-44 sm:w-56 mx-auto sm:mx-0 aspect-[3/4.4] rounded-lg overflow-hidden border border-[var(--border-ln)] shadow-lg bg-black/10">
              <img
                src={coverSrc}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-mut)] mb-1">
                  {isAudio ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                      <Headphones className="w-3.5 h-3.5" /> Audiobook ({totalUnits} min)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium">
                      <BookOpen className="w-3.5 h-3.5" /> Livro / PDF ({totalUnits} pág.)
                    </span>
                  )}
                  {book.suggestedOrder && <span>· Volume #{book.suggestedOrder}</span>}
                </div>

                <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-[var(--text-ink)] leading-snug">
                  {book.title}
                </h3>
                <p className="text-sm font-medium text-[var(--brand-ac)] mt-1">
                  {book.author}
                </p>

                <div className="my-3.5 pt-3 border-t border-[var(--border-ln)]/60">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-mut)] mb-1.5">
                    Sinopse & Resumo Editorial
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-ink)]/90 leading-relaxed font-normal">
                    {book.summary}
                  </p>
                </div>

                {book.tags && book.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-mut)]">
                    {book.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--border-ln)]/40 text-[var(--text-ink)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-4 mt-4 border-t border-[var(--border-ln)]/60">
                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-lg bg-[var(--brand-ac)] text-white text-xs sm:text-sm font-medium text-center flex items-center justify-center gap-1.5 hover:bg-[var(--brand-ac-hover)] transition-colors"
                >
                  {isAudio ? <Headphones className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  <span>{isAudio ? 'Acessar Audiobook' : 'Ler Livro Completo'}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                {onStartPomodoroForBook && (
                  <button
                    onClick={() => {
                      setIsCoverZoomed(false);
                      onStartPomodoroForBook(book);
                    }}
                    className="py-2 px-3 rounded-lg border border-[var(--border-ln)] hover:border-[var(--brand-gold)] text-[var(--text-ink)] text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
                    title="Iniciar sessão de leitura com Pomodoro"
                  >
                    <Clock className="w-4 h-4 text-[var(--brand-gold)]" />
                    <span className="hidden sm:inline">Pomodoro</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
