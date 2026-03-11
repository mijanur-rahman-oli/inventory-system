"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { io, Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import { createPost } from "@/lib/actions/posts";
import type { Post } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  inventoryId: string;
  initialPosts: Post[];
}

export function DiscussionTab({ inventoryId, initialPosts }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({ path: "/socket.io" });
    socketRef.current = socket;

    socket.emit("join-inventory", inventoryId);

    socket.on("new-post", (post: Post) => {
      setPosts((prev) => {
        // Avoid duplicates
        if (prev.some((p) => p.id === post.id)) return prev;
        return [...prev, post];
      });
    });

    return () => {
      socket.emit("leave-inventory", inventoryId);
      socket.disconnect();
    };
  }, [inventoryId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  const handleSend = async () => {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const result = await createPost(inventoryId, content);
      if ("error" in result) { toast.error(result.error ?? "Error"); return; }
      setContent("");
      // Socket will deliver the post to all clients including sender
      // Optimistically add if socket is slow
      if (result.post) {
        setPosts((prev) => {
          if (prev.some((p) => p.id === result.post!.id)) return prev;
          return [...prev, result.post as Post];
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] card overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--border)] flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {posts.map((post, idx) => {
          const showAvatar = idx === 0 || posts[idx - 1].userId !== post.userId;
          return (
            <div key={post.id} className={cn("flex gap-3", showAvatar ? "mt-4" : "mt-1")}>
              <div className="flex-shrink-0 w-8">
                {showAvatar && (
                  post.userAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-muted)] border border-[var(--accent)] flex items-center justify-center text-xs font-semibold text-[var(--accent)]">
                      {post.userName.charAt(0).toUpperCase()}
                    </div>
                  )
                )}
              </div>
              <div className="flex-1 min-w-0">
                {showAvatar && (
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-sm font-medium text-[var(--text)]">{post.userName}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
                <div className={cn(
                  "text-sm text-[var(--text)] prose prose-sm max-w-none",
                  "dark:prose-invert"
                )}>
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message... (Markdown supported, Ctrl+Enter to send)"
            rows={2}
            className={cn(
              "flex-1 px-3 py-2 rounded-xl border border-[var(--border)]",
              "bg-[var(--bg)] text-[var(--text)] text-sm",
              "focus:border-[var(--accent)] focus:outline-none resize-none"
            )}
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className={cn(
              "px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors",
              "bg-[var(--accent)] hover:bg-[var(--accent-hover)]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "flex items-center gap-2 self-end"
            )}
          >
            <Send className="w-4 h-4" />
            {sending ? "..." : "Send"}
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1.5">
          Ctrl+Enter to send • Markdown supported
        </p>
      </div>
    </div>
  );
}