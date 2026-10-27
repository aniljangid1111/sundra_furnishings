import { notFound } from "next/navigation";
import { SupplierForm } from "@/features/suppliers/supplier-form";
import { suppliers } from "@/features/suppliers/supplier.data";

interface EditSupplierPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({
  params,
}: EditSupplierPageProps) {
  const { id } = await params;

  const supplier = suppliers.find((item) => item.id === Number(id));

  if (!supplier) {
    notFound();
  }

  return <SupplierForm mode="edit" supplier={supplier} />;
}
