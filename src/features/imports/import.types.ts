export type ImportStatus =
  | "DRAFT"
  | "PROCESSING"
  | "REVIEW_REQUIRED"
  | "COMPLETED"
  | "CANCELLED";

export type ExpenseType =
  | "FREIGHT"
  | "INSURANCE"
  | "CUSTOMS"
  | "PORT_HANDLING"
  | "BROKERAGE"
  | "OTHER";

export type AllocationMethod = "BY_VALUE" | "BY_QUANTITY" | "EQUAL";

export interface ImportExpenseHead {
  id: number;
  type: ExpenseType;
  description: string;
  amount: number;
  allocationMethod: AllocationMethod;
}

export interface ImportItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  purchaseUnitCost: number;
  purchaseTotalCost: number;
  allocatedExpense: number;
  totalLandedCost: number;
  landedUnitCost: number;
}

export interface ImportShipment {
  id: number;
  importNumber: string;
  supplierId?: number;
  supplierName?: string;
  supplierInvoiceNumber?: string;
  purchaseId?: number;
  purchaseNumber?: string;
  shipmentReference?: string;
  importDate: string;
  warehouseId: number;
  warehouseName: string;
  status: ImportStatus;
  items: ImportItem[];
  expenseHeads: ImportExpenseHead[];
  totalProductCost: number;
  totalAdditionalCosts: number;
  totalLandedCost: number;
  documentName?: string;
  documentExtracted?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
