
import { notFound } from "next/navigation";
import { SalesChannelForm } from "@/features/sales-channels/sales-channel-form";
import { salesChannels } from "@/features/sales-channels/sales-channel.data";

interface EditSalesChannelPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSalesChannelPage({
  params,
}: EditSalesChannelPageProps) {
  const { id } = await params;

  const channel = salesChannels.find((item) => item.id === Number(id));

  if (!channel) {
    notFound();
  }

  return <SalesChannelForm mode="edit" channel={channel} />;
}
