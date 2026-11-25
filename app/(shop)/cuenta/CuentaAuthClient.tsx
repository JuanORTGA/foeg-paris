'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { registerUser } from './actions';

interface CuentaAuthClientProps {
  callbackUrl?: string;
}

export default function CuentaAuthClient({ callbackUrl = '/' }: CuentaAuthClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setErrorMessage('Identifiants non reconnus. Veuillez vérifier votre adresse et mot de passe.');
          setLoading(false);
          return;
        }

        router.push(callbackUrl);
        router.refresh();
      } else {
        const fullName = `${firstName} ${lastName}`.trim();
        const res = await registerUser({
          name: fullName,
          email,
          password,
        });

        if (!res.success) {
          setErrorMessage(res.error || 'Erreur lors de la création du compte.');
          setLoading(false);
          return;
        }

        const autoLogin = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (!autoLogin?.error) {
          router.push(callbackUrl);
          router.refresh();
        } else {
          setActiveTab('login');
          setSuccessMessage('Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMessage('Une erreur imprévue est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 md:pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md mx-auto space-y-10">
        {/* Cabecera Editorial */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
            {language === 'es' ? 'Espacio Privado · Maison FOEG París' : language === 'en' ? 'Private Space · Maison FOEG Paris' : 'Espace Privé · Maison FOEG Paris'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
            {t('nav.account')}
          </h1>
          <p className="text-xs text-foeg-muted font-light leading-relaxed max-w-xs mx-auto">
            {language === 'es' ? 'Acceda a sus pedidos, direcciones y privilegios exclusivos del Círculo Privado.' : language === 'en' ? 'Access your orders, saved addresses, and exclusive Private Circle privileges.' : 'Accédez à vos commandes, adresses enregistrées et privilèges exclusifs du Cercle Privé.'}
          </p>
        </div>

        {/* Message d'exclusivité Atelier pour finaliser la commande */}
        {callbackUrl.includes('checkout') && (
          <div className="p-4 bg-foeg-navy/5 border border-foeg-navy/20 text-foeg-navy text-xs flex items-center space-x-3 animate-fadeIn">
            <Lock className="w-4 h-4 shrink-0 text-foeg-navy" strokeWidth={1.5} />
            <p className="font-light leading-relaxed">
              {language === 'es'
                ? 'Para adquirir una creación de la Maison, certificar su pieza y acceder al seguimiento de Atelier, por favor inicie sesión o cree su cuenta privada.'
                : language === 'en'
                ? 'To acquire a creation from the Maison, certify your piece, and access Atelier tracking, please sign in or create your private account.'
                : 'Pour acquérir une création de la Maison, certifier votre pièce et accéder au suivi d’Atelier, veuillez vous connecter ou créer votre compte privé.'}
            </p>
          </div>
        )}

        {/* Dos Pestañas Minimalistas */}
        <div className="flex border-b border-foeg-border text-xs uppercase tracking-[0.2em]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`w-1/2 pb-3.5 text-center font-medium transition-all duration-300 relative cursor-pointer ${activeTab === 'login'
                ? 'text-foeg-black'
                : 'text-foeg-muted hover:text-foeg-black font-light'
              }`}
          >
            <span>{t('account.signIn')}</span>
            {activeTab === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foeg-navy animate-fadeIn" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`w-1/2 pb-3.5 text-center font-medium transition-all duration-300 relative cursor-pointer ${activeTab === 'register'
                ? 'text-foeg-black'
                : 'text-foeg-muted hover:text-foeg-black font-light'
              }`}
          >
            <span>{t('account.create')}</span>
            {activeTab === 'register' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foeg-navy animate-fadeIn" />
            )}
          </button>
        </div>

        {/* Avisos de error y éxito */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-4 flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" strokeWidth={1.5} />
            <p className="leading-relaxed font-light">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-4 flex items-start space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" strokeWidth={1.5} />
            <p className="leading-relaxed font-light">{successMessage}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
          {activeTab === 'register' && (
            <div className="grid grid-cols-2 gap-6 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {language === 'es' ? 'Nombre' : language === 'en' ? 'First Name' : 'Prénom'}
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Claire"
                  className="w-full bg-transparent border-b border-gray-300 focus:border-foeg-navy text-xs text-foeg-black py-2.5 focus:outline-none transition-colors font-light placeholder:text-gray-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {language === 'es' ? 'Apellido' : language === 'en' ? 'Last Name' : 'Nom'}
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="de La Tour"
                  className="w-full bg-transparent border-b border-gray-300 focus:border-foeg-navy text-xs text-foeg-black py-2.5 focus:outline-none transition-colors font-light placeholder:text-gray-300"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
              {language === 'es' ? 'Correo Electrónico' : language === 'en' ? 'Email Address' : 'Adresse Courriel'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="claire.delatour@paris.fr"
              className="w-full bg-transparent border-b border-gray-300 focus:border-foeg-navy text-xs text-foeg-black py-2.5 focus:outline-none transition-colors font-light placeholder:text-gray-300"
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {language === 'es' ? 'Contraseña' : language === 'en' ? 'Password' : 'Mot de Passe'}
              </label>
              {activeTab === 'login' && (
                <button
                  type="button"
                  onClick={() => alert(language === 'es' ? 'Se enviará un enlace de restablecimiento a su correo.' : language === 'en' ? 'A reset link will be sent to your email.' : 'Un lien de réinitialisation vous sera adressé.')}
                  className="text-[10px] text-foeg-muted hover:text-foeg-navy transition-colors font-light cursor-pointer"
                >
                  {language === 'es' ? '¿Olvidó su contraseña?' : language === 'en' ? 'Forgot password?' : 'Mot de passe oublié ?'}
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                id="client-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-transparent border-b border-gray-300 focus:border-foeg-navy text-xs text-foeg-black py-2.5 pr-10 focus:outline-none transition-colors font-light placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword((prev) => !prev);
                }}
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

          {/* Botón Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 rounded-none bg-foeg-navy text-foeg-white hover:bg-foeg-black flex items-center justify-center space-x-2 shadow-subtle cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <span>
              {loading
                ? (language === 'es' ? 'Procesando...' : language === 'en' ? 'Processing...' : 'Traitement...')
                : activeTab === 'login'
                  ? t('account.signIn')
                  : (language === 'es' ? 'Crear mi Cuenta' : language === 'en' ? 'Create my Account' : 'Créer mon Compte')}
            </span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1} />
          </button>

          {/* Separador Elegante con Estilo Maison */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-foeg-border/80"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.22em]">
              <span className="bg-white px-4 text-foeg-muted font-light">
                {language === 'es' ? 'o continuar con' : language === 'en' ? 'or continue with' : 'ou continuer avec'}
              </span>
            </div>
          </div>

          {/* Botón de Google con Elegancia Silenciosa */}
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full py-3.5 px-6 border border-foeg-border hover:border-foeg-navy bg-white hover:bg-foeg-surface/40 text-foeg-black text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 flex items-center justify-center space-x-3 rounded-none shadow-xs cursor-pointer active:scale-[0.99]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {activeTab === 'login'
                ? (language === 'es' ? 'Acceder con Google' : language === 'en' ? 'Sign in with Google' : 'Connexion avec Google')
                : (language === 'es' ? 'Registrarse con Google' : language === 'en' ? 'Register with Google' : 'S’inscrire avec Google')}
            </span>
          </button>

          {/* Acceso a Pedidos y Lista de Deseos */}
          <div className="pt-4 text-center border-t border-foeg-border/60 space-y-2">
            <div>
              <Link
                href="/cuenta/deseos"
                className="text-[11px] uppercase tracking-[0.18em] text-foeg-black hover:text-foeg-navy transition-colors font-medium"
              >
                {language === 'es' ? 'Acceder a mi lista de deseos (Wishlist) →' : language === 'en' ? 'Access my wishlist →' : 'Accéder à ma liste de désirs (Wishlist) →'}
              </Link>
            </div>
            <div>
              <Link
                href="/cuenta/pedidos"
                className="text-[11px] uppercase tracking-[0.18em] text-foeg-muted hover:text-foeg-navy transition-colors font-light"
              >
                {language === 'es' ? 'Consultar historial de pedidos →' : language === 'en' ? 'View order history →' : 'Consulter l’historique des commandes →'}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
