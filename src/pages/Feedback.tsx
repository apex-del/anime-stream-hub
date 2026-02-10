import { useState } from "react";
import { MessageSquare, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const REPORT_TYPES = [
  { value: "broken_episode", label: "Broken Episode" },
  { value: "broken_link", label: "Broken Download Link" },
  { value: "wrong_info", label: "Wrong Information" },
  { value: "feature_request", label: "Feature Request" },
  { value: "bug_report", label: "Bug Report" },
  { value: "other", label: "Other" },
];

export default function Feedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    type: "broken_episode",
    animeTitle: "",
    episodeNumber: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;

    await supabase.from("reports").insert({
      user_id: user?.id || null,
      anime_title: form.animeTitle || null,
      episode_number: form.episodeNumber ? Number(form.episodeNumber) : null,
      report_type: form.type,
      message: form.message.trim().slice(0, 1000),
    } as any);

    setSubmitted(true);
    toast({ title: "Feedback Sent!", description: "Thank you for your feedback." });
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 pt-20 max-w-lg text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold mb-2">Thank You!</h1>
            <p className="text-muted-foreground mb-6">
              Your feedback has been submitted successfully.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ type: "broken_episode", animeTitle: "", episodeNumber: "", message: "" }); }}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all"
            >
              Submit Another
            </button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-20 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-primary" />
            Feedback & Reports
          </h1>
          <p className="text-muted-foreground mb-8">
            Report broken episodes, links, or share your suggestions
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Anime Title (optional)</label>
            <input
              type="text"
              value={form.animeTitle}
              onChange={(e) => setForm({ ...form, animeTitle: e.target.value })}
              placeholder="e.g. Attack on Titan"
              maxLength={200}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Episode Number (optional)</label>
            <input
              type="number"
              value={form.episodeNumber}
              onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })}
              placeholder="e.g. 12"
              min={1}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Describe the issue or suggestion..."
              maxLength={1000}
              rows={4}
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{form.message.length}/1000</p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all"
          >
            <Send className="h-4 w-4" />
            Submit Feedback
          </button>
        </form>
      </div>
    </Layout>
  );
}
