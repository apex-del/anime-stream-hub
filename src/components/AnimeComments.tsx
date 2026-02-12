import { useState } from "react";
import { MessageCircle, Send, Trash2, LogIn } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface AnimeCommentsProps {
  animeId: number;
}

interface Comment {
  id: string;
  user_id: string;
  anime_id: number;
  content: string;
  display_name: string | null;
  created_at: string;
}

export default function AnimeComments({ animeId }: AnimeCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", animeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("anime_id", animeId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Comment[];
    },
    staleTime: 60 * 1000,
  });

  const addComment = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Not authenticated");
      const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";
      const { error } = await supabase.from("comments").insert({
        user_id: user.id,
        anime_id: animeId,
        content: text.trim(),
        display_name: displayName,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
      setContent("");
      toast({ title: "Comment posted!" });
    },
    onError: () => {
      toast({ title: "Failed to post comment", variant: "destructive" });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
      toast({ title: "Comment deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 2 || content.trim().length > 1000) return;
    addComment.mutate(content);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h2>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-0.5">
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                maxLength={1000}
                className="w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{content.length}/1000</span>
                <button
                  type="submit"
                  disabled={content.trim().length < 2 || addComment.isPending}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {addComment.isPending ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg bg-card border border-border p-6 text-center">
          <p className="text-muted-foreground mb-3">Sign in to join the discussion</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-card border border-border p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-secondary" />
                <div className="h-4 w-24 bg-secondary rounded" />
              </div>
              <div className="h-4 w-full bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg bg-card border border-border p-8 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg bg-card border border-border p-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                      {(comment.display_name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{comment.display_name || "Anonymous"}</span>
                      <span className="text-xs text-muted-foreground ml-2">{timeAgo(comment.created_at)}</span>
                    </div>
                  </div>
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => deleteComment.mutate(comment.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-muted-foreground hover:text-destructive transition-all"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed pl-11">{comment.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
