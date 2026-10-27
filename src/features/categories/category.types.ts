export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  productCount: number;
  status: CategoryStatus;
}