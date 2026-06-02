import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Sparkles } from "lucide-react";
import banner from "@/assets/anime-vibe-banner.jpg";

// Decorative animated "live" banner — drifting sakura petals + slow ken-burns
// to give the site an energetic anime vibe.
const PETALS = Array.from({ length: 14 }, (_, i) => i);

export default function AnimeVibeBanner() {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-border">
        {/* Background image with slow ken-burns motion */}
        <motion.img
          src={banner}
          alt="Dive into the anime universe"
          loading="lazy"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1.18 }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        {/* Dark + purple gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

        {/* Drifting petals */}
        {PETALS.map((p) => {
          const left = (p * 7.3) % 100;
          const delay = (p % 7) * 0.9;
          const dur = 7 + (p % 5) * 1.6;
          const size = 5 + (p % 4) * 2;
          return (
            <motion.span
              key={p}
              className="pointer-events-none absolute top-[-20px] rounded-full bg-primary/60 blur-[1px]"
              style={{ left: `${left}%`, width: size, height: size }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: ["-20px", "120%"], x: [0, 18, -12, 0], opacity: [0, 1, 1, 0] }}
              transition={{ duration: dur, repeat: Infinity, delay, ease: "linear" }}
            />
          );
        })}

        {/* Content */}
        <div className="relative z-10 flex min-h-[180px] sm:min-h-[240px] flex-col justify-center gap-3 p-5 sm:p-10 max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" /> Endless anime, one place
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-2xl sm:text-4xl font-extrabold leading-tight"
          >
            Discover. Track. <span className="text-primary">Download.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-muted-foreground"
          >
            Thousands of titles, fresh every season — find your next obsession.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <Link
              to="/browse"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              Start exploring
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
