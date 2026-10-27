export type InvoiceStatus = "DRAFT" | "ISSUED" | "CANCELLED";

export type InvoicePaymentStatus =
  | "PAID"
  | "PARTIALLY_PAID"
  | "PENDING"
  | "OVERDUE";

export interface InvoiceLineItem {
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

export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  salesChannelId: number;
  salesChannelName: string;
  externalOrderId?: string;
  quotationId?: number;
  customerId?: number;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  warehouseId: number;
  warehouseName: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCharges: number;
  additionalCharges: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: InvoicePaymentStatus;
  status: InvoiceStatus;
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}
