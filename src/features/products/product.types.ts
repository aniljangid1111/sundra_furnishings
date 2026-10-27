export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  uom: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderLevel: number;
  taxRate: number;
  status: ProductStatus;
  imageUrl?: string;
  salesChannels: string[];
}