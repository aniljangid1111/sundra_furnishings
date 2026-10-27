
import type { SalesChannel } from "./sales-channel.types";

export const salesChannels: SalesChannel[] = [
  {
    id: 1,
    name: "Website",
    code: "WEB",
    type: "OWN_WEBSITE",
    website: "https://sundarafurnishings.com",
    description: "Official Sundara Furnishings online store.",
    productCount: 6,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Amazon",
    code: "AMZ",
    type: "MARKETPLACE",
    website: "https://www.amazon.com",
    description: "Product listings and sales through Amazon.",
    productCount: 4,
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Wayfair",
    code: "WAY",
    type: "MARKETPLACE",
    website: "https://www.wayfair.com",
    description: "Furniture and home decor marketplace.",
    productCount: 3,
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Retail Store",
    code: "RTL",
    type: "RETAIL",
    website: "",
    description: "Direct sales through physical retail stores.",
    productCount: 0,
    status: "INACTIVE",
  },
];
