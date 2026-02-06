import { DashboardLayout } from "@/components/dashboard-layout";
import { CallDetailWrapper } from "@/components/call-detail-wrapper";

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <CallDetailWrapper callId={id} />
    </DashboardLayout>
  );
}
