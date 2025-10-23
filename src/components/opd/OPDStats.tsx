import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Timer, DollarSign } from "lucide-react";

const items = [
  { title: "Total Today", value: 127, icon: Users, color: "text-blue-600" },
  { title: "In Consultation", value: 4, icon: UserCheck, color: "text-green-600" },
  { title: "Waiting", value: 12, icon: Timer, color: "text-orange-600" },
  { title: "Revenue", value: "₹48,250", icon: DollarSign, color: "text-purple-600" },
];

export function OPDStats() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
      {items.map(({ title, value, icon: Icon, color }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{value}</CardContent>
        </Card>
      ))}
    </section>
  );
}