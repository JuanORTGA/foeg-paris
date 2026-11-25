'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getBcvRate, formatVesPrice as formatVesHelper, calculateVesAmount } from '@/lib/bcv';

export type Currency = 'EUR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  formatPrice: (priceInEur: number) => string;
  convertPrice: (priceInEur: number) => number;
  symbol: string;
  bcvRate: number;
  formatVesPrice: (amountEurOrUsd: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Tasa de cambio fija EUR a USD
const EUR_TO_USD_RATE = 1.08;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EUR');
  const [isInitialized, setIsInitialized] = useState(false);
  const [bcvRate, setBcvRate] = useState<number>(62.50);

  // Cargar moneda guardada y tasa BCV oficial
  useEffect(() => {
    try {
      const saved = localStorage.getItem('foeg_currency') as Currency | null;
      if (saved === 'EUR' || saved === 'USD') {
        setCurrencyState(saved);
      }
    } catch {
      // Ignorar errores de acceso
    }
    setIsInitialized(true);

    // Consulta de la tasa oficial del BCV
    getBcvRate()
      .then((rate) => setBcvRate(rate))
      .catch(() => setBcvRate(62.50));
  }, []);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('foeg_currency', newCurrency);
    } catch {
      // Ignorar errores
    }
  }, []);

  const convertPrice = useCallback(
    (priceInEur: number): number => {
      if (currency === 'USD') {
        return priceInEur * EUR_TO_USD_RATE;
      }
      return priceInEur;
    },
    [currency]
  );

  const formatPrice = useCallback(
    (priceInEur: number): string => {
      if (isNaN(priceInEur)) return '';

      if (currency === 'USD') {
        const usdAmount = priceInEur * EUR_TO_USD_RATE;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(usdAmount);
      }

      // EUR: Formato europeo refinado "1 850,00 €" / "120,00 €"
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(priceInEur);
    },
    [currency]
  );

  const formatVesPrice = useCallback(
    (amountEurOrUsd: number): string => {
      const ves = calculateVesAmount(amountEurOrUsd, bcvRate);
      return formatVesHelper(ves);
    },
    [bcvRate]
  );

  const symbol = useMemo(() => (currency === 'USD' ? '$' : '€'), [currency]);

  const contextValue = useMemo<CurrencyContextType>(
    () => ({
      currency,
      setCurrency,
      exchangeRate: EUR_TO_USD_RATE,
      formatPrice,
      convertPrice,
      symbol,
      bcvRate,
      formatVesPrice,
    }),
    [currency, setCurrency, formatPrice, convertPrice, symbol, bcvRate, formatVesPrice]
  );

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
