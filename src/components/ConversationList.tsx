import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageCircle, Home } from "lucide-react";

const conversations = [
  {
    id: "1",
    name: "Hamatsi Kamato",
    lastMessage: "I didn’t like it",
    time: "1m ago",
    channel: "whatsapp",
    unread: true,
  },
  {
    id: "2",
    name: "Georgi",
    lastMessage: "Send it 🏀",
    time: "1h ago",
    channel: "instagram",
    unread: false,
  },
  {
    id: "3",
    name: "Carolina Herrera",
    lastMessage: "I am free now, if you can do the...",
    time: "2d ago",
    channel: "website",
    unread: false,
  },
  {
    id: "4",
    name: "Angela Cambell",
    lastMessage: "Where should we go now?",
    time: "2m ago",
    channel: "whatsapp",
    unread: true,
  },
  {
    id: "5",
    name: "Jonathan",
    lastMessage: "Good luck with everything",
    time: "1h ago",
    channel: "instagram",
    unread: false,
  },
];

const channelIcon = (channel: string) => {
  switch (channel) {
    case "whatsapp":
      return <Phone size={18} style={{ color: "#25D366" }} />;
    case "instagram":
      return <MessageCircle size={18} style={{ color: "#E1306C" }} />;
    case "website":
      return <Home size={18} style={{ color: "#0078FF" }} />;
    default:
      return null;
  }
};

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
  isMobile?: boolean;
};

export const ConversationList = ({ selectedId, onSelect, isMobile }: Props) => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  // Filter conversations by tab
  let filtered = conversations;
  if (tab === "mine") {
    filtered = filtered.filter((c) => parseInt(c.id) % 2 === 0); // Example: "Mine" = even IDs
  } else if (tab === "unassigned") {
    filtered = filtered.filter((c) => parseInt(c.id) % 2 !== 0); // Example: "Unassigned" = odd IDs
  }
  if (search.trim()) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <aside className={`flex flex-col ${isMobile ? "w-full" : "w-72"} border-r border-black/10 bg-white min-h-screen`}>
      <div className="flex items-center justify-between h-16 border-b border-black/10 px-4">
        <span className="font-semibold text-lg">Conversations</span>
        <span className="text-xs text-black/40">{conversations.length}</span>
      </div>
      <div className="flex flex-col gap-2 p-2">
        <Input
          placeholder="Search for messages"
          className="bg-black/5 border-none text-black"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full flex bg-black/5 p-1" style={{ borderRadius: 5 }}>
            <TabsTrigger
              value="all"
              className="flex-1 text-xs px-3 py-1"
              style={{ borderRadius: 5 }}
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="mine"
              className="flex-1 text-xs px-3 py-1"
              style={{ borderRadius: 5 }}
            >
              Mine
            </TabsTrigger>
            <TabsTrigger
              value="unassigned"
              className="flex-1 text-xs px-3 py-1"
              style={{ borderRadius: 5 }}
            >
              Unassigned
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="flex-1">
        <ul className="px-2 pb-4">
          {filtered.length === 0 && (
            <li className="text-center text-xs text-black/40 py-8">No conversations found.</li>
          )}
          {filtered.map((c) => (
            <li
              key={c.id}
              className={`flex flex-col gap-1 px-3 py-2 rounded cursor-pointer mb-1 ${
                selectedId === c.id ? "bg-black/5" : "hover:bg-black/5"
              }`}
              onClick={() => onSelect(c.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {channelIcon(c.channel)}
                  <span className="font-medium text-sm">{c.name}</span>
                </div>
                <span className="text-xs text-black/40">{c.time}</span>
              </div>
              <span className="text-xs text-black/70 truncate">{c.lastMessage}</span>
              {c.unread && <span className="w-2 h-2 rounded-full bg-black inline-block mt-1" />}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
};