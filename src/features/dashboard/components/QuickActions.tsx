import { BarChart3, Clock, Settings, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";

interface QuickActionsProps {
  onRecharge: () => void;
  onUsage: () => void;
  onHistory: () => void;
  onSettings: () => void;
}

const actionCls =
  "flex flex-col items-center gap-2 ";

export function QuickActions({
  onRecharge,
  onUsage,
  onHistory,
  onSettings,
}: QuickActionsProps) {
  return (
    <motion.nav
      aria-label="Quick actions"
      className="grid grid-cols-4 gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
    >
      {/* Primary CTA — full width on mobile */}
      <Button
        variant="outline"
        onClick={onRecharge}
        className="flex flex-col items-center gap-2"
      >
        <IconBox size="lg" variant="primary" >
          <Zap className="size-5" />
        </IconBox>
        <span className="text-xs">Recharge</span>
      </Button>

      <Button variant="ghost" onClick={onUsage} className={actionCls}>
        <IconBox>
          <BarChart3 className="size-4 text-primary" />
        </IconBox>
        <span className="text-sm font-semibold">Usage</span>
      </Button>

      {/* History — hidden  lg */}
      <Button variant="ghost" onClick={onHistory} className={`${actionCls}`}>
        <IconBox variant="primary">
          <Clock className="size-4 text-primary" />
        </IconBox>
        <span className="text-sm font-semibold">History</span>
      </Button>



      <Button variant="ghost" onClick={onSettings} className={`${actionCls}`}>
        <IconBox variant="muted">
          <Settings className="size-4 text-muted-foreground" />
        </IconBox>
        <span className="text-sm font-semibold">Settings</span>
      </Button>
    </motion.nav>
  );
}
