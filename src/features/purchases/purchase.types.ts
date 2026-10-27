export type PurchaseStatus =
  | "DRAFT"
  | "ORDERED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export interface PurchaseItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  discount: number;
  taxRate: number;
  lineTotal: number;
  receivedQuantity: number;
}

export interface Purchase {
  id: number;
  purchaseNumber: string;
  supplierId: number;
  supplierName: string;
  purchaseDate: string;
  expectedDate?: string;
  supplierInvoiceNumber?: string;
  warehouseId: number;
  warehouseName: string;
  status: PurchaseStatus;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  additionalCharges: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
