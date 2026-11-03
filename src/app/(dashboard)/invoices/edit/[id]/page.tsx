"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { InvoiceForm } from "@/features/invoices/invoice-form";
import { getInvoiceByIdApi } from "@/lib/api/invoice.api";
import type { Invoice } from "@/features/invoices/invoice.types";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInvoice() {
      setIsLoading(true);
      try {
        const res = await getInvoiceByIdApi(id);
        if (res.success && res.data) {
          setInvoice(res.data);
        } else {
          setInvoice(null);
        }
      } catch (err) {
        console.error("Failed to load invoice for editing:", err);
        setInvoice(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadInvoice();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-[var(--muted)]">
        <Loader2 size={20} className="mr-2 animate-spin text-[var(--primary)]" />
        Loading invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <p className="text-base font-semibold">Invoice Not Found</p>
        <p className="mt-1 text-xs text-[var(--muted)]">The requested invoice ID does not exist.</p>
        <Link href="/invoices" className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline">
          <ArrowLeft size={14} /> Back to Invoices
        </Link>
      </div>
    );
  }

  return <InvoiceForm mode="edit" invoice={invoice} />;
}
