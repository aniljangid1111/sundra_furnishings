import { notFound } from "next/navigation";
import { WarehouseForm } from "@/features/warehouses/warehouse-form";
import { warehouses } from "@/features/warehouses/warehouse.data";

interface EditWarehousePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWarehousePage({
  params,
}: EditWarehousePageProps) {
  const { id } = await params;
  const wh = warehouses.find((item) => item.id === Number(id));

  if (!wh) {
    notFound();
  }

  return <WarehouseForm mode="edit" warehouse={wh} />;
}
