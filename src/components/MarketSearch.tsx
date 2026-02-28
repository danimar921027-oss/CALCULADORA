import React, { useState } from 'react';
import { Search, Globe, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { searchMarketData } from '../services/gemini';
import { cn } from '../utils/cn';

export function MarketSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await searchMarketData(query);
      setResult(response.text || 'No se encontraron resultados.');
    } catch (err) {
      console.error(err);
      setError('Error al buscar información. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl w-full max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Búsqueda de Mercado</h2>
          <p className="text-sm text-slate-400">Datos actualizados vía Google Search</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: ¿Cuál es el tamaño del contrato del Volatility 75 hoy?"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-4 pr-14 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 top-2 bottom-2 bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p>Buscando información en la web...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            {error}
          </div>
        ) : result ? (
          <div className="prose prose-invert max-w-none prose-emerald prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
            <Globe className="w-16 h-16" />
            <p className="text-center max-w-sm">
              Busca información actualizada sobre pares de divisas, índices sintéticos, noticias económicas o tamaños de contrato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
