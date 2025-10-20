import { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ConversationList } from "@/components/ConversationList";
import { ChatWindow } from "@/components/ChatWindow";

const Index = () => {
  const [selectedId, setSelectedId] = useState("1");

  return (
    <div className="min-h-screen flex bg-white text-black">
      <ChatSidebar />
      <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow conversationId={selectedId} />
      </div>
    </div>
  );
};

export default Index;