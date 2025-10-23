import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OPDMiniGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New vs Follow-up</CardTitle>
      </CardHeader>
      <CardContent className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        {/* placeholder for tiny chart – later use recharts */}
        Chart component coming soon
      </CardContent>
    </Card>
  );
}