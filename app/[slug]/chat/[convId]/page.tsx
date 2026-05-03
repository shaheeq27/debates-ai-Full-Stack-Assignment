"use client";

import { useState, useRef, useEffect } from "react";
import { useMessages, useSendMessage, useProject, useIntegrations } from "@/hooks";
import { Message } from "@/types";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function ChatConversationPage({
  params,
}: {
  params: { slug: string; convId: string };
}) {
  const isNew = params.convId === "new";
  const [input, setInput] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(
    isNew ? null : params.convId
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isLoading } = useMessages(
    params.slug,
    currentConvId
  );
  const sendMessage = useSendMessage(params.slug);
  const { data: project } = useProject(params.slug);
  const { data: integrations = [] } = useIntegrations(params.slug);

  const allMessages = [...messages, ...optimisticMessages];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sendMessage.isPending) return;

    setInput("");
    setIsThinking(true);
    setThinkingSteps([]);

    // Optimistic user message
    const tempMsg: Message = {
      _id: `temp-${Date.now()}`,
      conversationId: currentConvId ?? "new",
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setOptimisticMessages([tempMsg]);

    // Simulate steps appearing
    const steps = [
      "Analyzing your message...",
      ...(integrations.find((i: {type:string;enabled:boolean}) => i.type === "shopify" && i.enabled)
        ? ["Fetching Shopify data..."]
        : []),
      ...(integrations.find((i: {type:string;enabled:boolean}) => i.type === "crm" && i.enabled)
        ? ["Querying CRM records..."]
        : []),
      "Generating response...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setThinkingSteps((prev) => [...prev, steps[i]]);
    }

    try {
      const result = await sendMessage.mutateAsync({
        content,
        conversationId: currentConvId ?? undefined,
      });

      if (!currentConvId) {
        setCurrentConvId(result.conversationId);
        window.history.replaceState(
          {},
          "",
          `/${params.slug}/chat/${result.conversationId}`
        );
      }

      setOptimisticMessages([]);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to send message");
      setOptimisticMessages([]);
    } finally {
      setIsThinking(false);
      setThinkingSteps([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const enabledIntegrations = integrations.filter(
    (i: {enabled:boolean}) => i.enabled
  );

  return (
    <div className="flex flex-col h-full" data-testid="chat-view">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 2v-2H3a1 1 0 01-1-1V3z" stroke="#22d3ee" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              AI Sales Assistant
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-online" />
              <span className="text-xs text-[#5a5a72]">Online</span>
              {enabledIntegrations.length > 0 && (
                <span className="text-xs text-[#5a5a72]">
                  · {enabledIntegrations.map((i: {name:string}) => i.name).join(", ")} connected
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {integrations.map((integration: {type:string;name:string;enabled:boolean}) => (
            <div
              key={integration.type}
              className={clsx(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border",
                integration.enabled
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-white/5 border-white/5 text-[#5a5a72]"
              )}
            >
              <div className={clsx("w-1.5 h-1.5 rounded-full", integration.enabled ? "bg-emerald-400" : "bg-[#5a5a72]")} />
              {integration.name}
            </div>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4" data-testid="messages-list">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && allMessages.length === 0 && !isThinking && (
          <WelcomeMessage projectName={project?.name ?? ""} />
        )}

        {allMessages.map((msg, i) => (
          <MessageBubble key={msg._id} message={msg} index={i} />
        ))}

        {isThinking && <ThinkingIndicator steps={thinkingSteps} />}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-6 pb-6 pt-2 flex-shrink-0">
        <div className="relative glass rounded-2xl border border-white/10 focus-within:border-cyan-400/30 transition-all duration-200">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about inventory, orders, customers…"
            rows={1}
            className="w-full bg-transparent text-white text-sm placeholder-[#5a5a72] px-4 pt-3 pb-3 pr-14 resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: "120px", overflowY: "auto" }}
            data-testid="message-input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className={clsx(
              "absolute right-3 bottom-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
              input.trim() && !sendMessage.isPending
                ? "bg-gradient-to-br from-cyan-500 to-violet-600 text-white hover:opacity-90"
                : "bg-white/5 text-[#5a5a72]"
            )}
            data-testid="send-button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12 7L2 2l2.5 5L2 12l10-5z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-[11px] text-[#5a5a72] mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === "user";

  return (
    <div
      className={clsx(
        "flex gap-3 animate-fade-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold",
          isUser
            ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white"
            : "bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-white/10"
        )}
      >
        {isUser ? "U" : (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" stroke="#22d3ee" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      <div className={clsx("flex flex-col gap-1 max-w-[70%]", isUser ? "items-end" : "items-start")}>
        {/* Steps (for assistant messages) */}
        {!isUser && message.steps && message.steps.length > 0 && (
          <div className="flex flex-col gap-0.5 mb-1 w-full">
            {message.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#5a5a72]">
                <div className="w-1 h-1 rounded-full bg-cyan-400/50" />
                {step}
              </div>
            ))}
          </div>
        )}

        {/* Bubble */}
        <div
          className={clsx(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser ? "message-user text-white" : "message-assistant text-[#e0e0ed]"
          )}
          style={{
            borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
          }}
        >
          <FormattedContent content={message.content} />
        </div>

        <span className="text-[10px] text-[#5a5a72]">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function FormattedContent({ content }: { content: string }) {
  // Simple markdown-like formatting
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function ThinkingIndicator({ steps }: { steps: string[] }) {
  return (
    <div className="flex gap-3 animate-fade-up">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" stroke="#22d3ee" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex flex-col gap-1.5 max-w-[70%]">
        {/* Steps */}
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 text-[11px] text-[#5a5a72] animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="w-1 h-1 rounded-full bg-cyan-400/50" />
            {step}
          </div>
        ))}

        {/* Typing dots */}
        <div className="message-assistant px-4 py-3 rounded-2xl inline-flex items-center gap-1.5" style={{ borderRadius: "4px 18px 18px 18px" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#9090a8] typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#9090a8] typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#9090a8] typing-dot" />
        </div>
      </div>
    </div>
  );
}

function WelcomeMessage({ projectName }: { projectName: string }) {
  const suggestions = [
    "What products do we have in stock?",
    "Show me our recent orders",
    "Who are our top customers?",
    "What's our revenue this month?",
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/15 to-violet-500/15 border border-white/10 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L2 8v10l10 5 10-5V8l-10-5z" stroke="url(#wg)" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M2 8l10 5 10-5M12 13v9" stroke="url(#wg)" strokeWidth="1.2" strokeLinecap="round"/>
          <defs><linearGradient id="wg" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#22d3ee"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
        </svg>
      </div>
      <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
        How can I help you today?
      </h3>
      <p className="text-sm text-[#9090a8] mb-6">
        AI assistant for {projectName}
      </p>
      <div className="grid grid-cols-2 gap-2 max-w-sm w-full">
        {suggestions.map((s) => (
          <button
            key={s}
            className="text-left text-xs text-[#9090a8] bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 transition-all duration-150 hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
