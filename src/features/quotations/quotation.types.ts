export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED";

export interface QuotationItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  lineTotal: number;
}

export interface Quotation {
  id: number;
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  customerId?: number;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  salesChannelId?: number;
  salesChannelName?: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCharges: number;
  grandTotal: number;
  termsAndConditions?: string;
  notes?: string;
  status: QuotationStatus;
  convertedInvoiceId?: number;
  convertedInvoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}
