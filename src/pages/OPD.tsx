import { ScrollArea } from "@/components/ui/scroll-area";
import { OPDHeader } from "@/components/opd/OPDHeader";
import { OPDQuickActions } from "@/components/opd/OPDQuickActions";
import { OPDStats } from "@/components/opd/OPDStats";
import { OPDWaitingTile } from "@/components/opd/OPDWaitingTile";
import { OPDRecentPatients } from "@/components/opd/OPDRecentPatients";
import { OPDMiniGraph } from "@/components/opd/OPDMiniGraph";

export default function OPD() {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-6">
        <OPDHeader />
        <OPDQuickActions />
        <OPDStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-6">
          <OPDWaitingTile />
          <div className="space-y-4">
            <OPDRecentPatients />
            <OPDMiniGraph />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}