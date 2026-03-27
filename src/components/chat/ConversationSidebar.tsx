import { Plus, MessageSquare, Trash2, Search } from "lucide-react";
import { useState } from "react";

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

const ConversationSidebar = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ConversationSidebarProps) => {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 border-r border-border bg-muted/30 flex flex-col h-full">
      <div className="p-3 border-b border-border space-y-3">
        <button
          onClick={onNew}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all group relative ${
                activeId === conv.id
                  ? "bg-primary/10 border border-primary/20 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-xs">{conv.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {conv.messageCount} messages · {conv.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
