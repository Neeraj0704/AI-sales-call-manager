import { DashboardLayout } from "@/components/dashboard-layout";
import { OverviewDashboard } from "@/components/overview-dashboard";

export default function Home() {
  return (
    <DashboardLayout>
      <OverviewDashboard />
    </DashboardLayout>
  );
}
