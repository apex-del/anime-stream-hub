import { useSearchParams, Link } from "react-router-dom";
import {
  Download,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  AlertTriangle,
  Flag,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const DOWNLOAD_SERVICES = [
  {
    name: "MixDrop",
    url: "https://mixdrop.ag",
    description: "Fast streaming & download speeds",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "AnonFile",
    url: "https://anonfiles.com",
    description: "Anonymous file sharing",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "FilePress",
    url: "https://filepress.lol",
    description: "Reliable download links",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "DDownload",
    url: "https://ddownload.com",
    description: "Premium download service",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "GoFile",
    url: "https://gofile.io",
    description: "Free unlimited file sharing",
    color: "from-teal-500 to-green-500",
  },
  {
    name: "MediaFire",
    url: "https://www.mediafire.com",
    description: "Popular file hosting service",
    color: "from-indigo-500 to-blue-500",
  },
];

export default function DownloadPage() {
  const [params] = useSearchParams();
  const animeTitle = params.get("title") || "Unknown Anime";
  const episode = params.get("episode") || "1";
  const animeId = params.get("animeId") || "";
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportSent, setReportSent] = useState(false);

  const searchQuery = `${animeTitle} Episode ${episode}`;

  const handleServiceClick = (service: (typeof DOWNLOAD_SERVICES)[0]) => {
    const query = `${searchQuery} download`;
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(query + " site:" + new URL(service.url).hostname)}`,
      "_blank"
    );
  };

  const handleReport = async () => {
    await supabase.from("reports").insert({
      user_id: user?.id || null,
      anime_id: animeId ? Number(animeId) : null,
      anime_title: animeTitle,
      episode_number: Number(episode),
      report_type: "broken_link",
      message: `Broken download link reported for ${animeTitle} Episode ${episode}`,
    } as any);
    setReportSent(true);
    toast({ title: "Report Submitted", description: "Thanks for reporting!" });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
        <Link
          to={animeId ? `/anime/${animeId}` : "/"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Episodes
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 flex items-center gap-3">
            <Download className="h-7 w-7 text-primary" />
            Download Episode
          </h1>
          <p className="text-muted-foreground mb-6">
            {animeTitle} — Episode {episode}
          </p>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-8"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-300 mb-1">
                ⚠️ Important Notice
              </h3>
              <ul className="text-sm text-yellow-200/80 space-y-1">
                <li>
                  • Please use a <strong>VPN</strong> or{" "}
                  <strong>Ad Blocker</strong> on 3rd party services to avoid ads
                  and extra popups.
                </li>
                <li>
                  • We are <strong>NOT responsible</strong> for any
                  advertisements, popups, or content shown on these external
                  services.
                </li>
                <li>
                  • These are third-party services and we have no control over
                  their content or availability.
                </li>
                <li>
                  • Download at your own risk. Always scan downloaded files for
                  viruses.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Download Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {DOWNLOAD_SERVICES.map((service, i) => (
            <motion.button
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              onClick={() => handleServiceClick(service)}
              className="group relative rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:card-glow"
            >
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity`}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Google Search Fallback */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery + " download")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Search on Google instead
          </a>
        </motion.div>

        {/* Report Broken Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-border bg-card p-5 text-center"
        >
          <AlertTriangle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Having trouble finding this episode?
          </p>
          <button
            onClick={handleReport}
            disabled={reportSent}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all disabled:opacity-50"
          >
            <Flag className="h-4 w-4" />
            {reportSent ? "Report Submitted" : "Report Broken Link"}
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}
