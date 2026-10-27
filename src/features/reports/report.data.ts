import { initialInventory } from "@/features/inventory/inventory.data";
import { initialInvoices } from "@/features/invoices/invoice.data";
import { products } from "@/features/products/product.data";
import { purchases } from "@/features/purchases/purchase.data";
import { salesChannels } from "@/features/sales-channels/sales-channel.data";
import { suppliers } from "@/features/suppliers/supplier.data";

export interface SalesReportEntry {
  invoiceNumber: string;
  date: string;
  customer: string;
  channel: string;
  total: number;
  paid: number;
  balance: number;
  status: string;
}

export interface PurchaseReportEntry {
  purchaseNumber: string;
  date: string;
  supplier: string;
  warehouse: string;
  total: number;
  paid: number;
  balance: number;
  status: string;
}

export interface InventoryValuationEntry {
  productId: number;
  productName: string;
  sku: string;
  category: string;
  onHand: number;
  unitCost: number;
  totalValuation: number;
}

export interface ChannelPerformanceEntry {
  channelId: number;
  channelName: string;
  invoiceCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface ProfitAndLossSummary {
  grossRevenue: number;
  discountsGiven: number;
  netRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossProfitMargin: number;
}

export function getSalesReport(): SalesReportEntry[] {
  return initialInvoices.map((inv) => ({
    invoiceNumber: inv.invoiceNumber,
    date: inv.invoiceDate,
    customer: inv.buyerName,
    channel: inv.salesChannelName,
    total: inv.grandTotal,
    paid: inv.amountPaid,
    balance: inv.balanceDue,
    status: inv.paymentStatus,
  }));
}

export function getPurchaseReport(): PurchaseReportEntry[] {
  return purchases.map((po) => ({
    purchaseNumber: po.purchaseNumber,
    date: po.purchaseDate,
    supplier: po.supplierName,
    warehouse: po.warehouseName,
    total: po.grandTotal,
    paid: po.amountPaid,
    balance: po.balanceDue,
    status: po.status,
  }));
}

export function getInventoryValuationReport(): InventoryValuationEntry[] {
  return products.map((prod) => {
    // Total onHand from inventory items
    const stockEntries = initialInventory.filter((inv) => inv.productId === prod.id);
    const onHand = stockEntries.reduce((sum, item) => sum + item.onHand, 0);
    const totalValuation = onHand * prod.costPrice;

    return {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      category: prod.category,
      onHand,
      unitCost: prod.costPrice,
      totalValuation,
    };
  });
}

export function getChannelPerformance(): ChannelPerformanceEntry[] {
  return salesChannels.map((channel) => {
    const channelInvoices = initialInvoices.filter(
      (inv) => inv.salesChannelId === channel.id || inv.salesChannelName.toLowerCase().includes(channel.name.toLowerCase())
    );
    const totalRevenue = channelInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const invoiceCount = channelInvoices.length;
    const averageOrderValue = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

    return {
      channelId: channel.id,
      channelName: channel.name,
      invoiceCount,
      totalRevenue,
      averageOrderValue,
    };
  });
}

export function getProfitAndLossSummary(): ProfitAndLossSummary {
  // Calculated from issued invoices
  const validInvoices = initialInvoices.filter((inv) => inv.status === "ISSUED");

  const grossRevenue = validInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const discountsGiven = validInvoices.reduce((sum, inv) => sum + inv.discountTotal, 0);
  const netRevenue = validInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  // Compute COGS: for every invoice item, multiply item quantity by the product's base costPrice
  let costOfGoodsSold = 0;
  for (const inv of validInvoices) {
    for (const item of inv.items) {
      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
      const unitCost = prod ? prod.costPrice : item.unitPrice * 0.6; // fallback
      costOfGoodsSold += item.quantity * unitCost;
    }
  }

  const grossProfit = netRevenue - costOfGoodsSold;
  const grossProfitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

  return {
    grossRevenue: Number(grossRevenue.toFixed(2)),
    discountsGiven: Number(discountsGiven.toFixed(2)),
    netRevenue: Number(netRevenue.toFixed(2)),
    costOfGoodsSold: Number(costOfGoodsSold.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossProfitMargin: Number(grossProfitMargin.toFixed(1)),
  };
}
