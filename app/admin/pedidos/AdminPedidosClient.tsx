'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Search, Check, X, Truck, User, MapPin, Shirt, AlertCircle, ShieldCheck, CheckCircle2, Printer, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { updateOrderStatus, approveLocalPayment, deleteOrder } from './actions';

export interface AdminOrderItem {
  id: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
}

export interface AdminOrderData {
  id: string;
  orderNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  total: number;
  currency: string;
  status: string;
  trackingNumber?: string | null;
  createdAt: Date | string;
  items: AdminOrderItem[];
}

interface AdminPedidosClientProps {
  initialOrders: AdminOrderData[];
}

export default function AdminPedidosClient({ initialOrders }: AdminPedidosClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [orders, setOrders] = useState<AdminOrderData[]>(initialOrders);
  const [search, setSearch] = useState('');

  const statusFilterKeys = ['all', 'verify', 'pending', 'shipped', 'delivered'] as const;
  type StatusFilterKey = typeof statusFilterKeys[number];

  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getStatusFilterLabel = (key: StatusFilterKey) => {
    switch (key) {
      case 'all': return t('admin.orders.filterAll');
      case 'verify': return t('admin.orders.filterToVerify');
      case 'pending': return t('admin.orders.filterPending');
      case 'shipped': return t('admin.orders.filterShipped');
      case 'delivered': return t('admin.orders.filterDelivered');
    }
  };

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.success) {
        alert(res.error || (language === 'es' ? 'Error al actualizar.' : 'Erreur lors de la mise à jour du statut.'));
        setUpdatingId(null);
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      showToast(
        language === 'es'
          ? `Estado actualizado a "${formatOrderStatus(newStatus)}"`
          : language === 'en'
          ? `Status updated to "${formatOrderStatus(newStatus)}"`
          : `Statut mis à jour : "${newStatus}"`
      );
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      alert(language === 'es' ? 'Error de comunicación con el servidor.' : 'Erreur de communication avec le serveur.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprovePayment = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await approveLocalPayment(orderId);
      if (!res.success) {
        alert(res.error || (language === 'es' ? 'Error al validar el pago.' : 'Erreur lors de la validation du paiement.'));
        setUpdatingId(null);
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'En préparation à l’Atelier' } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: 'En préparation à l’Atelier' } : null));
      }

      showToast(t('admin.orders.approvedSuccess'));
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      alert(language === 'es' ? 'Error al validar el pago.' : 'Erreur lors de la validation du paiement.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    const confirmMsg = `${t('admin.orders.deleteConfirm')} #${orderNumber}?`;
    if (!confirm(confirmMsg)) return;

    setUpdatingId(orderId);
    try {
      const res = await deleteOrder(orderId);
      if (!res.success) {
        alert(res.error || (language === 'es' ? 'Error al eliminar el pedido.' : 'Erreur lors de la suppression de la commande.'));
        setUpdatingId(null);
        return;
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }

      showToast(t('admin.orders.deletedSuccess'));
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      alert(language === 'es' ? 'Error al comunicarse con el servidor.' : 'Erreur de communication avec le serveur.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const fullName = `${o.firstName} ${o.lastName}`.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      fullName.includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'verify') {
      matchesStatus = o.status === 'PENDING_VERIFICATION' || o.status.includes('attente') || o.status === 'À Vérifier';
    } else if (statusFilter === 'pending') {
      matchesStatus = o.status.includes('attente') || o.status === 'En attente';
    } else if (statusFilter === 'shipped') {
      matchesStatus = o.status.includes('Expédié') || o.status === 'Expédié';
    } else if (statusFilter === 'delivered') {
      matchesStatus = o.status.includes('Livré') || o.status === 'Livré';
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-foeg-white px-5 py-3.5 shadow-floating text-xs uppercase tracking-wider flex items-center space-x-3 border border-white/20 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ENCABEZADO DE REPORTE CONSOLIDADO VISIBLE SOLO AL IMPRIMIR */}
      <div className="hidden print:block pb-6 mb-6 border-b border-foeg-black/30">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-serif text-2xl uppercase tracking-[0.2em] font-normal text-foeg-black">
              FOEG Paris
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-foeg-muted mt-1">
              {t('admin.orders.reportTitle')} · {t('admin.orders.reportSubtitle')}
            </p>
          </div>
          <div className="text-right text-[10px] text-foeg-muted space-y-1">
            <p>
              {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="font-medium text-foeg-black text-xs">
              {t('admin.orders.totalRevenue')}{' '}
              {filteredOrders
                .reduce((acc, curr) => acc + curr.total, 0)
                .toLocaleString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
            </p>
            <p>
              {filteredOrders.length} {t('admin.orders').toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* En-tête */}
      <div className="border-b border-foeg-border/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1 font-medium">
            {t('admin.shipping')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black tracking-tight">
            {t('admin.orders')}
          </h1>
          <p className="text-xs text-foeg-muted font-light mt-1">
            {orders.length} {t('admin.orders').toLowerCase()}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 bg-white hover:bg-foeg-surface border border-foeg-border hover:border-foeg-navy text-foeg-black px-4 py-2.5 text-xs uppercase tracking-[0.18em] font-medium transition-all cursor-pointer shadow-2xs hover:shadow-subtle"
            title={t('admin.orders.printAll')}
          >
            <Printer className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1.5} />
            <span>{t('admin.orders.printAll')}</span>
          </button>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-foeg-surface/40 p-4 border border-foeg-border/60 print:hidden">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            suppressHydrationWarning
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.actions.searchPlaceholder')}
            className="w-full bg-white border border-foeg-border px-3 py-2 pl-9 text-xs font-light text-foeg-black focus:outline-none focus:border-foeg-navy rounded-none"
          />
          <Search className="w-4 h-4 text-foeg-muted absolute left-2.5 top-2.5" strokeWidth={1} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <span className="text-[11px] uppercase tracking-wider text-foeg-muted font-light shrink-0">
            {t('admin.table.status')}:
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {statusFilterKeys.map((key) => (
              <button
                key={key}
                type="button"
                suppressHydrationWarning
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                  statusFilter === key
                    ? key === 'verify'
                      ? 'bg-amber-600 text-white font-medium'
                      : 'bg-foeg-navy text-white font-medium'
                    : 'bg-white border border-foeg-border text-foeg-muted hover:text-foeg-black font-light'
                }`}
              >
                {getStatusFilterLabel(key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau des Commandes */}
      <div className="bg-white border border-foeg-border shadow-subtle overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[650px]">
          <thead>
            <tr className="border-b border-foeg-border bg-foeg-surface/30 text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium">
              <th className="py-4 px-6">{t('admin.table.order')}</th>
              <th className="py-4 px-6">{t('admin.table.client')}</th>
              <th className="py-4 px-6">{t('admin.table.items')}</th>
              <th className="py-4 px-6">{t('admin.table.total')}</th>
              <th className="py-4 px-6">{t('admin.table.status')}</th>
              <th className="py-4 px-6 text-right print:hidden">{t('admin.table.details')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foeg-border/60 font-light">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-foeg-muted font-light">
                  {t('catalog.noResults')}
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-foeg-surface/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-[11px] text-foeg-black font-medium">
                    <Link
                      href={`/admin/pedidos/${ord.id}`}
                      className="hover:text-foeg-navy hover:underline transition-colors block"
                      title={t('admin.orders.openInvoice')}
                    >
                      #{ord.orderNumber}
                    </Link>
                    <span className="block text-[10px] text-foeg-muted font-sans font-light mt-0.5">
                      {new Date(ord.createdAt).toLocaleDateString(
                        language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-serif text-sm text-foeg-black">
                      {ord.firstName} {ord.lastName}
                    </div>
                    <div className="text-[10px] text-foeg-muted font-light mt-0.5">
                      {ord.city} · {ord.email}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-foeg-muted">
                    {ord.items.length > 0 ? (
                      <span className="text-foeg-black">
                        {ord.items[0].productName} ({t('admin.orders.size')} {ord.items[0].size})
                        {ord.items.length > 1 && (
                          <span className="text-foeg-navy font-medium ml-1">
                            +{ord.items.length - 1} {ord.items.length - 1 === 1 ? t('admin.orders.moreItems') : t('admin.orders.moreItemsPlural')}
                          </span>
                        )}
                      </span>
                    ) : (
                      'Pièces sur-mesure'
                    )}
                  </td>

                  <td className="py-4 px-6 font-medium text-foeg-black text-sm">
                    {ord.total.toLocaleString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', {
                      style: 'currency',
                      currency: ord.currency || 'EUR',
                    })}
                  </td>

                  {/* SELECT DE STATUT DYNAMIQUE OU BOUTON DE VALIDATION LOCALE */}
                  <td className="py-4 px-6">
                    <span className="hidden print:inline-block font-mono text-[11px] uppercase tracking-wider text-foeg-black font-medium">
                      {formatOrderStatus(ord.status)}
                    </span>
                    <div className="print:hidden">
                      {ord.status === 'PENDING_VERIFICATION' || ord.status.includes('attente') || ord.status === 'À Vérifier' ? (
                        <div className="space-y-1.5 min-w-[140px]">
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertCircle className="w-3 h-3 mr-1 text-amber-700" />
                            {t('admin.orders.filterToVerify')}
                          </span>
                          <button
                            type="button"
                            suppressHydrationWarning
                            disabled={updatingId === ord.id}
                            onClick={() => handleApprovePayment(ord.id)}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-1 px-2 text-[10px] uppercase tracking-wider font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                            title={t('admin.orders.validateAndShip')}
                          >
                            <Check className="w-3 h-3" strokeWidth={2} />
                            <span>{t('admin.orders.validatePayment')}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="relative inline-block">
                          <select
                            value={ord.status}
                            suppressHydrationWarning
                            disabled={updatingId === ord.id}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className={`text-xs py-1.5 px-3 border uppercase tracking-wider font-medium focus:outline-none focus:border-foeg-navy cursor-pointer transition-colors ${
                              ord.status === 'Livré'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ord.status === 'Expédié'
                                ? 'bg-blue-50 text-foeg-navy border-blue-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            } ${updatingId === ord.id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <option value="En préparation à l’Atelier">{t('admin.orderDetail.statusPrep')}</option>
                            <option value="Expédié">{t('admin.orderDetail.statusShipped')}</option>
                            <option value="Livré">{t('admin.orderDetail.statusDelivered')}</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right print:hidden">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/pedidos/${ord.id}`}
                        className="p-1.5 text-foeg-muted hover:text-foeg-navy transition-colors inline-block"
                        title={t('admin.orders.openInvoice')}
                      >
                        <Printer className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 text-foeg-muted hover:text-foeg-navy transition-colors inline-block cursor-pointer"
                        title={t('admin.orders.slipTitle')}
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        suppressHydrationWarning
                        disabled={updatingId === ord.id}
                        onClick={() => handleDeleteOrder(ord.id, ord.orderNumber)}
                        className="p-1.5 text-foeg-muted hover:text-red-700 hover:bg-red-50 transition-colors inline-block cursor-pointer disabled:opacity-50"
                        title={t('admin.orders.delete')}
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALLES DE PEDIDO */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn print:hidden">
          <div className="bg-white border border-foeg-border shadow-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-start justify-between border-b border-foeg-border pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-navy block font-medium">
                  {t('admin.orders.slipTitle')}
                </span>
                <h2 className="font-serif text-2xl font-light text-foeg-black">
                  #{selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-foeg-muted hover:text-foeg-black cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Infos Client */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-foeg-surface/40 p-4 border border-foeg-border/60 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-foeg-navy" /> {t('admin.orders.privateClient')}
                </span>
                <p className="font-serif text-sm font-medium text-foeg-black">
                  {selectedOrder.firstName} {selectedOrder.lastName}
                </p>
                <p className="text-foeg-muted font-light">{selectedOrder.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-foeg-navy" /> {t('admin.orders.deliveryAddress')}
                </span>
                <p className="text-foeg-black font-light">{selectedOrder.address}</p>
                <p className="text-foeg-muted font-light">
                  {selectedOrder.postalCode} {selectedOrder.city}
                </p>
              </div>
            </div>

            {/* Articles */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium block">
                {t('admin.orders.craftedPieces')}
              </span>
              <div className="border border-foeg-border divide-y divide-foeg-border/60 text-xs">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-serif text-sm text-foeg-black">{it.productName}</div>
                      <div className="text-[11px] text-foeg-muted font-light">
                        {t('admin.orders.size')} {it.size} · {t('admin.orders.quantity')} : {it.quantity}
                      </div>
                    </div>
                    <div className="font-medium text-foeg-black">
                      {(it.price * it.quantity).toLocaleString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', {
                        style: 'currency',
                        currency: selectedOrder.currency || 'EUR',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total et Statut */}
            <div className="flex items-center justify-between pt-4 border-t border-foeg-border text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">
                  {t('admin.orders.currentStatus')}
                </span>
                <span className="font-medium text-foeg-navy text-sm uppercase tracking-wide">
                  {formatOrderStatus(selectedOrder.status)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">
                  {t('admin.orders.totalSettlement')}
                </span>
                <span className="font-serif text-2xl font-light text-foeg-black">
                  {selectedOrder.total.toLocaleString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', {
                    style: 'currency',
                    currency: selectedOrder.currency || 'EUR',
                  })}
                </span>
              </div>
            </div>

            {/* Bouton pour imprimer la facture officielle */}
            <div className="pt-4 border-t border-foeg-border/80">
              <Link
                href={`/admin/pedidos/${selectedOrder.id}`}
                className="w-full bg-foeg-navy hover:bg-foeg-black text-white py-3 px-4 text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-subtle"
              >
                <Printer className="w-4 h-4" />
                <span>{t('admin.orders.openInvoice')}</span>
              </Link>
            </div>

            {/* Bouton de validation rapide dans la modale si en attente */}
            {(selectedOrder.status === 'PENDING_VERIFICATION' ||
              selectedOrder.status.includes('attente') ||
              selectedOrder.status === 'À Vérifier') && (
              <div className="pt-3 border-t border-foeg-border/80">
                <button
                  type="button"
                  suppressHydrationWarning
                  disabled={updatingId === selectedOrder.id}
                  onClick={() => handleApprovePayment(selectedOrder.id)}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 px-4 text-xs uppercase tracking-wider font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-subtle disabled:opacity-50"
                >
                  <Check className="w-4 h-4" strokeWidth={2} />
                  <span>{t('admin.orders.validateAndShip')}</span>
                </button>
              </div>
            )}

            {/* Bouton pour supprimer la commande */}
            <div className="pt-3 border-t border-foeg-border/80 text-center">
              <button
                type="button"
                suppressHydrationWarning
                disabled={updatingId === selectedOrder.id}
                onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.orderNumber)}
                className="text-red-700 hover:text-red-800 hover:underline text-[11px] uppercase tracking-wider font-medium py-1.5 transition-colors inline-flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{t('admin.orders.delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
