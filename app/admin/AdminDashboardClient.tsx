'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  TrendingUp,
  Shirt,
  Users,
  AlertTriangle,
  CreditCard,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useLanguage } from '@/lib/language-context';

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  date: string;
  total: string;
  status: string;
  statusColor: string;
}

interface AdminDashboardClientProps {
  displaySales: number;
  displayOrdersCount: number;
  displayClientsCount: number;
  displayLowStock: number;
  finalRecentOrders: RecentOrder[];
  salesLast7Days?: { date: string; ventes: number }[];
  paymentMethodsData?: { name: string; value: number }[];
}

const LUXURY_PALETTE = ['#1B2A4A', '#C5A880', '#003087', '#7414CA', '#F3BA2F', '#10B981', '#64748B'];

export default function AdminDashboardClient({
  displaySales,
  displayOrdersCount,
  displayClientsCount,
  displayLowStock,
  finalRecentOrders,
  salesLast7Days = [],
  paymentMethodsData = [],
}: AdminDashboardClientProps) {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatOrderStatus = (status: string) => {
    if (status === 'PENDING_VERIFICATION' || status.includes('attente') || status === 'À Vérifier') {
      return t('admin.orders.filterToVerify');
    }
    if (status.includes('préparation')) {
      return t('admin.orderDetail.statusPrep');
    }
    if (status === 'Expédié' || status.includes('Expédié')) {
      return t('admin.orderDetail.statusShipped');
    }
    if (status === 'Livré' || status.includes('Livré')) {
      return t('admin.orderDetail.statusDelivered');
    }
    return status;
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-foeg-border/80 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1">
            Maison FOEG · Backstage
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
            {t('admin.overview')}
          </h1>
        </div>
        <div className="text-xs text-foeg-muted font-light tracking-widest uppercase">
          {t('admin.realtimeData')}
        </div>
      </div>

      {/* =========================================================================
          4 TARJETAS DE MÉTRICAS CON DATOS REALES DE LA BASE DE DATOS
      ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Tarjeta 1: Ventas del día */}
        <div className="bg-white border border-foeg-border/80 p-3.5 sm:p-6 space-y-2 sm:space-y-4 shadow-subtle">
          <div className="flex items-center justify-between text-[9px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] text-foeg-muted font-light">
            <span className="truncate pr-1">{t('admin.todaySales')}</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" strokeWidth={1} />
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-foeg-black tracking-tight block">
              {displaySales.toLocaleString(language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'fr-FR')} €
            </span>
            <p className="text-[10px] sm:text-[11px] text-emerald-800 font-light mt-0.5 truncate">
              {t('admin.todaySalesDesc')}
            </p>
          </div>
        </div>

        {/* Tarjeta 2: Total Pedidos */}
        <div className="bg-white border border-foeg-border/80 p-3.5 sm:p-6 space-y-2 sm:space-y-4 shadow-subtle">
          <div className="flex items-center justify-between text-[9px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] text-foeg-muted font-light">
            <span className="truncate pr-1">{t('admin.totalOrders')}</span>
            <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foeg-navy shrink-0" strokeWidth={1} />
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-foeg-black tracking-tight block">
              {displayOrdersCount}
            </span>
            <p className="text-[10px] sm:text-[11px] text-foeg-muted font-light mt-0.5 truncate">
              {t('admin.totalOrdersDesc')}
            </p>
          </div>
        </div>

        {/* Tarjeta 3: Clientes */}
        <div className="bg-white border border-foeg-border/80 p-3.5 sm:p-6 space-y-2 sm:space-y-4 shadow-subtle">
          <div className="flex items-center justify-between text-[9px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] text-foeg-muted font-light">
            <span className="truncate pr-1">{t('admin.privateClients')}</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foeg-navy shrink-0" strokeWidth={1} />
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-foeg-black tracking-tight block">
              {displayClientsCount}
            </span>
            <p className="text-[10px] sm:text-[11px] text-foeg-muted font-light mt-0.5 truncate">
              {t('admin.privateClientsDesc')}
            </p>
          </div>
        </div>

        {/* Tarjeta 4: Stock critique */}
        <div className="bg-white border border-foeg-border/80 p-3.5 sm:p-6 space-y-2 sm:space-y-4 shadow-subtle">
          <div className="flex items-center justify-between text-[9px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] text-foeg-muted font-light">
            <span className="truncate pr-1">{t('admin.criticalStock')}</span>
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 shrink-0" strokeWidth={1} />
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-amber-800 tracking-tight block">
              {displayLowStock} {displayLowStock === 1 ? t('admin.atelierRestock') : t('admin.atelierRestocks')}
            </span>
            <p className="text-[10px] sm:text-[11px] text-foeg-muted font-light mt-0.5 truncate">
              {t('admin.criticalStockDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GRÁFICAS VISUALES FOEG STUDIO: VENTAS 7 DÍAS + MÉTODOS DE PAGO
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Gráfico 1: Ventas de los últimos 7 días (2/3 de ancho) */}
        <div className="lg:col-span-2 bg-white border border-foeg-border/80 p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-foeg-border/60 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 bg-foeg-navy/5 text-foeg-navy border border-foeg-navy/10">
                <BarChart3 className="w-4 h-4" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-normal text-foeg-black tracking-wide">
                  {language === 'es'
                    ? 'Ventas de los Últimos 7 Días'
                    : language === 'en'
                    ? 'Sales over the Last 7 Days'
                    : 'Ventes des 7 Derniers Jours'}
                </h3>
                <p className="text-[10px] text-foeg-muted uppercase tracking-wider font-light">
                  {language === 'es'
                    ? 'Facturación diaria de la Maison (EUR)'
                    : language === 'en'
                    ? 'Daily turnover of the Maison (EUR)'
                    : 'Chiffre d’affaires quotidien de la Maison (EUR)'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-foeg-navy font-medium bg-foeg-surface px-2.5 py-1 border border-foeg-border">
              {salesLast7Days.reduce((acc, curr) => acc + curr.ventes, 0).toLocaleString()} € Total
            </span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesLast7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="foegSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B2A4A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1B2A4A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DECF" opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5DECF' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}€`}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      `${Number(value).toLocaleString()} €`,
                      language === 'es' ? 'Ventas' : language === 'en' ? 'Sales' : 'Ventes',
                    ]}
                    labelStyle={{ fontFamily: 'serif', color: '#1B2A4A', fontWeight: 600 }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5DECF',
                      borderRadius: 0,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      fontSize: 11,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ventes"
                    stroke="#1B2A4A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#foegSalesGrad)"
                    activeDot={{ r: 5, fill: '#1B2A4A', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-foeg-surface/40 animate-pulse" />
            )}
          </div>
        </div>

        {/* Gráfico 2: Métodos de Pago Utilizados (1/3 de ancho) */}
        <div className="bg-white border border-foeg-border/80 p-6 shadow-subtle space-y-5 flex flex-col justify-between">
          <div className="flex items-center space-x-2.5 border-b border-foeg-border/60 pb-3">
            <span className="p-1.5 bg-[#C5A880]/15 text-[#8C6D37] border border-[#C5A880]/30">
              <PieIcon className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-normal text-foeg-black tracking-wide">
                {language === 'es'
                  ? 'Métodos de Pago'
                  : language === 'en'
                  ? 'Payment Methods'
                  : 'Modes de Paiement'}
              </h3>
              <p className="text-[10px] text-foeg-muted uppercase tracking-wider font-light">
                {language === 'es'
                  ? 'Distribución de canales de cobro'
                  : language === 'en'
                  ? 'Breakdown of payment channels'
                  : "Répartition des canaux d'encaissement"}
              </p>
            </div>
          </div>

          <div className="h-52 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={LUXURY_PALETTE[index % LUXURY_PALETTE.length]}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} commandes`, name]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5DECF',
                      borderRadius: 0,
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-foeg-surface/40 animate-pulse" />
            )}
          </div>

          {/* Leyenda elegante Haute Couture */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-foeg-muted pt-2 border-t border-foeg-border/40 font-light">
            {paymentMethodsData.slice(0, 4).map((entry, idx) => (
              <div key={entry.name} className="flex items-center space-x-1.5 truncate">
                <span
                  className="w-2 h-2 shrink-0 rounded-none inline-block"
                  style={{ backgroundColor: LUXURY_PALETTE[idx % LUXURY_PALETTE.length] }}
                />
                <span className="truncate">{entry.name}</span>
                <span className="font-mono text-foeg-black font-medium">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          TABLA DE "DERNIÈRES COMMANDES" (Últimos pedidos en vivo)
      ========================================================================= */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-normal text-foeg-black tracking-wide">
            {t('admin.recentOrders')}
          </h2>
          <Link
            href="/admin/pedidos"
            className="text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-navy transition-colors font-light flex items-center space-x-1 group cursor-pointer"
          >
            <span>{t('admin.viewFullHistory')}</span>
            <ArrowUpRight
              className="w-3.5 h-3.5 text-foeg-muted group-hover:text-foeg-navy transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.5}
            />
          </Link>
        </div>

        <div className="bg-white border border-foeg-border/80 overflow-x-auto shadow-subtle">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead>
              <tr className="border-b border-foeg-border/80 text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium bg-foeg-surface/40">
                <th className="py-4 px-6">{t('admin.table.order')}</th>
                <th className="py-4 px-6">{t('admin.table.client')}</th>
                <th className="py-4 px-6">{t('admin.table.date')}</th>
                <th className="py-4 px-6">{t('admin.table.total')}</th>
                <th className="py-4 px-6 text-right">{t('admin.table.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foeg-border/60 font-light">
              {finalRecentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-foeg-surface/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-[11px] text-foeg-black font-normal">
                    <Link
                      href="/admin/pedidos"
                      className="hover:text-foeg-navy hover:underline underline-offset-4"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-foeg-black">{order.customer}</p>
                    <p className="text-[10px] text-foeg-muted font-light">{order.customerEmail}</p>
                  </td>
                  <td className="py-4 px-6 text-foeg-muted text-[11px]">
                    {order.date}
                  </td>
                  <td className="py-4 px-6 font-medium text-foeg-black tracking-wider">
                    {order.total}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center space-x-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 border border-foeg-border/70 bg-foeg-white">
                      <span className={`w-1.5 h-1.5 rounded-full ${order.statusColor}`} />
                      <span className="font-medium text-foeg-black">{formatOrderStatus(order.status)}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
