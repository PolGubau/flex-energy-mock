import { DashboardHome } from "../components/DashboardHome";
import { useDashboard } from "../hooks/useDashboard";

export function DashboardView() {
  const { totalBalanceFormatted, contracts, isLoading } = useDashboard();

  return (
    <DashboardHome
      totalBalanceFormatted={totalBalanceFormatted}
      contracts={contracts}
      isLoading={isLoading}
    />
  );
}
