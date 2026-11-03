"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ImportForm } from "@/features/imports/import-form";
import { getImportByIdApi } from "@/lib/api/import.api";
import type { ImportShipment } from "@/features/imports/import.types";

interface EditImportPageProps {
  params: Promise<{ id: string }>;
}

export default function EditImportPage({ params }: EditImportPageProps) {
  const { id } = use(params);
  const [shipment, setShipment] = useState<ImportShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShipment() {
      setIsLoading(true);
      try {
        const res = await getImportByIdApi(id);
        if (res.success && res.data) {
          setShipment(res.data);
        } else {
          setShipment(null);
        }
      } catch (err) {
        console.error("Failed to load import shipment for editing:", err);
        setShipment(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadShipment();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-[var(--muted)]">
        <Loader2 size={20} className="mr-2 animate-spin text-[var(--primary)]" />
        Loading import shipment...
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-8 text-center">
        <p className="text-base font-semibold">Shipment Not Found</p>
        <p className="mt-1 text-xs text-[var(--muted)]">The requested import shipment ID does not exist.</p>
        <Link href="/imports" className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline">
          <ArrowLeft size={14} /> Back to Imports
        </Link>
      </div>
    );
  }

  return <ImportForm mode="edit" importData={shipment} />;
}
