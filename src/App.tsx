import React, { useState } from 'react';
import { MessageSquare, Calculator, Search as SearchIcon, ShieldAlert, Activity } from 'lucide-react';
import { Chat } from './components/Chat';
import { QuickCalculator } from './components/Calculator';
import { MarketSearch } from './components/MarketSearch';
import { cn } from './utils/cn';

type Tab = 'chat' | 'calculator' | 'search';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-tight">CALCULADORA</h1>
            <p className="text-sm text-blue-400 font-bold tracking-wider uppercase">INDEX</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
              activeTab === 'chat'
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            Coach & Journal
          </button>
          
          <button
            onClick={() => setActiveTab('calculator')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
              activeTab === 'calculator'
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <Calculator className="w-5 h-5" />
            Calculadora de Lotaje
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
              activeTab === 'search'
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <SearchIcon className="w-5 h-5" />
            Info Mercado
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Regla de Oro</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arriesga máximo 1-2% por operación. Protege tu capital.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-6 bg-slate-950">
        <div className="flex-1 h-full w-full max-w-5xl mx-auto">
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'calculator' && (
            <div className="h-full flex items-center justify-center overflow-y-auto py-4">
              <QuickCalculator />
            </div>
          )}
          {activeTab === 'search' && <MarketSearch />}
        </div>
      </main>
    </div>
  );
}
