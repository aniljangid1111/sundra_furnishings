import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceForm } from "@/features/invoices/invoice-form";
import { initialInvoices } from "@/features/invoices/invoice.data";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;

  const invoice = initialInvoices.find(
    (item) => item.id === Number(id) || item.invoiceNumber.toLowerCase() === id.toLowerCase()
  );

  if (!invoice) {
    notFound();
  }

  return <InvoiceForm mode="edit" invoice={invoice} />;
}
