import { DashboardLayout } from "@/components/dashboard-layout";
import { OverviewDashboard } from "@/components/overview-dashboard";

export default function DashboardHome() {
  return (
    <DashboardLayout>
      <OverviewDashboard />
    </DashboardLayout>
  );
}
