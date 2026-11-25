'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Mail,
  Shield,
  Calendar,
  DollarSign,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Download,
  Printer,
  X,
  Check,
  Loader2,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';
import { useLanguage } from '@/lib/language-context';
import { createClient, updateClient, deleteClient, getClientDossier, ClientData } from '@/lib/client-actions';

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  role: string;
  memberSince: string;
  ordersCount: number;
  totalSpent: number;
  isRegistered?: boolean;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface AdminClientesClientProps {
  initialClients: ClientRow[];
}

export default function AdminClientesClient({ initialClients }: AdminClientesClientProps) {
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();

  const [clients, setClients] = useState<ClientRow[]>(initialClients);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'customers' | 'admins' | 'buyers' | 'vip'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado del Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'ADMIN',
    password: '',
    phone: '',
    address: '',
    city: '',
    country: 'FR',
  });

  // Estado del Modal de Dossier / Ficha de Conserjería
  const [dossierClient, setDossierClient] = useState<ClientRow | null>(null);
  const [dossierOrders, setDossierOrders] = useState<any[]>([]);
  const [isLoadingDossier, setIsLoadingDossier] = useState(false);

  // Filtrado reactivo de clientes
  const filtered = useMemo(() => {
    return clients.filter((c) => {
      // Filtro por pestaña
      if (activeFilter === 'customers' && c.role === 'ADMIN') return false;
      if (activeFilter === 'admins' && c.role !== 'ADMIN') return false;
      if (activeFilter === 'buyers' && c.ordersCount === 0) return false;
      if (activeFilter === 'vip' && c.totalSpent < 1000) return false;

      // Filtro por búsqueda
      const term = search.toLowerCase().trim();
      if (!term) return true;
      return (
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.role.toLowerCase().includes(term) ||
        (c.city && c.city.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term))
      );
    });
  }, [clients, activeFilter, search]);

  // Totales y KPIs
  const totalRevenue = useMemo(() => clients.reduce((sum, c) => sum + c.totalSpent, 0), [clients]);
  const totalOrders = useMemo(() => clients.reduce((sum, c) => sum + c.ordersCount, 0), [clients]);

  // Contadores para pestañas
  const counts = useMemo(() => {
    return {
      all: clients.length,
      customers: clients.filter((c) => c.role !== 'ADMIN').length,
      admins: clients.filter((c) => c.role === 'ADMIN').length,
      buyers: clients.filter((c) => c.ordersCount > 0).length,
      vip: clients.filter((c) => c.totalSpent >= 1000).length,
    };
  }, [clients]);

  // Abrir modal para Crear
  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      role: 'CUSTOMER',
      password: '',
      phone: '',
      address: '',
      city: '',
      country: 'FR',
    });
    setIsModalOpen(true);
  };

  // Abrir modal para Editar
  const handleOpenEditModal = (c: ClientRow) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      email: c.email,
      role: (c.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'),
      password: '',
      phone: c.phone || '',
      address: c.address || '',
      city: c.city || '',
      country: c.country || 'FR',
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingClient) {
      // Actualizar
      const res = await updateClient(editingClient.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
      });

      setIsSaving(false);
      if (res.success) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === editingClient.id
              ? {
                  ...c,
                  name: formData.name,
                  email: formData.email,
                  role: formData.role,
                  phone: formData.phone || c.phone,
                  address: formData.address || c.address,
                  city: formData.city || c.city,
                  country: formData.country || c.country,
                  isRegistered: true,
                }
              : c
          )
        );
        setIsModalOpen(false);
        setToastMessage(t('admin.clientes.clientSaved'));
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        alert(res.error || 'Error al actualizar el cliente');
      }
    } else {
      // Crear
      const res = await createClient({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password || 'foeg2026',
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
      });

      setIsSaving(false);
      if (res.success && res.client) {
        const newRow: ClientRow = {
          id: res.client.id,
          name: res.client.name || formData.name,
          email: res.client.email,
          role: res.client.role,
          memberSince: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          ordersCount: 0,
          totalSpent: 0,
          isRegistered: true,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          country: formData.country,
        };
        setClients((prev) => [newRow, ...prev]);
        setIsModalOpen(false);
        setToastMessage(t('admin.clientes.clientSaved'));
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        alert(res.error || 'Error al crear el cliente');
      }
    }
  };

  // Eliminar Cliente
  const handleDeleteClient = async (c: ClientRow) => {
    if (c.email === 'admin@foeg-paris.com') {
      alert(t('admin.clientes.cannotDeleteSelf'));
      return;
    }

    if (confirm(t('admin.clientes.deleteConfirm'))) {
      const res = await deleteClient(c.id);
      if (res.success) {
        setClients((prev) => prev.filter((item) => item.id !== c.id));
        setToastMessage(t('admin.clientes.clientDeleted'));
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        alert(res.error || 'Error al eliminar el cliente');
      }
    }
  };

  // Abrir Ficha / Dossier de Conserjería
  const handleOpenDossier = async (c: ClientRow) => {
    setDossierClient(c);
    setIsLoadingDossier(true);
    const res = await getClientDossier(c.id);
    setIsLoadingDossier(false);
    if (res.success && res.orders) {
      setDossierOrders(res.orders);
    } else {
      setDossierOrders([]);
    }
  };

  // Exportar Listado a CSV
  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', 'Rol', 'Miembro Desde', 'Pedidos', 'Gasto Total (EUR)', 'Telefono', 'Ciudad'];
    const rows = filtered.map((c) => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.role}"`,
      `"${c.memberSince}"`,
      c.ordersCount,
      c.totalSpent.toFixed(2),
      `"${c.phone || ''}"`,
      `"${c.city || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `foeg_clientes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir Listado
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-7xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-white px-5 py-3.5 shadow-floating text-xs uppercase tracking-wider flex items-center space-x-3 border border-white/20 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête avec Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-foeg-border/80 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1 font-medium">
            {t('admin.clientes.tag')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
            {t('admin.clientes.title')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-foeg-border hover:border-foeg-navy text-foeg-black text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer flex items-center space-x-2"
            title={t('admin.clientes.exportCsv')}
          >
            <Download className="w-3.5 h-3.5 text-foeg-muted" />
            <span>{t('admin.clientes.exportCsv')}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white border border-foeg-border hover:border-foeg-navy text-foeg-black text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer flex items-center space-x-2"
            title={t('admin.clientes.printList')}
          >
            <Printer className="w-3.5 h-3.5 text-foeg-muted" />
            <span>{t('admin.clientes.printList')}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors cursor-pointer flex items-center space-x-2 shadow-subtle shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('admin.clientes.addClient')}</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
              {t('admin.clientes.thName')}s
            </span>
            <Users className="w-4 h-4 text-foeg-muted" strokeWidth={1.5} />
          </div>
          <p className="font-serif text-3xl text-foeg-black">{clients.length}</p>
          <span className="text-[10px] text-foeg-muted block">
            {counts.buyers} con historial de compra activo
          </span>
        </div>

        <div className="p-6 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
              {t('admin.clientes.thOrders')}
            </span>
            <ShoppingBag className="w-4 h-4 text-foeg-muted" strokeWidth={1.5} />
          </div>
          <p className="font-serif text-3xl text-foeg-navy">
            {totalOrders}
          </p>
          <span className="text-[10px] text-foeg-muted block">
            {clients.length > 0 ? (totalOrders / clients.length).toFixed(1) : 0} pedidos promedio por cliente
          </span>
        </div>

        <div className="p-6 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
              {t('admin.clientes.totalRevenue')}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-700" strokeWidth={1.5} />
          </div>
          <p className="font-serif text-3xl text-emerald-800">
            {formatPrice(totalRevenue)}
          </p>
          <span className="text-[10px] text-emerald-700 block">
            Valor de por vida de la clientela (LTV)
          </span>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-foeg-surface/40 p-4 sm:p-5 border border-foeg-border/70 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.clientes.searchPlaceholder')}
              className="w-full bg-white border border-foeg-border px-3 py-2 pl-9 text-xs text-foeg-black focus:outline-none focus:border-foeg-navy font-light"
            />
            <Search className="w-4 h-4 text-foeg-muted absolute left-2.5 top-2.5" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-foeg-muted hover:text-foeg-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs text-foeg-muted font-light hidden sm:inline">
            {filtered.length} {t('admin.clientes.registered')}
          </span>
        </div>

        {/* Pestañas de Filtrado Rápido */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-foeg-border/50 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              activeFilter === 'all'
                ? 'bg-foeg-navy text-white border-foeg-navy shadow-2xs'
                : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
            }`}
          >
            {t('admin.clientes.filterAll')} ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('customers')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              activeFilter === 'customers'
                ? 'bg-foeg-navy text-white border-foeg-navy shadow-2xs'
                : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
            }`}
          >
            {t('admin.clientes.filterCustomers')} ({counts.customers})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('buyers')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              activeFilter === 'buyers'
                ? 'bg-foeg-navy text-white border-foeg-navy shadow-2xs'
                : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
            }`}
          >
            {t('admin.clientes.filterBuyers')} ({counts.buyers})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('vip')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              activeFilter === 'vip'
                ? 'bg-amber-900 text-white border-amber-900 shadow-2xs'
                : 'bg-white border-foeg-border text-amber-900 hover:text-black'
            }`}
          >
            {t('admin.clientes.filterVip')} ({counts.vip})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('admins')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              activeFilter === 'admins'
                ? 'bg-foeg-navy text-white border-foeg-navy shadow-2xs'
                : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
            }`}
          >
            {t('admin.clientes.filterAdmins')} ({counts.admins})
          </button>
        </div>
      </div>

      {/* Tableau des clients */}
      <div className="bg-white border border-foeg-border shadow-subtle overflow-x-auto">
        <table className="w-full text-left text-xs font-light min-w-[650px]">
          <thead className="bg-foeg-surface/60 border-b border-foeg-border text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium">
            <tr>
              <th className="py-3.5 px-6">{t('admin.clientes.thName')}</th>
              <th className="py-3.5 px-6">{t('admin.clientes.thEmail')}</th>
              <th className="py-3.5 px-4">{t('admin.clientes.thRole')}</th>
              <th className="py-3.5 px-4">{t('admin.clientes.thSince')}</th>
              <th className="py-3.5 px-4 text-center">{t('admin.clientes.thOrders')}</th>
              <th className="py-3.5 px-6 text-right">{t('admin.clientes.thSpent')}</th>
              <th className="py-3.5 px-6 text-right">{t('admin.clientes.thActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foeg-border/60">
            {filtered.length > 0 ? (
              filtered.map((client) => {
                const isVip = client.totalSpent >= 1000;

                return (
                  <tr key={client.id} className="hover:bg-foeg-surface/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-foeg-black">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDossier(client)}
                          className="font-medium text-foeg-black hover:text-foeg-navy transition-colors text-left cursor-pointer underline-offset-2 hover:underline"
                        >
                          {client.name}
                        </button>
                        {isVip && (
                          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-900 border border-amber-300 text-[9px] uppercase tracking-wider font-semibold">
                            VIP
                          </span>
                        )}
                        {!client.isRegistered && (
                          <span
                            className="px-1.5 py-0.2 bg-neutral-100 text-neutral-600 border border-neutral-300 text-[9px] uppercase tracking-wider"
                            title={t('admin.clientes.guestBuyer')}
                          >
                            Invitado
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-foeg-muted font-mono text-[11px]">
                      {client.email}
                    </td>

                    <td className="py-4 px-4">
                      {client.role === 'ADMIN' ? (
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border bg-foeg-navy text-white border-foeg-navy">
                          ADMIN
                        </span>
                      ) : client.totalSpent >= 1000 ? (
                        <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold border bg-foeg-navy text-white border-foeg-navy shadow-subtle inline-flex items-center space-x-1">
                          <span>CERCLE PRIVÉ</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium border bg-foeg-surface text-foeg-black border-foeg-border">
                          CLIENT
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-foeg-muted">
                      {client.memberSince}
                    </td>

                    <td className="py-4 px-4 text-center text-foeg-black font-medium">
                      <span className="inline-block px-2 py-0.5 bg-foeg-surface/80 border border-foeg-border text-xs font-mono">
                        {client.ordersCount}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-serif text-sm font-medium text-foeg-navy">
                      {formatPrice(client.totalSpent)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDossier(client)}
                          title={t('admin.clientes.dossierTitle')}
                          className="p-1.5 text-foeg-muted hover:text-foeg-navy hover:bg-foeg-surface/60 transition-colors cursor-pointer border border-transparent hover:border-foeg-border"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(client)}
                          title={t('admin.clientes.editClient')}
                          className="p-1.5 text-foeg-muted hover:text-foeg-navy hover:bg-foeg-surface/60 transition-colors cursor-pointer border border-transparent hover:border-foeg-border"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {client.email !== 'admin@foeg-paris.com' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteClient(client)}
                            title={t('admin.clientes.deleteClient')}
                            className="p-1.5 text-foeg-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-foeg-muted font-light">
                  {language === 'es'
                    ? 'No se encontraron clientes con este filtro.'
                    : language === 'en'
                    ? 'No customers found with this filter.'
                    : 'Aucun client trouvé pour cette recherche.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: AGREGAR / EDITAR CLIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-foeg-border w-full max-w-lg shadow-floating p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between border-b border-foeg-border pb-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-foeg-navy" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-foeg-black">
                  {editingClient ? t('admin.clientes.editClient') : t('admin.clientes.addClient')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-foeg-muted hover:text-foeg-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.clientes.formName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Henri de Beaumont..."
                    className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.clientes.formRole')} *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'CUSTOMER' | 'ADMIN' })}
                    className="w-full border border-foeg-border px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-foeg-navy"
                  >
                    <option value="CUSTOMER">{t('admin.clientes.filterCustomers')}</option>
                    <option value="ADMIN">{t('admin.clientes.filterAdmins')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('admin.clientes.formEmail')} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@chateau-b.fr"
                  className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('admin.clientes.formPassword')}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingClient ? '••••••••' : 'Mínimo 6 caracteres (defecto: foeg2026)'}
                  className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.clientes.formPhone')}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.clientes.formCity')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Paris, Bordeaux, Madrid..."
                    className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('admin.clientes.formAddress')}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="24 Rue du Faubourg Saint-Honoré..."
                  className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-foeg-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-foeg-border text-foeg-muted hover:text-foeg-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  {language === 'es' ? 'Cancelar' : language === 'en' ? 'Cancel' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-wider font-medium cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('admin.clientes.saving')}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('admin.clientes.saveBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DOSSIER PRIVADO DEL CLIENTE (FICHA DE CONSERJERÍA) */}
      {dossierClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-foeg-border w-full max-w-2xl max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto shadow-floating p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between border-b border-foeg-border pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted block mb-0.5">
                  {t('admin.clientes.dossierTitle')}
                </span>
                <h3 className="font-serif text-2xl text-foeg-black flex items-center space-x-2">
                  <span>{dossierClient.name}</span>
                  {dossierClient.totalSpent >= 1000 && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] uppercase tracking-wider font-semibold">
                      VIP
                    </span>
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDossierClient(null)}
                className="text-foeg-muted hover:text-foeg-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ficha Resumen de Métricas del Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-foeg-surface/40 border border-foeg-border/70 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">Gasto Total LTV</span>
                <p className="font-serif text-xl font-medium text-foeg-navy">{formatPrice(dossierClient.totalSpent)}</p>
                <span className="text-[10px] text-foeg-muted block">{dossierClient.ordersCount} compras registradas</span>
              </div>

              <div className="p-4 bg-foeg-surface/40 border border-foeg-border/70 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">Canal y Membresía</span>
                <p className="font-medium text-xs text-foeg-black">
                  {dossierClient.isRegistered ? t('admin.clientes.registeredUser') : t('admin.clientes.guestBuyer')}
                </p>
                <span className="text-[10px] text-foeg-muted block">Desde {dossierClient.memberSince}</span>
              </div>

              <div className="p-4 bg-foeg-surface/40 border border-foeg-border/70 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">Rol de Sistema</span>
                <p className="font-mono text-xs font-medium text-foeg-navy">{dossierClient.role}</p>
                <span className="text-[10px] text-emerald-700 block">Acceso verificado</span>
              </div>
            </div>

            {/* Datos de Contacto y Ubicación */}
            <div className="p-4 bg-white border border-foeg-border/80 space-y-3 text-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                Información de Contacto y Envío
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-foeg-black">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-foeg-muted shrink-0" />
                  <span className="font-mono text-[11px]">{dossierClient.email}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-foeg-muted shrink-0" />
                  <span className="font-mono text-[11px]">{dossierClient.phone || 'No registrado'}</span>
                </div>

                <div className="flex items-center space-x-2 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-foeg-muted shrink-0" />
                  <span>
                    {dossierClient.address || dossierClient.city
                      ? `${dossierClient.address || ''} ${dossierClient.city || ''} ${dossierClient.country || ''}`.trim()
                      : 'Sin dirección guardada'}
                  </span>
                </div>
              </div>

              {/* Botones de Acción de Conserjería */}
              <div className="pt-3 border-t border-foeg-border/50 flex flex-wrap gap-2">
                <a
                  href={`mailto:${dossierClient.email}?subject=Maison%20FOEG%20Paris%20-%20Relations%20Priv%C3%A9es`}
                  className="px-3 py-1.5 bg-foeg-surface border border-foeg-border hover:border-foeg-navy text-foeg-black text-[11px] uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
                >
                  <Mail className="w-3 h-3 text-foeg-navy" />
                  <span>Contactar por Correo</span>
                </a>

                {dossierClient.phone && (
                  <a
                    href={`https://wa.me/${dossierClient.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp Concierge</span>
                  </a>
                )}
              </div>
            </div>

            {/* Historial Detallado de Pedidos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium block">
                  Historial de Pedidos Realizados ({dossierOrders.length})
                </span>
              </div>

              {isLoadingDossier ? (
                <div className="py-8 text-center text-xs text-foeg-muted flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-foeg-navy" />
                  <span>Cargando compras del cliente...</span>
                </div>
              ) : dossierOrders.length > 0 ? (
                <div className="border border-foeg-border divide-y divide-foeg-border text-xs">
                  {dossierOrders.map((ord: any) => (
                    <div key={ord.id} className="p-3.5 flex items-center justify-between hover:bg-foeg-surface/20 transition-colors">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] font-medium text-foeg-navy block">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-foeg-muted">
                          {new Date(ord.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} · {ord.items?.length || 1} prenda(s)
                        </span>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="font-serif text-sm font-medium text-foeg-black block">
                          {formatPrice(ord.total)}
                        </span>
                        <span className="inline-block px-2 py-0.5 bg-foeg-surface border border-foeg-border text-[9px] uppercase tracking-wider text-foeg-muted">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-foeg-muted border border-foeg-border/60 bg-foeg-surface/20">
                  Este cliente aún no registra compras finalizadas.
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end pt-4 border-t border-foeg-border">
              <button
                type="button"
                onClick={() => setDossierClient(null)}
                className="px-6 py-2 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-wider font-medium cursor-pointer"
              >
                Cerrar Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
