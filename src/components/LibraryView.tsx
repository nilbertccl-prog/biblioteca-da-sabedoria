import React, { useState, useMemo } from 'react';
import { Book, BookProgress, BookFilter, BookType } from '../types';
import { BookCard } from './BookCard';
import {
  Search,
  Plus,
  SlidersHorizontal,
  X,
  Library,
  BookOpen,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  progressMap: Record<string, BookProgress>;
  customTotals: Record<string, number>;
  onUpdateProgress: (bookId: string, newUnit: number) => void;
  onComplete: (bookId: string) => void;
  onReopen: (bookId: string) => void;
  onUpdateMetadata: (bookId: string, updates: Partial<BookProgress>) => void;
  onUpdateTotalUnits: (bookId: string, newTotal: number) => void;
  onAddBook: (newBook: Omit<Book, 'id'>) => void;
  onStartPomodoroForBook?: (book: Book) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  progressMap,
  customTotals,
  onUpdateProgress,
  onComplete,
  onReopen,
  onUpdateMetadata,
  onUpdateTotalUnits,
  onAddBook,
  onStartPomodoroForBook,
}) => {
  const [filter, setFilter] = useState<BookFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'order' | 'progress' | 'title' | 'pages'>('order');
  const [showAddForm, setShowAddForm] = useState(false);

  // New book form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newType, setNewType] = useState<BookType>('pdf');
  const [newUrl, setNewUrl] = useState('');
  const [newTotalUnits, setNewTotalUnits] = useState(150);
  const [newSummary, setNewSummary] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddBook({
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Autor não informado',
      type: newType,
      url: newUrl.trim() || '#',
      totalUnits: Math.max(1, Number(newTotalUnits) || 100),
      summary: newSummary.trim() || 'Obra adicionada pelo usuário para leitura do ano.',
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    // Reset form
    setNewTitle('');
    setNewAuthor('');
    setNewUrl('');
    setNewSummary('');
    setNewTags('');
    setNewTotalUnits(150);
    setShowAddForm(false);
  };

  // Filter and sort
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        const prog = progressMap[b.id] || { currentUnit: 0, isCompleted: false };
        const total = customTotals[b.id] || b.totalUnits;

        // Type / Status filter
        if (filter === 'pdf' && b.type !== 'pdf') return false;
        if (filter === 'audio' && b.type !== 'audio') return false;
        if (filter === 'reading' && (prog.currentUnit === 0 || prog.isCompleted)) return false;
        if (filter === 'completed' && !prog.isCompleted) return false;
        if (filter === 'queued' && (prog.currentUnit > 0 || prog.isCompleted)) return false;

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchAuthor = b.author.toLowerCase().includes(q);
          const matchSummary = b.summary.toLowerCase().includes(q);
          const matchTags = b.tags?.some((t) => t.toLowerCase().includes(q));
          return matchTitle || matchAuthor || matchSummary || matchTags;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'progress') {
          const pctA = ((progressMap[a.id]?.currentUnit || 0) / (customTotals[a.id] || a.totalUnits)) * 100;
          const pctB = ((progressMap[b.id]?.currentUnit || 0) / (customTotals[b.id] || b.totalUnits)) * 100;
          return pctB - pctA;
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'pages') {
          return (customTotals[b.id] || b.totalUnits) - (customTotals[a.id] || a.totalUnits);
        }
        // default order
        return (a.suggestedOrder || 999) - (b.suggestedOrder || 999);
      });
  }, [books, progressMap, customTotals, filter, searchQuery, sortBy]);

  const filterTabs: { id: BookFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: books.length },
    {
      id: 'reading',
      label: 'Lendo',
      count: books.filter((b) => (progressMap[b.id]?.currentUnit || 0) > 0 && !progressMap[b.id]?.isCompleted).length,
    },
    {
      id: 'completed',
      label: 'Concluídos',
      count: books.filter((b) => progressMap[b.id]?.isCompleted).length,
    },
    {
      id: 'queued',
      label: 'Na Fila',
      count: books.filter((b) => (progressMap[b.id]?.currentUnit || 0) === 0 && !progressMap[b.id]?.isCompleted).length,
    },
    { id: 'pdf', label: 'PDFs', count: books.filter((b) => b.type === 'pdf').length },
    { id: 'audio', label: 'Audiobooks', count: books.filter((b) => b.type === 'audio').length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-ln)] pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[var(--brand-gold)] font-semibold block mb-1">
            Catálogo Anual de Leituras
          </span>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--text-ink)] flex items-center gap-2">
            <Library className="w-6 h-6 text-[var(--brand-ac)]" />
            <span>Biblioteca do Ano ({books.length} Obras)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-mut)] font-serif italic mt-0.5">
            Atualize suas páginas ou minutos, anote aprendizados e marque livros concluídos.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-[var(--brand-ac)] text-white hover:bg-[var(--brand-ac-hover)] transition-colors shadow-2xs shrink-0"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancelar' : 'Adicionar Livro'}</span>
        </button>
      </div>

      {/* Add Book Form (Collapsible) */}
      {showAddForm && (
        <form
          onSubmit={handleCreateBook}
          className="bg-[var(--bg-card)] border border-[var(--brand-ac)]/40 rounded-xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-ln)]/60 pb-2">
            <h4 className="font-serif-title font-semibold text-base text-[var(--text-ink)]">
              Novo Livro para a Meta do Ano
            </h4>
            <span className="text-xs text-[var(--text-mut)]">Ficará salvo localmente</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
                Título da Obra *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Meditações"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
                Autor *
              </label>
              <input
                type="text"
                required
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Ex: Marco Aurélio"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
                Formato / Tipo
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as BookType)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
              >
                <option value="pdf">Livro Físico / PDF (em Páginas)</option>
                <option value="audio">Audiobook / Podcast (em Minutos)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
                {newType === 'audio' ? 'Total em Minutos' : 'Total de Páginas'}
              </label>
              <input
                type="number"
                min={1}
                required
                value={newTotalUnits}
                onChange={(e) => setNewTotalUnits(Number(e.target.value))}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
                Link de Leitura / Áudio (opcional)
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Ex: https://drive.google.com/... ou YouTube"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
                Tags / Temas (separadas por vírgula)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Ex: Estoicismo, Filosofia, Vida Diária"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-mut)] uppercase tracking-wider mb-1">
              Breve Resumo da Obra
            </label>
            <textarea
              rows={2}
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Uma síntese curta dos temas essenciais do livro..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs rounded-lg border border-[var(--border-ln)] text-[var(--text-mut)] hover:text-[var(--text-ink)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-[var(--brand-ac)] text-white hover:bg-[var(--brand-ac-hover)] transition-colors"
            >
              Salvar Livro
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs, Search & Sort Bar */}
      <div className="space-y-3">
        {/* Filter Segmented Control (Zero-pill compliant button group) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--text-ink)] text-[var(--bg-page)] shadow-xs'
                    : 'bg-[var(--bg-card)] border border-[var(--border-ln)] text-[var(--text-mut)] hover:text-[var(--text-ink)]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-white/20' : 'bg-[var(--border-ln)]/50'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-mut)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, autor, resumo ou tema..."
              className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-card)] text-[var(--text-ink)] placeholder-[var(--text-mut)]/60 focus:outline-none focus:border-[var(--brand-ac)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-mut)] hover:text-[var(--text-ink)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-[var(--text-mut)]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs px-2 py-1.5 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-card)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
            >
              <option value="order">Ordem da lista</option>
              <option value="progress">Maior progresso (%)</option>
              <option value="title">Título (A-Z)</option>
              <option value="pages">Total de páginas/min</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books List */}
      {filteredBooks.length > 0 ? (
        <div className="space-y-4">
          {filteredBooks.map((book) => {
            const prog = progressMap[book.id] || {
              currentUnit: 0,
              isCompleted: false,
              rating: 0,
              readingType: '',
              recommendation: '',
              notes: '',
            };
            const total = customTotals[book.id] || book.totalUnits;

            return (
              <BookCard
                key={book.id}
                book={book}
                progress={prog}
                totalUnits={total}
                onUpdateProgress={onUpdateProgress}
                onComplete={onComplete}
                onReopen={onReopen}
                onUpdateMetadata={onUpdateMetadata}
                onUpdateTotalUnits={onUpdateTotalUnits}
                onStartPomodoroForBook={onStartPomodoroForBook}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-10 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[var(--text-mut)] mx-auto opacity-50" />
          <h4 className="font-serif-title font-semibold text-base text-[var(--text-ink)]">
            Nenhum livro encontrado
          </h4>
          <p className="text-xs text-[var(--text-mut)] max-w-sm mx-auto">
            {searchQuery
              ? `Nenhum resultado corresponde à busca "${searchQuery}". Tente outros termos ou limpe o filtro.`
              : 'Nenhum livro cadastrado nesta categoria no momento.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-medium text-[var(--brand-ac)] underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  );
};
