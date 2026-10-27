export type CustomerType = "INDIVIDUAL" | "BUSINESS";

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export type PaymentTerms =
  | "Due on Receipt"
  | "Net 15"
  | "Net 30"
  | "Net 45"
  | "Net 60";

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: number;
  customerCode: string;
  customerType: CustomerType;
  firstName: string;
  lastName: string;
  companyName?: string;
  displayName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  taxId?: string;
  paymentTerms: PaymentTerms;
  creditLimit: number;
  billingAddress: Address;
  shippingAddress: Address;
  notes?: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}
