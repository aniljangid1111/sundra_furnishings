import type { SystemModule, UserRole } from "./role.types";

export const standardModules: SystemModule[] = [
  { id: "mod-dash", name: "Dashboard", key: "dashboard", column: 1 },
  { id: "mod-ins", name: "Insights & Analytics", key: "insights", column: 1 },
  { id: "mod-inv", name: "Sales Invoices", key: "invoice", column: 1 },
  { id: "mod-quot", name: "Quotations", key: "quotation", column: 1 },
  { id: "mod-po", name: "Purchase Orders", key: "purchase", column: 1 },
  { id: "mod-imp", name: "Import Shipments", key: "import", column: 1 },
  { id: "mod-stock", name: "Inventory Stock", key: "inventory", column: 2 },
  { id: "mod-prod", name: "Products Catalogue", key: "catalogue", column: 2 },
  { id: "mod-mast", name: "Master Data", key: "masters", column: 2 },
  { id: "mod-user", name: "User Management", key: "users", column: 2 },
  { id: "mod-role", name: "Role Management", key: "roles", column: 2 },
  { id: "mod-rep", name: "Financial Reports", key: "reports", column: 2 },
];

export const allModuleKeys = standardModules.map((m) => m.key);

export const initialRoles: UserRole[] = [];
