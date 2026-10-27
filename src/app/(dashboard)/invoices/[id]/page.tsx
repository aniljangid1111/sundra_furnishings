import { redirect } from "next/navigation";

interface InvoiceAliasPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceAliasPage({ params }: InvoiceAliasPageProps) {
  const { id } = await params;
  redirect(`/invoices/view/${id}`);
}
