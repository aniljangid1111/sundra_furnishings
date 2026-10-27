import { notFound } from "next/navigation";
import { CustomerForm } from "@/features/customers/customer-form";
import { customers } from "@/features/customers/customer.data";

interface EditCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;

  const customer = customers.find((item) => item.id === Number(id));

  if (!customer) {
    notFound();
  }

  return <CustomerForm mode="edit" customer={customer} />;
}
