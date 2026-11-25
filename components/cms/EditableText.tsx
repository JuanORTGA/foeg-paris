'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCmsEditor } from '@/lib/cms-context';
import { useLanguage } from '@/lib/language-context';
import { updateContentField } from '@/app/admin/cms/actions';
import { Check, Loader2 } from 'lucide-react';

interface EditableTextProps {
  contentKey: string;
  defaultValue?: string;
  initialValue?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'blockquote' | 'div';
  className?: string;
  multiline?: boolean;
}

export default function EditableText({
  contentKey,
  defaultValue = '',
  initialValue,
  as: Component = 'span',
  className = '',
  multiline = false,
}: EditableTextProps) {
  const effectiveDefault = initialValue !== undefined ? initialValue : defaultValue;
  const { isEditing, activeLanguage, setLiveOverride, registerSaveStart, registerSaveEnd } = useCmsEditor();
  const { language } = useLanguage();
  const currentLang = isEditing ? activeLanguage : language;

  const [text, setText] = useState(effectiveDefault);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setText(effectiveDefault);
    if (elementRef.current) {
      elementRef.current.innerText = effectiveDefault;
    }
  }, [effectiveDefault]);

  // Si no está en modo de edición, renderizamos el texto estático de la tienda
  if (!isEditing) {
    return <Component className={className}>{text}</Component>;
  }

  const handleBlur = async () => {
    if (!elementRef.current) return;
    const newText = elementRef.current.innerText.trim();

    if (newText === text) return;

    setText(newText);
    setLiveOverride(contentKey, newText);
    setIsSaving(true);
    registerSaveStart(contentKey);

    try {
      const res = await updateContentField(contentKey, newText, activeLanguage);
      if (res.success) {
        setIsSaved(true);
        registerSaveEnd(contentKey, true);
        setTimeout(() => setIsSaved(false), 2500);
      } else {
        registerSaveEnd(contentKey, false);
      }
    } catch (err) {
      console.error('[EDITABLE TEXT SAVE ERROR]:', err);
      registerSaveEnd(contentKey, false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      elementRef.current?.blur();
    }
  };

  return (
    <span className="relative inline-block group/editable">
      <Component
        ref={elementRef as any}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        title="Clic para editar este texto directamente"
        className={`outline-none transition-all duration-200 cursor-text rounded-xs ${className} border-b border-dashed border-blue-400/60 hover:border-blue-600 hover:bg-blue-500/10 focus:border-blue-600 focus:bg-blue-500/15 focus:ring-1 focus:ring-blue-400/40`}
      >
        {text}
      </Component>

      {/* Indicador de estado de guardado sutil */}
      {isSaving && (
        <span className="absolute -top-3 -right-3 z-30 bg-foeg-navy text-white text-[8px] px-1 py-0.5 rounded-full flex items-center shadow-xs">
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
        </span>
      )}
      {isSaved && (
        <span className="absolute -top-3 -right-3 z-30 bg-emerald-700 text-white text-[8px] px-1 py-0.5 rounded-full flex items-center shadow-xs animate-fadeIn">
          <Check className="w-2.5 h-2.5" />
        </span>
      )}
    </span>
  );
}
