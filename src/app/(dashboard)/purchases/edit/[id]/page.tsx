import { notFound } from "next/navigation";
import { PurchaseForm } from "@/features/purchases/purchase-form";
import { purchases } from "@/features/purchases/purchase.data";

interface EditPurchasePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPurchasePage({
  params,
}: EditPurchasePageProps) {
  const { id } = await params;

  const purchase = purchases.find((item) => item.id === Number(id));

  if (!purchase) {
    notFound();
  }

  return <PurchaseForm mode="edit" purchase={purchase} />;
}
