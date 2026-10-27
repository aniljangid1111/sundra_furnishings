import { notFound } from "next/navigation";
import { QuotationForm } from "@/features/quotations/quotation-form";
import { quotations } from "@/features/quotations/quotation.data";

interface EditQuotationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuotationPage({
  params,
}: EditQuotationPageProps) {
  const { id } = await params;

  const quote = quotations.find((item) => item.id === Number(id));

  if (!quote) {
    notFound();
  }

  return <QuotationForm mode="edit" quotation={quote} />;
}
