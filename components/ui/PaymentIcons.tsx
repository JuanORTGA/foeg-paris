import React from 'react';

export function VisaIcon({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.12 0.5L12.52 15.5H8.16L5.02 3.66C4.84 2.92 4.66 2.66 4.08 2.34C3.12 1.82 1.48 1.34 0.1 1.04L0.2 0.5H6.96C7.84 0.5 8.64 1.1 8.84 2.14L10.52 11.08L14.78 0.5H19.12ZM35.96 10.54C36 6.54 30.42 6.32 30.46 4.54C30.48 4 30.98 3.42 32.1 3.26C32.66 3.18 34.22 3.12 35.98 3.94L36.68 0.7C35.72 0.36 34.5 0.04 32.96 0.04C28.92 0.04 26.08 2.18 26.06 5.24C26.02 7.52 28.06 8.78 29.62 9.54C31.22 10.32 31.76 10.82 31.74 11.52C31.72 12.6 30.44 13.08 29.28 13.1C27.24 13.12 26.04 12.54 25.1 12.1L24.38 15.48C25.32 15.92 27.06 16.28 28.86 16.3C33.14 16.3 35.94 14.18 35.96 10.54ZM46.6 15.5H42.74C41.54 15.5 40.66 15.16 40.14 13.92L34.28 0.5H38.7C39.66 0.5 40.5 1.16 40.72 2.14L41.76 7.64L44.3 0.5H48.42L46.6 15.5ZM25.04 0.5L21.64 15.5H17.52L20.92 0.5H25.04Z"
        fill="#1A1F71"
      />
    </svg>
  );
}

export function MastercardIcon({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="20" rx="3" fill="#FFFFFF" fillOpacity="0" />
      <circle cx="11" cy="10" r="7.5" fill="#EB001B" />
      <circle cx="21" cy="10" r="7.5" fill="#F79E1B" fillOpacity="0.88" />
    </svg>
  );
}

export function PaypalIcon({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.378A.801.801 0 0 1 5.736 1.7h7.114c3.275 0 5.412 1.637 4.887 4.966-.462 2.946-2.587 4.606-5.462 4.606H8.922l-1.383 8.775a.642.642 0 0 1-.463.55v.74z"
        fill="#003087"
      />
      <path
        d="M9.138 17.574h2.788c2.875 0 5-1.66 5.462-4.606.525-3.329-1.612-4.966-4.887-4.966H6.974a.8.8 0 0 0-.792.678l-1.897 12.04h3.332l1.52-3.146z"
        fill="#0079C1"
      />
    </svg>
  );
}

export function ZelleIcon({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#7414CA" />
      <path
        d="M6 7.5h10.5l-8 9H18M11.5 5v3.5M12.5 15.5V19"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BinanceIcon({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#181A20" />
      <path
        d="M12 4.5L14.7 7.2L9.9 12L12 14.1L16.8 9.3L19.5 12L12 19.5L4.5 12L12 4.5Z"
        fill="#F3BA2F"
      />
      <path d="M12 9.9L14.1 12L12 14.1L9.9 12L12 9.9Z" fill="#F3BA2F" />
    </svg>
  );
}

export function ZinliIcon({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#6729F3" />
      <path
        d="M7 8h10l-6.5 8H17"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.5" cy="8" r="1.5" fill="#00E5AA" />
    </svg>
  );
}

export function ApplePayIcon({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 38 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.3 3.6c-.6.8-1.5 1.3-2.4 1.2-.1-1 .3-1.9.9-2.6.6-.7 1.6-1.2 2.4-1.2.1 1-.3 1.9-.9 2.6zm.9 1.4c-1.3-.1-2.4.8-3 .8s-1.6-.7-2.6-.7c-1.4 0-2.6.8-3.3 2-1.4 2.5-.4 6.2 1 8.3.7 1 1.5 2.1 2.6 2.1s1.4-.7 2.7-.7c1.3 0 1.6.7 2.7.7s1.8-1 2.5-2.1c.8-1.2 1.1-2.4 1.2-2.5-.1 0-2.2-.9-2.3-3.4 0-2.1 1.7-3.2 1.8-3.2-1-1.5-2.6-1.6-3.1-1.7"
        fill="currentColor"
      />
      <text x="16" y="12" fill="currentColor" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="600" letterSpacing="0.05em">Pay</text>
    </svg>
  );
}

export function ShopPayIcon({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <span className="font-bold tracking-tight text-white flex items-center text-xs">
      shop<span className="bg-[#008060] text-white text-[9px] px-1 py-0.5 ml-0.5 rounded-sm uppercase tracking-wider font-semibold">Pay</span>
    </span>
  );
}
