import type {
  AllocationMethod,
  ImportExpenseHead,
  ImportItem,
  ImportShipment,
} from "./import.types";

export function calculateLandedCosts(
  items: Omit<ImportItem, "allocatedExpense" | "totalLandedCost" | "landedUnitCost">[],
  expenseHeads: ImportExpenseHead[]
): ImportItem[] {
  const totalProductCost = items.reduce(
    (sum, item) => sum + item.purchaseTotalCost,
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return items.map((item) => {
    let itemAllocated = 0;

    for (const expense of expenseHeads) {
      if (expense.amount <= 0) continue;

      let ratio = 0;
      if (expense.allocationMethod === "BY_VALUE") {
        ratio = totalProductCost > 0 ? item.purchaseTotalCost / totalProductCost : 0;
      } else if (expense.allocationMethod === "BY_QUANTITY") {
        ratio = totalQuantity > 0 ? item.quantity / totalQuantity : 0;
      } else {
        // EQUAL
        ratio = items.length > 0 ? 1 / items.length : 0;
      }

      itemAllocated += expense.amount * ratio;
    }

    const totalLanded = item.purchaseTotalCost + itemAllocated;
    const landedUnit = item.quantity > 0 ? totalLanded / item.quantity : 0;

    return {
      ...item,
      allocatedExpense: Number(itemAllocated.toFixed(2)),
      totalLandedCost: Number(totalLanded.toFixed(2)),
      landedUnitCost: Number(landedUnit.toFixed(2)),
    };
  });
}

export const initialImports: ImportShipment[] = [
  {
    id: 1,
    importNumber: "IMP-2026-001",
    supplierId: 2,
    supplierName: "Royal Teak Exports Ltd",
    supplierInvoiceNumber: "RTE-INV-99412",
    purchaseId: 1,
    purchaseNumber: "PO-2026-001",
    shipmentReference: "BOL-MSC-774129",
    importDate: "2026-10-12",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    status: "COMPLETED",
    documentName: "Commercial_Invoice_RTE99412.pdf",
    documentExtracted: true,
    expenseHeads: [
      {
        id: 1,
        type: "FREIGHT",
        description: "Ocean Container Freight (Port Klang to Port of Oakland)",
        amount: 2400,
        allocationMethod: "BY_VALUE",
      },
      {
        id: 2,
        type: "CUSTOMS",
        description: "US Customs & Border Protection Duty (HS 9403.60)",
        amount: 980,
        allocationMethod: "BY_VALUE",
      },
      {
        id: 3,
        type: "PORT_HANDLING",
        description: "Oakland Terminal Dwell & Drayage Handling",
        amount: 620,
        allocationMethod: "BY_QUANTITY",
      },
    ],
    items: [
      {
        id: 1,
        productId: 6,
        sku: "TBL-003",
        productName: "Teak Dining Table",
        quantity: 15,
        purchaseUnitCost: 650,
        purchaseTotalCost: 9750,
        allocatedExpense: 2780.0,
        totalLandedCost: 12530.0,
        landedUnitCost: 835.33,
      },
      {
        id: 2,
        productId: 5,
        sku: "TBL-002",
        productName: "Walnut Console Table",
        quantity: 10,
        purchaseUnitCost: 400,
        purchaseTotalCost: 4000,
        allocatedExpense: 1220.0,
        totalLandedCost: 5220.0,
        landedUnitCost: 522.0,
      },
    ],
    totalProductCost: 13750,
    totalAdditionalCosts: 4000,
    totalLandedCost: 17750,
    notes: "Landed cost finalized. Valuation applied to warehouse stock inventory.",
    createdAt: "2026-10-12T08:30:00Z",
    updatedAt: "2026-10-14T14:15:00Z",
  },
  {
    id: 2,
    importNumber: "IMP-2026-002",
    supplierId: 1,
    supplierName: "Nordic Living Supplies",
    supplierInvoiceNumber: "NLS-EXP-3321",
    purchaseId: 2,
    purchaseNumber: "PO-2026-002",
    shipmentReference: "AWB-SAS-98442",
    importDate: "2026-10-19",
    warehouseId: 3,
    warehouseName: "West Coast Fulfillment Center",
    status: "REVIEW_REQUIRED",
    documentName: "Airway_Bill_NLS_3321.pdf",
    documentExtracted: true,
    expenseHeads: [
      {
        id: 1,
        type: "FREIGHT",
        description: "Priority Air Cargo (Copenhagen to SFO)",
        amount: 1850,
        allocationMethod: "BY_QUANTITY",
      },
      {
        id: 2,
        type: "INSURANCE",
        description: "Marine & In-Transit Air Cargo Insurance",
        amount: 320,
        allocationMethod: "BY_VALUE",
      },
      {
        id: 3,
        type: "BROKERAGE",
        description: "Licensed Customs Broker Clearance Fee",
        amount: 450,
        allocationMethod: "EQUAL",
      },
    ],
    items: [
      {
        id: 1,
        productId: 2,
        sku: "CHR-001",
        productName: "Luna Accent Chair",
        quantity: 20,
        purchaseUnitCost: 240,
        purchaseTotalCost: 4800,
        allocatedExpense: 1680.0,
        totalLandedCost: 6480.0,
        landedUnitCost: 324.0,
      },
      {
        id: 2,
        productId: 3,
        sku: "TBL-001",
        productName: "Oak Side Table",
        quantity: 15,
        purchaseUnitCost: 150,
        purchaseTotalCost: 2250,
        allocatedExpense: 940.0,
        totalLandedCost: 3190.0,
        landedUnitCost: 212.67,
      },
    ],
    totalProductCost: 7050,
    totalAdditionalCosts: 2620,
    totalLandedCost: 9670,
    notes: "Document extracted via mock OCR scanner. Requires manager verification of broker disbursement.",
    createdAt: "2026-10-19T10:00:00Z",
    updatedAt: "2026-10-20T11:00:00Z",
  },
  {
    id: 3,
    importNumber: "IMP-2026-003",
    supplierId: 4,
    supplierName: "Bella Casa Textiles",
    supplierInvoiceNumber: "BCT-INV-5510",
    shipmentReference: "TRK-FEDEX-90214",
    importDate: "2026-10-24",
    warehouseId: 2,
    warehouseName: "East Coast Hub",
    status: "DRAFT",
    documentName: "Draft_Estimate_BCT.pdf",
    documentExtracted: false,
    expenseHeads: [
      {
        id: 1,
        type: "FREIGHT",
        description: "Cross-Border LTL Truckload Freight",
        amount: 750,
        allocationMethod: "BY_VALUE",
      },
      {
        id: 2,
        type: "OTHER",
        description: "Palletizing & Protective Shrink Wrap",
        amount: 180,
        allocationMethod: "BY_QUANTITY",
      },
    ],
    items: [
      {
        id: 1,
        productId: 1,
        sku: "BED-001",
        productName: "Cotton Bedsheet Set - Queen",
        quantity: 30,
        purchaseUnitCost: 110,
        purchaseTotalCost: 3300,
        allocatedExpense: 620.0,
        totalLandedCost: 3920.0,
        landedUnitCost: 130.67,
      },
      {
        id: 2,
        productId: 4,
        sku: "CUS-001",
        productName: "Linen Cushion Set",
        quantity: 25,
        purchaseUnitCost: 48,
        purchaseTotalCost: 1200,
        allocatedExpense: 310.0,
        totalLandedCost: 1510.0,
        landedUnitCost: 60.4,
      },
    ],
    totalProductCost: 4500,
    totalAdditionalCosts: 930,
    totalLandedCost: 5430,
    notes: "Preliminary draft shipment estimate awaiting final customs clearance papers.",
    createdAt: "2026-10-24T16:20:00Z",
    updatedAt: "2026-10-24T16:20:00Z",
  },
];
