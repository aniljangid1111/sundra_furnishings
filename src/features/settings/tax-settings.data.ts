import {
  CompanyProfile,
  PaymentTerm,
  TaxSettingsConfig,
  TaxSlab,
} from "./tax-settings.types";

export const defaultTaxSlabs: TaxSlab[] = [
  {
    id: "tax-std-825",
    name: "Standard US Sales Tax (8.25%)",
    rate: 8.25,
    isDefault: true,
    taxCode: "US-NC-COMB",
    description: "Combined State (4.75%) + Local County/City (3.50%) sales tax",
    isActive: true,
  },
  {
    id: "tax-resale-0",
    name: "Wholesale / Resale Certificate (0%)",
    rate: 0,
    isDefault: false,
    taxCode: "US-RESALE-EXEMPT",
    description: "Tax-exempt wholesale purchases under active State Resale Permit",
    isActive: true,
  },
  {
    id: "tax-outstate-0",
    name: "Out-of-State Non-Nexus Delivery (0%)",
    rate: 0,
    isDefault: false,
    taxCode: "US-NON-NEXUS",
    description: "Commercial shipments outside company tax nexus",
    isActive: true,
  },
  {
    id: "tax-flat-700",
    name: "Interstate Retail Flat Tax (7.00%)",
    rate: 7.0,
    isDefault: false,
    taxCode: "US-INTERSTATE-FLAT",
    description: "Standard single flat destination rate for neighboring states",
    isActive: true,
  },
];

export const defaultTaxSettings: TaxSettingsConfig = {
  defaultTaxRate: 8.25,
  defaultTaxName: "Standard US Sales Tax (8.25%)",
  taxCalculationMode: "EXCLUSIVE",
  taxLabel: "Sales Tax",
  ein: "84-2910394",
  slabs: defaultTaxSlabs,
};

export const defaultPaymentTerms: PaymentTerm[] = [
  {
    id: "term-net-30",
    name: "Net 30",
    days: 30,
    description: "Full invoice balance payable within 30 days of shipment",
    isDefault: true,
    isActive: true,
  },
  {
    id: "term-net-15",
    name: "Net 15",
    days: 15,
    description: "Fast-turn commercial billing payable within 15 calendar days",
    isDefault: false,
    isActive: true,
  },
  {
    id: "term-due-receipt",
    name: "Due on Receipt",
    days: 0,
    description: "Payment due immediately upon dispatch / delivery receipt",
    isDefault: false,
    isActive: true,
  },
  {
    id: "term-deposit-50",
    name: "50% Deposit + 50% Net 30",
    days: 30,
    description: "50% advance for custom carpentry, remaining within Net 30",
    isDefault: false,
    isActive: true,
  },
];

export const defaultCompanyProfile: CompanyProfile = {
  name: "Sundara Furnishings LLC",
  logoUrl: "/logo.png",
  ein: "84-2910394",
  address: "4820 South Blvd, Charlotte, NC 28217",
  phone: "+1 (704) 555-0199",
  email: "billing@sundarafurnishings.com",
};

const TAX_STORAGE_KEY = "sundara_tax_settings_v3";
const TERMS_STORAGE_KEY = "sundara_payment_terms_v3";
const PROFILE_STORAGE_KEY = "sundara_company_profile_v3";

export function getStoredTaxSettings(): TaxSettingsConfig {
  if (typeof window === "undefined") return defaultTaxSettings;
  try {
    const raw = localStorage.getItem(TAX_STORAGE_KEY);
    if (!raw) return defaultTaxSettings;
    const parsed = JSON.parse(raw);
    return {
      ...defaultTaxSettings,
      ...parsed,
      slabs:
        Array.isArray(parsed.slabs) && parsed.slabs.length > 0
          ? parsed.slabs
          : defaultTaxSlabs,
    };
  } catch {
    return defaultTaxSettings;
  }
}

export function saveStoredTaxSettings(cfg: TaxSettingsConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TAX_STORAGE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new Event("sundara_tax_settings_changed"));
  } catch (err) {
    console.error("Failed to save tax settings:", err);
  }
}

export function getDefaultTaxRate(): number {
  const cfg = getStoredTaxSettings();
  return typeof cfg.defaultTaxRate === "number" ? cfg.defaultTaxRate : 8.25;
}

export function getStoredPaymentTerms(): PaymentTerm[] {
  if (typeof window === "undefined") return defaultPaymentTerms;
  try {
    const raw = localStorage.getItem(TERMS_STORAGE_KEY);
    if (!raw) return defaultPaymentTerms;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultPaymentTerms;
  } catch {
    return defaultPaymentTerms;
  }
}

export function saveStoredPaymentTerms(terms: PaymentTerm[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(terms));
  } catch (err) {
    console.error("Failed to save payment terms:", err);
  }
}

export function getStoredCompanyProfile(): CompanyProfile {
  if (typeof window === "undefined") return defaultCompanyProfile;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return defaultCompanyProfile;
    const parsed = JSON.parse(raw);
    return { ...defaultCompanyProfile, ...parsed };
  } catch {
    return defaultCompanyProfile;
  }
}

export function saveStoredCompanyProfile(profile: CompanyProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("sundara_profile_changed"));
  } catch (err) {
    console.error("Failed to save company profile:", err);
  }
}
