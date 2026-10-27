export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type StockMovementType =
  | "PURCHASE_RECEIPT"
  | "SALES_INVOICE"
  | "SALES_RETURN"
  | "PURCHASE_CORRECTION"
  | "INVENTORY_ADJUSTMENT";

export interface InventoryItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  category: string;
  warehouseId: number;
  warehouseName: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  unitCost: number;
  inventoryValue: number;
  stockStatus: StockStatus;
  uom: string;
}

export interface StockLedgerEntry {
  id: number;
  date: string;
  productId: number;
  sku: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  movementType: StockMovementType;
  referenceDocument: string;
  quantityChange: number;
  previousBalance: number;
  newBalance: number;
  notes?: string;
}
