import { useState } from "react";
import { ConversationList } from "@/components/ConversationList";
import { ChatWindow } from "@/components/ChatWindow";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";

const Inbox = () => {
  const [selectedId, setSelectedId] = useState("1");
  const [chatMobileOpen, setChatMobileOpen] = useState(false);

  const isMobile = useIsMobile();

  // On mobile, open chat drawer when a conversation is selected
  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (isMobile) setChatMobileOpen(true);
  };

  return (
    <div className="flex-1 flex bg-white text-black relative h-full">
      {/* Conversation List */}
      <div className={`flex flex-col min-w-0 ${isMobile ? "flex-1" : "max-w-xs"}`}>
        {(!isMobile || !chatMobileOpen) && (
          <ConversationList
            selectedId={selectedId}
            onSelect={handleSelect}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Chat Window */}
      {!isMobile && (
        <div className="flex-1 flex flex-col min-w-0">
          <ChatWindow conversationId={selectedId} />
        </div>
      )}

      {/* Mobile Chat Drawer */}
      {isMobile && (
        <Sheet open={chatMobileOpen} onOpenChange={setChatMobileOpen}>
          <SheetContent side="right" className="p-0 w-full max-w-full">
            <ChatWindow
              conversationId={selectedId}
              isMobile
              onBack={() => setChatMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default Inbox;