export type WarehouseStatus = "ACTIVE" | "INACTIVE";

export interface Warehouse {
  id: number;
  warehouseCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: WarehouseStatus;
  notes?: string;
  createdAt: string;
}
