import { ModuleCRUD, SystemModule, UserRole } from "./role.types";

export const standardModules: SystemModule[] = [
  // Column 1
  { id: "mod-1", name: "Dashboard", key: "dashboard", column: 1 },
  { id: "mod-2", name: "Import", key: "import", column: 1 },
  { id: "mod-3", name: "Invoice", key: "invoice", column: 1 },
  { id: "mod-4", name: "Inventory", key: "inventory", column: 1 },
  { id: "mod-5", name: "Inventory Alerts", key: "inventory_alerts", column: 1 },
  { id: "mod-6", name: "User Management", key: "user_management", column: 1 },

  // Column 2
  { id: "mod-7", name: "Business Insights", key: "insights", column: 2 },
  { id: "mod-8", name: "Quotation", key: "quotation", column: 2 },
  { id: "mod-9", name: "Purchase", key: "purchase", column: 2 },
  { id: "mod-10", name: "Catalogue", key: "catalogue", column: 2 },
  { id: "mod-11", name: "Masters", key: "masters", column: 2 },
  { id: "mod-12", name: "Role Management", key: "role_management", column: 2 },
];

export const allModuleKeys = standardModules.map((m) => m.key);

// Helper to generate full CRUD
const createFullPermissions = (): Record<string, ModuleCRUD> => {
  const perm: Record<string, ModuleCRUD> = {};
  allModuleKeys.forEach((key) => {
    perm[key] = { canView: true, canCreate: true, canEdit: true, canDelete: true };
  });
  return perm;
};

// Helper for Sales Manager
const createSalesManagerPermissions = (): Record<string, ModuleCRUD> => {
  const perm: Record<string, ModuleCRUD> = {};
  allModuleKeys.forEach((key) => {
    perm[key] = { canView: false, canCreate: false, canEdit: false, canDelete: false };
  });
  perm["dashboard"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["insights"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["invoice"] = { canView: true, canCreate: true, canEdit: true, canDelete: false };
  perm["quotation"] = { canView: true, canCreate: true, canEdit: true, canDelete: false };
  perm["inventory"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["catalogue"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  return perm;
};

// Helper for Purchase Executive
const createPurchaseExecPermissions = (): Record<string, ModuleCRUD> => {
  const perm: Record<string, ModuleCRUD> = {};
  allModuleKeys.forEach((key) => {
    perm[key] = { canView: false, canCreate: false, canEdit: false, canDelete: false };
  });
  perm["dashboard"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["import"] = { canView: true, canCreate: true, canEdit: true, canDelete: false };
  perm["purchase"] = { canView: true, canCreate: true, canEdit: true, canDelete: false };
  perm["inventory"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["catalogue"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  return perm;
};

// Helper for Store Keeper
const createStoreKeeperPermissions = (): Record<string, ModuleCRUD> => {
  const perm: Record<string, ModuleCRUD> = {};
  allModuleKeys.forEach((key) => {
    perm[key] = { canView: false, canCreate: false, canEdit: false, canDelete: false };
  });
  perm["dashboard"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["inventory"] = { canView: true, canCreate: true, canEdit: true, canDelete: false };
  perm["inventory_alerts"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["catalogue"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  return perm;
};

// Helper for Accountant
const createAccountantPermissions = (): Record<string, ModuleCRUD> => {
  const perm: Record<string, ModuleCRUD> = {};
  allModuleKeys.forEach((key) => {
    perm[key] = { canView: false, canCreate: false, canEdit: false, canDelete: false };
  });
  perm["dashboard"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["insights"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["invoice"] = { canView: true, canCreate: true, canEdit: true, canDelete: false };
  perm["purchase"] = { canView: true, canCreate: false, canEdit: false, canDelete: false };
  perm["masters"] = { canView: true, canCreate: true, canEdit: true, canDelete: false };
  return perm;
};

export const initialRoles: UserRole[] = [
  {
    id: "role-admin",
    name: "Administrator",
    code: "ADMIN",
    description: "Full access across all platform modules and configuration settings.",
    userCount: 1,
    isSystem: true,
    status: "ACTIVE",
    modules: [...allModuleKeys],
    permissions: createFullPermissions(),
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-10-31T00:00:00Z",
  },
  {
    id: "role-sales-mgr",
    name: "Sales Manager",
    code: "SALES_MGR",
    description: "Manages invoices, quotations, customer catalogues, and commercial insights.",
    userCount: 1,
    isSystem: false,
    status: "ACTIVE",
    modules: ["dashboard", "insights", "invoice", "quotation", "inventory", "catalogue"],
    permissions: createSalesManagerPermissions(),
    createdAt: "2026-01-05T00:00:00Z",
    updatedAt: "2026-10-31T00:00:00Z",
  },
  {
    id: "role-purchase-exec",
    name: "Purchase Executive",
    code: "PURCHASE_EXEC",
    description: "Procurement, supplier orders, import shipments, and stock receiving.",
    userCount: 1,
    isSystem: false,
    status: "ACTIVE",
    modules: ["dashboard", "import", "purchase", "inventory", "catalogue"],
    permissions: createPurchaseExecPermissions(),
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-10-31T00:00:00Z",
  },
  {
    id: "role-store-keeper",
    name: "Store Keeper",
    code: "STORE_KEEPER",
    description: "Physical warehouse inventory tracking, alerts, and dispatch catalogue.",
    userCount: 1,
    isSystem: false,
    status: "ACTIVE",
    modules: ["dashboard", "inventory", "inventory_alerts", "catalogue"],
    permissions: createStoreKeeperPermissions(),
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-10-31T00:00:00Z",
  },
  {
    id: "role-accountant",
    name: "Accountant",
    code: "ACCOUNTANT",
    description: "Reconciles sales billing, purchases, tax masters, and financial reporting.",
    userCount: 1,
    isSystem: false,
    status: "ACTIVE",
    modules: ["dashboard", "insights", "invoice", "purchase", "masters"],
    permissions: createAccountantPermissions(),
    createdAt: "2026-01-20T00:00:00Z",
    updatedAt: "2026-10-31T00:00:00Z",
  },
];
