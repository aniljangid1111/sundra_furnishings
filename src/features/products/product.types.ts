export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface ProductCategoryRef {
  id: number;
  name: string;
  code: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId?: number | null;
  category?: ProductCategoryRef | string | null;
  uom: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderLevel: number;
  taxRate: number;
  status: ProductStatus;
  imageUrl?: string | null;
  salesChannels: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductKpi {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
}

export interface GetProductsParams {
  page?: number;
  limit?: number | "all";
  search?: string;
  categoryId?: number;
  status?: string;
  channel?: string;
  stockFilter?: string;
}

export interface ProductPayload {
  name: string;
  sku: string;
  categoryId?: number | null;
  uom?: string;
  costPrice?: number;
  sellingPrice?: number;
  stock?: number;
  reorderLevel?: number;
  taxRate?: number;
  status?: ProductStatus;
  imageUrl?: string | null;
  salesChannels?: string[];
}
