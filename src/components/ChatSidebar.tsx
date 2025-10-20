import { Home, Users, MessageCircle, Settings, Phone } from "lucide-react";

const channels = [
  { name: "WhatsApp", icon: <Phone size={16} />, id: "whatsapp" },
  { name: "Instagram", icon: <MessageCircle size={16} />, id: "instagram" },
  { name: "Website", icon: <Home size={16} />, id: "website" },
];

const labels = [
  { name: "Leads" },
  { name: "Support" },
  { name: "Internal" },
];

export const ChatSidebar = () => (
  <aside className="flex flex-col w-20 md:w-56 border-r border-black/10 bg-white min-h-screen">
    <div className="flex items-center justify-center h-16 border-b border-black/10">
      <div className="rounded-full bg-black w-10 h-10 flex items-center justify-center text-white font-bold text-lg">
        C
      </div>
    </div>
    <nav className="flex-1 flex flex-col gap-2 mt-4 px-2">
      <div>
        <div className="text-xs font-semibold mb-2 text-black/60">Channels</div>
        <ul className="space-y-1">
          {channels.map((c) => (
            <li key={c.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-black/5 cursor-pointer">
              <span>{c.icon}</span>
              <span className="hidden md:inline text-sm">{c.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <div className="text-xs font-semibold mb-2 text-black/60">Labels</div>
        <ul className="space-y-1">
          {labels.map((l) => (
            <li key={l.name} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-black/5 cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-black/40 inline-block" />
              <span className="hidden md:inline text-sm">{l.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
    <div className="flex flex-col gap-4 items-center justify-end h-20 border-t border-black/10 mt-auto">
      <button className="p-2 hover:bg-black/5 rounded">
        <Users size={20} className="text-black/60" />
      </button>
      <button className="p-2 hover:bg-black/5 rounded">
        <Settings size={20} className="text-black/60" />
      </button>
    </div>
  </aside>
);