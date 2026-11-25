'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Calendar,
  Lock,
} from 'lucide-react';
import {
  AdminProfileData,
  updateAdminProfile,
  changeAdminPassword,
} from '@/lib/admin-profile-actions';
import { useLanguage } from '@/lib/language-context';

interface AdminPerfilClientProps {
  initialProfile: AdminProfileData;
}

export default function AdminPerfilClient({ initialProfile }: AdminPerfilClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const [profile, setProfile] = useState<AdminProfileData>(initialProfile);
  const [profileForm, setProfileForm] = useState({
    name: initialProfile.name || '',
    email: initialProfile.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      showToast('Veuillez renseigner le nom et l’adresse courriel.', 'error');
      return;
    }

    setIsUpdatingProfile(true);
    const res = await updateAdminProfile(profileForm);
    setIsUpdatingProfile(false);

    if (res.success) {
      showToast(res.message || 'Profil mis à jour.');
      setProfile((prev) => ({
        ...prev,
        name: profileForm.name.trim(),
        email: profileForm.email.trim().toLowerCase(),
      }));
      startTransition(() => {
        router.refresh();
      });
    } else {
      showToast(res.error || 'Erreur lors de la mise à jour.', 'error');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      showToast('Le nouveau mot de passe doit comporter au moins 6 caractères.', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Les nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    const res = await changeAdminPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setIsUpdatingPassword(false);

    if (res.success) {
      showToast(res.message || 'Mot de passe modifié avec succès.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      showToast(res.error || 'Erreur lors du changement de mot de passe.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('foeg_admin_logged');
      sessionStorage.removeItem('foeg_admin_verified');
    } catch {}
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="space-y-6 sm:space-y-10 max-w-4xl p-3 sm:p-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 border shadow-floating text-xs uppercase tracking-wider font-medium flex items-center space-x-2 animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-700" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-700" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* En-tête Principal */}
      <div className="border-b border-foeg-black pb-6 space-y-1">
        <span className="text-[10px] uppercase tracking-[0.28em] text-foeg-muted block">
          {t('admin.perfil.tag')}
        </span>
        <h1 className="font-serif text-3xl font-light text-foeg-black">
          {t('admin.perfil.title')}
        </h1>
        <p className="text-xs text-foeg-muted font-light">
          {t('admin.perfil.subtitle')}
        </p>
      </div>

      {/* =========================================================================
          SECTION 1 : IDENTITÉ & COORDONNÉES ADMINISTRATEUR
      ========================================================================= */}
      <div className="bg-white border border-foeg-border/80 p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-foeg-border/60 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-foeg-navy text-white flex items-center justify-center font-serif text-sm font-light">
              FO
            </div>
            <div>
              <h2 className="font-serif text-lg text-foeg-black font-normal">
                {t('admin.perfil.identityTitle')}
              </h2>
              <span className="text-[11px] text-foeg-muted font-light">
                {t('admin.perfil.identityDesc')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
              <Shield className="w-3 h-3 text-emerald-700" />
              {profile.role || 'ADMIN'}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                {t('admin.perfil.nameLabel')} *
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Ex. Direction FOEG Paris"
                className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                {t('admin.perfil.emailLabel')} *
              </label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="direction@foeg-paris.com"
                className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono text-foeg-black focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-foeg-border/40 gap-4 text-xs">
            <div className="text-[11px] text-foeg-muted font-light flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {t('admin.perfil.activeSince')}{' '}
                {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="bg-foeg-navy hover:bg-foeg-black text-white px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-subtle disabled:opacity-50"
            >
              {isUpdatingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('admin.perfil.saveCoords')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* =========================================================================
          SECTION 2 : SÉCURITÉ & CHANGEMENT DE MOT DE PASSE
      ========================================================================= */}
      <div className="bg-white border border-foeg-border/80 p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-xs">
        <div className="pb-4 border-b border-foeg-border/60">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-foeg-navy" strokeWidth={1.5} />
            <h2 className="font-serif text-lg text-foeg-black font-normal">
              {t('admin.perfil.securityTitle')}
            </h2>
          </div>
          <p className="text-[11px] text-foeg-muted font-light mt-0.5">
            {t('admin.perfil.securityDesc')}
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                {t('admin.perfil.currentPassword')}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 pr-8 text-xs font-mono text-foeg-black focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-foeg-muted hover:text-foeg-black p-1 transition-colors cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                {t('admin.perfil.newPassword')} *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 pr-8 text-xs font-mono text-foeg-black focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-foeg-muted hover:text-foeg-black p-1 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                {t('admin.perfil.confirmPassword')} *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 pr-8 text-xs font-mono text-foeg-black focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-foeg-muted hover:text-foeg-black p-1 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-foeg-border/40 gap-4 text-xs">
            <span className="text-[11px] text-foeg-muted font-light">
              TLS 256-Bit &amp; Bcrypt 10 rounds
            </span>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="bg-foeg-navy hover:bg-foeg-black text-white px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-subtle disabled:opacity-50"
            >
              {isUpdatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('admin.perfil.updatePassword')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* =========================================================================
          SECTION 3 : PROTOCOLES DE SÉCURITÉ & DÉCONNEXION
      ========================================================================= */}
      <div className="p-4 sm:p-6 bg-foeg-surface/60 border border-foeg-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.22em] text-foeg-navy font-semibold block">
            {t('admin.perfil.sessionTitle')}
          </span>
          <p className="text-foeg-muted font-light text-[11px] leading-relaxed">
            {t('admin.perfil.sessionDesc')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center space-x-2 border border-red-300 text-red-700 hover:bg-red-50 px-5 py-2.5 text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('admin.perfil.logoutBtn')}</span>
        </button>
      </div>
    </div>
  );
}
