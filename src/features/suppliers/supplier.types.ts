export type SupplierType = "BUSINESS" | "INDIVIDUAL";

export type SupplierStatus = "ACTIVE" | "INACTIVE";

export type SupplierPaymentTerms =
  | "Due on Receipt"
  | "Net 15"
  | "Net 30"
  | "Net 45"
  | "Net 60"
  | "Advance Payment";

export interface Supplier {
  id: number;
  supplierCode: string;
  supplierType: SupplierType;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  taxId?: string;
  paymentTerms: SupplierPaymentTerms;
  openingBalance?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes?: string;
  status: SupplierStatus;
  createdAt: string;
  updatedAt: string;
}
