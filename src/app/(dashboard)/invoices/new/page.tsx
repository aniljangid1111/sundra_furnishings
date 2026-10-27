"use client";

import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    ChevronDown,
    Plus,
    Trash2,
} from "lucide-react";
import { useState } from "react";

type InvoiceItem = {
    id: number;
    product: string;
    quantity: number;
    uom: string;
    rate: number;
    discount: number;
    tax: number;
    shipping: number;
};

const products = [
    {
        name: "Cotton Bedsheet Set - Queen",
        uom: "PCS",
        rate: 189,
    },
    {
        name: "Luna Accent Chair",
        uom: "PCS",
        rate: 420,
    },
    {
        name: "Oak Side Table",
        uom: "PCS",
        rate: 280,
    },
    {
        name: "Linen Cushion Set",
        uom: "SET",
        rate: 95,
    },
    {
        name: "Walnut Console Table",
        uom: "PCS",
        rate: 680,
    },
];

export default function NewInvoicePage() {
    const [customerName, setCustomerName] = useState("");
    const [source, setSource] = useState("Retail");
    const [invoiceDate, setInvoiceDate] = useState("2026-10-18");
    const [shippingCharges, setShippingCharges] = useState(0);
    const [paymentTerms, setPaymentTerms] = useState("100% Advance");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");

    const [items, setItems] = useState<InvoiceItem[]>([
        {
            id: 1,
            product: "",
            quantity: 1,
            uom: "PCS",
            rate: 0,
            discount: 0,
            tax: 0,
            shipping: 0,
        },
    ]);

    const updateItem = (
        id: number,
        field: keyof InvoiceItem,
        value: string | number,
    ) => {
        setItems((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item,
            ),
        );
    };

    const selectProduct = (
        id: number,
        productName: string,
    ) => {
        const product = products.find(
            (item) => item.name === productName,
        );

        setItems((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        product: productName,
                        uom: product?.uom ?? "PCS",
                        rate: product?.rate ?? 0,
                    }
                    : item,
            ),
        );
    };

    const addItem = () => {
        setItems((current) => [
            ...current,
            {
                id: Date.now(),
                product: "",
                quantity: 1,
                uom: "PCS",
                rate: 0,
                discount: 0,
                tax: 0,
                shipping: 0,
            },
        ]);
    };

    const removeItem = (id: number) => {
        setItems((current) => {
            if (current.length === 1) {
                return current;
            }

            return current.filter((item) => item.id !== id);
        });
    };

    const subtotal = items.reduce(
        (total, item) =>
            total + item.quantity * item.rate,
        0,
    );

    const discount = items.reduce(
        (total, item) =>
            total +
            (item.quantity * item.rate * item.discount) / 100,
        0,
    );

    const tax = items.reduce((total, item) => {
        const itemAmount =
            item.quantity * item.rate -
            (item.quantity * item.rate * item.discount) / 100;

        return total + (itemAmount * item.tax) / 100;
    }, 0);

    const itemShipping = items.reduce(
        (total, item) => total + item.shipping,
        0,
    );

    const totalShipping = shippingCharges + itemShipping;

    const grandTotal =
        subtotal - discount + tax + totalShipping;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <Link
                        href="/invoices"
                        className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--primary)]"
                    >
                        <ArrowLeft size={16} />
                        Back to invoices
                    </Link>

                    <p className="text-sm font-medium text-[var(--primary)]">
                        Invoices
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        Create invoice
                    </h1>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        An invoice number will be generated when you save.
                    </p>
                </div>

                <Link
                    href="/invoices"
                    className="hidden h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-white hover:text-[var(--foreground)] sm:flex"
                    title="Close"
                >
                    <span className="text-2xl leading-none">×</span>
                </Link>
            </div>

            {/* Basic details */}
            <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
                <div className="grid gap-5 md:grid-cols-3">
                    <FormField label="Customer Name" required>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(event) =>
                                setCustomerName(event.target.value)
                            }
                            placeholder="Enter customer name"
                            className="form-input"
                        />
                    </FormField>

                    <FormField label="Source">
                        <Select
                            value={source}
                            onChange={(event) =>
                                setSource(event.target.value)
                            }
                        >
                            <option>Retail</option>
                            <option>Wholesale</option>
                            <option>Online</option>
                            <option>Referral</option>
                            <option>Other</option>
                        </Select>
                    </FormField>

                    <FormField label="Invoice Date" required>
                        <div className="relative">
                            <input
                                type="date"
                                value={invoiceDate}
                                onChange={(event) =>
                                    setInvoiceDate(event.target.value)
                                }
                                className="form-input pr-10"
                            />

                            <CalendarDays
                                size={16}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                            />
                        </div>
                    </FormField>
                </div>
            </section>

            {/* Line items */}
            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">
                            Line Items
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                    >
                        <Plus size={16} />
                        Add Line Item
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-sm">
                        <thead>
                            <tr className="border-b border-[var(--border-light)] bg-[var(--muted-background)]/50">
                                <TableHead label="Product Name" />
                                <TableHead label="Qty" />
                                <TableHead label="UOM" />
                                <TableHead label="Rate ($)" />
                                <TableHead label="Disc %" />
                                <TableHead label="Tax %" />
                                <TableHead label="Ship ($)" />
                                <TableHead label="Total" align="right" />
                                <th className="w-12" />
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item) => {
                                const baseAmount =
                                    item.quantity * item.rate;

                                const discountAmount =
                                    (baseAmount * item.discount) / 100;

                                const taxableAmount =
                                    Math.max(
                                        baseAmount - discountAmount,
                                        0,
                                    );

                                const taxAmount =
                                    (taxableAmount * item.tax) / 100;

                                const itemTotal =
                                    taxableAmount +
                                    taxAmount +
                                    item.shipping;

                                return (
                                    <tr
                                        key={item.id}
                                        className="border-b border-[var(--border-light)] last:border-0"
                                    >
                                        <td className="px-4 py-3 sm:px-5">
                                            <Select
                                                value={item.product}
                                                onChange={(event) =>
                                                    selectProduct(
                                                        item.id,
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select product
                                                </option>

                                                {products.map((product) => (
                                                    <option key={product.name}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </td>

                                        <td className="w-24 px-2 py-3">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(event) =>
                                                    updateItem(
                                                        item.id,
                                                        "quantity",
                                                        Number(event.target.value),
                                                    )
                                                }
                                                className="form-input"
                                            />
                                        </td>

                                        <td className="w-24 px-2 py-3">
                                            <input
                                                value={item.uom}
                                                onChange={(event) =>
                                                    updateItem(
                                                        item.id,
                                                        "uom",
                                                        event.target.value,
                                                    )
                                                }
                                                className="form-input"
                                            />
                                        </td>

                                        <td className="w-32 px-2 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.rate}
                                                onChange={(event) =>
                                                    updateItem(
                                                        item.id,
                                                        "rate",
                                                        Number(event.target.value),
                                                    )
                                                }
                                                className="form-input"
                                            />
                                        </td>

                                        <td className="w-24 px-2 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={item.discount}
                                                onChange={(event) =>
                                                    updateItem(
                                                        item.id,
                                                        "discount",
                                                        Number(event.target.value),
                                                    )
                                                }
                                                className="form-input"
                                            />
                                        </td>

                                        <td className="w-24 px-2 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={item.tax}
                                                onChange={(event) =>
                                                    updateItem(
                                                        item.id,
                                                        "tax",
                                                        Number(event.target.value),
                                                    )
                                                }
                                                className="form-input"
                                            />
                                        </td>

                                        <td className="w-28 px-2 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.shipping}
                                                onChange={(event) =>
                                                    updateItem(
                                                        item.id,
                                                        "shipping",
                                                        Number(event.target.value),
                                                    )
                                                }
                                                className="form-input"
                                            />
                                        </td>

                                        <td className="px-3 py-3 text-right font-semibold text-[var(--foreground)]">
                                            ${itemTotal.toFixed(2)}
                                        </td>

                                        <td className="px-3 py-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(item.id)
                                                }
                                                disabled={items.length === 1}
                                                title="Remove line item"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                <Trash2
                                                    size={15}
                                                    strokeWidth={1.8}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Invoice options */}
            <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Shipping Charges (invoice level, $)">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={shippingCharges}
                            onChange={(event) =>
                                setShippingCharges(
                                    Number(event.target.value),
                                )
                            }
                            className="form-input"
                        />
                    </FormField>

                    <FormField label="Payment Terms">
                        <Select
                            value={paymentTerms}
                            onChange={(event) =>
                                setPaymentTerms(event.target.value)
                            }
                        >
                            <option>100% Advance</option>
                            <option>Due on Receipt</option>
                            <option>Net 15</option>
                            <option>Net 30</option>
                            <option>Net 45</option>
                            <option>Net 60</option>
                        </Select>
                    </FormField>
                </div>
            </section>

            {/* Bottom */}
            <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
                {/* Delivery + notes */}
                <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <FormField label="Delivery Address">
                            <textarea
                                value={deliveryAddress}
                                onChange={(event) =>
                                    setDeliveryAddress(event.target.value)
                                }
                                placeholder="Enter delivery address..."
                                className="form-input min-h-[150px] resize-none py-3"
                            />
                        </FormField>

                        <FormField label="Additional Notes">
                            <textarea
                                value={additionalNotes}
                                onChange={(event) =>
                                    setAdditionalNotes(event.target.value)
                                }
                                placeholder="Add any additional notes..."
                                className="form-input min-h-[150px] resize-none py-3"
                            />
                        </FormField>
                    </div>
                </section>

                {/* Summary */}
                <section className="h-fit rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
                    <div className="space-y-4">
                        <SummaryRow
                            label="Sub Total"
                            value={`$${subtotal.toFixed(2)}`}
                        />

                        <SummaryRow
                            label="Discount"
                            value={`- $${discount.toFixed(2)}`}
                            negative={discount > 0}
                        />

                        <SummaryRow
                            label="Tax"
                            value={`$${tax.toFixed(2)}`}
                        />

                        <SummaryRow
                            label="Shipping"
                            value={`$${totalShipping.toFixed(2)}`}
                        />

                        <div className="border-t border-[var(--border-light)] pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-base font-semibold text-[var(--foreground)]">
                                    Grand Total
                                </span>

                                <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                                    ${grandTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
                <Link
                    href="/invoices"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-background)]"
                >
                    Cancel
                </Link>

                <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-6 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
                >
                    Generate Invoice
                </button>
            </div>
        </div>
    );
}

function FormField({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </span>

            {children}
        </label>
    );
}

function Select({
    children,
    value,
    onChange,
}: {
    children: React.ReactNode;
    value: string;
    onChange: (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => void;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className="form-input appearance-none pr-9"
            >
                {children}
            </select>

            <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
        </div>
    );
}

function TableHead({
    label,
    align = "left",
}: {
    label: string;
    align?: "left" | "right";
}) {
    return (
        <th
            className={`px-3 py-3 text-xs font-medium uppercase tracking-wide text-[var(--muted)] ${align === "right" ? "text-right" : "text-left"
                }`}
        >
            {label}
        </th>
    );
}

function SummaryRow({
    label,
    value,
    negative = false,
}: {
    label: string;
    value: string;
    negative?: boolean;
}) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">
                {label}
            </span>

            <span
                className={
                    negative
                        ? "font-medium text-red-600"
                        : "font-medium text-[var(--foreground)]"
                }
            >
                {value}
            </span>
        </div>
    );
}