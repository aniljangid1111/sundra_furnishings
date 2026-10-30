"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Purchase } from "@/features/purchases/purchase.types";
import type { Invoice } from "@/features/invoices/invoice.types";
import { suppliers } from "@/features/suppliers/supplier.data";
import { warehouses } from "@/features/warehouses/warehouse.data";

async function loadLogoBase64(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Generates and directly downloads an official single-page Purchase Order PDF.
 */
export async function downloadPurchasePdf(purchase: Purchase): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const supplier = suppliers.find((s) => s.id === purchase.supplierId);
  const warehouse = warehouses.find((w) => w.id === purchase.warehouseId);
  const logoData = await loadLogoBase64();

  // Header Brand / Logo
  if (logoData) {
    try {
      const logoHeight = 20;
      let logoWidth = 47;
      try {
        const props = doc.getImageProperties(logoData);
        if (props.width && props.height) {
          logoWidth = (props.width / props.height) * logoHeight;
        }
      } catch {
        logoWidth = 47;
      }
      doc.addImage(logoData, "PNG", 14, 8, logoWidth, logoHeight);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Sundara Furnishings", 14, 18);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Sundara Furnishings", 14, 18);
  }

  // Company Details (left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Sundara Furnishings LLC", 14, 32.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("4800 E 48th Ave, Suite 200 • Denver, CO 80216", 14, 36.5);
  doc.text("Phone: (303) 555-0190 • procurement@sundarafurnishings.com", 14, 40.5);

  // Document Title & Meta (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("PURCHASE ORDER", 196, 17, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87);
  doc.text(purchase.purchaseNumber, 196, 23, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Status: ${purchase.status}`, 196, 28, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice Date: ${purchase.purchaseDate}`, 196, 32, { align: "right" });
  doc.text(
    `Inward Date: ${purchase.expectedDate || "Pending Arrival"}`,
    196,
    36,
    { align: "right" },
  );

  if (purchase.supplierInvoiceNumber) {
    doc.text(`Vendor Ref #: ${purchase.supplierInvoiceNumber}`, 196, 40, {
      align: "right",
    });
  }

  if (purchase.containerNumber) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9);
    doc.text(
      `Container No: ${purchase.containerNumber}`,
      196,
      purchase.supplierInvoiceNumber ? 44 : 40,
      { align: "right" },
    );
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, 48, 196, 48);

  // 2-Column Section (Vendor & Ship-to)
  // Left: Vendor / Supplier
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("VENDOR / SUPPLIER", 14, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(purchase.supplierName, 14, 59);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  let leftY = 63;
  if (supplier?.contactPerson) {
    doc.text(`Contact: ${supplier.contactPerson}`, 14, leftY);
    leftY += 3.8;
  }
  if (supplier?.phone || supplier?.email) {
    const contactInfo = [supplier.phone, supplier.email].filter(Boolean).join(" • ");
    doc.text(contactInfo, 14, leftY);
    leftY += 3.8;
  }
  if (supplier?.addressLine1) {
    const fullAddr = `${supplier.addressLine1}, ${supplier.city}, ${supplier.state} ${supplier.postalCode}`;
    doc.text(fullAddr, 14, leftY);
  }

  // Right: Ship to / Receiving Destination
  const rightX = 108;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("SHIP TO / RECEIVING FACILITY", rightX, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(purchase.warehouseName, rightX, 59);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  let rightY = 63;
  doc.text("Sundara Furnishings Inventory Receiving Dock", rightX, rightY);
  rightY += 3.8;

  if (warehouse?.address) {
    const whAddr = `${warehouse.address}, ${warehouse.city}, ${warehouse.state} ${warehouse.postalCode}`;
    doc.text(whAddr, rightX, rightY);
    rightY += 4.5;
  }

  // Items Table (autoTable)
  const tableRows = purchase.items.map((item, idx) => [
    String(idx + 1),
    `${item.productName}\nSKU: ${item.sku}`,
    String(item.quantity),
    `${item.receivedQuantity} / ${item.quantity}`,
    `$${item.unitCost.toFixed(2)}`,
    item.discount > 0 ? `-$${item.discount.toFixed(2)}` : "—",
    `$${item.lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: 83,
    head: [["#", "Item Description / SKU", "Ordered", "Received", "Unit Cost", "Discount", "Line Total"]],
    body: tableRows,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [241, 245, 249],
      lineWidth: 0.1,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 9 },
      1: { cellWidth: 65 },
      2: { halign: "center", cellWidth: 18 },
      3: { halign: "center", cellWidth: 22 },
      4: { halign: "right", cellWidth: 22 },
      5: { halign: "right", cellWidth: 20 },
      6: { halign: "right", cellWidth: 26 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // Bottom Summary & Verification Grid
  // Left: Instructions & Verification
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("DELIVERY INSTRUCTIONS & LOGISTICS NOTES", 14, finalY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const notesText =
    purchase.notes ||
    "Standard dock receiving policy applies. Inspect packaging, pallet counts, and verify SKU barcodes upon check-in.";
  const splitNotes = doc.splitTextToSize(notesText, 90);
  doc.text(splitNotes, 14, finalY + 11);

  // Receiving Policy mini card
  const policyY = finalY + 13 + splitNotes.length * 3.5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, policyY, 90, 9, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Warehouse Receiving Policy: ", 16, policyY + 4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Stock is formally updated in warehouse ledger upon physical verification.", 16, policyY + 7.5);

  // Dock Verification Box
  const signY = policyY + 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("AUTHORIZED RECEIVING DOCK VERIFICATION", 14, signY);

  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(14, signY + 9, 54, signY + 9);
  doc.line(58, signY + 9, 98, signY + 9);
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text("Received By (Signature)", 14, signY + 12);
  doc.text("Date Received & Stamp", 58, signY + 12);

  // Right: Financial Landed Costs Summary
  let summaryY = finalY + 7;
  const valX = 196;
  const labelX = 145;

  const renderSummaryRow = (label: string, val: string, isBold = false, color = [71, 85, 105]) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, labelX, summaryY);

    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(val, valX, summaryY, { align: "right" });
    summaryY += 4.5;
  };

  renderSummaryRow("Subtotal:", `$${purchase.subtotal.toFixed(2)}`);
  if (purchase.discount > 0) {
    renderSummaryRow("Discounts:", `-$${purchase.discount.toFixed(2)}`, false, [4, 120, 87]);
  }
  if (purchase.tax > 0) {
    renderSummaryRow("Tax:", `$${purchase.tax.toFixed(2)}`);
  }
  if (purchase.additionalCharges > 0) {
    renderSummaryRow("Freight & Charges:", `$${purchase.additionalCharges.toFixed(2)}`);
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(labelX, summaryY - 1, valX, summaryY - 1);
  summaryY += 1.5;

  // Grand Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Grand Total:", labelX, summaryY + 1);
  doc.setTextColor(4, 120, 87);
  doc.text(`$${purchase.grandTotal.toFixed(2)}`, valX, summaryY + 1, { align: "right" });
  summaryY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Amount Paid:", labelX, summaryY);
  doc.setTextColor(30, 41, 59);
  doc.text(`$${purchase.amountPaid.toFixed(2)}`, valX, summaryY, { align: "right" });
  summaryY += 4.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Balance Due:", labelX, summaryY);
  if (purchase.balanceDue > 0) {
    doc.setTextColor(180, 83, 9);
  } else {
    doc.setTextColor(4, 120, 87);
  }
  doc.text(`$${purchase.balanceDue.toFixed(2)}`, valX, summaryY, { align: "right" });

  // Footer (Fixed bottom)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(14, 282, 196, 282);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Sundara Furnishings LLC • Procurement & Supply Chain Management • Denver CDC",
    105,
    286,
    { align: "center" },
  );

  // Directly save/download to browser (NO PRINT DIALOG)
  doc.save(`${purchase.purchaseNumber}.pdf`);
}

/**
 * Generates and directly downloads an official single-page Sales Invoice PDF.
 */
export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const logoData = await loadLogoBase64();

  // Header Brand / Logo
  if (logoData) {
    try {
      const logoHeight = 20;
      let logoWidth = 47;
      try {
        const props = doc.getImageProperties(logoData);
        if (props.width && props.height) {
          logoWidth = (props.width / props.height) * logoHeight;
        }
      } catch {
        logoWidth = 47;
      }
      doc.addImage(logoData, "PNG", 14, 8, logoWidth, logoHeight);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Sundara Furnishings", 14, 18);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Sundara Furnishings", 14, 18);
  }

  // Company Details (left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Sundara Furnishings LLC", 14, 32.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("4800 E 48th Ave, Suite 200 • Denver, CO 80216", 14, 36.5);
  doc.text("Phone: (303) 555-0190 • billing@sundarafurnishings.com", 14, 40.5);

  // Document Title & Meta (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("INVOICE", 196, 17, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87);
  doc.text(invoice.invoiceNumber, 196, 23, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Status: ${invoice.status} • ${invoice.paymentStatus}`, 196, 28, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice Date: ${invoice.invoiceDate}`, 196, 32, { align: "right" });
  doc.text(`Payment Due: ${invoice.dueDate}`, 196, 36, { align: "right" });

  if (invoice.externalOrderId) {
    doc.text(`Channel Order Ref: ${invoice.externalOrderId}`, 196, 40, {
      align: "right",
    });
  }
  doc.text(
    `Sales Channel: ${invoice.salesChannelName}`,
    196,
    invoice.externalOrderId ? 44 : 40,
    { align: "right" },
  );

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, 48, 196, 48);

  // 2-Column Section (Bill to & Ship to)
  // Left: Bill To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("BILL TO", 14, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.buyerName, 14, 59);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  let leftY = 63;
  if (invoice.buyerEmail || invoice.buyerPhone) {
    const contact = [invoice.buyerEmail, invoice.buyerPhone].filter(Boolean).join(" • ");
    doc.text(contact, 14, leftY);
    leftY += 3.8;
  }
  if (invoice.billingAddress) {
    doc.text(invoice.billingAddress, 14, leftY);
  }

  // Right: Ship To / Origin
  const rightX = 108;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("SHIP TO / FULFILLMENT", rightX, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.shippingAddress ? invoice.buyerName : "Same as Billing Address", rightX, 59);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  let rightY = 63;
  doc.text(invoice.shippingAddress || invoice.billingAddress || "Storefront / Curbside Delivery", rightX, rightY);
  rightY += 4;
  doc.text(`Origin Facility: ${invoice.warehouseName}`, rightX, rightY);

  // Items Table (autoTable)
  const tableRows = invoice.items.map((item, idx) => [
    String(idx + 1),
    `${item.productName}\nSKU: ${item.sku}`,
    String(item.quantity),
    `$${item.unitPrice.toFixed(2)}`,
    item.discount > 0 ? `-$${item.discount.toFixed(2)}` : "—",
    `$${item.lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: 81,
    head: [["#", "Item Description / SKU", "Qty", "Unit Price", "Discount", "Amount"]],
    body: tableRows,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [241, 245, 249],
      lineWidth: 0.1,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 80 },
      2: { halign: "center", cellWidth: 18 },
      3: { halign: "right", cellWidth: 24 },
      4: { halign: "right", cellWidth: 22 },
      5: { halign: "right", cellWidth: 28 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // Bottom Summary & Payment Terms
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("PAYMENT TERMS & INSTRUCTIONS", 14, finalY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const termsText =
    invoice.termsAndConditions ||
    "Payment is due within 30 days of invoice date. Wire transfer or ACH accepted.";
  doc.text(doc.splitTextToSize(termsText, 90), 14, finalY + 11);

  if (invoice.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("SPECIAL NOTES", 14, finalY + 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(invoice.notes, 90), 14, finalY + 26);
  }

  // Right Financial Totals
  let summaryY = finalY + 7;
  const valX = 196;
  const labelX = 145;

  const renderSummaryRow = (label: string, val: string, isBold = false, color = [71, 85, 105]) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, labelX, summaryY);

    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(val, valX, summaryY, { align: "right" });
    summaryY += 4.5;
  };

  renderSummaryRow("Subtotal:", `$${invoice.subtotal.toFixed(2)}`);
  if (invoice.discountTotal > 0) {
    renderSummaryRow("Discounts:", `-$${invoice.discountTotal.toFixed(2)}`, false, [4, 120, 87]);
  }
  if (invoice.taxTotal > 0) {
    renderSummaryRow("Sales Tax:", `$${invoice.taxTotal.toFixed(2)}`);
  }
  if (invoice.shippingCharges > 0) {
    renderSummaryRow("Shipping & Delivery:", `$${invoice.shippingCharges.toFixed(2)}`);
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(labelX, summaryY - 1, valX, summaryY - 1);
  summaryY += 1.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Grand Total:", labelX, summaryY + 1);
  doc.setTextColor(4, 120, 87);
  doc.text(`$${invoice.grandTotal.toFixed(2)}`, valX, summaryY + 1, { align: "right" });
  summaryY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Amount Paid:", labelX, summaryY);
  doc.setTextColor(30, 41, 59);
  doc.text(`$${invoice.amountPaid.toFixed(2)}`, valX, summaryY, { align: "right" });
  summaryY += 4.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Balance Due:", labelX, summaryY);
  if (invoice.balanceDue > 0) {
    doc.setTextColor(180, 83, 9);
  } else {
    doc.setTextColor(4, 120, 87);
  }
  doc.text(`$${invoice.balanceDue.toFixed(2)}`, valX, summaryY, { align: "right" });
  summaryY += 4.5;

  // Payment Status & Method Line
  const methodNames: Record<string, string> = {
    CASH: "Cash",
    BANK_TRANSFER: "Bank Transfer",
    CREDIT_CARD: "Card",
    UPI: "UPI / Online",
    CHECK: "Check",
  };
  const methodLabel = invoice.paymentMethod ? ` (${methodNames[invoice.paymentMethod] || invoice.paymentMethod})` : "";
  const isPaid = invoice.paymentStatus === "PAID" || invoice.balanceDue <= 0;

  renderSummaryRow(
    "Payment Status:",
    `${invoice.paymentStatus || (isPaid ? "PAID" : "PENDING")}${methodLabel}`,
    true,
    isPaid ? [4, 120, 87] : [180, 83, 9]
  );

  // Footer (Fixed bottom)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(14, 282, 196, 282);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Thank you for partnering with Sundara Furnishings LLC • Modern Handcrafted Furniture",
    105,
    286,
    { align: "center" },
  );

  // Directly save/download to browser (NO PRINT DIALOG)
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
