import { notFound } from "next/navigation";
import { ImportForm } from "@/features/imports/import-form";
import { initialImports } from "@/features/imports/import.data";

interface EditImportPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditImportPage({ params }: EditImportPageProps) {
  const { id } = await params;

  const shipment = initialImports.find(
    (item) => item.id === Number(id) || item.importNumber.toLowerCase() === id.toLowerCase()
  );

  if (!shipment) {
    notFound();
  }

  return <ImportForm mode="edit" importData={shipment} />;
}
