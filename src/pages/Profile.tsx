import { useParams, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Heart, MessageSquare, Edit2, Save, X, Check } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile, useUserStats, useRecentActivity } from "@/hooks/useProfile";
import { useAnimeStatusList } from "@/hooks/useAnimeStatus";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const ownerId = userId ?? user?.id;
  const isOwn = !!user && ownerId === user.id;

  const { data: profile, isLoading } = useProfile(ownerId);
  const { data: stats } = useUserStats(ownerId);
  const { data: activity } = useRecentActivity(ownerId);
  const { data: watchedList = [] } = useAnimeStatusList(ownerId, "watched");
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const startEdit = () => {
    setDisplayName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
    setEditing(true);
  };

  const saveEdit = async () => {
    await updateProfile.mutateAsync({ display_name: displayName.trim() || null, bio: bio.trim() || null });
    setEditing(false);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await updateProfile.mutateAsync({ avatar_url: data.publicUrl });
  };

  if (!ownerId) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 gap-4">
          <User className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Sign in to view your profile</h2>
          <Link to="/auth" className="rounded-lg bg-primary px-6 py-2 text-primary-foreground font-medium">
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-4xl">
        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {(profile?.display_name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwn && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
              <input
                ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
              />
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left w-full">
              {editing ? (
                <div className="space-y-3">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    className="w-full rounded-lg bg-secondary px-3 py-2 text-lg font-bold outline-none focus:ring-1 focus:ring-primary"
                  />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people about yourself..."
                    rows={3}
                    maxLength={300}
                    className="w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <button onClick={saveEdit} disabled={updateProfile.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      <Save className="h-4 w-4" /> Save
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold">
                      {profile?.display_name || "Unnamed user"}
                    </h1>
                    {isOwn && (
                      <button onClick={startEdit}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {profile?.bio && (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                  )}
                  {!profile?.bio && isOwn && (
                    <p className="mt-2 text-sm text-muted-foreground italic">Add a bio to introduce yourself.</p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { icon: Heart, label: "Favorites", value: stats?.favorites ?? 0 },
              { icon: Check, label: "Watched", value: stats?.watched ?? 0 },
              { icon: MessageSquare, label: "Comments", value: stats?.comments ?? 0 },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-secondary/50 border border-border p-3 sm:p-4 text-center">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Watched anime (flagged) */}
        {watchedList.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-400" /> Watched Anime
                <span className="text-xs text-muted-foreground font-normal">({watchedList.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {watchedList.map((a) => (
                <Link key={a.id} to={`/anime/${a.anime_id}`} className="block group">
                  {a.anime_image && (
                    <img
                      src={a.anime_image}
                      alt={a.anime_title}
                      loading="lazy"
                      className="w-full aspect-[3/4] rounded-lg object-cover group-hover:scale-[1.03] transition-transform"
                    />
                  )}
                  <p className="mt-1.5 text-xs line-clamp-2 group-hover:text-primary transition-colors">
                    {a.anime_title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent activity */}
        <section className="mt-8 space-y-6">
          <ActivityRow title="Recently Watched" items={activity?.history ?? []} render={(h: any) => (
            <Link to={`/anime/${h.anime_id}`} className="block">
              <img src={h.anime_image} alt={h.anime_title} className="w-full aspect-[3/4] rounded-lg object-cover" />
              <p className="mt-1.5 text-xs line-clamp-2">{h.anime_title}</p>
              {h.episode_number && <p className="text-[10px] text-muted-foreground">Ep {h.episode_number}</p>}
            </Link>
          )} />

          <ActivityRow title="Favorites" items={activity?.favorites ?? []} render={(f: any) => (
            <Link to={`/anime/${f.anime_id}`} className="block">
              <img src={f.anime_image} alt={f.anime_title} className="w-full aspect-[3/4] rounded-lg object-cover" />
              <p className="mt-1.5 text-xs line-clamp-2">{f.anime_title}</p>
            </Link>
          )} />

          {(activity?.comments?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Recent Comments</h2>
              <div className="space-y-2">
                {activity!.comments.map((c: any) => (
                  <Link key={c.id} to={`/anime/${c.anime_id}`}
                    className="block rounded-lg bg-card border border-border p-3 hover:border-primary/30 transition-colors">
                    <p className="text-sm line-clamp-2">{c.content}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

function ActivityRow({ title, items, render }: { title: string; items: any[]; render: (i: any) => React.ReactNode }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map((it: any) => (
          <div key={it.id}>{render(it)}</div>
        ))}
      </div>
    </div>
  );
}
