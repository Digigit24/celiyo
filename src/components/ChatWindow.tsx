import { useRef, useEffect, useState } from "react";
import {
  Send,
  ArrowLeft,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Smile,
  Plus,
  Mic,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const messagesData: Record<string, Array<{ from: "me" | "them"; text: string; time: string }>> = {
  "1": [
    { from: "them", text: "I didn’t like it", time: "3:30 PM" },
    { from: "me", text: "Sorry to hear that! Can you tell me more?", time: "3:31 PM" },
  ],
  "2": [
    { from: "me", text: "Send it 🏀", time: "3:30 PM" },
    { from: "them", text: "Here you go!", time: "3:31 PM" },
  ],
  "3": [
    { from: "them", text: "I am free now, if you can do the...", time: "3:30 PM" },
    { from: "me", text: "Sure, let's do it!", time: "3:31 PM" },
  ],
  "4": [
    { from: "them", text: "Where should we go now?", time: "3:30 PM" },
    { from: "me", text: "Let's decide together.", time: "3:31 PM" },
  ],
  "5": [
    { from: "them", text: "Good luck with everything", time: "3:30 PM" },
    { from: "me", text: "Thank you!", time: "3:31 PM" },
  ],
};

type Props = {
  conversationId: string;
  isMobile?: boolean;
  onBack?: () => void;
};

const botFlows = [
  { label: "FAQ Bot", value: "faq" },
  { label: "Order Status", value: "order" },
  { label: "Custom Flow", value: "custom" },
];

export const ChatWindow = ({ conversationId, isMobile, onBack }: Props) => {
  const messages = messagesData[conversationId] || [];
  const endRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"reply" | "ai">("reply");
  const [input, setInput] = useState("");
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationId, messages.length]);

  // Compact rich icons for header
  const richIcons = (
    <div className="flex gap-0.5 sm:gap-1">
      <Button type="button" variant="ghost" size="icon" className="rounded p-1 sm:p-2" aria-label="Bold">
        <Bold size={15} />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="rounded p-1 sm:p-2" aria-label="Italic">
        <Italic size={15} />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="rounded p-1 sm:p-2" aria-label="List">
        <List size={15} />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="rounded p-1 sm:p-2" aria-label="Link">
        <LinkIcon size={15} />
      </Button>
    </div>
  );

  return (
    <section className="flex flex-col flex-1 min-w-0 bg-white min-h-screen">
      {/* Chat header */}
      <div className="flex items-center justify-between h-16 border-b border-black/10 px-4">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={onBack}
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <span className="font-semibold text-lg">Chat</span>
        </div>
        <Button variant="outline" className="border-black/10 text-black px-4 py-1 rounded-full text-xs font-medium">
          Start a Call
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-xs text-sm",
                msg.from === "me"
                  ? "bg-black text-white ml-8"
                  : "bg-black/5 text-black mr-8"
              )}
            >
              {msg.text}
              <div className="text-[10px] text-black/40 mt-1 text-right">{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Chat input area */}
      <form
        className="flex flex-col gap-0 border-t border-black/10 bg-white"
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        {/* Input header: Tabs, rich icons, bot flow */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-2 pb-1">
          {/* Tabs */}
          <Tabs value={tab} onValueChange={v => setTab(v as "reply" | "ai")}>
            <TabsList className="flex bg-black/5 p-0.5" style={{ borderRadius: 5 }}>
              <TabsTrigger
                value="reply"
                className="text-xs px-2 py-1"
                style={{ borderRadius: 5 }}
              >
                Your Reply
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="text-xs px-2 py-1"
                style={{ borderRadius: 5 }}
              >
                Use AI
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Rich text icons */}
          <div className="flex-1 flex justify-center min-w-[100px]">
            {richIcons}
          </div>
          {/* Bot flow trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-xs px-2"
                aria-label="Trigger Bot Flow"
              >
                <Bot size={15} className="mr-1" />
                <span className="hidden sm:inline">
                  {selectedFlow ? botFlows.find(f => f.value === selectedFlow)?.label : "Bot Flow"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0">
              <ul>
                {botFlows.map(flow => (
                  <li key={flow.value}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 text-sm"
                      onClick={() => setSelectedFlow(flow.value)}
                    >
                      {flow.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
        {/* Typing area with + and emoji icons before input */}
        <div className="flex items-center gap-1 px-2 pb-2">
          <label className="relative flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded"
              aria-label="Upload"
              tabIndex={-1}
            >
              <Plus size={20} />
            </Button>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              tabIndex={-1}
              style={{ width: "100%", height: "100%" }}
              onClick={e => e.stopPropagation()}
            />
          </label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded flex-shrink-0"
            aria-label="Emoji"
          >
            <Smile size={20} />
          </Button>
          <Input
            placeholder="Type in your message..."
            className="flex-1 bg-black/5 border-none text-black"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <Button type="submit" className="bg-black text-white rounded-full px-4 py-2" aria-label="Send">
            {isMobile ? <Mic size={16} /> : <Send size={16} />}
          </Button>
        </div>
      </form>
    </section>
  );
};