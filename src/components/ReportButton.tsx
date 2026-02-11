import { useState } from "react";
import { Flag, Send, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ReportButtonProps {
  animeId: number;
  animeTitle: string;
  episodeNumber: number;
}

export default function ReportButton({ animeId, animeTitle, episodeNumber }: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await supabase.from("reports").insert({
      user_id: user?.id || null,
      anime_id: animeId,
      anime_title: animeTitle,
      episode_number: episodeNumber,
      report_type: "broken_link",
      message: message.trim() || "Broken link reported",
    });
    setLoading(false);
    setSent(true);
    setTimeout(() => { setSent(false); setOpen(false); setMessage(""); }, 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="Report broken link"
      >
        <Flag className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {sent ? (
        <span className="flex items-center gap-1 text-xs text-primary">
          <CheckCircle className="h-3.5 w-3.5" /> Reported
        </span>
      ) : (
        <>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's wrong?"
            className="w-32 sm:w-48 rounded-lg bg-secondary border border-border px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
