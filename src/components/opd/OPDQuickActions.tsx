import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Phone, Clock } from "lucide-react";

const actions = [
  { label: "New Visit", icon: Plus },
  { label: "Register Patient", icon: UserPlus },
  { label: "Call Next", icon: Phone },
  { label: "Hold Queue", icon: Clock },
];

export function OPDQuickActions() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4">
      {actions.map(({ label, icon: Icon }) => (
        <Button key={label} variant="outline" className="h-20 flex-col gap-2">
          <Icon className="h-5 w-5" />
          <span className="text-sm">{label}</span>
        </Button>
      ))}
    </section>
  );
}