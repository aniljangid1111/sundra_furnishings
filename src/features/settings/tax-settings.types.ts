export interface TaxSlab {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  taxCode?: string;
  description: string;
  isActive: boolean;
}

export interface TaxSettingsConfig {
  defaultTaxRate: number;
  defaultTaxName: string;
  taxCalculationMode: "EXCLUSIVE" | "INCLUSIVE";
  taxLabel: string;
  ein: string;
  slabs: TaxSlab[];
}

export interface PaymentTerm {
  id: string;
  name: string;
  days: number;
  description: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CompanyProfile {
  name: string;
  legalName?: string;
  brandName?: string;
  tagline?: string;
  logoUrl: string;
  ein: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone: string;
  email: string;
  website?: string;
}
