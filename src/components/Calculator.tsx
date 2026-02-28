import React, { useState } from 'react';
import { Calculator as CalcIcon, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

type AssetType = 'forex' | 'synthetic';
type ForexAccount = 'standard' | 'micro' | 'nano';
type SyntheticAccount = 'syntx' | 'micro' | 'pro';

export function QuickCalculator() {
  const [balance, setBalance] = useState<number | ''>('');
  const [riskPercent, setRiskPercent] = useState<number | ''>('');
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [assetType, setAssetType] = useState<AssetType>('forex');
  const [forexAccount, setForexAccount] = useState<ForexAccount>('standard');
  const [syntheticAccount, setSyntheticAccount] = useState<SyntheticAccount>('syntx');
  const [contractSize, setContractSize] = useState<number | ''>(1); // Default for some synthetics

  const calculateLotSize = () => {
    if (!balance || !riskPercent || !stopLoss) return null;

    const riskAmount = (Number(balance) * Number(riskPercent)) / 100;

    let lotSize = 0;
    let minLot = 0.01;
    let maxLot = 100;

    if (assetType === 'forex') {
      // Forex calculation based on account type
      // Standard: 100,000 units -> 1 pip = $10 per lot
      // Micro: 1,000 units -> 1 pip = $0.10 per lot
      // Nano: 100 units -> 1 pip = $0.01 per lot
      let pipValuePerLot = 10; // Standard
      
      if (forexAccount === 'micro') {
        pipValuePerLot = 0.10;
        minLot = 0.01;
      } else if (forexAccount === 'nano') {
        pipValuePerLot = 0.01;
        minLot = 0.001;
      }

      const pipValueNeeded = riskAmount / Number(stopLoss);
      lotSize = pipValueNeeded / pipValuePerLot;
      
    } else {
      // Synthetic Indices calculation (Weltrade specific)
      // Risk = Lot Size * Stop Loss (points) * Contract Size
      if (!contractSize) return null;
      
      // The base calculation for lot size
      lotSize = riskAmount / (Number(stopLoss) * Number(contractSize));
      
      // Adjust based on account type limits
      if (syntheticAccount === 'micro') {
        // Micro: 1 lot = 1,000 units
        minLot = 0.01;
        maxLot = 1000;
        // The contract size for micro might be different, but we rely on user input for contract size
        // as it varies per index (e.g., Vol 75 vs Boom 500).
      } else if (syntheticAccount === 'pro') {
        // Pro/Premium: 1 lot = 100,000 units
        minLot = 0.01;
        maxLot = 100;
      } else if (syntheticAccount === 'syntx') {
        // SyntX
        minLot = 0.01;
        maxLot = 100;
      }
    }

    // Ensure lot size is within bounds (for display purposes, we might just show the calculated value
    // but warn if it's out of bounds)
    const isBelowMin = lotSize < minLot;
    const isAboveMax = lotSize > maxLot;

    return {
      riskAmount: riskAmount.toFixed(2),
      lotSize: lotSize.toFixed(3),
      isBelowMin,
      isAboveMax,
      minLot,
      maxLot
    };
  };

  const result = calculateLotSize();
  const isHighRisk = Number(riskPercent) > 3;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl w-full max-w-md mx-auto my-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
          <CalcIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-white">Calculadora de Lotaje</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Activo</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAssetType('forex')}
              className={cn(
                "py-2 px-4 rounded-lg border text-sm font-medium transition-colors",
                assetType === 'forex' 
                  ? "bg-blue-600 border-blue-500 text-white" 
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
              )}
            >
              Forex
            </button>
            <button
              onClick={() => setAssetType('synthetic')}
              className={cn(
                "py-2 px-4 rounded-lg border text-sm font-medium transition-colors",
                assetType === 'synthetic' 
                  ? "bg-emerald-600 border-emerald-500 text-white" 
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
              )}
            >
              Índices Sintéticos
            </button>
          </div>
        </div>

        {/* Account Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Cuenta</label>
          {assetType === 'forex' ? (
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'micro', 'nano'] as ForexAccount[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setForexAccount(type)}
                  className={cn(
                    "py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors capitalize",
                    forexAccount === type 
                      ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {type === 'standard' ? 'Estándar' : type}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(['syntx', 'micro', 'pro'] as SyntheticAccount[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSyntheticAccount(type)}
                  className={cn(
                    "py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors capitalize",
                    syntheticAccount === type 
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" 
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {type === 'pro' ? 'Pro/Premium' : type}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1.5">
            {assetType === 'forex' 
              ? forexAccount === 'standard' ? '1 Lote = 100,000 unidades' : forexAccount === 'micro' ? '1 Lote = 1,000 unidades' : '1 Lote = 100 unidades (Cent)'
              : syntheticAccount === 'micro' ? '1 Lote = 1,000 unidades. Max 1,000 lotes.' : syntheticAccount === 'pro' ? '1 Lote = 100,000 unidades. Max 100 lotes.' : 'Especializada en índices. Max 100 lotes.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Saldo de Cuenta ($)</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value) || '')}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Ej: 1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Riesgo (%)</label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value) || '')}
            className={cn(
              "w-full bg-slate-800 border rounded-lg p-3 text-white focus:ring-2 focus:border-transparent transition-all",
              isHighRisk ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500"
            )}
            placeholder="Ej: 1"
          />
          {isHighRisk && (
            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Riesgo mayor al 3% no recomendado.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Stop Loss ({assetType === 'forex' ? 'Pips' : 'Puntos'})
          </label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value) || '')}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={assetType === 'forex' ? "Ej: 15" : "Ej: 500"}
          />
        </div>

        {assetType === 'synthetic' && (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
              Tamaño del Contrato <Info className="w-3 h-3 text-slate-500" />
            </label>
            <input
              type="number"
              value={contractSize}
              onChange={(e) => setContractSize(Number(e.target.value) || '')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Ej: 1 (Vol 75), 0.2 (Boom 500)"
            />
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
            <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Resultados</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Riesgo Monetario</p>
                <p className="text-2xl font-bold text-white">${result.riskAmount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Lote Sugerido</p>
                <p className={cn(
                  "text-2xl font-bold",
                  isHighRisk ? "text-red-400" : "text-blue-400",
                  (result.isBelowMin || result.isAboveMax) && "text-amber-400"
                )}>
                  {result.lotSize}
                </p>
              </div>
            </div>
            
            {(result.isBelowMin || result.isAboveMax) && (
              <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>
                  {result.isBelowMin 
                    ? `El lote calculado (${result.lotSize}) es menor al mínimo permitido (${result.minLot}) para esta cuenta.` 
                    : `El lote calculado (${result.lotSize}) supera el máximo permitido (${result.maxLot}) para esta cuenta.`}
                </p>
              </div>
            )}
            
            {assetType === 'forex' && (
              <p className="text-xs text-slate-500 mt-3 italic">
                *Cálculo basado en pares con USD como moneda cotizada (ej. EURUSD).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
