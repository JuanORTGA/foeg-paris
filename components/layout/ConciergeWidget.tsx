'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  X,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { getGlobalSettings } from '@/lib/settings-actions';
import { submitConciergeTicket, ConciergeTicketPayload } from '@/lib/concierge-actions';

export default function ConciergeWidget() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'DIRECT' | 'FORM'>('DIRECT');

  const [settings, setSettings] = useState({
    phone: '+33 1 42 68 55 00',
    whatsapp: '+33 6 12 34 56 78',
    email: 'concierge@foeg-paris.com',
  });

  const [formData, setFormData] = useState<ConciergeTicketPayload>({
    name: '',
    email: '',
    phone: '',
    topic: 'SIZING',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getGlobalSettings()
      .then((s) => {
        setSettings({
          phone: s.contact_phone || '+33 1 42 68 55 00',
          whatsapp: s.contact_whatsapp || '+33 6 12 34 56 78',
          email: s.contact_email || 'concierge@foeg-paris.com',
        });
      })
      .catch(() => {});

    // Escuchar apertura desde el menú de usuario "Espacio Privado / Dirección" o el footer
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('open-concierge-modal', handleOpenModal);
    return () => window.removeEventListener('open-concierge-modal', handleOpenModal);
  }, []);

  const cleanWhatsappNumber = settings.whatsapp.replace(/[^0-9]/g, '');
  const whatsappGreeting =
    language === 'es'
      ? encodeURIComponent('Hola Maison FOEG, me gustaría recibir asesoría de la conserjería privada...')
      : language === 'en'
      ? encodeURIComponent('Hello Maison FOEG, I would like personal advice from the private concierge...')
      : encodeURIComponent('Bonjour Maison FOEG, je souhaite être conseillé(e) par la conciergerie privée...');

  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${whatsappGreeting}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await submitConciergeTicket(formData);
      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(res.error || (language === 'es' ? 'Error al enviar la consulta.' : language === 'en' ? 'Error sending inquiry.' : 'Erreur lors de l’envoi.'));
      }
    } catch (_) {
      setErrorMsg(language === 'es' ? 'Error de conexión con el taller.' : language === 'en' ? 'Connection error with the atelier.' : 'Erreur de connexion avec l’atelier.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setErrorMsg(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      topic: 'SIZING',
      message: '',
    });
  };

  return (
    <>
      {/* Modal / Cajón Lateral de Soporte (Invocado desde Espacio Privado en el Menú) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div
            className="w-full sm:max-w-md bg-white border border-foeg-border shadow-floating text-foeg-black flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="p-6 bg-foeg-surface/60 border-b border-foeg-border flex items-start justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-[0.28em] text-foeg-muted block mb-1">
                  Maison FOEG Paris · 75010
                </span>
                <h2 className="font-serif text-2xl font-normal text-foeg-black">
                  {language === 'es'
                    ? 'Conserjería del Atelier'
                    : language === 'en'
                    ? 'Atelier Concierge'
                    : 'Conciergerie de l’Atelier'}
                </h2>
                <p className="text-[11px] text-foeg-muted font-light mt-0.5">
                  {language === 'es'
                    ? 'Asistencia directa y asesoría personalizada.'
                    : language === 'en'
                    ? 'Direct assistance & personal styling advice.'
                    : 'Assistance directe & conseil personnalisé.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="p-1.5 text-foeg-muted hover:text-foeg-black transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Pestañas: Canales Directos vs Formulario */}
            <div className="flex border-b border-foeg-border text-[10px] uppercase tracking-[0.2em] font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('DIRECT')}
                className={`w-1/2 py-3 text-center transition-colors cursor-pointer ${
                  activeTab === 'DIRECT'
                    ? 'bg-white text-foeg-navy border-b-2 border-foeg-navy font-semibold'
                    : 'bg-foeg-surface/30 text-foeg-muted hover:text-foeg-black'
                }`}
              >
                {language === 'es' ? 'Canales Directos' : language === 'en' ? 'Direct Channels' : 'Canaux Directs'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('FORM')}
                className={`w-1/2 py-3 text-center transition-colors cursor-pointer ${
                  activeTab === 'FORM'
                    ? 'bg-white text-foeg-navy border-b-2 border-foeg-navy font-semibold'
                    : 'bg-foeg-surface/30 text-foeg-muted hover:text-foeg-black'
                }`}
              >
                {language === 'es' ? 'Cita o Consulta' : language === 'en' ? 'Book or Inquire' : 'Message Privé'}
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-light">
              {activeTab === 'DIRECT' ? (
                <div className="space-y-4">
                  {/* WhatsApp VIP Oficial */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-foeg-border hover:border-emerald-700 bg-white hover:bg-emerald-50/20 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-foeg-black group-hover:text-emerald-800">
                          {language === 'es' ? 'WhatsApp Conserjería VIP' : language === 'en' ? 'VIP WhatsApp Concierge' : 'WhatsApp Conciergerie VIP'}
                        </div>
                        <div className="text-[10px] text-foeg-muted">
                          {settings.whatsapp} · {language === 'es' ? 'Respuesta directa de París' : language === 'en' ? 'Direct reply from Paris' : 'Réponse directe de Paris'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foeg-muted group-hover:text-emerald-800 transition-transform group-hover:translate-x-0.5" />
                  </a>

                  {/* Teléfono de París */}
                  <a
                    href={`tel:${settings.phone}`}
                    className="p-4 border border-foeg-border hover:border-foeg-navy bg-white hover:bg-foeg-surface/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-9 h-9 rounded-full bg-foeg-navy/10 text-foeg-navy flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-foeg-black group-hover:text-foeg-navy">
                          {language === 'es' ? 'Atelier París (Llamada Directa)' : language === 'en' ? 'Paris Atelier (Direct Call)' : 'Atelier Paris (Ligne Directe)'}
                        </div>
                        <div className="text-[10px] text-foeg-muted">
                          {settings.phone}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foeg-muted group-hover:text-foeg-navy transition-transform group-hover:translate-x-0.5" />
                  </a>

                  {/* Correo Oficial */}
                  <a
                    href={`mailto:${settings.email}`}
                    className="p-4 border border-foeg-border hover:border-foeg-navy bg-white hover:bg-foeg-surface/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-9 h-9 rounded-full bg-foeg-navy/10 text-foeg-navy flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-foeg-black group-hover:text-foeg-navy">
                          {language === 'es' ? 'Correo de Conserjería' : language === 'en' ? 'Concierge Email' : 'Courriel Conciergerie'}
                        </div>
                        <div className="text-[10px] text-foeg-muted">
                          {settings.email}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foeg-muted group-hover:text-foeg-navy transition-transform group-hover:translate-x-0.5" />
                  </a>

                  {/* Horario y Boutique Física */}
                  <div className="p-4 bg-foeg-surface/60 border border-foeg-border/80 space-y-2 mt-4">
                    <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.16em] font-medium text-foeg-black">
                      <Clock className="w-3.5 h-3.5 text-foeg-navy" />
                      <span>{language === 'es' ? 'Horario de Atención París' : language === 'en' ? 'Paris Operating Hours' : 'Horaires Atelier Paris'}</span>
                    </div>
                    <p className="text-[11px] text-foeg-muted leading-relaxed">
                      {language === 'es'
                        ? 'Lunes a Sábado : 10:00 – 19:00 (Hora de París). Fuera de horario, déjenos un mensaje privado.'
                        : language === 'en'
                        ? 'Monday to Saturday : 10:00 – 19:00 (CET). Outside hours, please leave a private message.'
                        : 'Lundi au Samedi : 10:00 – 19:00 (Heure de Paris). En dehors de ces plages, veuillez nous adresser un message.'}
                    </p>
                    <div className="text-[10px] text-foeg-muted pt-1 border-t border-foeg-border/50">
                      📍 48 Rue Lucien Sampaix, 75010 Paris
                    </div>
                  </div>
                </div>
              ) : submitted ? (
                /* Pantalla de Éxito */
                <div className="py-10 text-center space-y-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl font-normal text-foeg-black">
                    {language === 'es' ? 'Mensaje Transmitido al Taller' : language === 'en' ? 'Message Sent to Atelier' : 'Message Transmis à l’Atelier'}
                  </h3>
                  <p className="text-xs text-foeg-muted max-w-xs mx-auto leading-relaxed">
                    {language === 'es'
                      ? 'Nuestros asesores de conserjería revisarán su solicitud con la máxima atención y le responderán en menos de 24 horas.'
                      : language === 'en'
                      ? 'Our private concierge advisors will review your inquiry with the utmost care and reply within 24 hours.'
                      : 'Nos conseillers de conciergerie étudieront votre demande avec la plus haute attention et vous répondront sous 24 heures.'}
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-4 px-6 py-2.5 bg-foeg-navy text-white text-[10px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                  >
                    {language === 'es' ? 'Enviar otra consulta' : language === 'en' ? 'New inquiry' : 'Autre demande'}
                  </button>
                </div>
              ) : (
                /* Formulario de Asistencia Privada */
                <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-[11px]">
                      {errorMsg}
                    </div>
                  )}

                  {/* Asunto */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-foeg-muted block font-medium">
                      {language === 'es' ? 'Motivo de su Consulta' : language === 'en' ? 'Subject of Inquiry' : 'Objet de la Demande'}
                    </label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value as any })}
                      className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-2.5 rounded-none font-light focus:outline-none focus:border-foeg-navy"
                    >
                      <option value="SIZING">
                        {language === 'es' ? 'Asesoría de tallas y medidas exactas' : language === 'en' ? 'Fit & exact sizing advice' : 'Conseil de coupe & tailles'}
                      </option>
                      <option value="FABRICS">
                        {language === 'es' ? 'Información sobre tejidos nobles y cuidados' : language === 'en' ? 'Noble fabrics & garment care' : 'Matières nobles & entretien'}
                      </option>
                      <option value="APPOINTMENT">
                        {language === 'es' ? 'Cita privada en el Atelier de París' : language === 'en' ? 'Private appointment at Paris Atelier' : 'Rendez-vous privé à l’Atelier Paris'}
                      </option>
                      <option value="ORDER_TRACKING">
                        {language === 'es' ? 'Seguimiento de un pedido en curso' : language === 'en' ? 'Current order tracking' : 'Suivi de commande en cours'}
                      </option>
                      <option value="OTHER">
                        {language === 'es' ? 'Solicitud a medida / Otra consulta' : language === 'en' ? 'Bespoke request / Other' : 'Demande sur-mesure / Autre'}
                      </option>
                    </select>
                  </div>

                  {/* Nombre */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-foeg-muted block font-medium">
                      {language === 'es' ? 'Su Nombre' : language === 'en' ? 'Your Name' : 'Votre Nom'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Claire de La Tour"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-2.5 rounded-none font-light focus:outline-none focus:border-foeg-navy"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-foeg-muted block font-medium">
                      {language === 'es' ? 'Su Correo Electrónico' : language === 'en' ? 'Your Email' : 'Votre Courriel'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="claire@paris.fr"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-2.5 rounded-none font-light focus:outline-none focus:border-foeg-navy"
                    />
                  </div>

                  {/* Teléfono opcional */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-foeg-muted block font-medium">
                      {language === 'es' ? 'Teléfono (Opcional)' : language === 'en' ? 'Phone (Optional)' : 'Téléphone (Optionnel)'}
                    </label>
                    <input
                      type="tel"
                      placeholder="+33 6 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-2.5 rounded-none font-light focus:outline-none focus:border-foeg-navy"
                    />
                  </div>

                  {/* Mensaje */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-foeg-muted block font-medium">
                      {language === 'es' ? 'Su Mensaje' : language === 'en' ? 'Your Message' : 'Votre Message'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder={language === 'es' ? 'Describa su duda sobre cortes, medidas o prendas...' : 'Détaillez votre question sur les coupes, matières ou commandes...'}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-2.5 rounded-none font-light focus:outline-none focus:border-foeg-navy resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-foeg-navy hover:bg-foeg-black text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-200 flex items-center justify-center space-x-2 rounded-none cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'es' ? 'Transmitiendo...' : 'Transmission...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{language === 'es' ? 'Transmitir a Conserjería' : language === 'en' ? 'Send to Concierge' : 'Transmettre à l’Atelier'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="p-3 bg-foeg-surface/40 border-t border-foeg-border/80 flex items-center justify-between text-[10px] text-foeg-muted px-6">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-foeg-navy" />
                <span>{language === 'es' ? 'Confidencialidad Garantizada' : language === 'en' ? 'Guaranteed Privacy' : 'Confidentialité Garantie'}</span>
              </span>
              <span>FOEG Paris Haute Confection</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
