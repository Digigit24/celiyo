import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Instagram", value: "instagram" },
  { label: "Website", value: "website" },
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
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Filter conversations
  let filtered = conversations;
  if (filter === "unread") {
    filtered = filtered.filter((c) => c.unread);
  } else if (filter !== "all") {
    filtered = filtered.filter((c) => c.channel === filter);
  }
  if (search.trim()) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase())
    );
  }

  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <aside className={`flex flex-col ${isMobile ? "w-full" : "w-72"} border-r border-black/10 bg-white min-h-screen`}>
      <div className="flex items-center justify-between h-16 border-b border-black/10 px-4">
        <span className="font-semibold text-lg">Conversations</span>
        <span className="text-xs text-black/40">{conversations.length}</span>
      </div>
      <div className="flex flex-col gap-2 p-2">
        <div className="flex flex-wrap gap-2 items-center">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? "default" : "outline"}
              className={`rounded-full px-3 py-1 text-xs ${filter === f.value ? "bg-black text-white" : "bg-white text-black border-black/10"}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
          {unreadCount > 0 && (
            <Badge className="ml-auto bg-black text-white rounded-full px-2 py-1 text-xs">
              {unreadCount} Unread
            </Badge>
          )}
        </div>
        <Input
          placeholder="Search for messages"
          className="bg-black/5 border-none text-black"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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