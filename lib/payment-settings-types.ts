export interface PaymentSettings {
  // Toggles d'activation
  enable_stripe: boolean;
  enable_paypal: boolean;
  enable_virement: boolean;
  enable_virement_2: boolean;
  enable_virement_3: boolean;
  enable_zelle: boolean;
  enable_binance: boolean;
  enable_zinli: boolean;
  enable_pagomovil: boolean;

  // Stripe
  stripe_publishable_key: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;

  // PayPal
  paypal_client_id: string;
  paypal_secret: string;

  // Banque Française 1 (Compte Principal - ex. BNP Paribas)
  bank_holder_name: string;
  bank_iban: string;
  bank_bic: string;
  bank_name: string;

  // Banque Française 2 (Compte Secondaire - ex. Société Générale)
  bank_holder_name_2: string;
  bank_iban_2: string;
  bank_bic_2: string;
  bank_name_2: string;

  // Banque Française 3 (Compte Alternatif - ex. Crédit Agricole)
  bank_holder_name_3: string;
  bank_iban_3: string;
  bank_bic_3: string;
  bank_name_3: string;

  // Zelle
  zelle_email: string;
  zelle_name: string;

  // Binance Pay
  binance_pay_id: string;
  binance_network: string;

  // Zinli
  zinli_email: string;
  zinli_name: string;

  // Pago Móvil
  pagomovil_bank: string;
  pagomovil_phone: string;
  pagomovil_id: string;
  pagomovil_name: string;
}

export interface PublicPaymentSettings {
  enable_stripe: boolean;
  enable_paypal: boolean;
  enable_virement: boolean;
  enable_virement_2: boolean;
  enable_virement_3: boolean;
  enable_zelle: boolean;
  enable_binance: boolean;
  enable_zinli: boolean;
  enable_pagomovil: boolean;

  stripe_publishable_key: string;
  paypal_client_id: string;

  // Banque 1
  bank_holder_name: string;
  bank_iban: string;
  bank_bic: string;
  bank_name: string;

  // Banque 2
  bank_holder_name_2: string;
  bank_iban_2: string;
  bank_bic_2: string;
  bank_name_2: string;

  // Banque 3
  bank_holder_name_3: string;
  bank_iban_3: string;
  bank_bic_3: string;
  bank_name_3: string;

  zelle_email: string;
  zelle_name: string;
  binance_pay_id: string;
  binance_network: string;
  zinli_email: string;
  zinli_name: string;
  pagomovil_bank: string;
  pagomovil_phone: string;
  pagomovil_id: string;
  pagomovil_name: string;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  // Par défaut, Stripe et Virement Bancaire Principal sont activés
  enable_stripe: true,
  enable_paypal: false,
  enable_virement: true,
  enable_virement_2: false,
  enable_virement_3: false,
  enable_zelle: false,
  enable_binance: false,
  enable_zinli: false,
  enable_pagomovil: false,

  stripe_publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  stripe_secret_key: process.env.STRIPE_SECRET_KEY || '',
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || '',
  paypal_client_id: process.env.PAYPAL_CLIENT_ID || '',
  paypal_secret: process.env.PAYPAL_SECRET || '',

  // Banque 1 (BNP Paribas)
  bank_holder_name: 'Maison FOEG Paris SAS',
  bank_iban: 'FR76 3000 4000 0100 0123 4567 890',
  bank_bic: 'BNPAFRFRPPXXX',
  bank_name: 'BNP Paribas Paris Marais',

  // Banque 2 (Société Générale)
  bank_holder_name_2: 'Maison FOEG Paris SAS',
  bank_iban_2: 'FR76 3000 3000 0200 0987 6543 210',
  bank_bic_2: 'SOGEFRFRPPXXX',
  bank_name_2: 'Société Générale Paris Bastille',

  // Banque 3 (Crédit Agricole)
  bank_holder_name_3: 'Maison FOEG Paris SAS',
  bank_iban_3: 'FR76 1820 6000 0300 0555 4443 221',
  bank_bic_3: 'AGRIFRPPXXX',
  bank_name_3: 'Crédit Agricole Île-de-France',

  zelle_email: 'concierge@foeg-paris.com',
  zelle_name: 'Maison FOEG Paris LLC',
  binance_pay_id: '892104928',
  binance_network: 'BSC (BEP20) / TRC20',
  zinli_email: 'payments@foeg-paris.com',
  zinli_name: 'Maison FOEG Paris',
  pagomovil_bank: 'Banco Mercantil (0105)',
  pagomovil_phone: '0414-9281049',
  pagomovil_id: 'V-29.892.400',
  pagomovil_name: 'Maison FOEG Paris',
};

export const DEFAULT_PUBLIC_PAYMENT_SETTINGS: PublicPaymentSettings = {
  enable_stripe: DEFAULT_PAYMENT_SETTINGS.enable_stripe,
  enable_paypal: DEFAULT_PAYMENT_SETTINGS.enable_paypal,
  enable_virement: DEFAULT_PAYMENT_SETTINGS.enable_virement,
  enable_virement_2: DEFAULT_PAYMENT_SETTINGS.enable_virement_2,
  enable_virement_3: DEFAULT_PAYMENT_SETTINGS.enable_virement_3,
  enable_zelle: DEFAULT_PAYMENT_SETTINGS.enable_zelle,
  enable_binance: DEFAULT_PAYMENT_SETTINGS.enable_binance,
  enable_zinli: DEFAULT_PAYMENT_SETTINGS.enable_zinli,
  enable_pagomovil: DEFAULT_PAYMENT_SETTINGS.enable_pagomovil,

  stripe_publishable_key: DEFAULT_PAYMENT_SETTINGS.stripe_publishable_key,
  paypal_client_id: DEFAULT_PAYMENT_SETTINGS.paypal_client_id,

  bank_holder_name: DEFAULT_PAYMENT_SETTINGS.bank_holder_name,
  bank_iban: DEFAULT_PAYMENT_SETTINGS.bank_iban,
  bank_bic: DEFAULT_PAYMENT_SETTINGS.bank_bic,
  bank_name: DEFAULT_PAYMENT_SETTINGS.bank_name,

  bank_holder_name_2: DEFAULT_PAYMENT_SETTINGS.bank_holder_name_2,
  bank_iban_2: DEFAULT_PAYMENT_SETTINGS.bank_iban_2,
  bank_bic_2: DEFAULT_PAYMENT_SETTINGS.bank_bic_2,
  bank_name_2: DEFAULT_PAYMENT_SETTINGS.bank_name_2,

  bank_holder_name_3: DEFAULT_PAYMENT_SETTINGS.bank_holder_name_3,
  bank_iban_3: DEFAULT_PAYMENT_SETTINGS.bank_iban_3,
  bank_bic_3: DEFAULT_PAYMENT_SETTINGS.bank_bic_3,
  bank_name_3: DEFAULT_PAYMENT_SETTINGS.bank_name_3,

  zelle_email: DEFAULT_PAYMENT_SETTINGS.zelle_email,
  zelle_name: DEFAULT_PAYMENT_SETTINGS.zelle_name,
  binance_pay_id: DEFAULT_PAYMENT_SETTINGS.binance_pay_id,
  binance_network: DEFAULT_PAYMENT_SETTINGS.binance_network,
  zinli_email: DEFAULT_PAYMENT_SETTINGS.zinli_email,
  zinli_name: DEFAULT_PAYMENT_SETTINGS.zinli_name,
  pagomovil_bank: DEFAULT_PAYMENT_SETTINGS.pagomovil_bank,
  pagomovil_phone: DEFAULT_PAYMENT_SETTINGS.pagomovil_phone,
  pagomovil_id: DEFAULT_PAYMENT_SETTINGS.pagomovil_id,
  pagomovil_name: DEFAULT_PAYMENT_SETTINGS.pagomovil_name,
};
