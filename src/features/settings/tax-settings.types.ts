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
  logoUrl: string;
  ein: string;
  address: string;
  phone: string;
  email: string;
}
