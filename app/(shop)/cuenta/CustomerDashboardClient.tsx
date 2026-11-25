'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  LogOut,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Crown,
  Camera,
} from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';
import { useLanguage } from '@/lib/language-context';
import {
  CustomerAddress,
  updateUserProfile,
  updateUserAvatar,
  saveUserAddress,
  deleteUserAddress,
} from './actions';

interface CustomerDashboardProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  initialAddresses: CustomerAddress[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    date: string;
    total: number;
    currency: string;
    status: string;
    itemsCount: number;
  }>;
  initialTab?: 'profil' | 'adresses' | 'commandes';
  isVip?: boolean;
}

export default function CustomerDashboardClient({
  user,
  initialAddresses,
  recentOrders,
  initialTab = 'profil',
  isVip = false,
}: CustomerDashboardProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profil' | 'adresses' | 'commandes'>(initialTab);

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('livr') || s.includes('deliver') || s.includes('entreg')) return t('orders.statusDelivered');
    if (s.includes('expéd') || s.includes('ship') || s.includes('enviad')) return t('orders.statusShipped');
    if (s.includes('attente') || s.includes('pend') || s.includes('vérif')) return t('orders.statusPending');
    return status;
  };

  // État profil
  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.image || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data?.url) {
        setAvatar(data.url);
        await updateUserAvatar(data.url);
        setProfileMessage({ type: 'success', text: 'Photo de profil mise à jour avec succès.' });
        setTimeout(() => setProfileMessage(null), 4000);
      } else {
        setProfileMessage({ type: 'error', text: 'Impossible de charger l’image.' });
      }
    } catch (_) {
      setProfileMessage({ type: 'error', text: 'Erreur lors du téléversement.' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatar('');
    await updateUserAvatar('');
    setProfileMessage({ type: 'success', text: 'Photo de profil retirée.' });
    setTimeout(() => setProfileMessage(null), 3000);
  };

  // État adresses
  const [addresses, setAddresses] = useState<CustomerAddress[]>(initialAddresses);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [newAddress, setNewAddress] = useState({
    title: 'Domicile Parisien',
    recipient: user.name || '',
    street: '',
    city: 'Paris',
    postalCode: '',
    country: 'France',
    isDefault: false,
  });

  // Soumission Profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    const res = await updateUserProfile({
      name,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });

    setProfileLoading(false);
    if (res.success) {
      setProfileMessage({ type: 'success', text: res.message || 'Informations mises à jour.' });
      setCurrentPassword('');
      setNewPassword('');
      router.refresh();
    } else {
      setProfileMessage({ type: 'error', text: res.error || 'Erreur lors de la mise à jour.' });
    }
  };

  // Ajout Adresse
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.recipient || !newAddress.street || !newAddress.postalCode) {
      setAddressError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setAddressLoading(true);
    setAddressError('');

    const res = await saveUserAddress(newAddress);
    setAddressLoading(false);

    if (res.success && res.addresses) {
      setAddresses(res.addresses);
      setIsAddingAddress(false);
      setNewAddress({
        title: 'Domicile',
        recipient: user.name || '',
        street: '',
        city: 'Paris',
        postalCode: '',
        country: 'France',
        isDefault: false,
      });
    } else {
      setAddressError(res.error || 'Erreur lors de l’enregistrement.');
    }
  };

  // Suppression Adresse
  const handleDeleteAddress = async (id: string) => {
    const confirmMsg = language === 'es' ? '¿Está seguro de que desea eliminar esta dirección?' : language === 'en' ? 'Are you sure you want to delete this address?' : 'Êtes-vous sûr de vouloir supprimer cette adresse ?';
    if (!confirm(confirmMsg)) return;
    const res = await deleteUserAddress(id);
    if (res.success) {
      setAddresses(addresses.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="pt-28 md:pt-40 pb-32 px-6 md:px-12 max-w-6xl mx-auto space-y-12">
      {/* En-tête Espace Privé */}
      <header className="border-b border-foeg-border/80 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block mb-2">
            {language === 'es' ? 'Espacio Privado · Maison FOEG' : language === 'en' ? 'Private Space · Maison FOEG' : 'Espace Privé · Maison FOEG'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
            {language === 'es' ? 'Hola, ' : language === 'en' ? 'Hello, ' : 'Bonjour, '}{user.name || user.email?.split('@')[0]}
          </h1>
          <p className="text-xs text-foeg-muted font-light mt-1">
            {user.email} · {language === 'es' ? 'Miembro del Círculo Privado' : language === 'en' ? 'Private Circle Member' : 'Membre du Cercle Privé'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-navy transition-colors font-light py-2 px-4 border border-foeg-border hover:border-foeg-navy self-start md:self-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('account.logout')}</span>
        </button>
      </header>

      {/* TAREA 4: BANNER ÉLÉGANT CERCLE PRIVÉ VIP */}
      {isVip && (
        <div className="p-6 bg-gradient-to-r from-foeg-navy via-[#1e325a] to-foeg-navy text-white border border-white/20 shadow-floating flex flex-col sm:flex-row sm:items-center justify-between gap-5 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Crown className="w-6 h-6 text-amber-300" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.3em] text-amber-300 font-semibold block">
                {language === 'es' ? 'Privilegio Maison FOEG París' : language === 'en' ? 'Maison FOEG Paris Privilege' : 'Privilège Maison FOEG Paris'}
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-light text-white tracking-wide">
                {language === 'es' ? 'Forma parte del Círculo Privado FOEG' : language === 'en' ? 'You are part of the FOEG Private Circle' : 'Vous faites partie du Cercle Privé FOEG'}
              </h2>
              <p className="text-xs text-white/80 font-light mt-0.5 max-w-xl">
                {language === 'es'
                  ? 'Como miembro distinguido, disfruta de envíos signature siempre gratuitos, acceso prioritario a nuevas colecciones y atención exclusiva de su Conserjería.'
                  : language === 'en'
                  ? 'As a distinguished member, enjoy complimentary signature delivery on all orders, priority collection access, and dedicated Concierge support.'
                  : 'En tant que membre d’exception (plus de 1.000 € d’acquisitions réglées), vous bénéficiez de livraisons signature offertes en permanence, de l’accès prioritaire aux nouvelles collections et de l’accompagnement de votre Consergerie dédiée.'}
              </p>
            </div>
          </div>
          <Link
            href="/cercle-prive"
            className="px-5 py-2.5 bg-white text-foeg-navy hover:bg-[#f4f1ea] text-xs uppercase tracking-[0.2em] font-medium transition-colors shrink-0 text-center shadow-subtle"
          >
            {language === 'es' ? 'Descubrir Privilegios' : language === 'en' ? 'Discover Privileges' : 'Découvrir mes Privilèges'}
          </Link>
        </div>
      )}

      {/* Navigation des Onglets de Lujo Silencioso (Scroll Tactil en Movil) */}
      <div className="flex items-center space-x-6 sm:space-x-12 border-b border-foeg-border/80 text-xs uppercase tracking-[0.18em] overflow-x-auto no-scrollbar whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveTab('profil')}
          className={`pb-3 font-medium transition-colors cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'profil'
              ? 'border-foeg-black text-foeg-black'
              : 'border-transparent text-foeg-muted hover:text-foeg-black'
          }`}
        >
          {t('account.profile')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('adresses')}
          className={`pb-3 font-medium transition-colors cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'adresses'
              ? 'border-foeg-black text-foeg-black'
              : 'border-transparent text-foeg-muted hover:text-foeg-black'
          }`}
        >
          {t('account.addresses')} ({addresses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('commandes')}
          className={`pb-3 font-medium transition-colors cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'commandes'
              ? 'border-foeg-black text-foeg-black'
              : 'border-transparent text-foeg-muted hover:text-foeg-black'
          }`}
        >
          {t('account.orders')} ({recentOrders.length})
        </button>
        <Link
          href="/cuenta/deseos"
          className="pb-3 text-foeg-muted hover:text-foeg-black transition-colors font-light border-b-2 border-transparent shrink-0"
        >
          {t('wishlist.title').split('·')[0].trim()}
        </Link>
      </div>

      {/* CONTENIDO DEL TAB ACTIVO */}
      <div>
        {/* ======================= TAB: MON PROFIL ======================= */}
        {activeTab === 'profil' && (
          <div className="max-w-xl space-y-8 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-light text-foeg-black">
                Informations Personnelles
              </h2>
              <p className="text-xs text-foeg-muted font-light">
                Gérez votre identité et renforcez la sécurité de votre compte atelier.
              </p>
            </div>

            {/* Photo de Profil / Avatar (Synchronisée avec Google ou Cloud Atelier) */}
            <div className="flex items-center space-x-6 pb-6 border-b border-foeg-border/80">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[#C5A880]/60 bg-foeg-surface flex items-center justify-center shrink-0 shadow-subtle">
                {avatar ? (
                  <Image src={avatar} alt={name || 'Avatar'} fill sizes="80px" className="object-cover" />
                ) : (
                  <span className="font-serif text-2xl font-normal text-foeg-navy uppercase">
                    {(name || 'C').charAt(0)}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium block">
                  {language === 'es' ? 'Foto de Perfil' : language === 'en' ? 'Profile Picture' : 'Photo de Profil'}
                </span>
                <div className="flex items-center space-x-3">
                  <label className="px-3.5 py-1.5 bg-white border border-foeg-border/80 hover:border-foeg-navy text-foeg-black text-[11px] uppercase tracking-wider font-medium cursor-pointer transition-colors shadow-2xs">
                    {avatarUploading
                      ? (language === 'es' ? 'Subiendo...' : language === 'en' ? 'Uploading...' : 'Téléversement...')
                      : (language === 'es' ? 'Cambiar foto' : language === 'en' ? 'Change picture' : 'Changer la photo')}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                    />
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-[10px] uppercase tracking-wider text-foeg-muted hover:text-red-700 transition-colors cursor-pointer"
                    >
                      {language === 'es' ? 'Eliminar' : language === 'en' ? 'Delete' : 'Supprimer'}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-foeg-muted font-light">
                  {language === 'es'
                    ? 'JPG o PNG alta definición. Sincronizada con Google o Atelier.'
                    : language === 'en'
                    ? 'High-definition JPG or PNG. Synced with Google or Atelier.'
                    : 'JPG ou PNG haute définition. Synchronisée avec Google ou Cloud Atelier.'}
                </p>
              </div>
            </div>

            {profileMessage && (
              <div
                className={`p-4 text-xs font-light flex items-center space-x-3 border ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {language === 'es' ? 'Nombre Completo' : language === 'en' ? 'Full Name' : 'Nom Complet'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-foeg-border focus:border-foeg-navy px-4 py-3 text-xs text-foeg-black focus:outline-none font-light"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {language === 'es' ? 'Correo Electrónico (No modificable)' : language === 'en' ? 'Email Address (Read-only)' : 'Adresse Courriel (Identifiant non modifiable)'}
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full bg-gray-50 border border-foeg-border px-4 py-3 text-xs text-foeg-muted font-light cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-foeg-border/80 space-y-4">
                <span className="text-[11px] uppercase tracking-[0.2em] text-foeg-black font-medium block">
                  {language === 'es' ? 'Cambiar Contraseña (Opcional)' : language === 'en' ? 'Change Password (Optional)' : 'Modifier le Mot de Passe (Optionnel)'}
                </span>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                    {language === 'es' ? 'Contraseña actual' : language === 'en' ? 'Current password' : 'Mot de passe actuel'}
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-foeg-border focus:border-foeg-navy px-4 py-3 text-xs text-foeg-black focus:outline-none font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                    {language === 'es' ? 'Nueva contraseña' : language === 'en' ? 'New password' : 'Nouveau mot de passe'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={language === 'es' ? 'Al menos 6 caracteres' : language === 'en' ? 'At least 6 characters' : 'Au moins 6 caractères'}
                    className="w-full bg-white border border-foeg-border focus:border-foeg-navy px-4 py-3 text-xs text-foeg-black focus:outline-none font-light"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3.5 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-[0.25em] font-medium transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{language === 'es' ? 'Guardar Cambios' : language === 'en' ? 'Save Changes' : 'Enregistrer les modifications'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ======================= TAB: MES ADRESSES ======================= */}
        {activeTab === 'adresses' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-light text-foeg-black">
                  {language === 'es' ? 'Libreta de Direcciones' : language === 'en' ? 'Address Book' : 'Carnet d’Adresses'}
                </h2>
                <p className="text-xs text-foeg-muted font-light">
                  {language === 'es'
                    ? 'Guarde sus direcciones para un pago inmediato en sus próximos pedidos.'
                    : language === 'en'
                    ? 'Save your addresses for instant checkout on future orders.'
                    : 'Enregistrez vos adresses pour un règlement immédiat lors de vos prochaines commandes.'}
                </p>
              </div>

              {!isAddingAddress && (
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] px-4 py-2.5 bg-foeg-navy text-white hover:bg-black transition-colors font-medium cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Nueva dirección' : language === 'en' ? 'New address' : 'Nouvelle adresse'}</span>
                </button>
              )}
            </div>

            {/* Formulaire Nouvelle Adresse */}
            {isAddingAddress && (
              <div className="p-6 border border-foeg-navy bg-white max-w-xl space-y-6 shadow-subtle">
                <div className="flex items-center justify-between border-b border-foeg-border pb-3">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-foeg-black font-medium">
                    {language === 'es' ? 'Añadir dirección de entrega' : language === 'en' ? 'Add shipping address' : 'Ajouter une adresse de livraison'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="text-xs text-foeg-muted hover:text-foeg-black cursor-pointer"
                  >
                    {language === 'es' ? 'Cancelar' : language === 'en' ? 'Cancel' : 'Annuler'}
                  </button>
                </div>

                {addressError && (
                  <p className="text-xs text-red-700 bg-red-50 p-3 border border-red-200 font-light">
                    {addressError}
                  </p>
                )}

                <form onSubmit={handleSaveAddress} className="space-y-4 text-xs font-light">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium">
                        {language === 'es' ? 'Título (ej. Casa, Oficina)' : language === 'en' ? 'Label (e.g. Home, Office)' : 'Intitulé (ex. Domicile, Bureau)'}
                      </label>
                      <input
                        type="text"
                        value={newAddress.title}
                        onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                        className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium">
                        {language === 'es' ? 'Destinatario' : language === 'en' ? 'Recipient' : 'Destinataire'}
                      </label>
                      <input
                        type="text"
                        value={newAddress.recipient}
                        onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
                        className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium">
                      {language === 'es' ? 'Calle y número' : language === 'en' ? 'Street address' : 'Rue et numéro'}
                    </label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      placeholder="12 rue de la Paix"
                      className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium">
                        {language === 'es' ? 'Código Postal' : language === 'en' ? 'Postal Code' : 'Code Postal'}
                      </label>
                      <input
                        type="text"
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        placeholder="75001"
                        className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium">
                        {language === 'es' ? 'Ciudad' : language === 'en' ? 'City' : 'Ville'}
                      </label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium">
                        {language === 'es' ? 'País' : language === 'en' ? 'Country' : 'Pays'}
                      </label>
                      <input
                        type="text"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="rounded border-foeg-border text-foeg-navy focus:ring-0"
                    />
                    <label htmlFor="isDefault" className="text-xs text-foeg-black cursor-pointer">
                      {language === 'es' ? 'Establecer como dirección predeterminada' : language === 'en' ? 'Set as default shipping address' : 'Définir comme adresse de livraison par défaut'}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={addressLoading}
                    className="w-full py-3 bg-foeg-navy text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {addressLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{language === 'es' ? 'Guardar dirección' : language === 'en' ? 'Save address' : 'Enregistrer l’adresse'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* Liste des adresses */}
            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-6 border bg-white space-y-4 relative flex flex-col justify-between ${
                      addr.isDefault ? 'border-foeg-navy shadow-subtle' : 'border-foeg-border/80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg text-foeg-black">{addr.title}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-foeg-navy text-white font-medium">
                            {language === 'es' ? 'Predeterminada' : language === 'en' ? 'Default' : 'Par défaut'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-foeg-muted font-light space-y-0.5">
                        <p className="text-foeg-black font-medium">{addr.recipient}</p>
                        <p>{addr.street}</p>
                        <p>
                          {addr.postalCode} {addr.city}
                        </p>
                        <p>{addr.country}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-foeg-border/60 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-foeg-muted hover:text-red-700 transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-foeg-border/60 bg-foeg-surface/20 space-y-3">
                <MapPin className="w-8 h-8 mx-auto text-foeg-navy stroke-[1.2]" />
                <p className="font-serif text-xl text-foeg-black font-light">
                  Aucune adresse enregistrée
                </p>
                <p className="text-xs text-foeg-muted font-light max-w-sm mx-auto">
                  Ajoutez dès maintenant votre adresse pour faciliter vos futures commandes sur mesure.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: MES COMMANDES ======================= */}
        {activeTab === 'commandes' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-light text-foeg-black">
                  Historique des Commandes
                </h2>
                <p className="text-xs text-foeg-muted font-light">
                  Suivez en direct l’état de confection et d’acheminement de vos pièces.
                </p>
              </div>

              {recentOrders.length > 0 && (
                <Link
                  href="/cuenta/pedidos"
                  className="text-xs uppercase tracking-[0.2em] text-foeg-navy hover:text-black font-medium inline-flex items-center space-x-1"
                >
                  <span>{t('orders.viewAll')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {recentOrders.length > 0 ? (
              <div className="border border-foeg-border divide-y divide-foeg-border/80 bg-white">
                {recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-foeg-surface/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3 flex-wrap gap-1">
                        <span className="font-serif text-lg text-foeg-black font-normal">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 bg-foeg-surface border border-foeg-border font-medium text-foeg-black">
                          {getStatusLabel(ord.status)}
                        </span>
                      </div>
                      <p className="text-xs text-foeg-muted font-light">
                        {ord.date} · {ord.itemsCount} {ord.itemsCount === 1 ? 'pièce' : 'pièces'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-foeg-border/40">
                      <span className="font-serif text-lg text-foeg-black font-normal">
                        {formatPrice(ord.total)}
                      </span>
                      <Link
                        href={`/cuenta/pedidos/${ord.id}`}
                        className="px-4 py-2 bg-foeg-navy text-white text-xs uppercase tracking-[0.18em] font-medium hover:bg-black transition-colors"
                      >
                        {t('orders.details')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-foeg-border/60 bg-foeg-surface/20 space-y-4">
                <ShoppingBag className="w-8 h-8 mx-auto text-foeg-navy stroke-[1.2]" />
                <p className="font-serif text-xl text-foeg-black font-light">
                  Vous n’avez aucune commande active
                </p>
                <p className="text-xs text-foeg-muted font-light max-w-sm mx-auto">
                  Découvrez nos collections pour femme et homme confectionnées dans nos ateliers parisiens.
                </p>
                <Link
                  href="/femme"
                  className="inline-block mt-2 px-6 py-2.5 bg-foeg-navy text-white text-xs uppercase tracking-[0.2em]"
                >
                  Explorer la Collection
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
