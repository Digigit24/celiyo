import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const recent = Array.from({ length: 4 }, () => ({
  name: "Aarav Patel",
  age: 34,
  gender: "M",
  time: "10:45 AM",
}));

export function OPDRecentPatients() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Patients</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {recent.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">{p.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.age} yr, {p.gender} • {p.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}