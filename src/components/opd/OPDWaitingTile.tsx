import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const dummy = Array.from({ length: 12 }, (_, i) => ({
  token: `T-${i + 1}`,
  name: "Riya Sharma",
  doctor: "Dr. Gupta",
  type: i % 3 === 0 ? "New" : "Follow-up",
}));

export function OPDWaitingTile() {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Waiting Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 pr-4">
          <div className="space-y-3">
            {dummy.map(p => (
              <div key={p.token} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{p.token}</Badge>
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.doctor}</p>
                  </div>
                </div>
                <Badge variant={p.type === "New" ? "default" : "secondary"}>{p.type}</Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}