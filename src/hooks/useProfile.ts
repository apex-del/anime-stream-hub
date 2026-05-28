import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;

  return useQuery({
    queryKey: ["profile", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!targetId,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (patch: Partial<Pick<Profile, "display_name" | "avatar_url" | "bio">>) => {
      if (!user) throw new Error("Must be signed in");
      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profile updated" });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });
}

export function useUserStats(userId?: string) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;
  return useQuery({
    queryKey: ["user-stats", targetId],
    queryFn: async () => {
      if (!targetId) return { favorites: 0, watched: 0, comments: 0 };
      const [fav, watched, com] = await Promise.all([
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", targetId),
        supabase.from("anime_status" as any).select("id", { count: "exact", head: true })
          .eq("user_id", targetId).eq("status", "watched"),
        supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", targetId),
      ]);
      return {
        favorites: fav.count ?? 0,
        watched: watched.count ?? 0,
        comments: com.count ?? 0,
      };
    },
    enabled: !!targetId,
  });
}

export function useRecentActivity(userId?: string) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;
  return useQuery({
    queryKey: ["recent-activity", targetId],
    queryFn: async () => {
      if (!targetId) return { favorites: [], history: [], comments: [] };
      const [fav, hist, com] = await Promise.all([
        supabase.from("favorites").select("*").eq("user_id", targetId).order("created_at", { ascending: false }).limit(6),
        supabase.from("watch_history").select("*").eq("user_id", targetId).order("watched_at", { ascending: false }).limit(6),
        supabase.from("comments").select("*").eq("user_id", targetId).order("created_at", { ascending: false }).limit(5),
      ]);
      return {
        favorites: (fav.data as any[]) ?? [],
        history: (hist.data as any[]) ?? [],
        comments: (com.data as any[]) ?? [],
      };
    },
    enabled: !!targetId,
  });
}
