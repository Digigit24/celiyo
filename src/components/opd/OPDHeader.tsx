import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = ["Dashboard", "Waiting", "New visit", "Follow-up", "Reports"];

export function OPDHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <h1 className="text-2xl font-semibold tracking-tight">OPD</h1>
      <Tabs defaultValue="Dashboard" className="w-[420px]">
        <TabsList className="grid grid-cols-5">{TABS.map(t => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}</TabsList>
      </Tabs>
    </header>
  );
}