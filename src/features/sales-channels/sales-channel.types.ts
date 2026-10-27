
export type SalesChannelStatus = "ACTIVE" | "INACTIVE";

export type SalesChannelType =
  | "MARKETPLACE"
  | "OWN_WEBSITE"
  | "RETAIL";

export interface SalesChannel {
  id: number;
  name: string;
  code: string;
  type: SalesChannelType;
  website: string;
  description: string;
  productCount: number;
  status: SalesChannelStatus;
}
