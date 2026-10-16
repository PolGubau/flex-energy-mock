import { DashboardHome } from "../components/DashboardHome";
import { useDashboard } from "../hooks/useDashboard";

export function DashboardView() {
  const { dashboard, totalBalanceFormatted, contracts, isLoading } =
    useDashboard();

  return (
    <DashboardHome
      totalBalanceFormatted={totalBalanceFormatted}
      totalBalanceRaw={dashboard?.balance ?? null}
      contracts={contracts}
      isLoading={isLoading}
    />
  );
}
