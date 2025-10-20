import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Bold, Italic, Link2, Smile, Plus, Bot } from "lucide-react";

type Props = {
  conversationId: string;
};

const botFlows = [
  { label: "Welcome Flow", value: "welcome" },
  { label: "FAQ Flow", value: "faq" },
  { label: "Feedback Flow", value: "feedback" },
];

export const ChatWindow = ({ conversationId }: Props) => {
  const [tab, setTab] = useState("reply");
  const [message, setMessage] = useState("");
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex flex-col border-b border-black/10 px-4 pt-4 pb-2">
        <div className="flex items-center gap-4">
          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-black/5 p-1" style={{ borderRadius: 5 }}>
              <TabsTrigger value="reply" className="text-xs px-3 py-1" style={{ borderRadius: 5 }}>
                Reply
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs px-3 py-1" style={{ borderRadius: 5 }}>
                Use AI
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Rich text actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="icon" className="h-8 w-8" tabIndex={-1}>
              <Bold size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" tabIndex={-1}>
              <Italic size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" tabIndex={-1}>
              <Link2 size={16} />
            </Button>
          </div>
          {/* Bot trigger */}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1" style={{ borderRadius: 5 }}>
                  <Bot size={16} />
                  {selectedFlow ? botFlows.find(f => f.value === selectedFlow)?.label : "Trigger Bot"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {botFlows.map(flow => (
                  <DropdownMenuItem
                    key={flow.value}
                    onClick={() => setSelectedFlow(flow.value)}
                  >
                    {flow.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* Chat area (messages) */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {/* ...messages would go here... */}
        <div className="text-center text-black/30 text-xs mt-8">No messages yet.</div>
      </div>
      {/* File upload and emoji row */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleFileClick}
          tabIndex={-1}
        >
          <Plus size={18} />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          tabIndex={-1}
        >
          <Smile size={18} />
        </Button>
      </div>
      {/* Typing area */}
      <form
        className="flex items-center gap-2 border-t border-black/10 px-4 py-4"
        onSubmit={e => {
          e.preventDefault();
          if (message.trim()) {
            setMessage("");
          }
        }}
      >
        <input
          className="flex-1 bg-black/5 rounded px-3 py-2 border-none outline-none text-sm"
          placeholder="Type your message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <Button type="submit" className="ml-2" disabled={!message.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
};