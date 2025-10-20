import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export const ConversationList = ({ selectedId, onSelect }: Props) => (
  <aside className="flex flex-col w-72 border-r border-black/10 bg-white min-h-screen">
    <div className="flex items-center justify-between h-16 border-b border-black/10 px-4">
      <span className="font-semibold text-lg">Conversations</span>
      <span className="text-xs text-black/40">{conversations.length}</span>
    </div>
    <div className="p-2">
      <Input placeholder="Search for messages" className="bg-black/5 border-none text-black" />
    </div>
    <ScrollArea className="flex-1">
      <ul className="px-2 pb-4">
        {conversations.map((c) => (
          <li
            key={c.id}
            className={`flex flex-col gap-1 px-3 py-2 rounded cursor-pointer mb-1 ${
              selectedId === c.id ? "bg-black/5" : "hover:bg-black/5"
            }`}
            onClick={() => onSelect(c.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{c.name}</span>
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