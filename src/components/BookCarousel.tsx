import React, { useRef, useState, useEffect } from 'react';
import { Book, BookProgress } from '../types';
import { COVERS } from '../data/covers';
import { ChevronLeft, ChevronRight, CheckCircle2, Play, Pause } from 'lucide-react';

interface BookCarouselProps {
  books: Book[];
  progressMap: Record<string, BookProgress>;
  customTotals: Record<string, number>;
  onSelectBook: (bookId: string) => void;
}

export const BookCarousel: React.FC<BookCarouselProps> = ({
  books,
  progressMap,
  customTotals,
  onSelectBook,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [books]);

  // Gentle autoplay
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 190, behavior: 'smooth' });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const scroll = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -380 : 380;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="relative my-4 group" aria-label="Carrossel de capas dos livros">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-mut)]">
            Galeria de Obras do Ano
          </span>
          <span className="text-xs text-[var(--text-mut)]">({books.length} títulos)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded text-[var(--text-mut)] hover:text-[var(--text-ink)] transition-colors"
            title={isAutoPlaying ? 'Pausar rotação automática' : 'Retomar rotação automática'}
          >
            {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden sm:inline">{isAutoPlaying ? 'Pausar' : 'Girar'}</span>
          </button>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Rolar para esquerda"
            className={`w-7 h-7 rounded-full flex items-center justify-center border border-[var(--border-ln)] text-[var(--text-ink)] bg-[var(--bg-card)] shadow-xs transition-opacity ${
              canScrollLeft ? 'opacity-90 hover:opacity-100 hover:scale-105' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Rolar para direita"
            className={`w-7 h-7 rounded-full flex items-center justify-center border border-[var(--border-ln)] text-[var(--text-ink)] bg-[var(--bg-card)] shadow-xs transition-opacity ${
              canScrollRight ? 'opacity-90 hover:opacity-100 hover:scale-105' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        className="flex gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth snap-x snap-mandatory"
      >
        {books.map((b) => {
          const coverSrc = (b.coverKey && COVERS[b.coverKey]) || b.customCover;
          const prog = progressMap[b.id] || { currentUnit: 0, isCompleted: false, rating: 0 };
          const totalUnits = customTotals[b.id] || b.totalUnits;
          const percentage = Math.min(100, Math.round((prog.currentUnit / totalUnits) * 100));

          return (
            <div
              key={b.id}
              onClick={() => onSelectBook(b.id)}
              className="group/item shrink-0 w-32 sm:w-36 cursor-pointer snap-start transition-transform duration-200 hover:-translate-y-1.5 focus:outline-none"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectBook(b.id);
                }
              }}
              title={`${b.title} - ${b.author}`}
            >
              <div className="relative aspect-[3/4.4] rounded-md overflow-hidden bg-[var(--border-ln)]/40 shadow-sm group-hover/item:shadow-lg transition-shadow border border-[var(--border-ln)]">
                {coverSrc ? (
                  <img
                    src={coverSrc}
                    alt={`Capa do livro ${b.title}`}
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover/item:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-[var(--brand-ac)]/20 to-[var(--brand-gold)]/20">
                    <span className="font-serif-title font-semibold text-xs line-clamp-3 text-[var(--text-ink)]">
                      {b.title}
                    </span>
                    <span className="text-[10px] text-[var(--text-mut)] mt-1">{b.author}</span>
                  </div>
                )}

                {/* Status Badges on Cover */}
                {prog.isCompleted ? (
                  <div className="absolute top-1.5 right-1.5 bg-emerald-600/90 text-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : prog.currentUnit > 0 ? (
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-xs px-1.5 py-0.5 flex items-center justify-between text-[10px] text-white">
                    <span>{percentage}%</span>
                    <span className="text-amber-300 text-[9px]">{b.type === 'audio' ? 'áudio' : 'pág'}</span>
                  </div>
                ) : null}
              </div>

              {/* Title & Author below cover */}
              <div className="mt-1.5 text-left">
                <h4 className="font-serif-title text-xs font-semibold text-[var(--text-ink)] line-clamp-1 group-hover/item:text-[var(--brand-ac)] transition-colors">
                  {b.title}
                </h4>
                <p className="text-[11px] text-[var(--text-mut)] truncate">{b.author}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
