import { useState } from "react";
import { solveDoubt } from "../ai/engine";
import type { AIReply } from "../ai/engine";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  reply?: AIReply;
  subject?: string;
  timestamp: Date;
}

export default function DoubtsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: input,
      subject,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const reply = await solveDoubt({ subject, query: input });

    const aiMsg: ChatMessage = {
      role: "ai",
      content: reply.explanation,
      reply,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "Explain the concept of moment of inertia with examples",
    "What is the difference between SHM and damped oscillation?",
    "Derive the Nernst equation for electrode potential",
    "How does DNA replication occur in eukaryotes?",
    "Explain the chain rule in differentiation with examples",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          AI-Powered
        </div>
        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
          Doubt <span className="gradient-text">Solver</span>
        </h2>
        <p className="text-text-dim text-lg">
          Ask any question from your Maharashtra Board syllabus
        </p>
      </div>

      <div className="glass-card p-8 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto flex flex-col gap-6">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="text-6xl mb-6">🤖</div>
            <h3 className="text-xl font-bold mb-4">
              How can I help you today?
            </h3>
            <p className="text-text-dim mb-8 max-w-md">
              Ask me any doubt from Physics, Chemistry, Maths, or
              Biology. I&apos;ll explain with board context and related
              PYQs.
            </p>
            <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
              {suggestedQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => setInput(sq)}
                  className="glass-card px-4 py-2 text-sm text-text-dim hover:text-white hover:border-primary/50 transition-all cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] ${
                msg.role === "user"
                  ? "glass-card bg-primary/10 border-primary/30 p-6"
                  : "glass-card p-6"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-secondary text-white"
                  }`}
                >
                  {msg.role === "user" ? "Y" : "AI"}
                </span>
                <span className="text-[10px] text-text-dim uppercase tracking-widest font-bold">
                  {msg.role === "user" ? "You" : "AI Tutor"}
                  {msg.subject && ` • ${msg.subject}`}
                </span>
              </div>
              <p className="leading-relaxed">{msg.content}</p>

              {msg.reply && (
                <div className="mt-4 space-y-3">
                  {msg.reply.relatedPyqs.length > 0 && (
                    <div className="glass-card p-4 bg-primary/5 border-primary/20">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                        Related PYQs
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.reply.relatedPyqs.map((pyq, j) => (
                          <span
                            key={j}
                            className="text-xs px-3 py-1 bg-primary/10 rounded-full text-primary"
                          >
                            {pyq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {msg.reply.boardReference && (
                    <div className="text-xs text-text-dim">
                      📚 Reference: {msg.reply.boardReference}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-text-dim text-sm">
                  AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-4">
        <div className="flex gap-4 items-end">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="glass-card bg-transparent px-4 py-3 border-white/10 outline-none text-sm font-bold cursor-pointer"
          >
            <option value="Physics" className="bg-bg">
              Physics
            </option>
            <option value="Chemistry" className="bg-bg">
              Chemistry
            </option>
            <option value="Mathematics" className="bg-bg">
              Mathematics
            </option>
            <option value="Biology" className="bg-bg">
              Biology
            </option>
          </select>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your doubt here... (Enter to send)"
            rows={2}
            className="flex-1 bg-transparent outline-none resize-none text-white placeholder:text-white/30 px-4 py-3"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`btn-premium px-8 py-3 ${
              !input.trim() || isLoading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
