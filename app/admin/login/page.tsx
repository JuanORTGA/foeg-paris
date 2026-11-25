'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { loginAdminAction } from './actions';

export default function AdminLoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('admin@foeg-paris.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await loginAdminAction({ email, password });
      if (!res.success && res.error) {
        setErrorMessage(res.error);
        setLoading(false);
      } else if (res.success) {
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
        // Redirection interne de Next.js
        return;
      }
      setErrorMessage('Une erreur est survenue lors de l’authentification.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-foeg-white text-foeg-black flex flex-col justify-between p-6 sm:p-12">
      {/* Cabecera discreta con retorno a la tienda y selector de idioma */}
      <div className="flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.25em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          ← Retour à la Maison
        </Link>
        <div className="flex items-center space-x-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium hidden sm:inline">
            Maison FOEG · Paris
          </span>
          <div className="flex items-center space-x-1.5 text-xs font-sans tracking-[0.14em] text-foeg-black">
            {(['fr', 'en', 'es'] as const).map((lang, idx) => (
              <React.Fragment key={lang}>
                {idx > 0 && <span className="opacity-30">/</span>}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setLanguage(lang)}
                  className={`uppercase transition-all duration-200 cursor-pointer ${
                    language === lang
                      ? 'font-bold text-foeg-navy underline underline-offset-4'
                      : 'text-foeg-muted hover:text-foeg-black font-light'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Contenedor Central Minimalista (max-w-sm) */}
      <div className="w-full max-w-sm mx-auto space-y-8 my-auto animate-fadeIn">
        {/* Logo del Pájaro FOEG en Grande */}
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-white p-2 shadow-subtle border border-foeg-border/80 flex items-center justify-center">
            <Image
              src="/logo-foeg.png"
              alt="FOEG Paris - Emblème Oiseau"
              width={88}
              height={88}
              priority
              className="object-contain"
            />
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black tracking-tight">
              Accès Privilégié
            </h1>
            <p className="text-xs text-foeg-muted font-light tracking-wide">
              Portail de gestion et d’administration des ateliers FOEG.
            </p>
          </div>
        </div>

        {/* Mensaje de Error si las credenciales fallan o no es ADMIN */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3.5 flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" strokeWidth={1.5} />
            <p className="leading-relaxed font-light">{errorMessage}</p>
          </div>
        )}

        {/* Formulario con bordes inferiores finos */}
        <form onSubmit={handleLogin} className="space-y-6" suppressHydrationWarning>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.22em] text-foeg-muted block font-medium">
              Identifiant / Courriel
            </label>
            <input
              type="email"
              required
              suppressHydrationWarning
              placeholder="admin@foeg-paris.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 focus:border-foeg-navy text-xs text-foeg-black py-2.5 focus:outline-none transition-colors font-light placeholder:text-gray-300 rounded-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.22em] text-foeg-muted block font-medium">
              Mot de Passe Atelier
            </label>
            <div className="relative flex items-center">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                suppressHydrationWarning
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-transparent border-b border-gray-300 focus:border-foeg-navy text-xs text-foeg-black py-2.5 pr-10 focus:outline-none transition-colors font-light placeholder:text-gray-300 rounded-none"
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword((prev) => !prev);
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute right-0 z-10 p-2 text-foeg-muted hover:text-foeg-black transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-foeg-navy" strokeWidth={1.5} />
                ) : (
                  <Eye className="w-4 h-4 text-foeg-muted" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-foeg-navy hover:bg-foeg-black text-foeg-white py-4 px-6 text-xs uppercase tracking-[0.24em] font-medium transition-colors duration-300 flex items-center justify-center space-x-2 shadow-subtle cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Vérification...' : 'Déverrouiller l’Atelier'}</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1} />
            </button>
          </div>
        </form>

        {/* Aviso de confidencialidad */}
        <div className="text-center pt-4 border-t border-foeg-border/60 text-[10px] text-foeg-muted font-light flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1} />
          <span>Accès crypté réservé à la direction de la Maison</span>
        </div>
      </div>

      {/* Pie inferior con copyright */}
      <div className="text-center text-[11px] text-foeg-muted font-light tracking-wide max-w-7xl mx-auto w-full pt-8">
        © 2026 FOEG Paris. Système de gestion interne sécurisé.
      </div>
    </div>
  );
}
