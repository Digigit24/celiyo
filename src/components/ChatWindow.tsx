import { useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
};

export const ChatWindow = ({ conversationId }: Props) => {
  const messages = messagesData[conversationId] || [];
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationId, messages.length]);

  return (
    <section className="flex flex-col flex-1 min-w-0 bg-white min-h-screen">
      <div className="flex items-center justify-between h-16 border-b border-black/10 px-6">
        <div>
          <span className="font-semibold text-lg">Chat</span>
        </div>
        <Button variant="outline" className="border-black/10 text-black px-4 py-1 rounded-full text-xs font-medium">
          Start a Call
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-xs text-sm ${
                msg.from === "me"
                  ? "bg-black text-white ml-8"
                  : "bg-black/5 text-black mr-8"
              }`}
            >
              {msg.text}
              <div className="text-[10px] text-black/40 mt-1 text-right">{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form
        className="flex items-center gap-2 border-t border-black/10 px-6 py-4"
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <Input
          placeholder="Type your message..."
          className="flex-1 bg-black/5 border-none text-black"
        />
        <Button type="submit" className="bg-black text-white rounded-full px-4 py-2">
          <Send size={16} />
        </Button>
      </form>
    </section>
  );
};